// Contract for file storage — swap S3, Cloudinary, or local disk without touching use-cases
export interface IStorageProvider {
  // Upload a file to storage and return its key
  upload(params: {
    key: string;
    buffer: Buffer;
    mimeType: string;
    sizeBytes: number;
  }): Promise<string>;

  // Generate a temporary signed URL for secure file download; expires after 15 minutes
  getSignedUrl(key: string): Promise<string>;

  // Permanently delete a file from storage
  delete(key: string): Promise<void>;
}
