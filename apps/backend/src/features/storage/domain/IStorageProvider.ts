// This is the CONTRACT for file storage
// It defines what we can do with files
// WITHOUT saying whether it is S3, Cloudinary,
// or even local disk storage
export interface IStorageProvider {

  // Upload a file and return the S3 key
  // The key is the unique path of the file in storage
  // e.g. "uploads/org123/ticket456/uuid-invoice.pdf"
  upload(params: {
    key:         string; // where to store it
    buffer:      Buffer; // the raw file data
    mimeType:    string; // file type
    sizeBytes:   number; // file size
  }): Promise<string>;

  // Generate a temporary signed URL so the client
  // can securely download the file directly from S3
  // The URL expires after a set time (e.g. 15 minutes)
  // This is more secure than making files publicly accessible
  getSignedUrl(key: string): Promise<string>;

  // Permanently delete a file from storage
  delete(key: string): Promise<void>;
}