import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { IStorageProvider } from '../domain/IStorageProvider';

export class S3StorageProvider implements IStorageProvider {

  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    // Read AWS credentials from environment variables
    // Never hardcode credentials in code
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'ap-southeast-1',
      credentials: {
        accessKeyId:     process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    });
    this.bucket = process.env.AWS_BUCKET_NAME ?? '';
  }

  // Upload a file buffer to S3
  async upload(params: {
    key:       string;
    buffer:    Buffer;
    mimeType:  string;
    sizeBytes: number;
  }): Promise<string> {

    // PutObjectCommand is the AWS SDK way of saying "upload this file"
    const command = new PutObjectCommand({
      Bucket:        this.bucket,      // which bucket
      Key:           params.key,       // where inside the bucket
      Body:          params.buffer,    // the actual file data
      ContentType:   params.mimeType,  // tell S3 what kind of file it is
      ContentLength: params.sizeBytes, // file size for verification
    });

    await this.client.send(command);

    // Return the key so it can be stored in the database
    return params.key;
  }

  // Generate a temporary signed URL valid for 15 minutes
  // Only someone with this URL can access the file
  async getSignedUrl(key: string): Promise<string> {

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key:    key,
    });

    // 900 seconds = 15 minutes
    // After this time the URL stops working automatically
    const url = await getSignedUrl(this.client, command, {
      expiresIn: 900,
    });

    return url;
  }

  // Permanently delete a file from S3
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key:    key,
    });
    await this.client.send(command);
  }
}