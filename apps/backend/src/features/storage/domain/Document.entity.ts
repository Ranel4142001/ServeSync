import { Entity } from "@shared/domain/Entity";
import { uuidv7 } from "@shared/utils/idGenerators";

// Shape of data required to construct a Document
interface DocumentProps {
  fileName: string;
  s3Key: string; 
  mimeType: string;
  sizeBytes: number;
  ticketId: string;
  createdAt: Date;
}

export class Document extends Entity<string> {
  private props: DocumentProps;

  private constructor(props: DocumentProps, id?: string) {
    super(id ?? uuidv7());
    this.props = props;
  }

  static create(props: DocumentProps, id?: string): Document {
    if (!props.fileName || props.fileName.trim().length === 0) {
      throw new Error("File name is required");
    }

    if (!props.s3Key || props.s3Key.trim().length === 0) {
      throw new Error("S3 key is required");
    }

    if (!props.mimeType || props.mimeType.trim().length === 0) {
      throw new Error("Mime type is required");
    }

    if (props.sizeBytes <= 0) {
      throw new Error("File size must be greater than zero");
    }

    if (!props.ticketId || props.ticketId.trim().length === 0) {
      throw new Error("A valid Ticket ID is required");
    }

    // Max file size is 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (props.sizeBytes > MAX_SIZE) {
      throw new Error("File size must not exceed 10MB");
    }

    return new Document(props, id);
  }

  // Getters
  get fileName(): string { return this.props.fileName; }
  get s3Key(): string { return this.props.s3Key; }
  get mimeType(): string { return this.props.mimeType; }
  get sizeBytes(): number { return this.props.sizeBytes; }
  get ticketId(): string { return this.props.ticketId; }
  get createdAt(): Date { return this.props.createdAt; }

  get humanSize(): string {
    if (this.props.sizeBytes < 1024) {
      return `${this.props.sizeBytes} B`;
    } else if (this.props.sizeBytes < 1024 * 1024) {
      return `${(this.props.sizeBytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(this.props.sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
    }
  }

  toJSON() {
    return {
      id: this._id,
      fileName: this.props.fileName,
      s3Key: this.props.s3Key,
      mimeType: this.props.mimeType,
      sizeBytes: this.props.sizeBytes,
      humanSize: this.humanSize,
      ticketId: this.props.ticketId,
      createdAt: this.props.createdAt,
    };
  }
}