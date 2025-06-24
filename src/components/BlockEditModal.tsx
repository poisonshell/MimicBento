'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BentoBlock } from '@/types/bento';
import blockRegistry from '@/services/blockRegistry';
import { FormField, FormTextarea, FormSelect, ModalButtons } from '@/utils';

interface BlockEditModalProps {
  block: BentoBlock;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBlock: BentoBlock) => void;
  allBlocks?: BentoBlock[];
}

export default function BlockEditModal({
  block,
  isOpen,
  onClose,
  onSave,
  allBlocks = [],
}: BlockEditModalProps) {
  const [editedBlock, setEditedBlock] = useState<BentoBlock>(block);
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setEditedBlock(block);
  }, [block]);

  const handleSave = () => {
    onSave(editedBlock);
    onClose();
  };

  const updateContent = (field: string, value: any) => {
    setEditedBlock(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value,
      },
    }));
  };

  const updateTitle = (title: string) => {
    setEditedBlock(prev => {
      const newContent = { ...prev.content };
      if (prev.type === 'section-header' && newContent.title !== undefined) {
        delete newContent.title;
      }

      return {
        ...prev,
        title,
        content: newContent,
      };
    });
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Please select a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        updateContent('url', result.url);

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadError(result.error || 'Failed to upload image.');
      }
    } catch (error) {
      setUploadError('Failed to upload image. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const renderEditForm = () => {
    const blockModule = blockRegistry.get(block.type);
    if (blockModule?.configForm) {
      return renderDynamicForm(blockModule.configForm.fields);
    }

    return (
      <div className="text-center py-8 text-gray-500">
        <p>This block type is not registered in the block registry.</p>
        <p className="text-sm mt-2">Please check the block configuration.</p>
      </div>
    );
  };

  const renderDynamicForm = (fields: any[]) => {
    return (
      <div className="space-y-4">
        {fields.map(field => {
          const currentValue =
            field.key === 'title'
              ? editedBlock.title ||
                editedBlock.content?.title ||
                field.defaultValue ||
                ''
              : editedBlock.content?.[field.key] || field.defaultValue || '';

          if (field.dependencies) {
            const shouldShow = field.dependencies.every((dep: any) => {
              const depValue =
                dep.field === 'title'
                  ? editedBlock.title
                  : editedBlock.content?.[dep.field];
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

          const updateValue = (value: any) => {
            if (field.key === 'title') {
              updateTitle(value);
            } else {
              updateContent(field.key, value);
            }
          };

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
                  onChange={updateValue}
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
                      updateValue(
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
                    onChange={e => updateValue(e.target.value)}
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
                      onChange={e => updateValue(e.target.value)}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={currentValue}
                      onChange={e => updateValue(e.target.value)}
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
                  onChange={updateValue}
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
                  onChange={updateValue}
                  options={field.options || []}
                  required={field.required}
                  helpText={field.help}
                />
              );
            case 'radio':
              return (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="space-y-2">
                    {(field.options || []).map((option: any) => (
                      <div key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          id={`${field.key}-${option.value}`}
                          name={field.key}
                          value={option.value}
                          checked={currentValue === option.value}
                          onChange={e => updateValue(e.target.value)}
                          disabled={option.disabled}
                          className="mr-2"
                        />
                        <label
                          htmlFor={`${field.key}-${option.value}`}
                          className="text-sm"
                        >
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {field.help && (
                    <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                  )}
                </div>
              );
            case 'checkbox':
              return (
                <div key={field.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={field.key}
                    checked={currentValue}
                    onChange={e => updateValue(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={field.key} className="text-sm font-medium">
                    {field.label}
                  </label>
                  {field.help && (
                    <p className="text-xs text-gray-500 ml-6">{field.help}</p>
                  )}
                </div>
              );
            case 'file':
              return (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>

                  {/* Current file preview  this needs improvement too small image now */}
                  {currentValue && field.accept?.includes('image') && (
                    <div className="mb-3">
                      <img
                        src={currentValue}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Upload button */}
                  <button
                    type="button"
                    onClick={triggerFileUpload}
                    disabled={isUploading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {isUploading ? 'Uploading...' : `Upload ${field.label}`}
                  </button>

                  {/* Manual URL input */}
                  <FormField
                    label="Or enter URL"
                    value={currentValue}
                    onChange={updateValue}
                    placeholder="https://example.com/file"
                    type="url"
                  />

                  {uploadError && (
                    <p className="text-red-500 text-sm">{uploadError}</p>
                  )}

                  {field.help && (
                    <p className="text-xs text-gray-500">{field.help}</p>
                  )}
                </div>
              );
            case 'custom':
              if (field.CustomComponent) {
                return (
                  <div key={field.key}>
                    <field.CustomComponent
                      value={currentValue}
                      onChange={updateValue}
                      field={field}
                    />
                    {field.help && (
                      <p className="text-xs text-gray-500 mt-1">{field.help}</p>
                    )}
                  </div>
                );
              }
              return (
                <div key={field.key} className="text-red-500 text-sm">
                  Custom field type requires CustomComponent prop
                </div>
              );
            default:
              return (
                <div key={field.key} className="text-yellow-600 text-sm">
                  Unsupported field type: {field.type}
                </div>
              );
          }
        })}
      </div>
    );
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-black p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">
              Edit {block.type.charAt(0).toUpperCase() + block.type.slice(1)}{' '}
              Block
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center font-bold text-lg"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderEditForm()}
          <ModalButtons onCancel={onClose} onSave={handleSave} />
        </div>
      </div>
    </div>,
    document.body
  );
}
