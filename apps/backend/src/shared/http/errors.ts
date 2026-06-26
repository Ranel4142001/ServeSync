export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) { super(message); }
}
export class NotFoundError extends AppError {
  constructor(msg = 'Resource not found') { super(msg, 404); }
}
export class ForbiddenError extends AppError {
  constructor(msg = 'Access denied') { super(msg, 403); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') { super(msg, 401); }
}
export class ValidationError extends AppError {
  constructor(msg: string) { super(msg, 422); }
}