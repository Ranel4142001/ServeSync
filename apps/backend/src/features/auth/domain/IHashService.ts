// Contract for password hashing
export interface IHashService {

  // Hash a plain-text password
  hash(plain: string): Promise<string>;

  // Compare a plain-text password against a stored hash; returns true if they match
  compare(plain: string, hash: string): Promise<boolean>;
}