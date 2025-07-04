import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL!;

export interface UploadParams {
  key: string;
  contentType: string;
  expiresIn?: number;
}

export interface UploadResult {
  url: string;
  key: string;
  publicUrl: string;
}

export async function generatePresignedUrl(params: UploadParams): Promise<UploadResult> {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: params.key,
    ContentType: params.contentType,
  });

  const url = await getSignedUrl(r2Client, command, {
    expiresIn: params.expiresIn || 3600, // 1 hour by default
  });

  return {
    url,
    key: params.key,
    publicUrl: `${R2_PUBLIC_URL}/${params.key}`,
  };
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

export async function generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

export function getPublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${prefix}/${timestamp}_${random}_${sanitizedFilename}`;
}

export { r2Client };