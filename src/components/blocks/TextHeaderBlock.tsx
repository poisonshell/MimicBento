import React from 'react';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

// Text Header Block Component - For flexible text content with 60px height
function TextHeaderBlockComponent({ block }: BlockComponentProps) {
  const { content } = block;

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl',
    '2xl': 'text-2xl',
  };

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  const colorClasses = {
    'gray-800': 'text-gray-800',
    black: 'text-black',
    'gray-600': 'text-gray-600',
    'gray-500': 'text-gray-500',
    'blue-600': 'text-blue-600',
    'green-600': 'text-green-600',
    'purple-600': 'text-purple-600',
    'red-600': 'text-red-600',
    'orange-600': 'text-orange-600',
    'indigo-600': 'text-indigo-600',
    'pink-600': 'text-pink-600',
  };

  // Type-safe content access
  const contentRecord = content as Record<string, unknown>;

  const textSize =
    typeof contentRecord.textSize === 'string'
      ? contentRecord.textSize
      : 'medium';
  const textAlign =
    typeof contentRecord.textAlign === 'string'
      ? contentRecord.textAlign
      : 'left';
  const contentColor =
    typeof contentRecord.color === 'string' ? contentRecord.color : 'gray-800';
  const contentTitle =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const subtitle =
    typeof contentRecord.subtitle === 'string' ? contentRecord.subtitle : '';
  const showIcon =
    typeof contentRecord.showIcon === 'boolean'
      ? contentRecord.showIcon
      : false;
  const iconEmoji =
    typeof contentRecord.icon === 'string' ? contentRecord.icon : '';

  const size = textSize as keyof typeof sizeClasses;
  const align = textAlign as keyof typeof alignClasses;
  const color = contentColor as keyof typeof colorClasses;

  const displayTitle = contentTitle || 'Text Header';

  return (
    <div className="flex items-center h-full py-2 px-4 transition-all duration-200 bg-white rounded-xl">
      <div className="w-full">
        <div className={`flex items-center gap-2 ${alignClasses[align]}`}>
          {showIcon && iconEmoji && (
            <span className="text-lg">{iconEmoji}</span>
          )}
          <h2
            className={`font-bold ${sizeClasses[size]} ${colorClasses[color]} transition-colors leading-tight`}
          >
            {displayTitle}
          </h2>
        </div>
        {subtitle && (
          <p
            className={`mt-0.5 text-gray-500 ${size === 'small' ? 'text-xs' : 'text-sm'
              } ${alignClasses[align]} leading-tight`}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'text-header',
  name: 'Text Header',
  icon: 'FiType',
  description: 'Flexible text header for sections and content (60px height)',
  defaultSize: 'header-half',
  supportedSizes: ['header-full', 'header-half'],
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
      key: 'title',
      label: 'Header Text',
      type: 'text',
      required: true,
      placeholder: 'Enter header text',
      help: 'The main text for this header',
      validation: {
        max: 100,
        message: 'Header text must be 100 characters or less',
      },
    },
    {
      key: 'subtitle',
      label: 'Subtitle (optional)',
      type: 'text',
      placeholder: 'Optional subtitle',
      help: 'Additional description text (keep short for 60px height)',
      validation: {
        max: 120,
        message: 'Subtitle must be 120 characters or less',
      },
    },
    {
      key: 'showIcon',
      label: 'Show Icon',
      type: 'checkbox',
      defaultValue: false,
      help: 'Add an emoji icon to the header',
    },
    {
      key: 'icon',
      label: 'Icon (Emoji)',
      type: 'text',
      placeholder: '🚀',
      help: 'Emoji to display next to the header text',
      dependencies: [
        {
          field: 'showIcon',
          value: true,
        },
      ],
      validation: {
        max: 4,
        message: 'Please use a single emoji',
      },
    },
    {
      key: 'textSize',
      label: 'Text Size',
      type: 'select',
      defaultValue: 'medium',
      options: [
        { value: 'small', label: 'Small (14px)' },
        { value: 'medium', label: 'Medium (16px)' },
        { value: 'large', label: 'Large (18px)' },
        { value: 'extra-large', label: 'Extra Large (20px)' },
        { value: '2xl', label: '2X Large (24px)' },
      ],
      help: 'Size of the header text (optimized for 60px height)',
    },
    {
      key: 'textAlign',
      label: 'Text Alignment',
      type: 'select',
      defaultValue: 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
      help: 'How to align the header text',
    },
    {
      key: 'color',
      label: 'Text Color',
      type: 'select',
      defaultValue: 'gray-800',
      options: [
        { value: 'black', label: 'Black' },
        { value: 'gray-800', label: 'Dark Gray' },
        { value: 'gray-600', label: 'Medium Gray' },
        { value: 'gray-500', label: 'Light Gray' },
        { value: 'blue-600', label: 'Blue' },
        { value: 'green-600', label: 'Green' },
        { value: 'purple-600', label: 'Purple' },
        { value: 'red-600', label: 'Red' },
        { value: 'orange-600', label: 'Orange' },
        { value: 'indigo-600', label: 'Indigo' },
        { value: 'pink-600', label: 'Pink' },
      ],
      help: 'Color of the header text',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const title = typeof data.title === 'string' ? data.title : '';
    if (!title) {
      return 'Header text is required';
    }
    return null;
  },
};

// Default content when creating a new text header block
const getDefaultContent = () => ({
  title: '',
  subtitle: '',
  textAlign: 'left',
  textSize: 'medium',
  color: 'gray-800',
  showIcon: false,
  icon: '',
});

// Preview component for add modal
const PreviewComponent: React.FC<{ content: Record<string, unknown> }> = ({
  content,
}) => {
  const contentRecord = content as Record<string, unknown>;
  const title =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const subtitle =
    typeof contentRecord.subtitle === 'string' ? contentRecord.subtitle : '';
  const showIcon =
    typeof contentRecord.showIcon === 'boolean'
      ? contentRecord.showIcon
      : false;
  const icon = typeof contentRecord.icon === 'string' ? contentRecord.icon : '';

  return (
    <div className="p-3 border rounded-lg bg-gray-50 h-16 flex items-center">
      <div className="flex items-center gap-2">
        {showIcon && icon && <span className="text-sm">{icon}</span>}
        <div>
          <h3 className="font-semibold text-sm text-gray-800">
            {title || 'Text Header'}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export const blockModule: BlockModule = {
  config,
  Component: TextHeaderBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent,
};

export default TextHeaderBlockComponent;
