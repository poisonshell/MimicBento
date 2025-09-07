import { fileTypeFromBuffer } from 'file-type';
import sharp from 'sharp';
import crypto from 'crypto';
import path from 'path';

export const FILE_SECURITY_CONFIG = {
  // Allowed MIME types
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
  ] as const,

  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB

  MAX_UPLOADS_PER_HOUR: 20,

  FILENAME_PATTERN: /^[a-zA-Z0-9._-]+$/,

  IMAGE_QUALITY: 85,
  MAX_IMAGE_WIDTH: 2048,
  MAX_IMAGE_HEIGHT: 2048,
} as const;

export async function validateFileType(
  buffer: Buffer,
  originalMimeType: string
): Promise<boolean> {
  try {
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      if (originalMimeType === 'image/svg+xml') {
        const content = buffer.toString('utf8', 0, 100);
        return content.includes('<svg') || content.includes('<?xml');
      }
      return false;
    }

    const allowedTypes =
      FILE_SECURITY_CONFIG.ALLOWED_MIME_TYPES as readonly string[];
    const isAllowed = allowedTypes.includes(detectedType.mime);
    const isConsistent = detectedType.mime === originalMimeType;

    return isAllowed && isConsistent;
  } catch (error) {
    console.error('File type validation error:', error);
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  const baseName = path.basename(filename);

  let sanitized = baseName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/-+/g, '-');

  sanitized = sanitized.replace(/^[-.]/, '').replace(/[-.]$/, '');

  if (!sanitized || sanitized.length === 0) {
    sanitized = 'upload';
  }

  return sanitized;
}

export function generateSecureFilename(originalName: string): string {
  const sanitizedBase = sanitizeFilename(originalName);
  const ext = path.extname(sanitizedBase);
  const nameWithoutExt = path.basename(sanitizedBase, ext);
  const timestamp = Date.now();
  const hash = crypto.randomBytes(8).toString('hex');

  return `${timestamp}-${hash}-${nameWithoutExt}${ext}`;
}

export async function processImage(
  buffer: Buffer,
  mimeType: string
): Promise<Buffer> {
  try {
    if (mimeType === 'image/svg+xml') {
      return sanitizeSVG(buffer);
    }

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const needsResize =
      (metadata.width &&
        metadata.width > FILE_SECURITY_CONFIG.MAX_IMAGE_WIDTH) ||
      (metadata.height &&
        metadata.height > FILE_SECURITY_CONFIG.MAX_IMAGE_HEIGHT);

    let processedImage = image;

    if (needsResize) {
      processedImage = processedImage.resize(
        FILE_SECURITY_CONFIG.MAX_IMAGE_WIDTH,
        FILE_SECURITY_CONFIG.MAX_IMAGE_HEIGHT,
        {
          fit: 'inside',
          withoutEnlargement: true,
        }
      );
    }

    switch (mimeType) {
      case 'image/jpeg':
      case 'image/jpg':
        return await processedImage
          .jpeg({
            quality: FILE_SECURITY_CONFIG.IMAGE_QUALITY,
            progressive: true,
          })
          .toBuffer();

      case 'image/png':
        return await processedImage
          .png({
            compressionLevel: 9,
            progressive: true,
          })
          .toBuffer();

      case 'image/webp':
        return await processedImage
          .webp({
            quality: FILE_SECURITY_CONFIG.IMAGE_QUALITY,
          })
          .toBuffer();

      default:
        return await processedImage.toBuffer();
    }
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
}

function sanitizeSVG(buffer: Buffer): Buffer {
  let content = buffer.toString('utf8');

  // Remove potentially dangerous elements and attributes
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /on\w+\s*=/gi, // Remove all event handlers (onclick, onload, etc.)
    /javascript:/gi,
    /data:(?!image\/)/gi, // Remove non-image data URLs
  ];

  dangerousPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  return Buffer.from(content, 'utf8');
}

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= FILE_SECURITY_CONFIG.MAX_FILE_SIZE;
}

class SimpleRateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const hourAgo = now - 60 * 60 * 1000; // 1 hour ago

    const recentAttempts = this.attempts.get(identifier) || [];

    const validAttempts = recentAttempts.filter(time => time > hourAgo);

    if (validAttempts.length >= FILE_SECURITY_CONFIG.MAX_UPLOADS_PER_HOUR) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(identifier, validAttempts);

    return true;
  }

  cleanup(): void {
    const hourAgo = Date.now() - 60 * 60 * 1000;

    for (const [key, attempts] of this.attempts.entries()) {
      const validAttempts = attempts.filter(time => time > hourAgo);

      if (validAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, validAttempts);
      }
    }
  }
}

export const uploadRateLimiter = new SimpleRateLimiter();

setInterval(
  () => {
    uploadRateLimiter.cleanup();
  },
  60 * 60 * 1000
);

export async function validateUploadedFile(
  file: File,
  clientIP: string
): Promise<{ isValid: boolean; error?: string }> {
  try {
    if (!uploadRateLimiter.isAllowed(clientIP)) {
      return {
        isValid: false,
        error: 'Too many uploads. Please try again later.',
      };
    }

    if (!validateFileSize(file.size)) {
      return {
        isValid: false,
        error: `File too large. Maximum size is ${FILE_SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      };
    }

    const allowedTypes =
      FILE_SECURITY_CONFIG.ALLOWED_MIME_TYPES as readonly string[];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Only images are allowed.',
      };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const isValidType = await validateFileType(buffer, file.type);

    if (!isValidType) {
      return {
        isValid: false,
        error: 'File type mismatch or invalid file format.',
      };
    }

    return { isValid: true };
  } catch (error) {
    console.error('File validation error:', error);
    return {
      isValid: false,
      error: 'Failed to validate file.',
    };
  }
}
