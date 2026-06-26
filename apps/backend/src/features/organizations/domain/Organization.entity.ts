import { Entity } from '@shared/domain/Entity';

// These are all the pieces of data that make up an Organization
interface OrganizationProps {
  name:      string;  // display name e.g. "Acme Corp"
  slug:      string;  // URL-friendly unique name e.g. "acme-corp"
  createdAt: Date;
  updatedAt: Date;
}

export class Organization extends Entity<string> {
  private props: OrganizationProps;

  // Private constructor — only create() can make an Organization
  private constructor(props: OrganizationProps, id?: string) {
    super(id ?? '');
    this.props = props;
  }

  // ── Factory method ───────────────────────────────────────
  // Validates data BEFORE the object is created
  // This means an invalid Organization can never exist
  static create(props: OrganizationProps, id?: string): Organization {

    // Name must not be empty
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Organization name is required');
    }

    // Slug must not be empty
    if (!props.slug || props.slug.trim().length === 0) {
      throw new Error('Organization slug is required');
    }

    // Slug must only contain lowercase letters, numbers, and hyphens
    // e.g. "acme-corp" is valid, "Acme Corp!" is not
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(props.slug)) {
      throw new Error('Slug must only contain lowercase letters, numbers, and hyphens');
    }

    return new Organization(props, id);
  }

  // ── Getters ──────────────────────────────────────────────
  // Read-only access — nothing outside can directly change these
  get name():      string { return this.props.name; }
  get slug():      string { return this.props.slug; }
  get createdAt(): Date   { return this.props.createdAt; }
  get updatedAt(): Date   { return this.props.updatedAt; }

  // ── Helper ───────────────────────────────────────────────
  // Generates a slug automatically from the organization name
  // e.g. "Acme Corp" → "acme-corp"
  static generateSlug(name: string): string {
    return name
      .toLowerCase()           // make all lowercase
      .trim()                  // remove leading/trailing spaces
      .replace(/\s+/g, '-')   // replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, ''); // remove special characters
  }

  // ── Serializer ───────────────────────────────────────────
  // Converts entity to plain object for HTTP responses
  toJSON() {
    return {
      id:        this._id,
      name:      this.props.name,
      slug:      this.props.slug,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}