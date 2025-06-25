import React from 'react';
import { BentoBlock } from '@/types/bento';
import {
  createOccupiedCellsMap,
  createGridCells,
  createDropZones,
  getDraggedBlockSize,
  checkCollisionWithHeightConstraint,
  isHeaderSize,
} from '@/utils';

interface AdminOverlaysProps {
  blocks: BentoBlock[];
  totalRows: number;
  maxRow: number;
  draggedBlock: string | null;
  dragOverCell: { x: number; y: number } | null;
  onAddBlock?: (position: { x: number; y: number }) => void;
  onDragOver: (e: React.DragEvent, x?: number, y?: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, x: number, y: number) => void;
}

// Grid overlay component
export const GridOverlay: React.FC<{
  blocks: BentoBlock[];
  totalRows: number;
  maxRow: number;
  draggedBlock: string | null;
}> = ({ blocks, totalRows, maxRow }) => {
  const occupiedCells = createOccupiedCellsMap(blocks);
  const gridCells = createGridCells(totalRows, maxRow, occupiedCells, blocks);

  return (
    <>
      {gridCells.map(cell => (
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
      ))}
    </>
  );
};

// Add buttons component
export const AddButtons: React.FC<{
  blocks: BentoBlock[];
  maxRow: number;
  draggedBlock: string | null;
  onAddBlock?: (position: { x: number; y: number }) => void;
}> = ({ blocks, maxRow, draggedBlock, onAddBlock }) => {
  if (!onAddBlock || draggedBlock) return null;

  const occupiedCells = createOccupiedCellsMap(blocks);
  const addButtons = [];

  // Find rows that contain header blocks
  const headerRows = new Set<number>();
  blocks.forEach(block => {
    if (isHeaderSize(block.size) || block.type === 'section-header') {
      headerRows.add(block.position.y);
    }
  });

  // Add buttons for empty cells
  for (let row = 0; row <= maxRow + 2; row++) {
    for (let col = 0; col < 4; col++) {
      const cellKey = `${col}-${row}`;
      if (!occupiedCells.has(cellKey)) {
        const isHeaderRow = headerRows.has(row);

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
              className={`w-full h-full border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 rounded-3xl transition-all duration-200 opacity-60 hover:opacity-100 flex items-center justify-center z-10 ${
                isHeaderRow ? '' : 'min-h-[100px]'
              }`}
            >
              <div
                className={`flex flex-col items-center text-gray-400 hover:text-blue-500 ${
                  isHeaderRow ? 'space-y-1' : 'space-y-2'
                }`}
              >
                <svg
                  className={isHeaderRow ? 'w-4 h-4' : 'w-8 h-8'}
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
                <span
                  className={`font-medium ${isHeaderRow ? 'text-xs' : 'text-sm'}`}
                >
                  Add Block
                </span>
              </div>
            </button>
          </div>
        );
      }
    }
  }

  return <>{addButtons}</>;
};

// Drop zones component
export const DropZones: React.FC<{
  blocks: BentoBlock[];
  totalRows: number;
  draggedBlock: string | null;
  dragOverCell: { x: number; y: number } | null;
  onDragOver: (e: React.DragEvent, x?: number, y?: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, x: number, y: number) => void;
}> = ({
  blocks,
  totalRows,
  draggedBlock,
  dragOverCell,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  if (!draggedBlock) return null;

  const draggedBlockSize = getDraggedBlockSize(blocks, draggedBlock);
  const draggedBlockData = blocks.find(b => b.id === draggedBlock);
  const dropZones = createDropZones(
    totalRows,
    draggedBlockSize,
    draggedBlockData,
    dragOverCell,
    draggedBlock,
    (blockId: string, x: number, y: number) =>
      checkCollisionWithHeightConstraint(blocks, blockId, x, y),
    blocks // Pass blocks array for height constraint checking
  );

  return (
    <>
      {dropZones.map(zone => {
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
              onDragOver={e => onDragOver(e, zone.col, zone.row)}
              onDragLeave={onDragLeave}
              onDrop={e => onDrop(e, zone.col, zone.row)}
            />
          );
        }

        return (
          <div
            key={zone.key}
            className="absolute border-2 border-dashed pointer-events-none transition-all duration-200 rounded-3xl"
            style={{
              gridColumn: `${zone.col + 1} / span ${zone.colSpan}`,
              gridRow: `${zone.row + 1} / span ${zone.rowSpan}`,
              zIndex: 999999,
              backgroundColor: zone.isValidDrop
                ? 'rgba(59, 130, 246, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              borderColor: zone.isValidDrop ? '#60a5fa' : '#f87171',
            }}
          ></div>
        );
      })}
    </>
  );
};

// Main admin overlays component
export const AdminOverlays: React.FC<AdminOverlaysProps> = ({
  blocks,
  totalRows,
  maxRow,
  draggedBlock,
  dragOverCell,
  onAddBlock,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <>
      {/* Grid overlay for admin */}
      <GridOverlay
        blocks={blocks}
        totalRows={totalRows}
        maxRow={maxRow}
        draggedBlock={draggedBlock}
      />

      {/* Invisible drop zones */}
      <DropZones
        blocks={blocks}
        totalRows={totalRows}
        draggedBlock={draggedBlock}
        dragOverCell={dragOverCell}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />

      {/* Add buttons for empty cells */}
      <AddButtons
        blocks={blocks}
        maxRow={maxRow}
        draggedBlock={draggedBlock}
        onAddBlock={onAddBlock}
      />
    </>
  );
};
