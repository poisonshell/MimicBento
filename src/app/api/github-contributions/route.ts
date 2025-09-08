import { NextRequest, NextResponse } from 'next/server';

interface ContributionData {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsResponse {
  contributions: ContributionData[];
}

interface CacheEntry {
  data: ContributionData[];
  timestamp: number;
  expiresAt: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const cache = new Map<string, CacheEntry>();
const rateLimits = new Map<string, RateLimitEntry>();

const CACHE_TTL = 5 * 60 * 60 * 1000;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 20;

const ALLOWED_USERS = process.env.ALLOWED_GITHUB_USERS?.split(',').map(u =>
  u.trim()
) || ['poisonshell'];

setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now > entry.expiresAt) {
        cache.delete(key);
      }
    }

    for (const [ip, limit] of rateLimits.entries()) {
      if (now > limit.resetTime) {
        rateLimits.delete(ip);
      }
    }
  },
  60 * 60 * 1000
);

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return clientIP;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  limit.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - limit.count };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  const timeframe = searchParams.get('timeframe') || 'year';

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  if (!ALLOWED_USERS.includes(username.toLowerCase())) {
    return NextResponse.json(
      { error: 'Username not allowed' },
      { status: 403 }
    );
  }

  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  const cacheKey = `${username}-${timeframe}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);

  if (!rateLimit.allowed) {
    if (cached) {
      return NextResponse.json(
        { contributions: cached.data, fromCache: true, rateLimited: true },
        {
          status: 200,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(
              Math.ceil((rateLimits.get(clientIP)?.resetTime || now) / 1000)
            ),
          },
        }
      );
    }
    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
      },
      { status: 429 }
    );
  }

  if (cached && now < cached.expiresAt) {
    return NextResponse.json(
      { contributions: cached.data, fromCache: true },
      {
        headers: {
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }

  if (!username) {
    return NextResponse.json(
      { error: 'Username is required' },
      { status: 400 }
    );
  }

  let days = 365;
  switch (timeframe) {
    case '3months':
      days = 91;
      break;
    case '6months':
      days = 183;
      break;
    case 'year':
    default:
      days = 365;
      break;
  }

  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}`,
      {
        headers: {
          'User-Agent': 'MimicBento/1.0.0',
        },
      }
    );

    if (!response.ok) {
      if (cached) {
        return NextResponse.json(
          { contributions: cached.data, fromCache: true, stale: true },
          {
            headers: {
              'X-RateLimit-Remaining': String(rateLimit.remaining),
            },
          }
        );
      }
      throw new Error(
        `GitHub contributions API responded with status: ${response.status}`
      );
    }

    const data = (await response.json()) as GitHubContributionsResponse;

    if (data && data.contributions && Array.isArray(data.contributions)) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days + 1);

      const recentContributions = data.contributions
        .filter((contrib: ContributionData) => {
          const contribDate = new Date(contrib.date);
          return contribDate >= cutoffDate;
        })
        .map((contrib: ContributionData) => ({
          date: contrib.date,
          count: contrib.count || 0,
          level: Math.min(Math.max(contrib.level || 0, 0), 4),
        }));

      cache.set(cacheKey, {
        data: recentContributions,
        timestamp: now,
        expiresAt: now + CACHE_TTL,
      });

      return NextResponse.json(
        { contributions: recentContributions, fromCache: false },
        {
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'Cache-Control': 'public, max-age=3600',
          },
        }
      );
    }

    cache.set(cacheKey, {
      data: [],
      timestamp: now,
      expiresAt: now + CACHE_TTL,
    });

    return NextResponse.json({ contributions: [] });
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);

    if (cached) {
      return NextResponse.json(
        { contributions: cached.data, fromCache: true, stale: true },
        {
          headers: {
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    );
  }
}
