import { Role } from './Role.enum';

// Data embedded inside the JWT
export interface TokenPayload {
  userId:         string;
  email:          string;
  role:           Role;
  organizationId: string;
}

// Contract for JWT signing and verification
export interface ITokenService {

  // Sign a payload and return a JWT string
  sign(payload: TokenPayload): string;

  // Verify a JWT and return its payload; returns null if invalid or expired
  verify(token: string): TokenPayload | null;
}