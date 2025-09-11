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


export const GridOverlay: React.FC<{
  blocks: BentoBlock[];
  totalRows: number;
  maxRow: number;
  draggedBlock: string | null;
}> = ({ blocks, totalRows, maxRow, draggedBlock }) => {
  const occupiedCells = createOccupiedCellsMap(
    blocks,
    draggedBlock || undefined
  );
  const gridCells = createGridCells(totalRows, maxRow, occupiedCells, blocks);

  return (
    <>
      {gridCells.map(cell => (
        <div
          key={cell.key}
          className={`border relative pointer-events-none z-0 rounded-xl transition-all duration-200 ${cell.isNewRow
            ? 'border-blue-300 border-opacity-50 bg-blue-50 bg-opacity-30'
            : 'border-slate-300 border-opacity-30 bg-slate-50 bg-opacity-15'
            }`}
          style={{
            gridColumn: cell.col + 1,
            gridRow: cell.row + 1,
            borderStyle: 'dotted',
            borderWidth: '1px',
          }}
        ></div>
      ))}
    </>
  );
};


export const AddButtons: React.FC<{
  blocks: BentoBlock[];
  maxRow: number;
  draggedBlock: string | null;
  onAddBlock?: (position: { x: number; y: number }) => void;
}> = ({ blocks, maxRow, draggedBlock, onAddBlock }) => {
  if (!onAddBlock || draggedBlock) return null;

  const occupiedCells = createOccupiedCellsMap(blocks, undefined);
  const addButtons = [];


  const headerRows = new Set<number>();
  blocks.forEach(block => {
    if (isHeaderSize(block.size) || block.type === 'section-header') {
      headerRows.add(block.position.y);
    }
  });


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
              className={`group w-full h-full border border-dotted bg-white hover:bg-slate-50 rounded-xl transition-all duration-200 ease-out flex items-center justify-center z-10 hover:shadow-sm ${isHeaderRow
                ? 'border-slate-400 border-opacity-40 hover:border-blue-400 hover:border-opacity-60 opacity-80 hover:opacity-100'
                : 'border-slate-400 border-opacity-40 hover:border-blue-400 hover:border-opacity-60 opacity-70 hover:opacity-100 min-h-[100px]'
                }`}
            >
              <div
                className={`flex flex-col items-center transition-all duration-300 ${isHeaderRow ? 'space-y-1' : 'space-y-2'
                  }`}
              >
                <div className={`${isHeaderRow ? 'w-4 h-4' : 'w-6 h-6'}`}>
                  <svg
                    className="w-full h-full text-slate-500 group-hover:text-blue-500 transition-colors duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <span
                  className={`font-normal text-slate-600 group-hover:text-blue-600 transition-colors duration-200 ${isHeaderRow ? 'text-xs' : 'text-sm'
                    }`}
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
      blocks
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
              className={`absolute border pointer-events-none transition-all duration-200 ease-out rounded-xl shadow-sm ${zone.isValidDrop
                ? 'border-blue-400 border-opacity-60'
                : 'border-red-400 border-opacity-60'
                }`}
              style={{
                gridColumn: `${zone.col + 1} / span ${zone.colSpan}`,
                gridRow: `${zone.row + 1} / span ${zone.rowSpan}`,
                zIndex: 999999,
                background: zone.isValidDrop
                  ? 'rgba(59, 130, 246, 0.08)'
                  : 'rgba(239, 68, 68, 0.08)',
                borderStyle: 'dotted',
                borderWidth: '2px',
              }}
            >
              { }
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={`w-5 h-5 ${zone.isValidDrop ? 'text-blue-500' : 'text-red-500'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {zone.isValidDrop ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  )}
                </svg>
              </div>
            </div>
          );
        })}
      </>
    );
  };


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
      { }
      <GridOverlay
        blocks={blocks}
        totalRows={totalRows}
        maxRow={maxRow}
        draggedBlock={draggedBlock}
      />

      { }
      <DropZones
        blocks={blocks}
        totalRows={totalRows}
        draggedBlock={draggedBlock}
        dragOverCell={dragOverCell}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      />

      { }
      <AddButtons
        blocks={blocks}
        maxRow={maxRow}
        draggedBlock={draggedBlock}
        onAddBlock={onAddBlock}
      />
    </>
  );
};
