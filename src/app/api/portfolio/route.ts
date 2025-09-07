import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BentoData } from '@/types/bento';
import { verify } from 'jsonwebtoken';
import {
  validateUploadedFile,
  generateSecureFilename,
  processImage,
} from '@/utils/file-security';
import { validateCSRFRequest, logCSRFEvent } from '@/utils/csrf';

const DATA_FILE_PATH = path.join(
  process.cwd(),
  'public',
  'data',
  'portfolio.json'
);

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

const isAdminEnabled = () => {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
  );
};

function isAdminAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin-token')?.value;

  if (!token) {
    return false;
  }

  try {
    verify(token, process.env.NEXTAUTH_SECRET!);
    return true;
  } catch {
    return false;
  }
}

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'localhost';
}

export async function GET() {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const data: BentoData = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading portfolio data:', error);

    const defaultData: BentoData = {
      profile: {
        name: 'John Doe',
        bio: 'Welcome to my portfolio! This is a fresh start.',
        avatar: undefined,
      },
      blocks: [],
    };

    return NextResponse.json(defaultData);
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: 'Admin operations are not available' },
      { status: 403 }
    );
  }

  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const csrfValidation = await validateCSRFRequest(request);
    if (!csrfValidation.isValid) {
      logCSRFEvent('token_failed', {
        error: `POST /api/portfolio: ${csrfValidation.error || 'CSRF validation failed'}`,
      });
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
    logCSRFEvent('token_validated', {
      error: 'POST /api/portfolio: Portfolio data update',
    });
  } catch (error) {
    console.error('CSRF validation error:', error);
    return NextResponse.json(
      { error: 'Security validation failed' },
      { status: 500 }
    );
  }

  try {
    const data: BentoData = await request.json();

    if (!data.profile || !data.blocks || !Array.isArray(data.blocks)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Portfolio data saved successfully',
    });
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return NextResponse.json(
      { error: 'Failed to save portfolio data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: 'Admin operations are not available' },
      { status: 403 }
    );
  }

  if (!isAdminAuthenticated(request)) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  try {
    const csrfValidation = await validateCSRFRequest(request);
    if (!csrfValidation.isValid) {
      logCSRFEvent('token_failed', {
        error: `PUT /api/portfolio: ${csrfValidation.error || 'CSRF validation failed'}`,
      });
      return NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      );
    }
    logCSRFEvent('token_validated', {
      error: 'PUT /api/portfolio: File upload',
    });
  } catch (error) {
    console.error('CSRF validation error:', error);
    return NextResponse.json(
      { error: 'Security validation failed' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const clientIP = getClientIP(request);
    const validation = await validateUploadedFile(file, clientIP);

    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    await ensureUploadsDir();

    const secureFilename = generateSecureFilename(file.name);
    const filePath = path.join(UPLOADS_DIR, secureFilename);

    const originalBuffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await processImage(originalBuffer, file.type);

    await fs.writeFile(filePath, processedBuffer);

    const publicUrl = `/uploads/${secureFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: secureFilename,
      originalName: file.name,
      size: processedBuffer.length,
      type: file.type,
      message: 'File uploaded and processed successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);

    const clientIP = getClientIP(request);
    console.error(`Upload error from IP ${clientIP}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}
