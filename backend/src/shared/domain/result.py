from typing import Generic, TypeVar, Optional, Any

T = TypeVar('T')

class Result(Generic[T]):
    """
    Standard Result pattern wrapper to encapsulate success/failure operations.
    Highly effective for Domain-Driven Design in Clean Architecture.
    """
    def __init__(self, is_success: bool, error: Optional[str] = None, value: Optional[T] = None) -> None:
        if is_success and error:
            raise ValueError("Invalid Result configuration: cannot be successful and contain error message.")
        if not is_success and not error:
            raise ValueError("Invalid Result configuration: failure results must specify an error message.")

        self.is_success = is_success
        self.error = error
        self._value = value

    @property
    def value(self) -> T:
        if not self.is_success:
            raise ValueError(f"Cannot retrieve value of a failed Result: {self.error}")
        return self._value  # type: ignore

    @classmethod
    def ok(cls, value: Optional[T] = None) -> 'Result[T]':
        return cls(is_success=True, value=value)

    @classmethod
    def fail(cls, error: str) -> 'Result[Any]':
        return cls(is_success=False, error=error)
