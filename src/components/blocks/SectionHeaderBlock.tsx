import React from 'react';
import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

// Section Header Block Component
function SectionHeaderBlockComponent({
  block,
  isMobile = false,
  isAdmin = false,
}: BlockComponentProps) {
  const { content, title } = block;

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

  // Support both new and legacy field names for backward compatibility
  const size = (content?.textSize ||
    content?.size ||
    'medium') as keyof typeof sizeClasses;
  const align = (content?.textAlign ||
    content?.align ||
    'left') as keyof typeof alignClasses;
  const color = (content?.color || 'gray-800') as keyof typeof colorClasses;

  const displayTitle = title || content?.title || 'Section Header';

  return (
    <div className="flex items-center h-full py-2 px-4 transition-all duration-200">
      <div className="w-full">
        <h2
          className={`font-bold ${sizeClasses[size]} ${alignClasses[align]} ${colorClasses[color]} transition-colors leading-tight`}
        >
          {displayTitle}
        </h2>
        {content?.subtitle && (
          <p
            className={`mt-0.5 text-gray-500 ${
              size === 'small' ? 'text-xs' : 'text-sm'
            } ${alignClasses[align]} leading-tight`}
          >
            {content.subtitle}
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
  icon: 'Layout',
  description: 'Organize content with section headers',
  defaultSize: 'section-header',
  supportedSizes: ['section-header'],
  category: 'layout',
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
  validate: data => {
    if (!data.title) {
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
const PreviewComponent: React.FC<{ content: any }> = ({ content }) => (
  <div className="p-3 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-sm text-gray-800">
      {content?.title || 'Section Header'}
    </h3>
    {content?.subtitle && (
      <p className="text-xs text-gray-500 mt-1">{content.subtitle}</p>
    )}
  </div>
);

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: SectionHeaderBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent,
};

// Default export for backward compatibility
export default SectionHeaderBlockComponent;
