import crypto from 'crypto';
import { NextRequest } from 'next/server';
import React from 'react';

export const CSRF_CONFIG = {
  TOKEN_LENGTH: 32,
  COOKIE_NAME: 'csrf-token',
  HEADER_NAME: 'x-csrf-token',
  FORM_FIELD_NAME: 'csrfToken',
  TOKEN_LIFETIME: 60 * 60 * 1000, // 1 hour
  COOKIE_OPTIONS: {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 60 * 60, // 1 hour in seconds
    path: '/',
  },
} as const;

export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_CONFIG.TOKEN_LENGTH).toString('hex');
}

export function createCSRFTokenWithTimestamp(): {
  token: string;
  timestamp: number;
  combined: string;
} {
  const token = generateCSRFToken();
  const timestamp = Date.now();
  const combined = `${token}.${timestamp}`;

  return { token, timestamp, combined };
}

export function validateCSRFTokenWithTimestamp(combined: string): boolean {
  try {
    const [token, timestampStr] = combined.split('.');

    if (!token || !timestampStr) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    if (now - timestamp > CSRF_CONFIG.TOKEN_LIFETIME) {
      return false;
    }

    if (token.length !== CSRF_CONFIG.TOKEN_LENGTH * 2) {
      return false;
    }

    if (!/^[a-f0-9]+$/i.test(token)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function extractCSRFToken(request: NextRequest): string | null {
  const headerToken = request.headers.get(CSRF_CONFIG.HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  const cookieToken = request.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export function validateCSRFRequest(request: NextRequest): {
  isValid: boolean;
  error?: string;
} {
  const requestToken = extractCSRFToken(request);

  if (!requestToken) {
    return {
      isValid: false,
      error: 'CSRF token missing from request',
    };
  }

  const cookieToken = request.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value;

  if (!cookieToken) {
    return {
      isValid: false,
      error: 'CSRF token missing from cookie',
    };
  }

  if (!validateCSRFTokenWithTimestamp(requestToken)) {
    return {
      isValid: false,
      error: 'Invalid or expired CSRF token',
    };
  }

  if (requestToken !== cookieToken) {
    return {
      isValid: false,
      error: 'CSRF token mismatch',
    };
  }

  return { isValid: true };
}

export function createCSRFCookieHeader(token: string): string {
  const options = CSRF_CONFIG.COOKIE_OPTIONS;

  let cookieHeader = `${CSRF_CONFIG.COOKIE_NAME}=${token}; Path=${options.path}; Max-Age=${options.maxAge}; SameSite=${options.sameSite}`;

  if (options.secure) {
    cookieHeader += '; Secure';
  }

  if (options.httpOnly) {
    cookieHeader += '; HttpOnly';
  }

  return cookieHeader;
}

export function getClientCSRFToken(): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === CSRF_CONFIG.COOKIE_NAME) {
      return decodeURIComponent(value);
    }
  }

  return null;
}

export function useCSRFToken(): {
  token: string | null;
  isLoading: boolean;
  refreshToken: () => Promise<void>;
} {
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshToken = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
      } else {
        console.error('Failed to get CSRF token');
        setToken(null);
      }
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const existingToken = getClientCSRFToken();
    if (existingToken && validateCSRFTokenWithTimestamp(existingToken)) {
      setToken(existingToken);
      setIsLoading(false);
    } else {
      refreshToken();
    }
  }, [refreshToken]);

  return { token, isLoading, refreshToken };
}

export function withCSRFProtection<T extends unknown[], R>(
  apiCall: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const token = getClientCSRFToken();

    if (!token) {
      throw new Error('CSRF token not available');
    }

    const originalFetch = global.fetch;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      headers.set(CSRF_CONFIG.HEADER_NAME, token);

      return originalFetch(input, {
        ...init,
        headers,
      });
    };

    try {
      const result = await apiCall(...args);
      return result;
    } finally {
      global.fetch = originalFetch;
    }
  };
}

export function logCSRFEvent(
  event:
    | 'token_generated'
    | 'token_validated'
    | 'token_failed'
    | 'token_expired',
  details: {
    ip?: string;
    userAgent?: string;
    error?: string;
    timestamp?: number;
  } = {}
) {
  const logEntry = {
    event,
    timestamp: Date.now(),
    ...details,
  };

  if (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
  ) {
    console.log('🛡️  CSRF Event:', logEntry);
  }
}
