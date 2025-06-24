'use client';

import { BentoBlock } from '@/types/bento';
import BentoBlockComponent from './BentoBlock';
import { useState } from 'react';
import {
  getSizeClasses,
  getDraggedBlockSize,
  getRowHeights,
  calculateMaxRow,
  getNextSize,
  checkCollision,
  checkResizeCollision,
  createDragImage,
  sortBlocksForMobile,
  createOccupiedCellsMap,
  createGridCells,
  createDropZones,
} from '@/utils';

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
  const [draggedBlock, setDraggedBlock] = useState<string | null>(null);
  const [dragOverCell, setDragOverCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [resizingBlock, setResizingBlock] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);

  if (isMobile) {
    // Mobile layout: Simple 2-column grid with equal-sized blocks
    const sortedBlocks = sortBlocksForMobile(blocks);

    return (
      <div className="w-full space-y-4">
        {sortedBlocks.map((block, index) => {
          if (block.type === 'section-header') {
            return (
              <div key={block.id} className="w-full mb-4">
                <BentoBlockComponent
                  block={block}
                  isMobile={true}
                  isAdmin={isAdmin}
                  onEdit={onBlockEdit}
                  onDelete={onBlockDelete}
                />
              </div>
            );
          }

          // Group regular blocks and render them in grid sections
          const nextSectionIndex = sortedBlocks.findIndex(
            (b, i) => i > index && b.type === 'section-header'
          );
          const sectionBlocks =
            nextSectionIndex === -1
              ? sortedBlocks
                  .slice(index)
                  .filter(b => b.type !== 'section-header')
              : sortedBlocks
                  .slice(index, nextSectionIndex)
                  .filter(b => b.type !== 'section-header');

          // Only render if this is the first block of a section
          const isFirstInSection =
            index === 0 || sortedBlocks[index - 1].type === 'section-header';

          if (!isFirstInSection) return null;

          return (
            <div key={`section-${index}`} className="grid grid-cols-2 gap-4">
              {sectionBlocks.map(sectionBlock => (
                <div
                  key={sectionBlock.id}
                  className="aspect-square rounded-2xl overflow-hidden relative"
                >
                  <BentoBlockComponent
                    block={{ ...sectionBlock, size: 'small' }}
                    isMobile={true}
                    isAdmin={isAdmin}
                    onEdit={onBlockEdit}
                    onDelete={onBlockDelete}
                  />
                </div>
              ))}

              {/* Add mobile + button */}
              {isAdmin && onAddBlock && sectionBlocks.length % 2 !== 0 && (
                <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center">
                  <button
                    onClick={() => onAddBlock({ x: 0, y: index + 1 })}
                    className="w-full h-full flex flex-col items-center justify-center space-y-2 text-gray-400 hover:text-blue-500"
                  >
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm font-medium">Add Block</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Add section for empty mobile */}
        {isAdmin && onAddBlock && (
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center">
              <button
                onClick={() => onAddBlock({ x: 0, y: sortedBlocks.length })}
                className="w-full h-full flex flex-col items-center justify-center space-y-2 text-gray-400 hover:text-blue-500"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-sm font-medium">Add Block</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop layout: Original complex grid
  const maxRow = calculateMaxRow(blocks);
  const totalRows = isAdmin ? Math.max(maxRow + 3, 8) : maxRow;

  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDraggedBlock(blockId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);

    const dragElement = e.currentTarget as HTMLElement;
    const draggedBlockData = blocks.find(b => b.id === blockId);

    createDragImage(dragElement, draggedBlockData, e);
  };

  const handleDragOver = (e: React.DragEvent, x?: number, y?: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (x !== undefined && y !== undefined) {
      setDragOverCell({ x, y });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    if (draggedBlock && onBlockPositionChange) {
      const draggedBlockData = blocks.find(b => b.id === draggedBlock);
      const finalX = draggedBlockData?.size === 'section-header' ? 0 : x;

      if (!checkCollision(blocks, draggedBlock, finalX, y)) {
        onBlockPositionChange(draggedBlock, { x: finalX, y });
      }
    }
    setDraggedBlock(null);
    setDragOverCell(null);
  };

  const handleResize = (blockId: string, newSize: string) => {
    if (onBlockSizeChange) {
      const block = blocks.find(b => b.id === blockId);
      if (block && !checkResizeCollision(blocks, blockId, newSize)) {
        onBlockSizeChange(blockId, newSize);
      }
    }
  };

  const renderGridOverlay = () => {
    if (!isAdmin || !draggedBlock) return null;

    const occupiedCells = createOccupiedCellsMap(blocks);
    const gridCells = createGridCells(totalRows, maxRow, occupiedCells);

    return gridCells.map(cell => (
      <div
        key={cell.key}
        className={`border border-dashed relative pointer-events-none z-0 rounded-3xl ${
          cell.isNewRow
            ? 'border-blue-300 border-opacity-50 bg-blue-50 bg-opacity-30'
            : 'border-gray-300 border-opacity-30'
        }`}
        style={{
          gridColumn: cell.col + 1,
          gridRow: cell.row + 1,
        }}
      >
        {cell.isNewRow && cell.col === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-blue-500 opacity-75">
            Row {cell.row + 1}
          </div>
        )}
      </div>
    ));
  };

  const renderAddButtons = () => {
    if (!isAdmin || !onAddBlock || draggedBlock) return null;

    const occupiedCells = createOccupiedCellsMap(blocks);
    const addButtons = [];

    // Add buttons for empty cells up
    for (let row = 0; row <= maxRow + 2; row++) {
      for (let col = 0; col < 4; col++) {
        const cellKey = `${col}-${row}`;
        if (!occupiedCells.has(cellKey)) {
          addButtons.push(
            <div
              key={`add-${cellKey}`}
              className="relative group z-20"
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
              }}
            >
              <button
                onClick={() => onAddBlock({ x: col, y: row })}
                className="w-full h-full min-h-[100px] border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 rounded-3xl transition-all duration-200 opacity-60 hover:opacity-100 flex items-center justify-center z-10"
              >
                <div className="flex flex-col items-center space-y-2 text-gray-400 hover:text-blue-500">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="text-sm font-medium">Add Block</span>
                </div>
              </button>
            </div>
          );
        }
      }
    }

    return addButtons;
  };

  const renderDropZones = () => {
    if (!isAdmin) return null;

    const draggedBlockSize = getDraggedBlockSize(blocks, draggedBlock);
    const draggedBlockData = blocks.find(b => b.id === draggedBlock);
    const dropZones = createDropZones(
      totalRows,
      draggedBlockSize,
      draggedBlockData,
      dragOverCell,
      draggedBlock,
      (blockId: string, x: number, y: number) =>
        checkCollision(blocks, blockId, x, y)
    );

    return dropZones.map(zone => {
      if (zone.isDropZone) {
        return (
          <div
            key={zone.key}
            className="absolute inset-0 pointer-events-auto"
            style={{
              gridColumn: zone.col + 1,
              gridRow: zone.row + 1,
              zIndex: 5,
            }}
            onDragOver={e => handleDragOver(e, zone.col, zone.row)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, zone.col, zone.row)}
          />
        );
      }

      return (
        <div
          key={zone.key}
          className={`absolute border-2 border-dashed pointer-events-none transition-all duration-200 rounded-3xl ${
            zone.isValidDrop
              ? 'bg-blue-50 bg-opacity-90 border-blue-400 shadow-lg'
              : 'bg-red-50 bg-opacity-90 border-red-400 shadow-lg'
          }`}
          style={{
            gridColumn: `${zone.col + 1} / span ${zone.colSpan}`,
            gridRow: `${zone.row + 1} / span ${zone.rowSpan}`,
            zIndex: 6,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className={`w-8 h-8 rounded-full shadow-lg ${
                zone.isValidDrop ? 'bg-blue-500' : 'bg-red-500'
              }`}
            />
          </div>
        </div>
      );
    });
  };

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
        {/* Grid overlay for admin */}
        {renderGridOverlay()}

        {/* Invisible drop zones */}
        {renderDropZones()}

        {/* Add buttons for empty cells */}
        {renderAddButtons()}

        {/* Blocks */}
        {blocks.map(block => {
          const sizeClasses = getSizeClasses(block.size);
          const isDragging = draggedBlock === block.id;
          const isSectionHeader = block.type === 'section-header';

          return (
            <div
              key={block.id}
              draggable={isAdmin && block.type !== 'photo'}
              onDragStart={e => handleDragStart(e, block.id)}
              className={`
                ${isAdmin && block.type !== 'photo' ? 'cursor-move' : ''} 
                relative
                ${sizeClasses}
                ${isDragging ? 'opacity-80 z-50' : 'z-10 hover:z-30'}
                transition-all duration-200 ease-out
                ${isAdmin && block.type === 'photo' ? 'group' : ''}
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

              {/* Resize handles for photo blocks */}
              {isAdmin && block.type === 'photo' && !isDragging && (
                <>
                  {/* Right edge handle - expand horizontally */}
                  <div
                    className="absolute top-1/2 -right-1 w-2 h-8 bg-blue-500 border border-white rounded-r cursor-e-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 transform -translate-y-1/2"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const nextSize = getNextSize(block.size, 'right');
                      if (nextSize !== block.size) {
                        handleResize(block.id, nextSize);
                      }
                    }}
                    title="Expand horizontally"
                  />

                  {/* Bottom edge handle - expand vertically */}
                  <div
                    className="absolute left-1/2 -bottom-1 w-8 h-2 bg-blue-500 border border-white rounded-b cursor-s-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 transform -translate-x-1/2"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const nextSize = getNextSize(block.size, 'down');
                      if (nextSize !== block.size) {
                        handleResize(block.id, nextSize);
                      }
                    }}
                    title="Expand vertically"
                  />

                  {/* Corner handle - expand both directions */}
                  <div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border border-white rounded cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20"
                    onMouseDown={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      const nextSize = getNextSize(block.size, 'corner');
                      if (nextSize !== block.size) {
                        handleResize(block.id, nextSize);
                      }
                    }}
                    title="Expand both directions"
                  />

                  {/* Left edge handle - shrink horizontally */}
                  {(block.size === 'wide' || block.size === 'large') && (
                    <div
                      className="absolute top-1/2 -left-1 w-2 h-8 bg-red-500 border border-white rounded-l cursor-w-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 transform -translate-y-1/2"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const nextSize = getNextSize(block.size, 'left');
                        if (nextSize !== block.size) {
                          handleResize(block.id, nextSize);
                        }
                      }}
                      title="Shrink horizontally"
                    />
                  )}

                  {/* Top edge handle - shrink vertically */}
                  {(block.size === 'medium' ||
                    block.size === 'large' ||
                    block.size === 'tall') && (
                    <div
                      className="absolute left-1/2 -top-1 w-8 h-2 bg-red-500 border border-white rounded-t cursor-n-resize opacity-0 group-hover:opacity-100 transition-opacity shadow-md z-20 transform -translate-x-1/2"
                      onMouseDown={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        const nextSize = getNextSize(block.size, 'up');
                        if (nextSize !== block.size) {
                          handleResize(block.id, nextSize);
                        }
                      }}
                      title="Shrink vertically"
                    />
                  )}

                  {/* Size indicator */}
                  <div className="absolute top-1 left-1 bg-black bg-opacity-75 text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {block.size}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
