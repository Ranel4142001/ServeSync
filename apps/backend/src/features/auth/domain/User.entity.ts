import { Entity } from '@shared/domain/Entity';
import { Role }   from './Role.enum';

// Shape of data required to construct a User
interface UserProps {
  email:          string;
  passwordHash:   string;
  firstName:      string;
  lastName:       string;
  role:           Role;
  isActive:       boolean;
  organizationId: string;
  createdAt:      Date;
  updatedAt:      Date;
}

export class User extends Entity<string> {
  private props: UserProps;

  // Private — forces use of the create() factory method
  private constructor(props: UserProps, id?: string) {
    super(id ?? '');
    this.props = props;
  }

  // Factory method — validates props before the object is created; no invalid Users can exist
  static create(props: UserProps, id?: string): User {
    if (!props.email || !props.email.includes('@')) {
      throw new Error('Invalid email address');
    }
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    return new User(props, id);
  }

  // Getters
  get email():          string  { return this.props.email; }
  get passwordHash():   string  { return this.props.passwordHash; }
  get firstName():      string  { return this.props.firstName; }
  get lastName():       string  { return this.props.lastName; }
  get role():           Role    { return this.props.role; }
  get isActive():       boolean { return this.props.isActive; }
  get organizationId(): string  { return this.props.organizationId; }
  get createdAt():      Date    { return this.props.createdAt; }
  get updatedAt():      Date    { return this.props.updatedAt; }

  // Computed from firstName and lastName
  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  // Role checks and account state — no DB calls
  isAdmin():  boolean { return this.props.role === Role.ADMIN; }
  isAgent():  boolean { return this.props.role === Role.AGENT; }
  isClient(): boolean { return this.props.role === Role.CLIENT; }

  deactivate(): void { this.props.isActive = false; }
  activate():   void { this.props.isActive = true; }

  // Serialize to plain object; passwordHash is intentionally excluded
  toJSON() {
    return {
      id:             this._id,
      email:          this.props.email,
      firstName:      this.props.firstName,
      lastName:       this.props.lastName,
      fullName:       this.fullName,
      role:           this.props.role,
      isActive:       this.props.isActive,
      organizationId: this.props.organizationId,
      createdAt:      this.props.createdAt,
      updatedAt:      this.props.updatedAt,
    };
  }
}