'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { InlineEditField, InlineEditTextarea, AvatarEditModal } from '@/utils';

interface EditableProfileProps {
  name: string;
  bio: string;
  avatar?: string;
  onNameChange: (name: string) => void;
  onBioChange: (bio: string) => void;
  onAvatarChange: (avatar: string) => void;
}

export default function EditableProfile({
  name,
  bio,
  avatar,
  onNameChange,
  onBioChange,
  onAvatarChange,
}: EditableProfileProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleNameSave = (newName: string) => {
    onNameChange(newName);
    setIsEditingName(false);
  };

  const handleBioSave = (newBio: string) => {
    onBioChange(newBio);
    setIsEditingBio(false);
  };

  const handleAvatarSave = (newAvatar: string) => {
    onAvatarChange(newAvatar);
    setIsEditingAvatar(false);
  };

  return (
    <>
      {/* Avatar */}
      <div className="w-[120px] h-[120px] xl:w-[184px] xl:h-[184px] group relative">
        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-gray-100 group-hover:border-gray-400 transition-all duration-200">
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 120px, 184px"
              onError={() => console.log('Image failed to load')}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-black text-white text-lg xl:text-2xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Small edit badge */}
        <button
          onClick={() => setIsEditingAvatar(true)}
          className="absolute -bottom-1 -right-1 w-8 h-8 xl:w-10 xl:h-10 bg-black hover:bg-gray-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100"
        >
          <svg
            className="w-4 h-4 xl:w-5 xl:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>

      {/* Name, Bio, and Edit controls */}
      <div className="ml-2 mt-8 w-[calc(100%-8px)] max-w-[min(500px,calc(100%-8px))] xl:max-w-[min(500px,calc(100vw-1000px))]">
        {/* Editable Name */}
        {isEditingName ? (
          <InlineEditField
            value={name}
            onSave={handleNameSave}
            onCancel={() => setIsEditingName(false)}
            className="mb-2"
          />
        ) : (
          <h1
            onClick={() => setIsEditingName(true)}
            className="text-[32px] font-bold leading-[120%] tracking-[-1px] xl:text-[44px] xl:tracking-[-2px] cursor-pointer hover:text-gray-600 transition-colors border-2 border-transparent hover:border-dashed hover:border-gray-400 rounded p-1 -m-1"
          >
            {name}
          </h1>
        )}

        {/* Editable Bio */}
        {isEditingBio ? (
          <InlineEditTextarea
            value={bio}
            onSave={handleBioSave}
            onCancel={() => setIsEditingBio(false)}
            placeholder="Click to add bio..."
            className="mt-3"
            rows={3}
          />
        ) : (
          <p
            onClick={() => setIsEditingBio(true)}
            className="mt-3 text-base text-[#565656] xl:mt-3 xl:text-xl cursor-pointer hover:text-gray-600 transition-colors border-2 border-transparent hover:border-dashed hover:border-gray-400 rounded p-2 -m-2"
          >
            {bio || 'Click to add bio...'}
          </p>
        )}
      </div>

      {/* Avatar Edit Modal */}
      {isEditingAvatar && isMounted && (
        <AvatarEditModal
          isOpen={isEditingAvatar}
          currentAvatar={avatar}
          name={name}
          onSave={handleAvatarSave}
          onCancel={() => setIsEditingAvatar(false)}
        />
      )}
    </>
  );
}
