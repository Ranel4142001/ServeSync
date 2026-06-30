import { Role } from "./Role.enum";

export interface TokenPayload {
  userId: number; // Updated to number
  email: string;
  role: Role;
  organizationId: number; // Updated to number
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload | null;
}
