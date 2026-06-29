import { Entity } from "@shared/domain/Entity";

// Shape of data required to construct an Organization
interface OrganizationProps {
  name: string; // display name e.g. "Acme Corp"
  slug: string; // URL-friendly unique identifier e.g. "acme-corp"
  createdAt: Date;
  updatedAt: Date;
}

export class Organization extends Entity<string> {
  private props: OrganizationProps;

  // Private — forces use of the create() factory method
  private constructor(props: OrganizationProps, id?: string) {
    super(id ?? "");
    this.props = props;
  }

  // Factory method — validates name and slug before the object is created; no invalid Organizations can exist
  static create(props: OrganizationProps, id?: string): Organization {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Organization name is required");
    }

    if (!props.slug || props.slug.trim().length === 0) {
      throw new Error("Organization slug is required");
    }

    // Slug must only contain lowercase letters, numbers, and hyphens e.g. "acme-corp"
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(props.slug)) {
      throw new Error(
        "Slug must only contain lowercase letters, numbers, and hyphens",
      );
    }

    return new Organization(props, id);
  }

  // Getters
  get name(): string {
    return this.props.name;
  }
  get slug(): string {
    return this.props.slug;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Converts a name to a URL-friendly slug e.g. "Acme Corp" → "acme-corp"
  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  // Serialize to plain object for HTTP responses
  toJSON() {
    return {
      id: this._id,
      name: this.props.name,
      slug: this.props.slug,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
