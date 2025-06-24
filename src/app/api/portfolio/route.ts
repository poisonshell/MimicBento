import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { BentoData } from '@/types/bento';
import crypto from 'crypto';

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
    process.env.ENABLE_ADMIN === 'true'
  );
};

async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

function validateFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
    );
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Maximum size is 5MB.');
  }
}

function generateUniqueFilename(originalName: string) {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now();
  return `${timestamp}-${hash}${ext}`;
}

// portfolio data fetch always allowed
export async function GET() {
  try {
    const fileContents = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const data: BentoData = JSON.parse(fileContents);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading portfolio data:', error);

    // gracefully handle no data case
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

// save portfolio data for admin only in dev/local
// this is not used in production
export async function POST(request: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: 'Admin operations are not available in production' },
      { status: 403 }
    );
  }

  try {
    const data: BentoData = await request.json();

    // Validate data structure
    if (!data.profile || !data.blocks || !Array.isArray(data.blocks)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Write to JSON file
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

// PUT - Upload image file  data for admin only in dev/local
export async function PUT(request: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: 'Admin operations are not available in production' },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    validateFile(file);
    await ensureUploadsDir();
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = path.join(UPLOADS_DIR, uniqueFilename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);
    const publicUrl = `/uploads/${uniqueFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: uniqueFilename,
      originalName: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    );
  }
}
