import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function MusicBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;

  if (!content?.title && !content?.artist && !title) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <span>Configure music details</span>
      </div>
    );
  }

  const handleClick = () => {
    if (content?.url) {
      window.open(content.url, '_blank', 'noopener noreferrer');
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center h-full text-center p-4 ${
        content?.url ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
      }`}
      onClick={handleClick}
    >
      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
          {content?.title || title || 'Untitled'}
        </h3>
        {content?.artist && (
          <p className="text-gray-500 text-xs line-clamp-1">{content.artist}</p>
        )}
        {content?.url && (
          <p className="text-green-600 text-xs">Click to play</p>
        )}
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'music',
  name: 'Music',
  icon: 'Music',
  description: 'Music track or player',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium'],
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
      label: 'Song Title',
      type: 'text',
      required: true,
      placeholder: 'Enter song title',
      help: 'The name of the song or track',
      validation: {
        max: 100,
        message: 'Title must be 100 characters or less',
      },
    },
    {
      key: 'artist',
      label: 'Artist',
      type: 'text',
      required: true,
      placeholder: 'Enter artist name',
      help: 'The name of the artist or band',
      validation: {
        max: 100,
        message: 'Artist name must be 100 characters or less',
      },
    },
    {
      key: 'url',
      label: 'Music URL (optional)',
      type: 'url',
      placeholder: 'https://spotify.com/track/...',
      help: 'Link to Spotify, Apple Music, YouTube, etc.',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL',
      },
    },
  ],
  validate: data => {
    if (!data.title || !data.artist) {
      return 'Song title and artist are required';
    }
    return null;
  },
};

// Default content when creating a new music block
const getDefaultContent = () => ({
  title: '',
  artist: '',
  url: '',
});

// Preview component for the add modal
function MusicPreviewComponent({ content }: { content: any }) {
  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">🎵 {content.title || 'Music Track'}</div>
      <div className="text-gray-500 text-xs">
        by {content.artist || 'Artist'}
      </div>
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: MusicBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: MusicPreviewComponent,
};

// Export the component for backwards compatibility
export default MusicBlockComponent;
