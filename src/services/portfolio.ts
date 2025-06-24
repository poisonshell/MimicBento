import { BentoData } from '@/types/bento';

// Fetch portfolio data from API
export async function getPortfolioData(): Promise<BentoData> {
  try {
    const response = await fetch('/api/portfolio', {
      method: 'GET',
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio data: ${response.status}`);
    }

    const data: BentoData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);

    // Fallback to default data if API fails
    return {
      profile: {
        name: 'John Doe',
        bio: 'A passionate developer with a love for creating beautiful and functional web applications.',
        avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
      },
      blocks: [],
    };
  }
}

// Save portfolio data to API (admin only)
export async function savePortfolioData(
  data: BentoData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `Failed to save portfolio data: ${response.status}`
      );
    }

    return {
      success: true,
      message: result.message || 'Portfolio data saved successfully',
    };
  } catch (error) {
    console.error('Error saving portfolio data:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to save portfolio data',
    };
  }
}

// Client-side data fetching for static pages
export async function getPortfolioDataStatic(): Promise<BentoData> {
  try {
    // For static generation, read directly from the JSON file for better performance
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/data/portfolio.json`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch static portfolio data: ${response.status}`
      );
    }

    const data: BentoData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching static portfolio data:', error);

    // Fallback to default data
    return {
      profile: {
        name: 'John Doe',
        bio: 'A passionate developer with a love for creating beautiful and functional web applications.',
        avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
      },
      blocks: [],
    };
  }
}
