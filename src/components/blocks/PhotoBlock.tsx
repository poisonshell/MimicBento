import Image from 'next/image';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function PhotoBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;

  const url = typeof content.url === 'string' ? content.url : '';
  const alt = typeof content.alt === 'string' ? content.alt : '';
  const href = typeof content.href === 'string' ? content.href : '';
  const position =
    typeof content.position === 'string' ? content.position : 'center';

  if (!url) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
        <div className="text-center">
          <div className="text-2xl mb-2">📷</div>
          <span>Add a photo</span>
        </div>
      </div>
    );
  }

  // Get object-position value, default to center
  const objectPosition = position;

  const image = (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <Image
        src={url}
        alt={alt || title || 'Photo'}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        priority={block.size === 'large' && block.position.y <= 2}
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        style={{ objectPosition }}
      />
      {title && (
        <div className="absolute bottom-2 left-2 bg-white px-2 py-1.5 text-[14px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-[8px]">
          <div className="line-clamp-2">{title}</div>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full h-full"
      >
        {image}
      </a>
    );
  }

  return <div className="group w-full h-full">{image}</div>;
}

// Block configuration
const config: BlockConfig = {
  type: 'photo',
  name: 'Photo',
  icon: 'FiImage',
  description: 'Image or photo',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium', 'large', 'wide', 'tall'],
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
      label: 'Caption/Title',
      type: 'text',
      placeholder: 'Add a caption for your photo',
      help: 'Optional caption that appears on the photo',
      validation: {
        max: 100,
        message: 'Caption must be 100 characters or less',
      },
    },
    {
      key: 'url',
      label: 'Image',
      type: 'file',
      required: true,
      placeholder: 'Upload an image or enter URL',
      help: 'Upload an image file or enter an image URL',
      validation: {
        pattern:
          '^(https?://.*\\.(jpg|jpeg|png|gif|webp|svg)($|\\?)|/uploads/.*\\.(jpg|jpeg|png|gif|webp))($|\\?)',
        message: 'Please upload an image or enter a valid image URL',
      },
    },
    {
      key: 'alt',
      label: 'Alt Text',
      type: 'text',
      placeholder: 'Describe the image',
      help: 'Alternative text for accessibility and SEO',
      validation: {
        max: 100,
        message: 'Alt text must be 100 characters or less',
      },
    },
    {
      key: 'position',
      label: 'Image Position',
      type: 'select',
      defaultValue: 'center',
      options: [
        { value: 'center', label: 'Center' },
        { value: 'top', label: 'Top' },
        { value: 'bottom', label: 'Bottom' },
        { value: 'left', label: 'Left' },
        { value: 'right', label: 'Right' },
        { value: 'top left', label: 'Top Left' },
        { value: 'top right', label: 'Top Right' },
        { value: 'bottom left', label: 'Bottom Left' },
        { value: 'bottom right', label: 'Bottom Right' },
      ],
      help: 'How the image is positioned within the block',
    },
    {
      key: 'href',
      label: 'Link URL (optional)',
      type: 'url',
      placeholder: 'https://example.com',
      help: 'Make the photo clickable with this link',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL',
      },
    },
  ],
  validate: data => {
    if (!data.url) {
      return 'Image URL is required';
    }
    return null;
  },
};

// Default content when creating a new photo block
const getDefaultContent = () => ({
  url: '',
  alt: '',
  position: 'center',
  href: '',
});

// Preview component for the add modal
function PhotoPreviewComponent({
  content,
  title,
}: {
  content: Record<string, unknown>;
  title?: string;
}) {
  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">📷 Photo</div>
      {title && (
        <div className="text-gray-700 text-xs mt-1 font-medium">
          &ldquo;{title}&rdquo;
        </div>
      )}
      {typeof content.url === 'string' && content.url ? (
        <div className="text-gray-500 text-xs mt-1">
          Image configured
          {typeof content.href === 'string' && content.href && ' • Clickable'}
        </div>
      ) : (
        <div className="text-gray-500 text-xs mt-1">No image URL set</div>
      )}
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: PhotoBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: PhotoPreviewComponent,
};

// Export the component for backwards compatibility
export default PhotoBlockComponent;
