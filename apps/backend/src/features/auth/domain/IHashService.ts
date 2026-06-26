// Contract for password hashing — no bcrypt here, just the shape
export interface IHashService {

  // Takes a plain password, returns a hashed version
  hash(plain: string): Promise<string>;

  // Compares a plain password against a stored hash
  // Returns true if they match, false if not
  compare(plain: string, hash: string): Promise<boolean>;
}