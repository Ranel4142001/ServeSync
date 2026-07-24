from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.billing.infrastructure.persistence.invoice_repository import SqlAlchemyInvoiceRepository
from src.features.billing.application.create_invoice import CreateInvoiceUseCase
from src.features.billing.application.get_invoices import GetInvoicesUseCase
from src.features.billing.application.mark_invoice_paid import MarkInvoicePaidUseCase
from src.features.billing.presentation.schemas import (
    CreateInvoiceRequest, CreateInvoiceResponse,
    GetInvoicesResponse, InvoiceResponseItem, BillingSummary,
    MarkPaidResponse
)
from src.features.auth.presentation.dependencies import get_current_user, CurrentUser, RequireRole
from src.shared.infrastructure.models import UserRole

router = APIRouter(prefix="/billing/invoices", tags=["Billing"])

@router.post("", response_model=CreateInvoiceResponse, status_code=status.HTTP_201_CREATED)
def create_invoice(
    req: CreateInvoiceRequest,
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    invoice_repo = SqlAlchemyInvoiceRepository(db)
    use_case = CreateInvoiceUseCase(invoice_repo)
    
    result = use_case.execute(req, current_user.organizationId)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    invoice = result.value
    return CreateInvoiceResponse(
        message="Invoice created successfully",
        id=invoice.id,
        amount=invoice.formattedAmount
    )

@router.get("", response_model=GetInvoicesResponse)
def get_invoices(
    unpaidOnly: bool = False,
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN, UserRole.CLIENT)),
    db: Session = Depends(get_db)
):
    invoice_repo = SqlAlchemyInvoiceRepository(db)
    use_case = GetInvoicesUseCase(invoice_repo)
    
    result = use_case.execute(
        organization_id=current_user.organizationId,
        role=current_user.role,
        unpaid_only=unpaidOnly
    )
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=result.error)
        
    invoices, total_unpaid, total_paid = result.value
    
    invoice_items = [
        InvoiceResponseItem(
            id=inv.id,
            amount=inv.formattedAmount,
            description=inv.description or "No description",
            isPaid=inv.isPaid,
            paidAt=inv.paidAt,
            createdAt=inv.createdAt
        )
        for inv in invoices
    ]
    
    summary = BillingSummary(
        total=len(invoice_items),
        totalPaid=f"${total_paid:,.2f}",
        totalUnpaid=f"${total_unpaid:,.2f}"
    )
    
    return GetInvoicesResponse(invoices=invoice_items, summary=summary)

@router.get("/{id}", response_model=InvoiceResponseItem)
def get_invoice_details(
    id: str,
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    invoice_repo = SqlAlchemyInvoiceRepository(db)
    invoice = invoice_repo.find_by_id(id)
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found")
        
    return InvoiceResponseItem(
        id=invoice.id,
        amount=invoice.formattedAmount,
        description=invoice.description or "No description",
        isPaid=invoice.isPaid,
        paidAt=invoice.paidAt,
        createdAt=invoice.createdAt
    )

@router.patch("/{id}/pay", response_model=MarkPaidResponse)
def pay_invoice(
    id: str,
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    invoice_repo = SqlAlchemyInvoiceRepository(db)
    use_case = MarkInvoicePaidUseCase(invoice_repo)
    
    result = use_case.execute(id, current_user.role)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    invoice = result.value
    return MarkPaidResponse(
        message="Invoice marked as paid successfully",
        id=invoice.id,
        isPaid=True,
        paidAt=invoice.paidAt
    )
