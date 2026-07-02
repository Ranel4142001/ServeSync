import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { IStorageProvider } from "../../domain/IStorageProvider";

export class S3StorageProvider implements IStorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor() {
    // Read AWS credentials from environment variables; never hardcode secrets
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? "ap-southeast-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });
    this.bucket = process.env.AWS_BUCKET_NAME ?? "";
  }

  // Upload a file buffer to S3 and return its key
  async upload(params: {
    key: string;
    buffer: Buffer;
    mimeType: string;
    sizeBytes: number;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: params.key,
      Body: params.buffer,
      ContentType: params.mimeType,
      ContentLength: params.sizeBytes,
    });

    await this.client.send(command);

    return params.key;
  }

  // Generate a signed URL valid for 15 minutes (900 seconds)
  async getSignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, {
      expiresIn: 900,
    });

    return url;
  }

  // Permanently delete a file from S3
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    await this.client.send(command);
  }
}
