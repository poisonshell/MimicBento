'use client';

import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';
import { useState } from 'react';

// Utility functions for video thumbnails
function getYouTubeVideoId(url: string): string | null {
  // More comprehensive YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
    /(?:youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    /(?:youtu\.be\/)([^&\n?#]+)/,
    /(?:youtube\.com\/watch\?.*&v=)([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {

      return match[1];
    }
  }


  return null;
}

function getVimeoVideoId(url: string): string | null {
  const regex = /(?:vimeo\.com\/)(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function getYouTubeThumbnails(videoId: string): string[] {
  const thumbnails = [
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,    // High quality (480x360) - most reliable
    `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,    // Medium quality (320x180)
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // Max quality (1280x720) - not always available
    `https://img.youtube.com/vi/${videoId}/default.jpg`       // Default quality (120x90)
  ];


  return thumbnails;
}

function getVideoThumbnail(url: string, platform: string): string[] {
  if (platform === 'youtube') {
    const videoId = getYouTubeVideoId(url);
    return videoId ? getYouTubeThumbnails(videoId) : [];
  }

  if (platform === 'vimeo') {
    const videoId = getVimeoVideoId(url);
    return videoId ? [`https://vumbnail.com/${videoId}.jpg`] : [];
  }

  return [];
}

function VideoBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;
  const [imageError, setImageError] = useState(false);
  const [currentThumbnailIndex, setCurrentThumbnailIndex] = useState(0);

  // Type-safe content access
  const contentRecord = content as Record<string, unknown>;
  const videoTitle =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const description =
    typeof contentRecord.description === 'string'
      ? contentRecord.description
      : '';
  const url = typeof contentRecord.url === 'string' ? contentRecord.url : '';
  const platform =
    typeof contentRecord.platform === 'string' ? contentRecord.platform : '';

  if (!url && !videoTitle && !title) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <span>Configure video details</span>
      </div>
    );
  }

  const handleClick = () => {
    if (url) {
      window.open(url, '_blank', 'noopener noreferrer');
    }
  };

  const thumbnailUrls = getVideoThumbnail(url, platform);
  const currentThumbnailUrl = thumbnailUrls[currentThumbnailIndex];
  const showThumbnail = currentThumbnailUrl && !imageError && thumbnailUrls.length > 0;



  const handleImageError = () => {
    // Try next thumbnail quality if available
    if (currentThumbnailIndex < thumbnailUrls.length - 1) {
      setCurrentThumbnailIndex(prev => prev + 1);
    } else {
      // No more thumbnails to try
      setImageError(true);
    }
  };

  return (
    <div
      className={`flex flex-col h-full ${url ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
        } overflow-hidden rounded-lg`}
      onClick={handleClick}
    >


      {/* Thumbnail area */}
      {showThumbnail ? (

        <div className="relative flex-1 min-h-0">

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentThumbnailUrl}
            alt={videoTitle || title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-transparent hover:bg-black hover:bg-opacity-20 transition-all pointer-events-none">
            <div className="w-8 h-8 bg-red-600 bg-opacity-80 rounded-full flex items-center justify-center text-white shadow-md pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        /* Fallback content area */
        <div className="flex-1 flex items-center justify-center bg-gray-100 min-h-0">

          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mx-auto mb-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-sm text-gray-600 capitalize">{platform || 'video'}</div>
          </div>
        </div>
      )}

      {/* Content area */}
      <div className="p-3 bg-white">
        <div className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {videoTitle || title || 'Video Title'}
        </div>
        {description && (
          <div className="text-gray-500 text-xs line-clamp-2 mb-2">
            {description}
          </div>
        )}
        <div className="flex items-center justify-between">
          {platform && (
            <div className="text-gray-400 text-xs capitalize">{platform}</div>
          )}
          {url && (
            <div className="text-xs text-blue-600">
              Watch →
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'video',
  name: 'Video',
  icon: 'FiVideo',
  description: 'Video content or link',
  defaultSize: 'medium',
  supportedSizes: ['small', 'medium', 'large', 'wide'],
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
      label: 'Video Title',
      type: 'text',
      required: true,
      placeholder: 'Enter video title',
      help: 'The title of the video',
      validation: {
        max: 100,
        message: 'Title must be 100 characters or less',
      },
    },
    {
      key: 'description',
      label: 'Description (optional)',
      type: 'textarea',
      placeholder: 'Brief description of the video',
      help: 'Optional description or summary',
      validation: {
        max: 200,
        message: 'Description must be 200 characters or less',
      },
    },
    {
      key: 'url',
      label: 'Video URL',
      type: 'url',
      required: true,
      placeholder: 'https://youtube.com/watch?v=...',
      help: 'Paste the video URL from YouTube, Vimeo, Twitch, TikTok, or other platforms',
      validation: {
        pattern: '^https?://.*',
        message: 'Please enter a valid URL',
      },
    },
    {
      key: 'platform',
      label: 'Platform',
      type: 'select',
      defaultValue: 'youtube',
      options: [
        { value: 'youtube', label: 'YouTube' },
        { value: 'vimeo', label: 'Vimeo' },
        { value: 'twitch', label: 'Twitch' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'other', label: 'Other' },
      ],
      help: 'Select the platform where your video is hosted (auto-detects from URL)',
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const title = typeof data.title === 'string' ? data.title : '';
    const url = typeof data.url === 'string' ? data.url : '';
    if (!title || !url) {
      return 'Video title and URL are required';
    }
    return null;
  },
};

// Default content when creating a new video block
const getDefaultContent = () => ({
  title: '',
  description: '',
  url: '',
  platform: 'youtube',
});

// Preview component for the add modal
function VideoPreviewComponent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const [previewImageError, setPreviewImageError] = useState(false);
  const [previewThumbnailIndex, setPreviewThumbnailIndex] = useState(0);

  const contentRecord = content as Record<string, unknown>;
  const title =
    typeof contentRecord.title === 'string' ? contentRecord.title : '';
  const platform =
    typeof contentRecord.platform === 'string' ? contentRecord.platform : '';
  const url = typeof contentRecord.url === 'string' ? contentRecord.url : '';

  const thumbnailUrls = getVideoThumbnail(url, platform);
  const currentThumbnailUrl = thumbnailUrls[previewThumbnailIndex];
  const showThumbnail = currentThumbnailUrl && !previewImageError && thumbnailUrls.length > 0;

  const handlePreviewImageError = () => {
    if (previewThumbnailIndex < thumbnailUrls.length - 1) {
      setPreviewThumbnailIndex(prev => prev + 1);
    } else {
      setPreviewImageError(true);
    }
  };

  return (
    <div className="border rounded overflow-hidden">
      {showThumbnail ? (
        <div className="relative aspect-video bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentThumbnailUrl}
            alt={title || 'Video thumbnail'}
            className="w-full h-full object-cover"
            onError={handlePreviewImageError}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 mx-auto mb-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <div className="text-xs text-gray-500">{platform || 'Video'}</div>
          </div>
        </div>
      )}
      <div className="p-2">
        <div className="font-medium text-sm">{title || 'Video'}</div>
        <div className="text-gray-500 text-xs">
          {platform ? `${platform} video` : 'Video content'}
        </div>
      </div>
    </div>
  );
}

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: VideoBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: VideoPreviewComponent,
};

// Export the component for backwards compatibility
export default VideoBlockComponent;