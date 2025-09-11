import React from 'react';
import { BentoBlock } from '@/types/bento';
import { blockRegistry } from '@/services/blockRegistry';
import { getNextSize, checkResizeCollisionWithHeightConstraint } from '@/utils';

// Types for resize functionality
export interface ResizeState {
  resizingBlock: string | null;
  resizePreview: {
    blockId: string;
    size: string;
  } | null;
  showResizeHints: string | null;
}

export interface ResizeHandlers {
  handleResize: (blockId: string, newSize: string) => void;
  handleResizePreview: (blockId: string, newSize: string) => void;
  clearResizePreview: () => void;
  getSupportedSizes: (blockType: string) => string[];
  setResizingBlock: (blockId: string | null) => void;
  setResizePreview: (preview: { blockId: string; size: string } | null) => void;
  setShowResizeHints: (blockId: string | null) => void;
}

// Get supported sizes for a block type
export const getSupportedSizes = (blockType: string): string[] => {
  const blockModule = blockRegistry.getBlock(blockType);
  return blockModule?.config?.supportedSizes || [];
};

// Create resize handlers
export const createResizeHandlers = (
  blocks: BentoBlock[],
  setState: {
    setResizingBlock: (blockId: string | null) => void;
    setResizePreview: (
      preview: { blockId: string; size: string } | null
    ) => void;
    setShowResizeHints: (blockId: string | null) => void;
  },
  onBlockSizeChange?: (blockId: string, newSize: string) => void
): ResizeHandlers => {
  const handleResize = (blockId: string, newSize: string) => {
    if (onBlockSizeChange) {
      const block = blocks.find(b => b.id === blockId);
      const supportedSizes = getSupportedSizes(block?.type || '');

      // Check if the new size is supported by this block type
      if (
        block &&
        supportedSizes.includes(newSize) &&
        !checkResizeCollisionWithHeightConstraint(blocks, blockId, newSize)
      ) {
        setState.setResizingBlock(blockId);
        // Add smooth transition delay
        setTimeout(() => {
          onBlockSizeChange(blockId, newSize);
          setState.setResizingBlock(null);
          setState.setResizePreview(null);
        }, 150);
      }
    }
  };

  const handleResizePreview = (blockId: string, newSize: string) => {
    const block = blocks.find(b => b.id === blockId);
    const supportedSizes = getSupportedSizes(block?.type || '');

    // Only show preview if the size is supported and no collision
    if (
      block &&
      supportedSizes.includes(newSize) &&
      !checkResizeCollisionWithHeightConstraint(blocks, blockId, newSize)
    ) {
      setState.setResizePreview({ blockId, size: newSize });
    }
  };

  const clearResizePreview = () => {
    setState.setResizePreview(null);
  };

  return {
    handleResize,
    handleResizePreview,
    clearResizePreview,
    getSupportedSizes,
    setResizingBlock: setState.setResizingBlock,
    setResizePreview: setState.setResizePreview,
    setShowResizeHints: setState.setShowResizeHints,
  };
};

// Resize handle component props
interface ResizeHandleProps {
  block: BentoBlock;
  direction: 'right' | 'down' | 'corner' | 'left' | 'up';
  showResizeHints: string | null;
  resizeHandlers: ResizeHandlers;
  className?: string;
}

