import { Entity } from "@shared/domain/Entity";

// Shape of data required to construct an Organization
interface OrganizationProps {
  code: string | null;
  name: string; // display name e.g. "Acme Corp"
  slug: string; // URL-friendly unique identifier e.g. "acme-corp"
  createdAt: Date;
  updatedAt: Date;
}

export class Organization extends Entity<number> {
  private props: OrganizationProps;

  // Private — forces use of the create() factory method
  private constructor(props: OrganizationProps, id?: number) {
    // If id is undefined, pass 0 (or let database assign it during creation)
    super(id ?? 0);
    this.props = props;
  }

  // Factory method — validates name and slug before the object is created
  static create(props: OrganizationProps, id?: number): Organization {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error("Organization name is required");
    }

    if (!props.slug || props.slug.trim().length === 0) {
      throw new Error("Organization slug is required");
    }

    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(props.slug)) {
      throw new Error(
        "Slug must only contain lowercase letters, numbers, and hyphens",
      );
    }

    return new Organization(props, id);
  }

  // Getters
  get code(): string | null {
    return this.props.code;
  }
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

  static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  toJSON() {
    return {
      id: this._id, // This is now a number
      code: this.props.code,
      name: this.props.name,
      slug: this.props.slug,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}