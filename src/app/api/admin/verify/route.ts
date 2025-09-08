import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    const isAdminEnabled =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';

    if (!isAdminEnabled) {
      return NextResponse.json(
        { error: 'Admin panel disabled' },
        { status: 404 }
      );
    }

    const token = request.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    try {
      verify(token, process.env.NEXTAUTH_SECRET!);
      return NextResponse.json({ authenticated: true });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Authentication check failed' },
      { status: 500 }
    );
  }
}
