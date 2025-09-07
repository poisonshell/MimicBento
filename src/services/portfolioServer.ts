import { BentoData } from '@/types/bento';
import { promises as fs } from 'fs';
import path from 'path';

export async function getPortfolioDataServer(): Promise<BentoData> {
  try {
    const dataFilePath = path.join(
      process.cwd(),
      'public',
      'data',
      'portfolio.json'
    );

    try {
      await fs.access(dataFilePath);
    } catch {
      console.warn('Portfolio data file not found, using default data');
      return getDefaultData();
    }

    const fileContents = await fs.readFile(dataFilePath, 'utf8');
    const data: BentoData = JSON.parse(fileContents);

    return data;
  } catch (error) {
    console.error('Error reading portfolio data:', error);

    return getDefaultData();
  }
}

function getDefaultData(): BentoData {
  return {
    profile: {
      name: 'John Doe',
      bio: 'A passionate developer with a love for creating beautiful and functional web applications.',
      avatar: 'https://randomuser.me/api/portraits/men/60.jpg',
    },
    blocks: [],
  };
}
