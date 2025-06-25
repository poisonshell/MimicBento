import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface BlockSkeletonProps {
  type?:
    | 'small'
    | 'medium'
    | 'large'
    | 'wide'
    | 'tall'
    | 'header-full'
    | 'header-half'
    | 'section-header';
  variant?:
    | 'default'
    | 'photo'
    | 'social'
    | 'link'
    | 'note'
    | 'music'
    | 'video'
    | 'clock'
    | 'map';
}

export default function BlockSkeleton({
  type = 'small',
  variant = 'default',
}: BlockSkeletonProps) {
  if (
    type === 'section-header' ||
    type === 'header-full' ||
    type === 'header-half'
  ) {
    return (
      <div className="p-4">
        <Skeleton height={20} width="40%" />
        <Skeleton height={12} width="60%" style={{ marginTop: 4 }} />
      </div>
    );
  }

  const renderSkeletonContent = () => {
    switch (variant) {
      case 'photo':
        return (
          <div className="h-full flex flex-col">
            {/* Main image area */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-300">
                <svg
                  className="w-12 h-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
            </div>
            {/* Title area at bottom */}
            <div className="p-3 bg-white">
              <Skeleton height={14} width="70%" />
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="p-4 h-full flex flex-col justify-center">
            {/* Social platform icon area */}
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <div className="text-gray-400">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                    <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Platform name */}
            <div className="text-center">
              <Skeleton height={16} width="60%" className="mx-auto" />
              <Skeleton
                height={12}
                width="40%"
                className="mx-auto"
                style={{ marginTop: 4 }}
              />
            </div>
          </div>
        );

      case 'link':
        return (
          <div className="p-4 h-full flex flex-col justify-between">
            <div>
              {/* Link title */}
              <Skeleton height={18} width="85%" />
              {/* Link description */}
              <Skeleton height={14} width="95%" style={{ marginTop: 8 }} />
              <Skeleton height={14} width="70%" style={{ marginTop: 4 }} />
            </div>
            {/* Link URL indicator */}
            <div className="flex items-center mt-4">
              <div className="w-4 h-4 bg-gray-200 rounded mr-2 flex items-center justify-center">
                <div className="text-gray-400">
                  <svg
                    className="w-2.5 h-2.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 6H6a2 2 0 00-2 2v8a2 2 0 002 2h4v-2H6V8h4V6zM14 6v2h4v8h-4v2h4a2 2 0 002-2V8a2 2 0 00-2-2h-4z" />
                    <path d="M8 12h8v2H8z" />
                  </svg>
                </div>
              </div>
              <Skeleton height={12} width="60%" />
            </div>
          </div>
        );

      case 'note':
        return (
          <div className="p-4 h-full">
            <Skeleton height={16} width="70%" />
            <Skeleton height={14} width="100%" style={{ marginTop: 8 }} />
            <Skeleton height={14} width="85%" style={{ marginTop: 4 }} />
            <Skeleton height={14} width="60%" style={{ marginTop: 4 }} />
          </div>
        );

      case 'music':
        return (
          <div className="p-4 h-full flex flex-col justify-center items-center">
            {/* Music icon */}
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <div className="text-gray-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            </div>
            {/* Song title */}
            <Skeleton height={16} width="80%" className="mb-2" />
            {/* Artist */}
            <Skeleton height={14} width="60%" />
          </div>
        );

      case 'video':
        return (
          <div className="h-full flex flex-col">
            {/* Video thumbnail area */}
            <div className="flex-1 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-300">
                <svg
                  className="w-16 h-16"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Video info */}
            <div className="p-3 bg-white">
              <Skeleton height={14} width="85%" />
              <Skeleton height={12} width="60%" style={{ marginTop: 4 }} />
            </div>
          </div>
        );

      case 'clock':
        return (
          <div className="p-4 h-full flex flex-col justify-center items-center">
            {/* Clock face */}
            <div className="w-20 h-20 border-4 border-gray-200 rounded-full flex items-center justify-center mb-4 relative">
              <div
                className="w-1 h-6 bg-gray-300 absolute"
                style={{ transform: 'rotate(90deg)' }}
              ></div>
              <div
                className="w-1 h-4 bg-gray-400 absolute"
                style={{ transform: 'rotate(0deg)' }}
              ></div>
            </div>
            {/* Time display */}
            <Skeleton height={20} width="60%" className="mb-2" />
            {/* Timezone */}
            <Skeleton height={12} width="40%" />
          </div>
        );

      case 'map':
        return (
          <div className="h-full bg-gray-100 relative overflow-hidden">
            {/* Map pattern background */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-4 grid-rows-4 h-full">
                {[...Array(16)].map((_, i) => (
                  <div key={i} className="border border-gray-300"></div>
                ))}
              </div>
            </div>
            {/* Map pin */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="text-red-400">
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </div>
            </div>
            {/* Location info */}
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3">
              <Skeleton height={14} width="70%" />
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 h-full">
            <Skeleton height={20} width="70%" />
            <Skeleton height={14} width="90%" style={{ marginTop: 8 }} />
            <Skeleton height={14} width="60%" style={{ marginTop: 4 }} />
            <div className="mt-4">
              <Skeleton height={40} />
            </div>
          </div>
        );
    }
  };

  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      {renderSkeletonContent()}
    </SkeletonTheme>
  );
}

// Skeleton for grid layout
export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div
        className="grid gap-4 lg:gap-6 xl:gap-10"
        style={{ gridTemplateColumns: 'repeat(4, 175px)' }}
      >
        {[...Array(count)].map((_, i) => (
          <div key={i} className="h-[175px]">
            <Skeleton height="100%" className="rounded-xl" />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}

// Skeleton for profile section
export function ProfileSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <SkeletonTheme baseColor="#f3f4f6" highlightColor="#e5e7eb">
      <div
        className={`flex flex-col ${isMobile ? 'items-center text-center' : 'items-center xl:items-start'}`}
      >
        <Skeleton
          circle
          height={isMobile ? 80 : 120}
          width={isMobile ? 80 : 120}
          className={!isMobile ? 'xl:!h-[184px] xl:!w-[184px]' : ''}
        />
        <div className="mt-4 xl:mt-8 w-full">
          <Skeleton height={isMobile ? 20 : 44} width="80%" />
          <Skeleton
            height={isMobile ? 14 : 20}
            width="90%"
            style={{ marginTop: isMobile ? 8 : 12 }}
          />
        </div>
      </div>
    </SkeletonTheme>
  );
}

// Skeleton for admin page layout
export function AdminPageSkeleton() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Loading spinner */}
        <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

        {/* Loading text */}
        <div className="text-gray-600 text-lg font-medium">
          Initializing block system...
        </div>

        {/* Subtitle */}
        <div className="text-gray-400 text-sm">
          Setting up your admin interface
        </div>
      </div>
    </main>
  );
}
