import SocialIcon from './SocialIcon';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

const platformColors: { [key: string]: { bg: string; text: string } } = {
  x: { bg: '#F7F9FA', text: '#0F1419' },
  instagram: { bg: '#FAFAFA', text: '#000000' },
  github: { bg: '#F6F8FA', text: '#24292F' },
  linkedin: { bg: '#F3F6F8', text: '#000000' },
  youtube: { bg: '#FFF5F5', text: '#000000' },
  default: { bg: '#F5F5F5', text: '#000000' },
};

const FollowButton = ({
  platform,
  isSmall = false,
}: {
  platform: string;
  isSmall?: boolean;
}) => {
  const buttonSize = isSmall ? 'px-2 py-1 text-xs' : 'px-4 py-1.5 text-sm';

  if (platform === 'x') {
    return (
      <div
        className={`${buttonSize} w-[55%] font-medium text-white bg-[#1D9BF0] rounded-[9999px]`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'instagram') {
    return (
      <div
        className={`${buttonSize} w-[60%]  font-medium text-white bg-[#E4405F] rounded-lg`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'github') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-[#24292F] bg-[#F6F8FA] border border-[#D0D7DE] rounded-md`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'youtube') {
    return (
      <div
        className={`${buttonSize} font-medium text-white bg-[#FF0000] rounded-md w-[75%]`}
      >
        Subscribe
      </div>
    );
  }
  if (platform === 'linkedin') {
    // LinkedIn should show a Connect button
    return (
      <div
        className={`${buttonSize} w-[65%] font-medium text-white bg-[#0077B5] rounded-md`}
      >
        Connect
      </div>
    );
  }
  if (platform === 'facebook') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-white bg-[#1877F2] rounded-lg`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'tiktok') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-white bg-[#000000] rounded-lg`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'discord') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-white bg-[#5865F2] rounded-lg`}
      >
        Join
      </div>
    );
  }
  if (platform === 'spotify') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-white bg-[#1DB954] rounded-lg`}
      >
        Follow
      </div>
    );
  }
  if (platform === 'twitch') {
    return (
      <div
        className={`${buttonSize} w-[60%] font-medium text-white bg-[#9146FF] rounded-lg`}
      >
        Follow
      </div>
    );
  }

  return null;
};

function SocialBlockComponent({
  block,
  isAdmin,
  isMobile,
}: BlockComponentProps) {
  const { content, title } = block;

  if (!content?.platform || !content?.url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">👤</div>
          <span>Configure social link</span>
        </div>
      </div>
    );
  }

  const platformName =
    title ||
    content.displayName ||
    content.platform.charAt(0).toUpperCase() + content.platform.slice(1);

  const description = content.username || content.description;
  const colors = platformColors[content.platform] || platformColors.default;

  // Use smaller text sizes for admin mobile view
  const titleTextSize = isAdmin && isMobile ? 'text-xs' : 'text-sm';
  const descriptionTextSize = isAdmin && isMobile ? 'text-xs' : 'text-sm';
  // Add extra spacing for admin mobile view
  const containerPadding = isAdmin && isMobile ? 'p-4' : 'p-6';
  const sectionSpacing = isAdmin && isMobile ? 'space-y-2' : '';

  return (
    <a
      href={content.url}
      target="_blank"
      rel="noopener noreferrer me"
      className={`${containerPadding} h-full w-full flex flex-col justify-between transition-all duration-300 ease-in-out hover:-translate-y-1 relative ${sectionSpacing} rounded-xl overflow-hidden`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <div className="relative w-10 h-10">
        <SocialIcon
          platform={content.platform}
          isAdmin={isAdmin}
          isMobile={isMobile}
        />
      </div>

      <div>
        <div className={titleTextSize}>{platformName}</div>
        {description && (
          <div className={`${descriptionTextSize} text-gray-500 mt-0.5`}>
            {description}
          </div>
        )}
      </div>

      <div className="left-4">
        <FollowButton
          platform={content.platform}
          isSmall={isAdmin && isMobile}
        />
      </div>
    </a>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'social',
  name: 'Social',
  icon: 'Users',
  description: 'Social media link',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium'],
  category: 'social',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'platform',
      label: 'Platform',
      type: 'select',
      required: true,
      options: [
        { value: 'x', label: 'X (Twitter)' },
        { value: 'instagram', label: 'Instagram' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'github', label: 'GitHub' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'discord', label: 'Discord' },
        { value: 'spotify', label: 'Spotify' },
        { value: 'twitch', label: 'Twitch' },
      ],
      help: 'Choose the social media platform',
    },
    {
      key: 'url',
      label: 'Profile URL',
      type: 'url',
      required: true,
      placeholder: 'https://x.com/username',
      help: 'Full URL to your social media profile',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL starting with http:// or https://',
      },
    },
    {
      key: 'username',
      label: 'Username (optional)',
      type: 'text',
      placeholder: '@username',
      help: 'Your username or handle on this platform',
      validation: {
        max: 50,
        message: 'Username must be 50 characters or less',
      },
    },
    {
      key: 'displayName',
      label: 'Display Name (optional)',
      type: 'text',
      placeholder: 'Custom display name',
      help: 'Custom name to display instead of platform name',
      validation: {
        max: 50,
        message: 'Display name must be 50 characters or less',
      },
    },
    {
      key: 'description',
      label: 'Description (optional)',
      type: 'text',
      placeholder: 'Additional description',
      help: 'Optional description text',
      validation: {
        max: 100,
        message: 'Description must be 100 characters or less',
      },
    },
  ],
  validate: data => {
    if (!data.platform || !data.url) {
      return 'Platform and URL are required';
    }

    // Validate URL matches platform (basic check)
    const platformDomains: { [key: string]: string[] } = {
      x: ['x.com', 'twitter.com'],
      instagram: ['instagram.com'],
      linkedin: ['linkedin.com'],
      github: ['github.com'],
      youtube: ['youtube.com', 'youtu.be'],
      facebook: ['facebook.com'],
      tiktok: ['tiktok.com'],
      discord: ['discord.com', 'discord.gg'],
      spotify: ['spotify.com', 'open.spotify.com'],
      twitch: ['twitch.tv'],
    };

    const domains = platformDomains[data.platform];
    if (domains && !domains.some(domain => data.url.includes(domain))) {
      return `URL should be from ${domains.join(' or ')} for ${data.platform}`;
    }

    return null;
  },
};

// Default content when creating a new social block
const getDefaultContent = () => ({
  platform: 'x',
  url: '',
  username: '',
  displayName: '',
  description: '',
});

// Preview component for the add modal
function SocialPreviewComponent({ content }: { content: any }) {
  const platformName =
    content.displayName ||
    (content.platform
      ? content.platform.charAt(0).toUpperCase() + content.platform.slice(1)
      : 'Social');

  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">👤 {platformName}</div>
      <div className="text-gray-500 text-xs">
        {content.username || content.platform || 'Social media link'}
      </div>
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: SocialBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: SocialPreviewComponent,
};

// Export the component for backwards compatibility
export default SocialBlockComponent;
