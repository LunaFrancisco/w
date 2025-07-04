import { generatePresignedUrl, deleteObject, generateFileKey, getPublicUrl } from './r2';

export interface FileUploadOptions {
  prefix: string;
  filename: string;
  contentType: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export interface FileUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
}

export interface UploadedFile {
  key: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFile(file: File, options?: { allowedTypes?: string[]; maxSize?: number }): void {
  const allowedTypes = options?.allowedTypes || ALLOWED_MIME_TYPES;
  const maxSize = options?.maxSize || MAX_FILE_SIZE;

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Tipo de archivo no permitido: ${file.type}`);
  }

  if (file.size > maxSize) {
    throw new Error(`Archivo demasiado grande: ${Math.round(file.size / 1024 / 1024)}MB. Máximo permitido: ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
}

export async function prepareFileUpload(options: FileUploadOptions): Promise<FileUploadResult> {
  const { prefix, filename, contentType, allowedTypes } = options;

  // Validate content type
  const allowedMimeTypes = allowedTypes || ALLOWED_MIME_TYPES;
  if (!allowedMimeTypes.includes(contentType)) {
    throw new Error(`Tipo de archivo no permitido: ${contentType}`);
  }

  // Generate unique file key
  const key = generateFileKey(prefix, filename);

  // Generate presigned URL
  const result = await generatePresignedUrl({
    key,
    contentType,
    expiresIn: 3600, // 1 hour
  });

  return {
    uploadUrl: result.url,
    key,
    publicUrl: result.publicUrl,
  };
}

export async function uploadFileToR2(file: File, uploadUrl: string): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al subir archivo: ${response.statusText}`);
  }
}

export async function deleteFileFromR2(key: string): Promise<void> {
  await deleteObject(key);
}

export function getFileUrl(key: string): string {
  return getPublicUrl(key);
}

export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1); // Remove leading slash
  } catch {
    return null;
  }
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

export function isImageFile(contentType: string): boolean {
  return contentType.startsWith('image/');
}

export function isPdfFile(contentType: string): boolean {
  return contentType === 'application/pdf';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export const STORAGE_PREFIXES = {
  ACCESS_REQUESTS: 'access-requests',
  PRODUCT_IMAGES: 'product-images',
  USER_AVATARS: 'user-avatars',
} as const;

export type StoragePrefix = typeof STORAGE_PREFIXES[keyof typeof STORAGE_PREFIXES];