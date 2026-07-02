import jwt from 'jsonwebtoken';
import { ITokenService, TokenPayload } from '../../domain/ITokenService';

export class JwtService implements ITokenService {

  private readonly secret:    string;
  private readonly expiresIn: string;

  constructor() {
    // Read from environment variables; never hardcode secrets
    this.secret    = process.env.JWT_SECRET     ?? 'fallback-secret';
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
  }

  sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn as any,
    });
  }

  verify(token: string): TokenPayload | null {
    try {
      // jwt.verify throws if invalid or expired — catch and return null
      const decoded = jwt.verify(token, this.secret) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}