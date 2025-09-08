import HomePage from '@/components/HomePage';
import { getPortfolioDataServer } from '@/services/portfolioServer';
import '@/services/blockRegistry';

export default async function Home() {
  const portfolioData = await getPortfolioDataServer();

  const profile = portfolioData?.profile || {
    name: 'Portfolio',
    bio: 'Welcome to this portfolio',
    avatar: undefined,
  };
  const blocks = portfolioData?.blocks || [];
  const animations = portfolioData?.animations;

  return <HomePage initialData={{ profile, blocks, animations }} />;
}
