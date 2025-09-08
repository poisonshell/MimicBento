'use client';

import { BentoBlock, BentoProfile, AnimationSettings } from '@/types/bento';
import BentoBlockComponent from './BentoBlock';
import { useState, useRef } from 'react';
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
import { AnimatedGrid, AnimatedWrapper } from '@/components/AnimatedWrapper';

interface BentoGridProps {
  blocks: BentoBlock[];
  profile?: BentoProfile;
  isMobile?: boolean;
  isAdmin?: boolean;
  animations?: AnimationSettings;
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
  profile,
  isMobile = false,
  isAdmin = false,
  animations,
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

  // Grid element ref for portal positioning
  const gridRef = useRef<HTMLDivElement>(null);

  // Use keyboard shortcuts hook
  useResizeKeyboardShortcuts(isAdmin, showResizeHints, blocks, resizeHandlers);

  if (isMobile) {
    // Mobile layout using the new utility component
    return (
      <MobileLayout
        blocks={blocks}
        isAdmin={isAdmin}
        animations={animations}
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
      <AnimatedGrid animations={animations}>
        <div
          ref={gridRef}
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
          {blocks.map((block, index) => {
            const sizeClasses = getSizeClasses(block.size);
            const isDragging = draggedBlock === block.id;
            const isHeaderType =
              ['section-header', 'header-full', 'header-half'].includes(
                block.size
              ) || block.type === 'section-header';

            return (
              <AnimatedWrapper
                key={block.id}
                animations={animations}
                index={index}
                className={`
                ${isAdmin && !['photo', 'section-header'].includes(block.type) && !isHeaderType ? 'cursor-move' : ''} 
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
                <div
                  draggable={
                    isAdmin && !['photo', 'section-header'].includes(block.type)
                  }
                  onDragStart={e => dragHandlers.handleDragStart(e, block.id)}
                  onDragEnd={dragHandlers.handleDragEnd}
                  onMouseEnter={() => setShowResizeHints(block.id)}
                  onMouseLeave={e => {
                    // Keep handles visible if mouse is moving to a resize handle
                    const relatedTarget = e.relatedTarget;
                    const isMovingToHandle =
                      relatedTarget &&
                      relatedTarget instanceof Element &&
                      relatedTarget.closest('[data-resize-handle]');
                    if (!isMovingToHandle) {
                      setShowResizeHints(null);
                    }
                  }}
                  className="w-full h-full"
                >
                  <BentoBlockComponent
                    block={block}
                    profile={profile}
                    isAdmin={isAdmin}
                    onEdit={onBlockEdit}
                    onDelete={onBlockDelete}
                  />

                  {/* Area indicator for header blocks */}
                  {isAdmin && isHeaderType && !isDragging && (
                    <div className="absolute -top-1 -left-1 -right-1 -bottom-1 border border-dashed border-gray-300 border-opacity-30 pointer-events-none rounded-lg"></div>
                  )}

                  {/* Enhanced resize handles for all resizable blocks */}
                  {isAdmin &&
                    !isDragging &&
                    block.type !== 'section-header' && (
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
              </AnimatedWrapper>
            );
          })}
        </div>
      </AnimatedGrid>
    </div>
  );
}
