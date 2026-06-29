import bcrypt from 'bcryptjs';
import { IHashService } from '../domain/IHashService';

export class BcryptHashService implements IHashService {

  // 12 salt rounds — good balance of security and performance for production
  private readonly saltRounds = 12;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}