// Individual resize handle component
export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  block,
  direction,
  showResizeHints,
  resizeHandlers,
  className = '',
}) => {
  const supportedSizes = resizeHandlers.getSupportedSizes(block.type);
  const nextSize = getNextSize(block.size, direction, supportedSizes);
  const isValidResize = nextSize !== block.size;

  if (!isValidResize) return null;

  const handleConfig = {
    right: {
      position: 'absolute top-1/2 -right-1 transform -translate-y-1/2',
      size: 'w-3 h-8',
      background: 'bg-white/95 hover:bg-blue-500 backdrop-blur-sm',
      cursor: 'cursor-e-resize',
      shadow: 'shadow-lg hover:shadow-xl',
      icon: (
        <svg
          className="w-3 h-3 fill-gray-800 hover:fill-white transition-colors duration-200"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    down: {
      position: 'absolute left-1/2 -bottom-1 transform -translate-x-1/2',
      size: 'w-8 h-3',
      background: 'bg-white/95 hover:bg-blue-500 backdrop-blur-sm',
      cursor: 'cursor-s-resize',
      shadow: 'shadow-lg hover:shadow-xl',
      icon: (
        <svg
          className="w-3 h-3 fill-gray-800 hover:fill-white transition-colors duration-200"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    corner: {
      position: 'absolute -bottom-1 -right-1',
      size: 'w-4 h-4',
      background: 'bg-white/95 hover:bg-emerald-500 backdrop-blur-sm',
      cursor: 'cursor-se-resize',
      shadow: 'shadow-lg hover:shadow-xl',
      icon: (
        <svg
          className="w-2.5 h-2.5 fill-gray-800 hover:fill-white transition-colors duration-200"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    left: {
      position: 'absolute top-1/2 -left-1 transform -translate-y-1/2',
      size: 'w-3 h-8',
      background: 'bg-white/95 hover:bg-amber-500 backdrop-blur-sm',
      cursor: 'cursor-w-resize',
      shadow: 'shadow-lg hover:shadow-xl',
      icon: (
        <svg
          className="w-3 h-3 fill-gray-800 hover:fill-white transition-colors duration-200"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    up: {
      position: 'absolute left-1/2 -top-1 transform -translate-x-1/2',
      size: 'w-8 h-3',
      background: 'bg-white/95 hover:bg-amber-500 backdrop-blur-sm',
      cursor: 'cursor-n-resize',
      shadow: 'shadow-lg hover:shadow-xl',
      icon: (
        <svg
          className="w-3 h-3 fill-gray-800 hover:fill-white transition-colors duration-200"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  };

  const config = handleConfig[direction];
  const isExpand =
    direction === 'right' || direction === 'down' || direction === 'corner';
  const action = isExpand ? 'Expand' : 'Shrink';

  return (
    <div
      data-resize-handle={direction}
      className={`
        ${config.position} ${config.size} ${config.background} ${config.cursor} ${config.shadow}
        rounded-lg z-50 transition-all duration-300 ease-out
        flex items-center justify-center
        ring-1 ring-gray-200/80 hover:ring-0
        ${showResizeHints === block.id
          ? 'opacity-100 scale-100'
          : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
        }
        hover:scale-110 active:scale-95
        ${className}
      `}
      onMouseDown={e => {
        e.preventDefault();
        e.stopPropagation();
        resizeHandlers.handleResize(block.id, nextSize);
      }}
      onMouseEnter={() => {
        resizeHandlers.handleResizePreview(block.id, nextSize);
      }}
      onMouseLeave={() => {
        resizeHandlers.clearResizePreview();
      }}
      title={`${action} to ${nextSize}`}
    >
      {config.icon}

      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-md bg-white/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

// Main resize handles container component
interface ResizeHandlesProps {
  block: BentoBlock;
  isAdmin: boolean;
  isDragging: boolean;
  showResizeHints: string | null;
  resizePreview: { blockId: string; size: string } | null;
  resizeHandlers: ResizeHandlers;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  block,
  isAdmin,
  isDragging,
  showResizeHints,
  resizePreview,
  resizeHandlers,
}) => {
  // Don't show resize handles for legacy section-header blocks (they should be migrated)
  if (!isAdmin || isDragging || block.type === 'section-header') {
    return null;
  }

  return (
    <>
      {/* Enhanced size indicator */}
      {showResizeHints === block.id && (
        <div className="absolute -top-8 left-0 z-40 animate-in fade-in duration-200">
          <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg ring-1 ring-gray-200/50">
            <span className="text-gray-600">Size:</span> {block.size}
          </div>
        </div>
      )}

      {/* Enhanced resize preview overlay */}
      {resizePreview?.blockId === block.id && (
        <div className="absolute inset-0 z-20 animate-in fade-in duration-200">
          {/* Preview border with animated gradient */}
          <div className="absolute inset-0 rounded-xl border-2 border-blue-400/80 bg-gradient-to-br from-blue-50/20 via-transparent to-blue-100/20 backdrop-blur-[1px]">
            {/* Animated corner indicators */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
          </div>

          {/* Preview size label */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-blue-600/95 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xl border border-blue-500/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
                {resizePreview.size}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resize handles with improved spacing and visibility */}
      <div className="resize-handles-container">
        <ResizeHandle
          block={block}
          direction="right"
          showResizeHints={showResizeHints}
          resizeHandlers={resizeHandlers}
        />

        <ResizeHandle
          block={block}
          direction="down"
          showResizeHints={showResizeHints}
          resizeHandlers={resizeHandlers}
        />

        <ResizeHandle
          block={block}
          direction="corner"
          showResizeHints={showResizeHints}
          resizeHandlers={resizeHandlers}
        />

        {/* Conditional shrink handles with better visual hierarchy */}
        {(block.size === 'wide' || block.size === 'large') && (
          <ResizeHandle
            block={block}
            direction="left"
            showResizeHints={showResizeHints}
            resizeHandlers={resizeHandlers}
          />
        )}

        {(block.size === 'medium' ||
          block.size === 'large' ||
          block.size === 'tall') && (
            <ResizeHandle
              block={block}
              direction="up"
              showResizeHints={showResizeHints}
              resizeHandlers={resizeHandlers}
            />
          )}
      </div>
    </>
  );
};

// Keyboard shortcuts for resizing
export const useResizeKeyboardShortcuts = (
  isAdmin: boolean,
  showResizeHints: string | null,
  blocks: BentoBlock[],
  resizeHandlers: ResizeHandlers
) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdmin || !showResizeHints) return;

      // showResizeHints is guaranteed to be a string (block ID) at this point
      const block = blocks.find(b => b.id === showResizeHints);
      if (!block) return;

      let direction = '';

      // Use Shift + Arrow keys for resizing
      if (e.shiftKey) {
        switch (e.key) {
          case 'ArrowRight':
            direction = 'right';
            break;
          case 'ArrowLeft':
            direction = 'left';
            break;
          case 'ArrowDown':
            direction = 'down';
            break;
          case 'ArrowUp':
            direction = 'up';
            break;
          case 'Enter':
            direction = 'corner';
            break;
        }

        if (direction) {
          e.preventDefault();
          const supportedSizes = resizeHandlers.getSupportedSizes(block.type);
          const nextSize = getNextSize(block.size, direction, supportedSizes);
          if (nextSize !== block.size) {
            resizeHandlers.handleResize(block.id, nextSize);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isAdmin, showResizeHints, blocks, resizeHandlers]);
};
