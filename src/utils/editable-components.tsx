import React from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface InlineEditFieldProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
}

export const InlineEditField: React.FC<InlineEditFieldProps> = ({
  value,
  onSave,
  onCancel,
  placeholder,
  className = '',
}) => {
  const [tempValue, setTempValue] = React.useState(value);

  const handleSave = () => {
    onSave(tempValue);
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <input
        type="text"
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 border-b-2 border-black bg-transparent text-inherit font-inherit outline-none"
        autoFocus
      />
      <button
        onClick={handleSave}
        className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
      >
        Save
      </button>
      <button
        onClick={handleCancel}
        className="px-3 py-1 bg-white text-black text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

interface InlineEditTextareaProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const InlineEditTextarea: React.FC<InlineEditTextareaProps> = ({
  value,
  onSave,
  onCancel,
  placeholder,
  className = '',
  rows = 3,
}) => {
  const [tempValue, setTempValue] = React.useState(value);

  const handleSave = () => {
    onSave(tempValue);
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <textarea
        value={tempValue}
        onChange={e => setTempValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className="w-full border-2 border-black bg-transparent text-inherit font-inherit outline-none resize-none rounded p-2"
        autoFocus
      />
      <div className="flex space-x-2">
        <button
          onClick={handleSave}
          className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors"
        >
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1 bg-white text-black text-sm rounded border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface AvatarEditModalProps {
  isOpen: boolean;
  currentAvatar?: string;
  name: string;
  onSave: (avatar: string) => void;
  onCancel: () => void;
}

export const AvatarEditModal: React.FC<AvatarEditModalProps> = ({
  isOpen,
  currentAvatar,
  name,
  onSave,
  onCancel,
}) => {
  const [tempAvatar, setTempAvatar] = React.useState(currentAvatar || '');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setTempAvatar(currentAvatar || '');
  }, [currentAvatar]);

  const handleSave = () => {
    onSave(tempAvatar);
  };

  const handleCancel = () => {
    setTempAvatar(currentAvatar || '');
    setUploadError('');
    onCancel();
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
        setTempAvatar(result.url);

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

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200">
        <div className="bg-black p-4 text-white relative">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Edit Profile Picture</h3>
            <button
              onClick={handleCancel}
              className="w-10 h-10 rounded-full bg-white text-black hover:bg-gray-100 transition-colors flex items-center justify-center font-bold text-lg"
              title="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                {tempAvatar ? (
                  <Image
                    src={tempAvatar}
                    alt="Preview"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-black text-white text-2xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {tempAvatar && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center border-2 border-white">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="mb-3">
            <button
              type="button"
              onClick={triggerFileUpload}
              disabled={isUploading}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  Upload Image
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {uploadError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          )}

          <div className="relative mb-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or use URL</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Image URL
            </label>
            <div className="relative">
              <input
                type="url"
                value={tempAvatar}
                onChange={e => setTempAvatar(e.target.value)}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-gray-200 transition-all duration-200 text-sm"
              />
              <div className="absolute right-3 top-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Paste a link to your profile picture from the web
            </p>
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-white text-black rounded-lg border border-gray-300 hover:bg-gray-100 font-medium transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
