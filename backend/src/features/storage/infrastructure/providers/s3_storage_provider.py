import os
import pathlib
from src.config import settings
from src.features.storage.domain.storage_provider import IStorageProvider

class S3StorageProvider(IStorageProvider):
    """
    S3 Storage Provider with fallback to local file system if AWS credentials
    or S3 bucket configurations are not set.
    """
    def __init__(self) -> None:
        self.bucket = settings.AWS_BUCKET_NAME
        self.access_key = settings.AWS_ACCESS_KEY_ID
        self.secret_key = settings.AWS_SECRET_ACCESS_KEY
        self.region = settings.AWS_REGION
        self.use_local = not (self.access_key and self.secret_key and self.bucket)

        if self.use_local:
            # Set up local directory for uploaded files
            self.local_dir = pathlib.Path("uploads")
            self.local_dir.mkdir(exist_ok=True)

    def upload(self, key: str, file_bytes: bytes, mime_type: str, size_bytes: int) -> str:
        if self.use_local:
            # Sanitize key for filesystem usage
            safe_filename = key.replace("/", "_")
            file_path = self.local_dir / safe_filename
            file_path.parent.mkdir(exist_ok=True, parents=True)
            file_path.write_bytes(file_bytes)
            return key
        else:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            s3.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=file_bytes,
                ContentType=mime_type
            )
            return key

    def get_signed_url(self, key: str) -> str:
        if self.use_local:
            # Returns a simulated download URL matching the FastAPI uploads route
            safe_filename = key.replace("/", "_")
            return f"/api/documents/download/{safe_filename}"
        else:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            url = s3.generate_presigned_url(
                ClientMethod="get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=900
            )
            return url

    def delete(self, key: str) -> None:
        if self.use_local:
            safe_filename = key.replace("/", "_")
            file_path = self.local_dir / safe_filename
            if file_path.exists():
                file_path.unlink()
        else:
            import boto3
            s3 = boto3.client(
                "s3",
                region_name=self.region,
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key
            )
            s3.delete_object(Bucket=self.bucket, Key=key)
            
        return None
