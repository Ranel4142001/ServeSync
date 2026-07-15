import { Entity } from "@shared/domain/Entity";
import { uuidv7 } from "@shared/utils/idGenerators";
import { Role } from "./Role.enum";

interface UserProps {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User extends Entity<string> {
  private props: UserProps;

  private constructor(props: UserProps, id?: string) {
    super(id ?? uuidv7());
    this.props = props;
  }

  static create(props: UserProps, id?: string): User {
    if (!props.email || !props.email.includes("@")) {
      throw new Error("Invalid email address");
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error("First name is required");
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error("Last name is required");
    }
    if (!props.organizationId || props.organizationId.trim().length === 0) {
      throw new Error("Valid organization ID is required");
    }
    return new User(props, id);
  }

  get email(): string {
    return this.props.email;
  }
  get passwordHash(): string {
    return this.props.passwordHash;
  }
  get firstName(): string {
    return this.props.firstName;
  }
  get lastName(): string {
    return this.props.lastName;
  }
  get role(): Role {
    return this.props.role;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get organizationId(): string {
    return this.props.organizationId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  isAdmin(): boolean {
    return this.props.role === Role.ADMIN;
  }
  isAgent(): boolean {
    return this.props.role === Role.AGENT;
  }
  isClient(): boolean {
    return this.props.role === Role.CLIENT;
  }

  deactivate(): void {
    this.props.isActive = false;
  }
  activate(): void {
    this.props.isActive = true;
  }

  toJSON() {
    return {
      id: this._id,
      email: this.props.email,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      fullName: this.fullName,
      role: this.props.role,
      isActive: this.props.isActive,
      organizationId: this.props.organizationId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
