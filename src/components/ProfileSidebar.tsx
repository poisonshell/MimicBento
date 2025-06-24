import Image from 'next/image';

interface ProfileSidebarProps {
  name: string;
  bio: string;
  avatar?: string;
  isMobile?: boolean;
}

export default function ProfileSidebar({
  name,
  bio,
  avatar,
  isMobile = false,
}: ProfileSidebarProps) {
  const displayName = name?.trim() || 'Anonymous User';
  const fallbackLetter = displayName.charAt(0).toUpperCase() || 'A';

  if (isMobile) {
    return (
      <div className="flex flex-col items-center text-center w-full">
        {/* Avatar */}
        <div className="w-20 h-20 mb-4">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200">
            {avatar ? (
              <Image
                src={avatar}
                alt={name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-sm font-bold">
                {fallbackLetter}
              </div>
            )}
          </div>
        </div>

        {/* Name */}
        <h1 className="text-xl font-bold leading-tight tracking-tight mb-2">
          {displayName}
        </h1>

        {/* Bio */}
        {bio && (
          <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
            {bio}
          </p>
        )}
      </div>
    );
  }

  // Desktop layout
  return (
    <>
      {/* Avatar */}
      <div className="w-[120px] h-[120px] xl:w-[184px] xl:h-[184px]">
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              sizes="(max-width: 1280px) 120px, 184px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500 text-white text-lg font-bold">
              {fallbackLetter}
            </div>
          )}
        </div>
      </div>

      {/* Name, Bio, and Edit Link */}
      <div className="ml-2 mt-8 w-[calc(100%-8px)] max-w-[min(500px,calc(100%-8px))] xl:max-w-[min(500px,calc(100vw-1000px))]">
        <h1 className="text-[32px] font-bold leading-[120%] tracking-[-1px] xl:text-[44px] xl:tracking-[-2px]">
          {displayName}
        </h1>

        {/* Bio */}
        {bio && (
          <p className="mt-3 text-base text-[#565656] xl:mt-3 xl:text-xl">
            {bio}
          </p>
        )}
      </div>
    </>
  );
}
