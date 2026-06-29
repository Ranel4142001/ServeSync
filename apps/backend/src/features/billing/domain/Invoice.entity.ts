import { Entity } from '@shared/domain/Entity';

// All the data that makes up an Invoice
// An invoice is a bill sent to an organization
// for using the ServeSync platform
interface InvoiceProps {
  amount:         number;       // how much they owe e.g. 29.00
  currency:       string;       // e.g. "USD", "PHP", "EUR"
  description:    string | null; // e.g. "Monthly subscription - June 2026"
  paidAt:         Date | null;  // null means unpaid, Date means paid
  organizationId: string;       // which org owes this invoice
  createdAt:      Date;
}

export class Invoice extends Entity<string> {
  private props: InvoiceProps;

  private constructor(props: InvoiceProps, id?: string) {
    super(id ?? '');
    this.props = props;
  }

  // ── Factory method ───────────────────────────────────────
  // Validates the invoice before it is created
  static create(props: InvoiceProps, id?: string): Invoice {

    // Amount must be greater than zero
    // You cannot create an invoice for free or negative amount
    if (props.amount <= 0) {
      throw new Error('Invoice amount must be greater than zero');
    }

    // Currency must be provided
    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error('Currency is required');
    }

    // Currency must be exactly 3 characters e.g. "USD" not "US Dollars"
    if (props.currency.trim().length !== 3) {
      throw new Error('Currency must be a 3-letter code e.g. USD, PHP, EUR');
    }

    // Organization ID must be provided
    if (!props.organizationId || props.organizationId.trim().length === 0) {
      throw new Error('Organization ID is required');
    }

    return new Invoice(props, id);
  }

  // ── Getters ──────────────────────────────────────────────
  get amount():         number      { return this.props.amount; }
  get currency():       string      { return this.props.currency; }
  get description():    string|null { return this.props.description; }
  get paidAt():         Date|null   { return this.props.paidAt; }
  get organizationId(): string      { return this.props.organizationId; }
  get createdAt():      Date        { return this.props.createdAt; }

  // ── Computed properties ──────────────────────────────────

  // Whether this invoice has been paid
  // Simply checks if paidAt has a date value
  get isPaid(): boolean {
    return this.props.paidAt !== null;
  }

  // Human-readable formatted amount
  // e.g. amount: 29, currency: "USD" → "$29.00"
  get formattedAmount(): string {
    return new Intl.NumberFormat('en-US', {
      style:    'currency',
      currency: this.props.currency,
    }).format(this.props.amount);
  }

  // ── Business logic methods ───────────────────────────────

  // Mark the invoice as paid right now
  // Once paid it cannot be unpaid
  markAsPaid(): void {
    if (this.isPaid) {
      throw new Error('Invoice is already paid');
    }
    this.props.paidAt = new Date();
  }

  // ── Serializer ───────────────────────────────────────────
  toJSON() {
    return {
      id:              this._id,
      amount:          this.props.amount,
      currency:        this.props.currency,
      formattedAmount: this.formattedAmount,
      description:     this.props.description,
      isPaid:          this.isPaid,
      paidAt:          this.props.paidAt,
      organizationId:  this.props.organizationId,
      createdAt:       this.props.createdAt,
    };
  }
}