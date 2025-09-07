import { BentoData } from '@/types/bento';

async function getCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/admin/csrf-token', {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Failed to get CSRF token:', response.status);
      return null;
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

export async function getPortfolioData(): Promise<BentoData> {
  try {
    const response = await fetch('/api/portfolio', {
      method: 'GET',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio data: ${response.status}`);
    }

    const data: BentoData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching portfolio data:', error);

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

export async function savePortfolioData(
  data: BentoData
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token');
    }

    const response = await fetch('/api/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
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

export async function getPortfolioDataStatic(): Promise<BentoData> {
  try {
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

export async function uploadFile(
  file: File
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const csrfToken = await getCSRFToken();
    if (!csrfToken) {
      throw new Error('Failed to obtain CSRF token');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/portfolio', {
      method: 'PUT',
      headers: {
        'X-CSRF-Token': csrfToken,
      },
      credentials: 'include',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || `Failed to upload file: ${response.status}`
      );
    }

    return {
      success: true,
      url: result.url,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}
