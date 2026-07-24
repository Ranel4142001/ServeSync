from abc import ABC, abstractmethod

class IStorageProvider(ABC):
    """
    Interface for File Storage Operations (Upload, signed URLs, deletion).
    """
    @abstractmethod
    def upload(self, key: str, file_bytes: bytes, mime_type: str, size_bytes: int) -> str:
        pass

    @abstractmethod
    def get_signed_url(self, key: str) -> str:
        pass

    @abstractmethod
    def delete(self, key: str) -> None:
        pass
