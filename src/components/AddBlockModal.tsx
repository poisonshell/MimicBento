'use client';

import { createPortal } from 'react-dom';
import { useState, useRef, useEffect } from 'react';
import { BentoBlockType, BentoBlock, BlockConfig } from '@/types/bento';
import blockRegistry from '@/services/blockRegistry';
import { FormField, FormTextarea, FormSelect } from '@/utils';
import {
  X,
  ArrowLeft,
  Plus,
  Link,
  Type,
  Image,
  Video,
  Music,
  Clock,
  Map,
  Users,
  FileText,
  Layout,
  Upload,
  Loader2,
} from 'lucide-react';

// Icon mapping for block types
const getBlockIcon = (
  iconName: string | React.ReactNode,
  fallbackType?: string
) => {
  if (typeof iconName !== 'string') {
    return Type;
  }

  const iconMap = {
    Link: Link,
    FileText: FileText,
    Image: Image,
    Video: Video,
    Music: Music,
    Clock: Clock,
    Map: Map,
    Users: Users,
    Layout: Layout,
    // Fallback mapping by type
    link: Link,
    note: FileText,
    photo: Image,
    video: Video,
    music: Music,
    clock: Clock,
    map: Map,
    social: Users,
    'section-header': Layout,
  };

  return (
    iconMap[iconName as keyof typeof iconMap] ||
    iconMap[fallbackType as keyof typeof iconMap] ||
    Type
  );
};

// Category colors
const getCategoryColor = (category?: string) => {
  const colorMap = {
    content: 'bg-blue-50 border-blue-200 text-blue-700',
    media: 'bg-purple-50 border-purple-200 text-purple-700',
    social: 'bg-green-50 border-green-200 text-green-700',
    utility: 'bg-orange-50 border-orange-200 text-orange-700',
    layout: 'bg-gray-50 border-gray-200 text-gray-700',
  };

  return (
    colorMap[category as keyof typeof colorMap] ||
    'bg-gray-50 border-gray-200 text-gray-700'
  );
};

interface AddBlockModalProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onAddBlock: (block: BentoBlock) => void;
  allBlocks?: BentoBlock[];
}

