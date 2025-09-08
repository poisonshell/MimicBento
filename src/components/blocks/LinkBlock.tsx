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

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500">
        <span>Configure link URL</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between h-full p-4 relative">
      <div className="flex flex-col space-y-1">
        <div className="font-medium text-gray-900 text-base">
          {title || 'Link'}
        </div>
        {description && (
          <div className="text-gray-500 text-sm">{description}</div>
        )}
      </div>

      <div className="text-xs text-gray-400 truncate mt-2">{url}</div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0"
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

  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">{title || 'Link Title'}</div>
      {description && (
        <div className="text-gray-500 text-xs mt-1">{description}</div>
      )}
      <div className="text-blue-500 text-xs mt-1 truncate">
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
