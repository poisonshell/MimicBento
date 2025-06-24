'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BentoBlock, BlockFormField } from '@/types/bento';
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
}: BlockEditModalProps) {
  const [editedBlock, setEditedBlock] = useState<BentoBlock>(block);
  const [isMounted, setIsMounted] = useState(false);
  const [uploadError] = useState('');

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

  const updateContent = (field: string, value: unknown) => {
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

  // File upload functionality removed - using direct URL input only

  const renderEditForm = () => {
    const blockModule = blockRegistry.getBlock(block.type);
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

  const renderDynamicForm = (fields: BlockFormField[]) => {
    return (
      <div className="space-y-4">
        {fields.map(field => {
          const rawValue =
            field.key === 'title'
              ? editedBlock.title ||
                editedBlock.content?.title ||
                field.defaultValue ||
                ''
              : editedBlock.content?.[field.key] || field.defaultValue || '';

          // Safe type conversion based on field type
          const stringValue =
            typeof rawValue === 'string' ? rawValue : String(rawValue || '');
          const numberValue = typeof rawValue === 'number' ? rawValue : 0;
          const booleanValue = typeof rawValue === 'boolean' ? rawValue : false;

          if (field.dependencies) {
            const shouldShow = field.dependencies.every(
              (dep: { field: string; value: unknown; condition?: string }) => {
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
                    return String(depValue).includes(String(dep.value));
                  case 'greater-than':
                    return Number(depValue) > Number(dep.value);
                  case 'less-than':
                    return Number(depValue) < Number(dep.value);
                  default:
                    return true;
                }
              }
            );

            if (!shouldShow) return null;
          }

          const updateValue = (value: unknown) => {
            if (field.key === 'title') {
              updateTitle(String(value));
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
                  value={stringValue}
                  onChange={updateValue}
                  placeholder={field.placeholder}
                  type={field.type === 'password' ? 'text' : field.type}
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
                    value={field.type === 'number' ? numberValue : stringValue}
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
                    value={stringValue}
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
                      value={stringValue || '#000000'}
                      onChange={e => updateValue(e.target.value)}
                      className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={stringValue}
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
                  value={stringValue}
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
                  value={stringValue}
                  onChange={updateValue}
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
                    {(field.options || []).map(
                      (option: {
                        value: string;
                        label: string;
                        disabled?: boolean;
                      }) => (
                        <div key={option.value} className="flex items-center">
                          <input
                            type="radio"
                            id={`${field.key}-${option.value}`}
                            name={field.key}
                            value={option.value}
                            checked={stringValue === option.value}
                            onChange={e => updateValue(e.target.value)}
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
                      )
                    )}
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
                    checked={booleanValue}
                    onChange={e => updateValue(e.target.checked)}
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
                  {stringValue && field.accept?.includes('image') && (
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stringValue}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity rounded-xl" />
                    </div>
                  )}

                  {/* Manual URL input */}
                  <FormField
                    label=""
                    value={stringValue}
                    onChange={updateValue}
                    placeholder="https://example.com/image.jpg"
                    type="url"
                  />

                  {uploadError && (
                    <div className="flex items-center space-x-2 text-red-600 text-sm">
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
                      value={stringValue}
                      onChange={updateValue}
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
