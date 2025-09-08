import { NextRequest, NextResponse } from 'next/server';

interface ContributionData {
  date: string;
  count: number;
  level: number;
}

interface GitHubContributionsResponse {
  contributions: ContributionData[];
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

      return NextResponse.json({ contributions: recentContributions });
    }

    return NextResponse.json({ contributions: [] });
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions' },
      { status: 500 }
    );
  }
}
