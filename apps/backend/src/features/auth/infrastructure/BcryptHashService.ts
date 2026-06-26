import bcrypt from 'bcryptjs';
import { IHashService } from '../domain/IHashService';

export class BcryptHashService implements IHashService {

  // Salt rounds — higher = more secure but slower
  // 12 is a good balance for production
  private readonly saltRounds = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}