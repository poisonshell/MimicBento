import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function VideoBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;

  // Type-safe content access
  const contentRecord = content as Record<string, unknown>;
  const videoTitle =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const description =
    typeof contentRecord.description === 'string'
      ? contentRecord.description
      : '';
  const url = typeof contentRecord.url === 'string' ? contentRecord.url : '';
  const platform =
    typeof contentRecord.platform === 'string' ? contentRecord.platform : '';

  if (!url && !videoTitle && !title) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <span>Configure video details</span>
      </div>
    );
  }

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <div
      className={`flex flex-col justify-between h-full p-4 ${
        url ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
      }`}
      onClick={handleClick}
    >
      {/* Main content */}
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-gray-900 text-base line-clamp-2">
          {videoTitle || title || 'Video Title'}
        </div>
        {description && (
          <div className="text-gray-500 text-sm line-clamp-2">
            {description}
          </div>
        )}
        {platform && (
          <div className="text-gray-400 text-xs capitalize">{platform}</div>
        )}
      </div>

      {/* Action text at bottom */}
      <div className="mt-auto pt-2">
        {url && (
          <div className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
            Watch video →
          </div>
        )}
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'video',
  name: 'Video',
  icon: 'FiVideo',
  description: 'Video content or link',
  defaultSize: 'medium',
  supportedSizes: ['small', 'medium', 'large', 'wide'],
  category: 'media',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'title',
      label: 'Video Title',
      type: 'text',
      required: true,
      placeholder: 'Enter video title',
      help: 'The title of the video',
      validation: {
        max: 100,
        message: 'Title must be 100 characters or less',
      },
    },
    {
      key: 'description',
      label: 'Description (optional)',
      type: 'textarea',
      placeholder: 'Brief description of the video',
      help: 'Optional description or summary',
      validation: {
        max: 200,
        message: 'Description must be 200 characters or less',
      },
    },
    {
      key: 'url',
      label: 'Video URL',
      type: 'url',
      required: true,
      placeholder: 'https://youtube.com/watch?v=...',
      help: 'Link to YouTube, Vimeo, or other video platform',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL',
      },
    },
    {
      key: 'platform',
      label: 'Platform',
      type: 'select',
      defaultValue: 'youtube',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'twitch', label: 'Twitch' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'other', label: 'Other' },
      ],
      help: 'The video platform',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const title = typeof data.title === 'string' ? data.title : '';
    const url = typeof data.url === 'string' ? data.url : '';
    if (!title || !url) {
      return 'Video title and URL are required';
    }
    return null;
  },
};

// Default content when creating a new video block
const getDefaultContent = () => ({
  title: '',
  description: '',
  url: '',
  platform: 'youtube',
});

// Preview component for the add modal
function VideoPreviewComponent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const contentRecord = content as Record<string, unknown>;
  const title =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const platform =
    typeof contentRecord.platform === 'string' ? contentRecord.platform : '';

  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">🎥 {title || 'Video'}</div>
      <div className="text-gray-500 text-xs">
        {platform ? `${platform} video` : 'Video content'}
      </div>
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: VideoBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: VideoPreviewComponent,
};

// Export the component for backwards compatibility
export default VideoBlockComponent;
