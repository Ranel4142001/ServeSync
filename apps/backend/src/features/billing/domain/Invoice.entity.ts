import { Entity } from "@shared/domain/Entity";

// Shape of data required to construct an Invoice
interface InvoiceProps {
  amount: number;
  currency: string;
  description: string | null;
  paidAt: Date | null; // null = unpaid, Date = paid
  organizationId: string;
  createdAt: Date;
}

export class Invoice extends Entity<string> {
  private props: InvoiceProps;

  private constructor(props: InvoiceProps, id?: string) {
    super(id ?? "");
    this.props = props;
  }

  // Factory method — validates amount, currency, and organizationId before creating
  static create(props: InvoiceProps, id?: string): Invoice {
    if (props.amount <= 0) {
      throw new Error("Invoice amount must be greater than zero");
    }

    if (!props.currency || props.currency.trim().length === 0) {
      throw new Error("Currency is required");
    }

    // Currency must be a 3-letter code e.g. USD, PHP, EUR
    if (props.currency.trim().length !== 3) {
      throw new Error("Currency must be a 3-letter code e.g. USD, PHP, EUR");
    }

    if (!props.organizationId || props.organizationId.trim().length === 0) {
      throw new Error("Organization ID is required");
    }

    return new Invoice(props, id);
  }

  // Getters
  get amount(): number {
    return this.props.amount;
  }
  get currency(): string {
    return this.props.currency;
  }
  get description(): string | null {
    return this.props.description;
  }
  get paidAt(): Date | null {
    return this.props.paidAt;
  }
  get organizationId(): string {
    return this.props.organizationId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }

  // True if paidAt has been set
  get isPaid(): boolean {
    return this.props.paidAt !== null;
  }

  // Formats amount as a currency string e.g. 29 USD → "$29.00"
  get formattedAmount(): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: this.props.currency,
    }).format(this.props.amount);
  }

  // Mark as paid at the current time; throws if already paid
  markAsPaid(): void {
    if (this.isPaid) {
      throw new Error("Invoice is already paid");
    }
    this.props.paidAt = new Date();
  }

  // Serialize to plain object for persistence or HTTP response
  toJSON() {
    return {
      id: this._id,
      amount: this.props.amount,
      currency: this.props.currency,
      formattedAmount: this.formattedAmount,
      description: this.props.description,
      isPaid: this.isPaid,
      paidAt: this.props.paidAt,
      organizationId: this.props.organizationId,
      createdAt: this.props.createdAt,
    };
  }
}
