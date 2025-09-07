import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Decode the hash from environment variable (workaround for $ character issues)
function getPasswordHash(): string {
  const encoded = process.env.ADMIN_PASSWORD_HASH_ENCODED;
  if (encoded) {
    // Convert 2b__12__... back to $2b$12$...
    return '$' + encoded.replace(/__/g, '$');
  }
  // Fallback to default hash for "password"
  return '$2b$12$WC8Q.MnCnPLGGj9AvYlNo.458uKsc8GSqc5eNz.y06RNZ1XSy6wlS';
}

const ADMIN_PASSWORD_HASH = getPasswordHash();

function isAdminEnabled(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
  );
}

export async function POST(request: NextRequest) {
  // Check if admin panel is enabled
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: 'Admin panel is disabled' },
      { status: 404 }
    );
  }

  try {
    const { password } = await request.json();

    console.log('🔍 Login attempt received');
    console.log('📝 Password provided:', password ? 'YES' : 'NO');
    console.log('🔑 Raw env hash:', process.env.ADMIN_PASSWORD_HASH);
    console.log('🔑 Hash length:', ADMIN_PASSWORD_HASH?.length || 'undefined');
    console.log(
      '🔑 Hash starts with:',
      ADMIN_PASSWORD_HASH?.substring(0, 10) || 'undefined'
    );

    if (!ADMIN_PASSWORD_HASH) {
      console.log('❌ No password hash found in environment');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!password) {
      console.log('❌ No password provided');
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    console.log('🔄 Comparing password with hash...');
    const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    console.log('✅ Password validation result:', isValid);

    if (!isValid) {
      // Log failed attempt (for security monitoring)
      const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
      console.warn(
        `❌ Failed admin login attempt from ${clientIP} at ${new Date().toISOString()}`
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log successful login
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    console.log(
      `✅ Successful admin login from ${clientIP} at ${new Date().toISOString()}`
    );

    const token = jwt.sign(
      { admin: true, timestamp: Date.now() },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json({ success: true });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('💥 Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
