import React from 'react';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function SectionHeaderBlockComponent({ block }: BlockComponentProps) {
  const { content } = block;

  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    'extra-large': 'text-xl',
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
  };

  const contentRecord = content as Record<string, unknown>;

  const textSize =
    typeof contentRecord.textSize === 'string' ? contentRecord.textSize : '';
  const legacySize =
    typeof contentRecord.size === 'string' ? contentRecord.size : '';
  const textAlign =
    typeof contentRecord.textAlign === 'string' ? contentRecord.textAlign : '';
  const legacyAlign =
    typeof contentRecord.align === 'string' ? contentRecord.align : '';
  const contentColor =
    typeof contentRecord.color === 'string' ? contentRecord.color : '';
  const contentTitle =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const subtitle =
    typeof contentRecord.subtitle === 'string' ? contentRecord.subtitle : '';

  const size = (textSize || legacySize || 'medium') as keyof typeof sizeClasses;
  const align = (textAlign ||
    legacyAlign ||
    'left') as keyof typeof alignClasses;
  const color = (contentColor || 'gray-800') as keyof typeof colorClasses;

  const displayTitle = contentTitle || 'Section Header';

  return (
    <div className="flex items-center h-full py-2 px-4 transition-all duration-200">
      <div className="w-full">
        <h2
          className={`font-bold ${sizeClasses[size]} ${alignClasses[align]} ${colorClasses[color]} transition-colors leading-tight`}
        >
          {displayTitle}
        </h2>
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
  type: 'section-header',
  name: 'Section Header',
  icon: 'FiLayout',
  description: 'Full-width section title and description (60px height)',
  defaultSize: 'header-full',
  supportedSizes: ['header-full', 'header-half'],
  category: 'layout',
  version: '2.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'title',
      label: 'Section Title',
      type: 'text',
      required: true,
      placeholder: 'Enter section title',
      help: 'The main title for this section',
      validation: {
        max: 80,
        message: 'Title must be 80 characters or less',
      },
    },
    {
      key: 'subtitle',
      label: 'Subtitle (optional)',
      type: 'text',
      placeholder: 'Optional subtitle',
      help: 'Additional description for the section (keep short for 60px height)',
      validation: {
        max: 120,
        message: 'Subtitle must be 120 characters or less',
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
      ],
      help: 'Size of the section header text (optimized for 60px height)',
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
      help: 'How to align the section header text',
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
      ],
      help: 'Color of the section header text',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const title = typeof data.title === 'string' ? data.title : '';
    if (!title) {
      return 'Section title is required';
    }
    return null;
  },
};

// Default content when creating a new section header block
const getDefaultContent = () => ({
  title: '',
  subtitle: '',
  textAlign: 'left',
  textSize: 'medium',
  color: 'gray-800',
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

  return (
    <div className="p-3 border rounded-lg bg-gray-50">
      <h3 className="font-semibold text-sm text-gray-800">
        {title || 'Section Header'}
      </h3>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
};

export const blockModule: BlockModule = {
  config,
  Component: SectionHeaderBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent,
};

export default SectionHeaderBlockComponent;
