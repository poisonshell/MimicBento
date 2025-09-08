import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { manualCleanup, getUploadStats } from '@/utils/file-cleanup';

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

export async function GET(request: NextRequest) {
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
    const stats = await getUploadStats();

    return NextResponse.json({
      success: true,
      stats: {
        ...stats,
        totalSizeMB: Math.round((stats.totalSize / (1024 * 1024)) * 100) / 100,
        recommendation:
          stats.oldFiles > 0
            ? `${stats.oldFiles} old files can be cleaned up`
            : 'No cleanup needed',
      },
    });
  } catch (error) {
    console.error('Error getting upload stats:', error);
    return NextResponse.json(
      { error: 'Failed to get upload statistics' },
      { status: 500 }
    );
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
    const result = await manualCleanup();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        details: result.details,
      });
    } else {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    return NextResponse.json(
      { error: 'Failed to perform cleanup' },
      { status: 500 }
    );
  }
}
