import Image from 'next/image';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

// Helper function to get optimal image sizing based on block dimensions
const getImageSizing = (blockSize: string, fitMode: string = 'auto') => {
  // Block dimensions (width x height in pixels, including gaps)
  const dimensions = {
    small: { width: 175, height: 175, aspectRatio: 1 }, // 1x1
    medium: { width: 175, height: 360, aspectRatio: 0.49 }, // 1x2 (175px + 10px gap + 175px)
    large: { width: 360, height: 360, aspectRatio: 1 }, // 2x2 (175px + 10px gap + 175px)
    wide: { width: 360, height: 175, aspectRatio: 2.06 }, // 2x1
    'extra-wide': { width: 730, height: 175, aspectRatio: 4.17 }, // 4x1 (4*175px + 3*10px gaps)
    tall: { width: 175, height: 545, aspectRatio: 0.32 }, // 1x3 (175px + 10px + 175px + 10px + 175px)
    'header-full': { width: 730, height: 60, aspectRatio: 12.17 }, // 4x1 header
    'header-half': { width: 360, height: 60, aspectRatio: 6 }, // 2x1 header
    'section-header': { width: 730, height: 60, aspectRatio: 12.17 }, // Legacy 4x1 header
  };

  const blockDimensions =
    dimensions[blockSize as keyof typeof dimensions] || dimensions.small;

  // Calculate optimal sizes attribute for Next.js Image
  const sizes = `${blockDimensions.width}px`;

  // Determine best object-fit strategy based on fitMode and aspect ratio
  let objectFitClass = 'object-cover';

  if (fitMode === 'cover') {
    objectFitClass = 'object-cover';
  } else if (fitMode === 'contain') {
    objectFitClass = 'object-contain';
  } else if (fitMode === 'auto') {
    // Smart auto-fitting based on block aspect ratio
    if (blockDimensions.aspectRatio > 3) {
      // For very wide blocks (like headers), use contain to avoid cropping
      objectFitClass = 'object-contain';
    } else if (blockDimensions.aspectRatio < 0.6) {
      // For very tall blocks, use cover but with smart positioning
      objectFitClass = 'object-cover';
    } else {
      // For square-ish blocks, cover usually works best
      objectFitClass = 'object-cover';
    }
  }

  return {
    sizes,
    objectFitClass,
    priority: ['large', 'extra-wide', 'header-full'].includes(blockSize),
  };
};

// Helper function to get smart default positioning based on block size
const getSmartPosition = (blockSize: string, userPosition?: string): string => {
  // If user has set a specific position, use it
  if (userPosition && userPosition !== 'center') {
    return userPosition;
  }

  // Smart defaults based on block dimensions
  switch (blockSize) {
    case 'wide':
    case 'extra-wide':
      // For wide blocks, center horizontally but slightly favor top for faces/subjects
      return '50% 40%';
    case 'tall':
      // For tall blocks, center vertically but slightly favor top for portraits
      return '50% 35%';
    case 'medium':
      // For medium blocks (1x2), good for portraits - favor upper portion
      return '50% 30%';
    case 'header-full':
    case 'header-half':
    case 'section-header':
      // For headers, center the image
      return 'center';
    default:
      // For square blocks, center is usually best
      return 'center';
  }
};

function PhotoBlockComponent({ block }: BlockComponentProps) {
  const { content } = block;

  const url = typeof content.url === 'string' ? content.url : '';
  const alt = typeof content.alt === 'string' ? content.alt : '';
  const href = typeof content.href === 'string' ? content.href : '';
  const title = typeof content.title === 'string' ? content.title : '';
  const position =
    typeof content.position === 'string' ? content.position : 'center';
  const fitMode =
    typeof content.fitMode === 'string' ? content.fitMode : 'auto';

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

  const { sizes, objectFitClass, priority } = getImageSizing(
    block.size,
    fitMode
  );
  const objectPosition = getSmartPosition(block.size, position);

  // Adjust caption styling based on block size
  const getCaptionStyles = () => {
    const isHeader = ['header-full', 'header-half', 'section-header'].includes(
      block.size
    );
    const isWide = ['wide', 'extra-wide'].includes(block.size);
    const isSmall = block.size === 'small';

    if (isHeader) {
      return 'absolute bottom-1 left-1 bg-white px-1.5 py-1 text-[10px] shadow-sm rounded-[4px]';
    } else if (isSmall) {
      return 'absolute bottom-1 left-1 bg-white px-1.5 py-1 text-[11px] shadow-sm rounded-[6px]';
    } else if (isWide) {
      return 'absolute bottom-2 left-2 bg-white px-3 py-1.5 text-[14px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-[8px]';
    }

    return 'absolute bottom-2 left-2 bg-white px-2 py-1.5 text-[14px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)] rounded-[8px]';
  };

  const image = (
    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
      <Image
        src={url}
        alt={alt || title || 'Photo'}
        fill
        sizes={sizes}
        priority={priority && block.position.y <= 2}
        className={`${objectFitClass} transition-transform duration-300 ease-in-out group-hover:scale-105`}
        style={{ objectPosition }}
      />
      {title && (
        <div className={getCaptionStyles()}>
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
        { value: '25% 25%', label: 'Upper Left Quarter' },
        { value: '75% 25%', label: 'Upper Right Quarter' },
        { value: '25% 75%', label: 'Lower Left Quarter' },
        { value: '75% 75%', label: 'Lower Right Quarter' },
        { value: '50% 25%', label: 'Top Center' },
        { value: '50% 75%', label: 'Bottom Center' },
      ],
      help: 'How the image is positioned within the block. For portraits, try "Top Center" or "25% 25%"',
    },
    {
      key: 'fitMode',
      label: 'Image Fit',
      type: 'select',
      defaultValue: 'auto',
      options: [
        { value: 'auto', label: 'Auto (Smart)' },
        { value: 'cover', label: 'Cover (Fill)' },
        { value: 'contain', label: 'Contain (Fit)' },
      ],
      help: 'Auto uses smart fitting based on block size. Cover fills the block. Contain fits the entire image.',
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
  fitMode: 'auto',
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

export const blockModule: BlockModule = {
  config,
  Component: PhotoBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: PhotoPreviewComponent,
};

export default PhotoBlockComponent;