export default function AddBlockModal({
  isOpen,
  position,
  onClose,
  onAddBlock,
  allBlocks = [],
}: AddBlockModalProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedType, setSelectedType] = useState<BentoBlockType | null>(null);
  const [blockData, setBlockData] = useState<Partial<BentoBlock>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [availableBlocks, setAvailableBlocks] = useState<BlockConfig[]>([]);
  const [isRegistryReady, setIsRegistryReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialize block registry and get available blocks
    blockRegistry
      .initialize()
      .then(() => {
        const configs = blockRegistry.getConfigs();
        setAvailableBlocks(configs);
        setIsRegistryReady(true);
      })
      .catch(console.error);
  }, []);

  if (!isOpen) return null;

  const handleTypeSelect = (type: BentoBlockType) => {
    // For social blocks, we'll check for duplicates after platform selection
    // This allows creating multiple social blocks but prevents duplicate platforms

    setSelectedType(type);

    // Generate unique ID
    const newId = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get default content from block module or fallback
    let defaultContent = {};
    const blockModule = blockRegistry.get(type);
    if (blockModule?.getDefaultContent) {
      defaultContent = blockModule.getDefaultContent();
    } else {
      defaultContent = getDefaultContent(type);
    }

    // Get default size from block config or fallback
    let defaultSize: BentoBlock['size'] = 'small';
    const blockConfig = availableBlocks.find(config => config.type === type);
    if (blockConfig) {
      defaultSize = blockConfig.defaultSize;
    } else if (type === 'section-header') {
      defaultSize = 'section-header';
    } else if (type === 'map') {
      defaultSize = 'wide';
    }

    // Auto-populate title for social blocks based on default platform
    let initialTitle = type === 'section-header' ? '' : 'New Block';
    if (type === 'social' && (defaultContent as any).platform) {
      const platformLabels: { [key: string]: string } = {
        x: 'X',
        instagram: 'Instagram',
        linkedin: 'LinkedIn',
        github: 'GitHub',
        youtube: 'YouTube',
        facebook: 'Facebook',
        tiktok: 'TikTok',
        discord: 'Discord',
        spotify: 'Spotify',
        twitch: 'Twitch',
      };

      const platform = (defaultContent as any).platform;
      initialTitle =
        platformLabels[platform] ||
        platform.charAt(0).toUpperCase() + platform.slice(1);
    }

    // Initialize block data with defaults
    setBlockData({
      id: newId,
      type,
      title: initialTitle,
      content: defaultContent,
      size: defaultSize,
      position,
    });

    setStep('configure');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedType(null);
    setBlockData({});
    setUploadError('');
  };

  const handleSave = () => {
    if (!blockData.id || !blockData.type) return;

    const completeBlock: BentoBlock = {
      id: blockData.id,
      type: blockData.type,
      title: blockData.title || '',
      content: blockData.content || {},
      size: blockData.size || 'small',
      position: blockData.position || position,
    };

    onAddBlock(completeBlock);
    handleClose();
  };

  const handleClose = () => {
    setStep('select');
    setSelectedType(null);
    setBlockData({});
    setUploadError('');
    onClose();
  };

  // Fallback for built-in block types that might not be in registry yet
  const getDefaultContent = (blockType: BentoBlockType) => {
    switch (blockType) {
      case 'social':
        return { platform: 'x', username: '', url: '' };
      case 'link':
        return { title: '', url: '', description: '' };
      case 'photo':
        return { url: '', alt: '', position: 'center' };
      case 'video':
        return { url: '', title: '' };
      case 'note':
        return { text: '' };
      case 'music':
        return { title: '', artist: '', url: '' };
      case 'map':
        return { location: '', address: '' };
      case 'clock':
        return { timezone: 'auto', format: '24h' };
      case 'section-header':
        return {
          title: '',
          subtitle: '',
          textAlign: 'left',
          textSize: 'medium',
          color: 'gray-800',
        };
      default:
        return {};
    }
  };

  const updateContent = (field: string, value: any) => {
    setBlockData(prev => {
      const newBlockData = {
        ...prev,
        content: {
          ...prev.content,
          [field]: value,
        },
      };

      // Auto-populate title for social blocks when platform is selected
      if (prev.type === 'social' && field === 'platform' && value) {
        // Check for duplicate platform
        const existingSocialBlocks = allBlocks.filter(
          block => block.type === 'social' && block.id !== prev.id
        );
        const existingPlatforms = existingSocialBlocks
          .map(block => block.content?.platform)
          .filter(Boolean);

        if (existingPlatforms.includes(value)) {
          alert(
            `You already have a ${value.charAt(0).toUpperCase() + value.slice(1)} social block.\n\nPlease edit the existing block instead of creating a duplicate.`
          );
          return prev; // Don't update if duplicate
        }

        const platformLabels: { [key: string]: string } = {
          x: 'X (Twitter)',
          instagram: 'Instagram',
          linkedin: 'LinkedIn',
          github: 'GitHub',
          youtube: 'YouTube',
          facebook: 'Facebook',
          tiktok: 'TikTok',
          discord: 'Discord',
          spotify: 'Spotify',
          twitch: 'Twitch',
        };

        newBlockData.title =
          platformLabels[value] ||
          value.charAt(0).toUpperCase() + value.slice(1);
      }

      return newBlockData;
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      updateContent('url', result.url);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderConfigureForm = () => {
    if (!selectedType) return null;

    // Check if block is registered in the registry
    const blockModule = blockRegistry.get(selectedType);
    if (blockModule?.configForm) {
      return renderDynamicForm(blockModule.configForm.fields);
    }

    // Default message for unregistered blocks
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Type className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-900 mb-2">
          Block Not Available
        </p>
        <p className="text-sm">
          This block type is not registered in the block registry.
        </p>
        <p className="text-sm mt-1">Please check the block configuration.</p>
      </div>
    );
  };

  const renderDynamicForm = (fields: any[]) => {
    return (
      <div className="space-y-6">
        {fields.map(field => {
          const currentValue =
            blockData.content?.[field.key] || field.defaultValue || '';

          // Check field dependencies
          if (field.dependencies) {
            const shouldShow = field.dependencies.every((dep: any) => {
              const depValue = blockData.content?.[dep.field];
              const condition = dep.condition || 'equals';

              switch (condition) {
                case 'equals':
                  return depValue === dep.value;
                case 'not-equals':
                  return depValue !== dep.value;
                case 'contains':
                  return String(depValue).includes(dep.value);
                case 'greater-than':
                  return Number(depValue) > Number(dep.value);
                case 'less-than':
                  return Number(depValue) < Number(dep.value);
                default:
                  return true;
              }
            });

            if (!shouldShow) return null;
          }

          switch (field.type) {
            case 'text':
            case 'url':
            case 'email':
            case 'password':
              return (
                <FormField
                  key={field.key}
                  label={field.label}
                  value={currentValue}
                  onChange={value => updateContent(field.key, value)}
                  placeholder={field.placeholder}
                  type={field.type}
                  required={field.required}
                  helpText={field.help}
                />
              );
            case 'number':
            case 'range':
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    value={currentValue}
                    onChange={e =>
                      updateContent(
                        field.key,
                        field.type === 'number'
                          ? Number(e.target.value)
                          : e.target.value
                      )
                    }
                    min={field.validation?.min}
                    max={field.validation?.max}
                    step={field.step}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                  {field.help && (
                    <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                  )}
                </div>
              );
            case 'date':
            case 'datetime-local':
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type={field.type}
                    value={currentValue}
                    onChange={e => updateContent(field.key, e.target.value)}
                    required={field.required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                  />
                  {field.help && (
                    <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                  )}
                </div>
              );
            case 'color':
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={currentValue || '#000000'}
                      onChange={e => updateContent(field.key, e.target.value)}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentValue}
                      onChange={e => updateContent(field.key, e.target.value)}
                      placeholder="#000000"
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  {field.help && (
                    <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                  )}
                </div>
              );
            case 'textarea':
              return (
                <FormTextarea
                  key={field.key}
                  label={field.label}
                  value={currentValue}
                  onChange={value => updateContent(field.key, value)}
                  placeholder={field.placeholder}
                  required={field.required}
                  helpText={field.help}
                  rows={field.rows || 4}
                />
              );
            case 'select':
              return (
                <FormSelect
                  key={field.key}
                  label={field.label}
                  value={currentValue}
                  onChange={value => updateContent(field.key, value)}
                  options={field.options || []}
                  required={field.required}
                  helpText={field.help}
                />
              );
            case 'radio':
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="space-y-3">
                    {(field.options || []).map((option: any) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.key}-${option.value}`}
                          name={field.key}
                          value={option.value}
                          checked={currentValue === option.value}
                          onChange={e =>
                            updateContent(field.key, e.target.value)
                          }
                          disabled={option.disabled}
                          className="h-4 w-4 text-black border-gray-300 focus:ring-black"
                        />
                        <label
                          htmlFor={`${field.key}-${option.value}`}
                          className="ml-3 text-sm font-medium text-gray-700"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {field.help && (
                    <p className="text-xs text-gray-500 mt-2">{field.help}</p>
                  )}
                </div>
              );
            case 'checkbox':
              return (
                <div key={field.key} className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id={field.key}
                    checked={currentValue}
                    onChange={e => updateContent(field.key, e.target.checked)}
                    className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={field.key}
                      className="text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>
                    {field.help && (
                      <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                    )}
                  </div>
                </div>
              );
            case 'file':
              return (
                <div key={field.key} className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {/* Current image preview */}
                  {currentValue && field.accept?.includes('image') && (
                    <div className="relative">
                      <img
                        src={currentValue}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity rounded-xl" />
                    </div>
                  )}

                  {/* Upload section */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-gray-400 transition-colors">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                      <button
                        type="button"
                        onClick={triggerFileUpload}
                        disabled={isUploading}
                        className="inline-flex items-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {field.label}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Or enter a URL below
                      </p>
                    </div>
                  </div>

                  {/* Manual URL input */}
                  <FormField
                    label=""
                    value={currentValue}
                    onChange={value => updateContent(field.key, value)}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />

                  {uploadError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
                      <X className="w-4 h-4" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {field.help && (
                    <p className="text-xs text-gray-500">{field.help}</p>
                  )}
                </div>
              );
            case 'custom':
              // Allow extensions to provide custom components
              if (field.CustomComponent) {
                return (
                  <div key={field.key}>
                    <field.CustomComponent
                      value={currentValue}
                      onChange={(value: any) => updateContent(field.key, value)}
                      field={field}
                    />
                    {field.help && (
                      <p className="text-xs text-gray-500 mt-2">{field.help}</p>
                    )}
                  </div>
                );
              }
              return (
                <div
                  key={field.key}
                  className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  Custom field type requires CustomComponent prop
                </div>
              );
            default:
              return (
                <div
                  key={field.key}
                  className="text-amber-600 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200"
                >
                  Unsupported field type: {field.type}
                </div>
              );
          }
        })}
      </div>
    );
  };

  const renderSelectStep = () => {
    if (!isRegistryReady) {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <div className="text-gray-500 font-medium">
            Loading available blocks...
          </div>
          <div className="text-gray-400 text-sm mt-1">Please wait a moment</div>
        </div>
      );
    }

    // Group blocks by category
    const blocksByCategory = availableBlocks.reduce(
      (acc, block) => {
        const category = block.category || 'other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(block);
        return acc;
      },
      {} as Record<string, BlockConfig[]>
    );

    const categoryOrder = [
      'content',
      'media',
      'social',
      'utility',
      'layout',
      'other',
    ];
    const sortedCategories = categoryOrder.filter(cat => blocksByCategory[cat]);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Add New Block
          </h3>
          <p className="text-gray-500">Choose a block type to get started</p>
        </div>

        <div className="space-y-6">
          {sortedCategories.map(category => (
            <div key={category}>
              <div className="flex items-center mb-4">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  {category}
                </h4>
                <div className="flex-1 ml-3 border-t border-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {blocksByCategory[category].map(config => {
                  const IconComponent = getBlockIcon(config.icon, config.type);
                  const categoryColor = getCategoryColor(config.category);

                  return (
                    <button
                      key={config.type}
                      onClick={() => handleTypeSelect(config.type)}
                      className="group relative p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-200 text-left"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm mb-1 truncate">
                            {config.name}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {config.description}
                          </div>
                        </div>
                      </div>

                      {config.category && (
                        <div
                          className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full border ${categoryColor}`}
                        >
                          {config.category}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="absolute inset-0" onClick={handleClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              {step === 'configure' && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {step === 'select' ? 'Add Block' : 'Configure Block'}
                </h2>
                {step === 'configure' && selectedType && (
                  <p className="text-sm text-gray-500 mt-1">
                    Setting up your{' '}
                    {availableBlocks.find(b => b.type === selectedType)?.name ||
                      selectedType}{' '}
                    block
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'select' ? renderSelectStep() : renderConfigureForm()}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            {step === 'select' ? (
              <button
                onClick={handleClose}
                className="w-full px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200"
              >
                Cancel
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleBack}
                  className="flex-1 px-4 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium border border-gray-200"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file input for photo uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>,
    document.body
  );
}
