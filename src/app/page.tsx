import BentoGrid from '@/components/BentoGrid';
import ProfileSidebar from '@/components/ProfileSidebar';
import { getPortfolioDataStatic } from '@/services/portfolio';
import '@/services/blockRegistry';

export default async function Home() {
  const portfolioData = await getPortfolioDataStatic();

  //no data case handle gracefully
  const profile = portfolioData?.profile || {
    name: 'Portfolio',
    bio: 'Welcome to this portfolio',
    avatar: undefined,
  };
  const blocks = portfolioData?.blocks || [];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
      <div className="flex min-h-screen w-full max-w-[1728px] flex-col">
        <div className="relative flex min-h-screen w-full flex-1 flex-col items-center">
          <div className="flex h-full w-full max-w-[428px] items-center justify-center p-6 pt-12 pb-0 xl:absolute xl:top-0 xl:max-w-[min(100vw,1728px)] xl:items-stretch xl:justify-start xl:p-16">
            <div className="flex w-full flex-col px-4 xl:mr-20 xl:flex-1 xl:px-0">
              <div className="relative xl:sticky xl:top-16">
                <ProfileSidebar
                  name={profile.name}
                  bio={profile.bio}
                  avatar={profile.avatar}
                />
              </div>
            </div>
          </div>

          <div
            className="flex h-full w-full max-w-[428px] flex-1 flex-col p-6 pt-0 xl:max-w-[1728px] xl:flex-row xl:p-16 overflow-x-hidden"
            data-bento-container="true"
          >
            <div className="mb-10 flex flex-col px-4 xl:mb-0 xl:mr-20 xl:flex-1 xl:px-0"></div>

            <div
              className="relative flex-1 xl:max-w-[900px] xl:flex-none min-w-0"
              data-grid-container="true"
            >
              <BentoGrid blocks={blocks} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
