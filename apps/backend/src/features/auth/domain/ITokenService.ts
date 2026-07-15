import { Role } from "./Role.enum";

export interface TokenPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
}

export interface ITokenService {
  sign(payload: TokenPayload): string;
  verify(token: string): TokenPayload | null;
}
