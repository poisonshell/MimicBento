import { BentoBlock } from '@/types/bento';
import blockRegistry from '@/services/blockRegistry';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { getSizeClasses } from '@/utils';
import { useState, useEffect } from 'react';
import BlockSkeleton from './BlockSkeleton';

interface BentoBlockProps {
  block: BentoBlock;
  isMobile?: boolean;
  isAdmin?: boolean;
  onEdit?: (block: BentoBlock) => void;
  onDelete?: (blockId: string) => void;
}

export default function BentoBlockComponent({
  block,
  isMobile = false,
  isAdmin = false,
  onEdit,
  onDelete,
}: BentoBlockProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRegistryReady, setIsRegistryReady] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Wait for the block registry to be initialized
    blockRegistry
      .initialize()
      .then(() => {
        setIsRegistryReady(true);
      })
      .catch(console.error);
  }, []);

  const getSkeletonVariant = (blockType: string) => {
    switch (blockType) {
      case 'photo':
        return 'photo';
      case 'social':
        return 'social';
      case 'link':
        return 'link';
      case 'note':
        return 'note';
      case 'music':
        return 'music';
      case 'video':
        return 'video';
      case 'clock':
        return 'clock';
      case 'map':
        return 'map';
      default:
        return 'default';
    }
  };

  const renderBlockContent = () => {
    // Check if registry is ready
    if (!isRegistryReady) {
      return (
        <BlockSkeleton
          type={block.size}
          variant={getSkeletonVariant(block.type)}
        />
      );
    }

    // Get block module from registry (including section-header now)
    const blockModule = blockRegistry.getBlock(block.type);

    if (!blockModule) {
      return (
        <div className="flex items-center justify-center text-gray-500 p-4">
          <div className="text-center">
            <div>Unknown block type: {block.type}</div>
            <div className="text-xs mt-1">Block not registered</div>
          </div>
        </div>
      );
    }

    // Render the block using the registered component
    const { Component } = blockModule;
    return (
      <Component
        block={block}
        isMobile={isMobile}
        isAdmin={isAdmin}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );
  };

  const handleClick = () => {
    // Prevent edit action if deletion is in progress
    if (isDeleting || showDeleteConfirm) {
      return;
    }

    if (isAdmin && onEdit) {
      onEdit(block);
    }
  };

  const interactiveClasses =
    block.type === 'clock'
      ? 'cursor-default'
      : isAdmin
        ? 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:z-30 transform transition-all duration-300 ease-out'
        : 'cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:z-30 transform transition-all duration-300 ease-out';

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    if (onDelete) {
      onDelete(block.id);
    }
    setShowDeleteConfirm(false);
    // Note: Component will be unmounted after deletion, so no need to reset isDeleting
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const getDeleteModalProps = () => {
    const isSection = block.type === 'section-header';
    return {
      title: isSection ? 'Delete Section' : 'Delete Block',
      message: isSection
        ? 'Are you sure you want to delete this section? This action cannot be undone.'
        : 'Are you sure you want to delete this block? This action cannot be undone.',
    };
  };

  // All blocks (including section-header) now use the unified rendering approach
  const modalProps = getDeleteModalProps();
  const isSection = block.type === 'section-header';

  return (
    <div
      className={`h-full rounded-xl overflow-hidden transition-all duration-300 ease-out ${
        isSection
          ? 'bg-transparent border-0'
          : 'bg-white border border-gray-200'
      } ${
        isMobile
          ? 'hover:scale-[1.02] hover:shadow-lg hover:z-10 transform cursor-pointer'
          : `${getSizeClasses(block.size, isMobile)} ${interactiveClasses}`
      } ${isAdmin ? 'group relative' : ''} ${isDeleting ? 'pointer-events-none opacity-50' : ''}`}
      onClick={handleClick}
    >
      {renderBlockContent()}

      {/* Admin buttons - now show for all blocks including section-header */}
      {isAdmin && !isDeleting && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={e => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800"
            title={isSection ? 'Edit section' : 'Edit block'}
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
            className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            title={isSection ? 'Delete section' : 'Delete block'}
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
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={modalProps.title}
        message={modalProps.message}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
