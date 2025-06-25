'use client';

import { BentoBlock } from '@/types/bento';
import BentoBlockComponent from './BentoBlock';
import { useState } from 'react';
import {
  getSizeClasses,
  getRowHeights,
  calculateMaxRow,
  ResizeHandles,
  createResizeHandlers,
  useResizeKeyboardShortcuts,
  MobileLayout,
  AdminOverlays,
  createDragHandlers,
} from '@/utils';
import type { DragState } from '@/utils';

interface BentoGridProps {
  blocks: BentoBlock[];
  isMobile?: boolean;
  isAdmin?: boolean;
  onBlockPositionChange?: (
    blockId: string,
    newPosition: { x: number; y: number }
  ) => void;
  onBlockSizeChange?: (blockId: string, newSize: string) => void;
  onBlockEdit?: (block: BentoBlock) => void;
  onBlockDelete?: (blockId: string) => void;
  onAddBlock?: (position: { x: number; y: number }) => void;
}

export default function BentoGrid({
  blocks,
  isMobile = false,
  isAdmin = false,
  onBlockPositionChange,
  onBlockSizeChange,
  onBlockEdit,
  onBlockDelete,
  onAddBlock,
}: BentoGridProps) {
  // Drag state
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Resize state
  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [resizePreview, setResizePreview] = useState<{
    blockId: string;
    size: string;
  } | null>(null);
  const [showResizeHints, setShowResizeHints] = useState<string | null>(null);

  // Create resize handlers using the new utility
  const resizeHandlers = createResizeHandlers(
    blocks,
    {
      setResizingBlock,
      setResizePreview,
      setShowResizeHints,
    },
    onBlockSizeChange
  );

  // Create drag handlers using the new utility
  const dragState: DragState = { draggedBlock, dragOverCell };
  const dragHandlers = createDragHandlers(
    blocks,
    dragState,
    {
      setDraggedBlock,
      setDragOverCell,
    },
    onBlockPositionChange
  );

  // Use keyboard shortcuts hook
  useResizeKeyboardShortcuts(isAdmin, showResizeHints, blocks, resizeHandlers);

  if (isMobile) {
    // Mobile layout using the new utility component
    return (
      <MobileLayout
        blocks={blocks}
        isAdmin={isAdmin}
        onBlockEdit={onBlockEdit}
        onBlockDelete={onBlockDelete}
        onAddBlock={onAddBlock}
      />
    );
  }

  // Desktop layout: Original complex grid
  const maxRow = calculateMaxRow(blocks);
  const totalRows = isAdmin ? Math.max(maxRow + 3, 8) : maxRow;

  return (
    <div className="w-full overflow-hidden">
      <div
        className="grid gap-4 lg:gap-6 xl:gap-10 relative"
        style={{
          gridTemplateColumns: 'repeat(4, 175px)',
          gridTemplateRows: getRowHeights(totalRows, blocks),
          padding: '6px', // Padding for hover scale effects
        }}
      >
        {/* Admin overlays using the new utility component */}
        {isAdmin && (
          <AdminOverlays
            blocks={blocks}
            totalRows={totalRows}
            maxRow={maxRow}
            draggedBlock={draggedBlock}
            dragOverCell={dragOverCell}
            onAddBlock={onAddBlock}
            onDragOver={dragHandlers.handleDragOver}
            onDragLeave={dragHandlers.handleDragLeave}
            onDrop={dragHandlers.handleDrop}
          />
        )}

        {/* Blocks */}
        {blocks.map(block => {
          const sizeClasses = getSizeClasses(block.size);
          const isDragging = draggedBlock === block.id;
          const isSectionHeader = block.type === 'section-header';

          return (
            <div
              key={block.id}
              draggable={
                isAdmin && !['photo', 'section-header'].includes(block.type)
              }
              onDragStart={e => dragHandlers.handleDragStart(e, block.id)}
              onMouseEnter={() => setShowResizeHints(block.id)}
              onMouseLeave={e => {
                // Keep handles visible if mouse is moving to a resize handle
                const relatedTarget = e.relatedTarget as HTMLElement;
                const isMovingToHandle = relatedTarget?.closest(
                  '[data-resize-handle]'
                );
                if (!isMovingToHandle) {
                  setShowResizeHints(null);
                }
              }}
              className={`
                ${isAdmin && !['photo', 'section-header'].includes(block.type) ? 'cursor-move' : ''} 
                relative
                ${sizeClasses}
                ${isDragging ? 'opacity-80 z-50' : 'z-10 hover:z-30'}
                ${resizingBlock === block.id ? 'transition-all duration-300 ease-out scale-105' : 'transition-all duration-200 ease-out'}
                ${isAdmin ? 'group' : ''}
              `}
              style={{
                gridColumnStart: block.position.x + 1,
                gridRowStart: block.position.y + 1,
              }}
            >
              <BentoBlockComponent
                block={block}
                isAdmin={isAdmin}
                onEdit={onBlockEdit}
                onDelete={onBlockDelete}
              />

              {/* Area indicator for section headers */}
              {isAdmin && isSectionHeader && !isDragging && (
                <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border border-dashed border-gray-300 border-opacity-30 pointer-events-none rounded-lg"></div>
              )}

              {/* Enhanced resize handles for all resizable blocks */}
              {isAdmin && !isDragging && block.type !== 'section-header' && (
                <ResizeHandles
                  block={block}
                  isAdmin={isAdmin}
                  isDragging={isDragging}
                  showResizeHints={showResizeHints}
                  resizePreview={resizePreview}
                  resizeHandlers={resizeHandlers}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
