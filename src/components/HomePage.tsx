'use client';

import BentoGrid from '@/components/BentoGrid';
import ProfileSidebar from '@/components/ProfileSidebar';
import { BentoBlock } from '@/types/bento';
import { useMobile } from '@/hooks/useMobile';

interface HomePageProps {
    initialData: {
        profile: { name: string; bio: string; avatar?: string };
        blocks: BentoBlock[];
    };
}

export default function HomePage({ initialData }: HomePageProps) {
    const isMobile = useMobile(1024);

    const { profile, blocks } = initialData;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
            <div className="flex min-h-screen w-full max-w-[1728px] flex-col">
                <div className="relative flex min-h-screen w-full flex-1 flex-col items-center">
                    <div className="flex h-full w-full max-w-[428px] items-center justify-center p-6 pt-12 pb-0 md:max-w-[768px] lg:max-w-[1024px] xl:absolute xl:top-0 xl:max-w-[min(100vw,1728px)] xl:items-stretch xl:justify-start xl:p-16">
                        <div className="flex w-full flex-col px-4 lg:mr-16 xl:mr-20 xl:flex-1 xl:px-0">
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
                        className="flex h-full w-full max-w-[428px] flex-1 flex-col p-6 pt-0 md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1728px] xl:flex-row xl:p-16 overflow-x-hidden"
                        data-bento-container="true"
                    >
                        <div className="mb-10 flex flex-col px-4 lg:mb-0 xl:mr-20 xl:flex-1 xl:px-0"></div>

                        <div
                            className="relative flex-1 lg:max-w-[900px] lg:mx-auto xl:max-w-[1000px] xl:flex-none xl:mx-0 min-w-0"
                            data-grid-container="true"
                        >
                            <BentoGrid blocks={blocks} isMobile={isMobile} />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
