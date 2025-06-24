'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
}: ToastProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 3000); //  3 seconds

      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  return (
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999]">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border max-w-sm transform transition-all duration-300 ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        } ${
          type === 'success'
            ? 'bg-black text-white border-gray-800'
            : 'bg-white text-black border-gray-200'
        }`}
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg
              className="w-5 h-5 text-white"
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
          ) : (
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className="flex-1 text-sm font-medium">{message}</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`flex-shrink-0 transition-colors ${
            type === 'success'
              ? 'text-gray-400 hover:text-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
