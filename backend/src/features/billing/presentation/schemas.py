from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CreateInvoiceRequest(BaseModel):
    amount: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = None

class CreateInvoiceResponse(BaseModel):
    message: str
    id: str
    amount: str

class InvoiceResponseItem(BaseModel):
    id: str
    amount: str
    description: str
    isPaid: bool
    paidAt: Optional[datetime]
    createdAt: datetime

class BillingSummary(BaseModel):
    total: int
    totalPaid: str
    totalUnpaid: str

class GetInvoicesResponse(BaseModel):
    invoices: List[InvoiceResponseItem]
    summary: BillingSummary

class MarkPaidResponse(BaseModel):
    message: str
    id: str
    isPaid: bool
    paidAt: datetime
