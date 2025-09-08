import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import {
  createCSRFTokenWithTimestamp,
  createCSRFCookieHeader,
  logCSRFEvent,
  CSRF_CONFIG,
} from '@/utils/csrf';

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
    const { combined } = createCSRFTokenWithTimestamp();

    const response = NextResponse.json({
      success: true,
      token: combined,
      expiresIn: CSRF_CONFIG.TOKEN_LIFETIME,
      config: {
        headerName: CSRF_CONFIG.HEADER_NAME,
        cookieName: CSRF_CONFIG.COOKIE_NAME,
      },
    });

    response.headers.set('Set-Cookie', createCSRFCookieHeader(combined));

    const clientIP = getClientIP(request);
    logCSRFEvent('token_generated', {
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: Date.now(),
    });

    return response;
  } catch (error) {
    console.error('Error generating CSRF token:', error);

    const clientIP = getClientIP(request);
    logCSRFEvent('token_failed', {
      ip: clientIP,
      userAgent: request.headers.get('user-agent') || 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
