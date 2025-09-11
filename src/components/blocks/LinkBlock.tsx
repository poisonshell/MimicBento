import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function LinkBlockComponent({ block }: BlockComponentProps) {
  const { content } = block;

  const url = typeof content?.url === 'string' ? content.url : '';
  const title = typeof content?.title === 'string' ? content.title : '';
  const description =
    typeof content?.description === 'string' ? content.description : '';
  const logo = typeof content?.logo === 'string' ? content.logo : '';
  const backgroundColor =
    typeof content?.backgroundColor === 'string' ? content.backgroundColor : '';

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500">
        <span>Configure link URL</span>
      </div>
    );
  }

  // Dynamic styling based on background color
  const hasCustomBackground = backgroundColor && backgroundColor !== '';
  const containerStyle = hasCustomBackground ? { backgroundColor } : {};

  // Text color adjustments based on background
  const getTextColor = () => {
    if (!hasCustomBackground) return 'text-gray-900';

    // Simple light/dark detection for better contrast
    if (backgroundColor) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? 'text-gray-900' : 'text-white';
    }
    return 'text-gray-900';
  };

  const getSecondaryTextColor = () => {
    if (!hasCustomBackground) return 'text-gray-500';
    const primaryColor = getTextColor();
    return primaryColor === 'text-white' ? 'text-gray-200' : 'text-gray-600';
  };

  const getUrlTextColor = () => {
    if (!hasCustomBackground) return 'text-gray-400';
    const primaryColor = getTextColor();
    return primaryColor === 'text-white' ? 'text-gray-300' : 'text-gray-500';
  };

  const textColor = getTextColor();
  const secondaryTextColor = getSecondaryTextColor();
  const urlTextColor = getUrlTextColor();

  return (
    <div
      className={`flex flex-col justify-between h-full p-4 relative rounded-xl transition-all duration-200 ${hasCustomBackground ? '' : 'bg-white'} hover:shadow-md`}
      style={containerStyle}
    >
      {/* Title and description at the top */}
      <div className="flex flex-col space-y-1">
        <div className={`font-medium text-base ${textColor} line-clamp-2`}>
          {title || 'Link'}
        </div>
        {description && (
          <div className={`text-sm ${secondaryTextColor} line-clamp-2`}>
            {description}
          </div>
        )}
      </div>

      {/* Centered logo */}
      {logo && (
        <div className="flex-1 flex items-center justify-center py-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logo}
            alt={`${title} logo`}
            className="w-12 h-12 rounded-lg object-cover shadow-sm"
            onError={e => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* URL at bottom */}
      <div className={`text-xs ${urlTextColor} truncate mt-3`}>
        {url.replace(/^https?:\/\//, '')}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 rounded-xl"
        aria-label={`Visit ${title || 'link'}`}
      />
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'link',
  name: 'Link',
  icon: 'FiLink',
  description: 'External link with title and description',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium', 'wide'],
  category: 'content',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'url',
      label: 'URL',
      type: 'url',
      required: true,
      placeholder: 'https://example.com',
      help: 'The URL this block will link to',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL starting with http:// or https://',
      },
    },
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Link title',
      help: 'Display title for the link',
      validation: {
        max: 50,
        message: 'Title must be 50 characters or less',
      },
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Optional description',
      help: 'Additional details about the link',
      validation: {
        max: 150,
        message: 'Description must be 150 characters or less',
      },
    },
    {
      key: 'logo',
      label: 'Logo/Icon (optional)',
      type: 'file',
      placeholder: 'https://example.com/logo.png',
      help: 'Upload a logo or icon for this link (recommended size: 40x40px)',
      accept: 'image/*',
      validation: {
        pattern:
          '^(https?://.*\\.(jpg|jpeg|png|gif|webp|svg)($|\\?)|/uploads/.*\\.(jpg|jpeg|png|gif|webp))($|\\?)',
        message: 'Please upload an image or enter a valid image URL',
      },
    },
    {
      key: 'backgroundColor',
      label: 'Background Color (optional)',
      type: 'color',
      placeholder: '#ffffff',
      help: 'Set a custom background color for this link block',
      defaultValue: '',
    },
  ],
  validate: data => {
    if (!data.url || !data.title) {
      return 'URL and title are required';
    }
    return null;
  },
};

// Default content when creating a new link block
const getDefaultContent = () => ({
  url: '',
  title: '',
  description: '',
  logo: '',
  backgroundColor: '',
});

// Preview component for the add modal
function LinkPreviewComponent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const title = typeof content.title === 'string' ? content.title : '';
  const description =
    typeof content.description === 'string' ? content.description : '';
  const url = typeof content.url === 'string' ? content.url : '';
  const logo = typeof content.logo === 'string' ? content.logo : '';
  const backgroundColor =
    typeof content.backgroundColor === 'string' ? content.backgroundColor : '';

  const hasCustomBackground = backgroundColor && backgroundColor !== '';
  const containerStyle = hasCustomBackground ? { backgroundColor } : {};

  return (
    <div
      className={`p-3 border rounded-lg text-sm ${hasCustomBackground ? '' : 'bg-white'}`}
      style={containerStyle}
    >
      <div className="flex items-start space-x-2">
        {logo && (
          <div className="flex-shrink-0 w-6 h-6 rounded overflow-hidden bg-white/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className={`font-medium ${hasCustomBackground ? (backgroundColor && parseInt(backgroundColor.replace('#', ''), 16) > 0x888888 ? 'text-gray-900' : 'text-white') : 'text-gray-900'}`}
          >
            {title || 'Link Title'}
          </div>
          {description && (
            <div
              className={`text-xs mt-1 ${hasCustomBackground ? (backgroundColor && parseInt(backgroundColor.replace('#', ''), 16) > 0x888888 ? 'text-gray-600' : 'text-gray-200') : 'text-gray-500'}`}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      <div
        className={`text-xs mt-2 truncate ${hasCustomBackground ? (backgroundColor && parseInt(backgroundColor.replace('#', ''), 16) > 0x888888 ? 'text-gray-500' : 'text-gray-300') : 'text-blue-500'}`}
      >
        {url || 'https://example.com'}
      </div>
    </div>
  );
}

export const blockModule: BlockModule = {
  config,
  Component: LinkBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: LinkPreviewComponent,
};

export default LinkBlockComponent;
