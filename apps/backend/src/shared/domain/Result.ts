export class Result<T> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: string,
    private readonly _value?: T
  ) {}

  get value(): T {
    if (!this.isSuccess) throw new Error('Cannot get value of failed result');
    return this._value as T;
  }

  static ok<U>(value?: U): Result<U> {
    return new Result(true, undefined, value);
  }

  static fail(error: string): Result<never> {
    return new Result(false, error);
  }
}