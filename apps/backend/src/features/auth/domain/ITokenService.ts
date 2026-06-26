import { Role } from './Role.enum';

// The data we embed inside the JWT token
export interface TokenPayload {
  userId:         string;
  email:          string;
  role:           Role;
  organizationId: string;
}

// Contract for token signing and verification
export interface ITokenService {

  // Signs a payload and returns a JWT string
  sign(payload: TokenPayload): string;

  // Verifies a JWT string and returns the payload
  // Returns null if the token is invalid or expired
  verify(token: string): TokenPayload | null;
}