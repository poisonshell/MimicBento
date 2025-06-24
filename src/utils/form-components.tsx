import React from 'react';
import { BentoBlock } from '@/types/bento';

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'url' | 'email';
  required?: boolean;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  helpText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
      placeholder={placeholder}
      required={required}
    />
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
);

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  helpText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  helpText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black resize-none"
      placeholder={placeholder}
      required={required}
    />
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
);

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  helpText?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  value,
  onChange,
  options,
  required = false,
  helpText,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-black focus:border-black"
      required={required}
    >
      {options.map(option => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
    {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
  </div>
);

interface ModalButtonsProps {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

export const ModalButtons: React.FC<ModalButtonsProps> = ({
  onCancel,
  onSave,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
}) => (
  <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
    <button
      onClick={onCancel}
      className="flex-1 px-4 py-3 bg-white text-black rounded-lg border border-gray-300 hover:bg-gray-100 font-medium transition-colors"
    >
      {cancelLabel}
    </button>
    <button
      onClick={onSave}
      className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors"
    >
      {saveLabel}
    </button>
  </div>
);
export const getUsedPlatforms = (
  allBlocks: BentoBlock[],
  currentBlockId: string
) => {
  return allBlocks
    .filter(b => b.type === 'social' && b.id !== currentBlockId)
    .map(b => b.content.platform)
    .filter(Boolean);
};

export const getSocialPlatformOptions = (
  usedPlatforms: string[],
  currentPlatform?: string
) => {
  const availablePlatforms = [
    { value: 'x', label: 'X (Twitter)' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'github', label: 'GitHub' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'discord', label: 'Discord' },
    { value: 'spotify', label: 'Spotify' },
    { value: 'twitch', label: 'Twitch' },
  ];

  return availablePlatforms.map(platform => {
    const isUsed = usedPlatforms.includes(platform.value);
    const isCurrentPlatform = currentPlatform === platform.value;

    return {
      value: platform.value,
      label:
        platform.label +
        (isUsed && !isCurrentPlatform ? ' (Already used)' : ''),
      disabled: isUsed && !isCurrentPlatform,
    };
  });
};
