import { BentoBlock } from '@/types/bento';
import {
  getBlockDimensions,
  isHeaderSize,
  isBlockCompatibleWithRow,
} from './grid-calculations';

export const createOccupiedCellsMap = (blocks: BentoBlock[]) => {
  const occupiedCells = new Set<string>();

  blocks.forEach(block => {
    const { colSpan, rowSpan } = getBlockDimensions(block.size);

    for (let row = block.position.y; row < block.position.y + rowSpan; row++) {
      for (
        let col = block.position.x;
        col < block.position.x + colSpan;
        col++
      ) {
        occupiedCells.add(`${col}-${row}`);
      }
    }
  });

  return occupiedCells;
};

export const createGridCells = (
  totalRows: number,
  maxRow: number,
  occupiedCells: Set<string>,
  blocks: BentoBlock[] = []
) => {
  const gridCells = [];

  // Find rows that contain header blocks
  const headerRows = new Set<number>();
  blocks.forEach(block => {
    if (isHeaderSize(block.size) || block.type === 'section-header') {
      headerRows.add(block.position.y);
    }
  });

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < 4; col++) {
      const cellKey = `${col}-${row}`;
      // Only show grid lines in empty cells
      if (!occupiedCells.has(cellKey)) {
        // Check if this is a new empty row (beyond current content)
        const isNewRow = row >= maxRow;
        const isHeaderRow = headerRows.has(row);

        gridCells.push({
          key: cellKey,
          col,
          row,
          isNewRow,
          isHeaderRow,
          cellKey,
        });
      }
    }
  }

  return gridCells;
};

export const createDropZones = (
  totalRows: number,
  draggedBlockSize: { colSpan: number; rowSpan: number },
  draggedBlockData: BentoBlock | undefined,
  dragOverCell: { x: number; y: number } | null,
  draggedBlock: string | null,
  checkCollisionFn: (blockId: string, x: number, y: number) => boolean,
  allBlocks: BentoBlock[] = [] // Add blocks array for height constraint checking
) => {
  const dropZones = [];
  const { colSpan, rowSpan } = draggedBlockSize;
  const isFullWidthHeader =
    draggedBlockData?.size === 'header-full' ||
    draggedBlockData?.size === 'section-header'; // Legacy support

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < 4; col++) {
      // For full-width headers, only allow dropping at x=0
      if (isFullWidthHeader && col !== 0) {
        continue;
      }

      // Check if this position can fit the block
      const canFit = col + colSpan <= 4 && row + rowSpan <= totalRows;
      const isHoverStart = dragOverCell?.x === col && dragOverCell?.y === row;

      if (isHoverStart && canFit) {
        // Check regular collision
        const hasCollision = draggedBlock
          ? checkCollisionFn(draggedBlock, col, row)
          : false;

        // Check height constraint compatibility
        const heightCompatible = draggedBlockData?.size
          ? isBlockCompatibleWithRow(
              allBlocks,
              draggedBlockData.size,
              row,
              draggedBlock || undefined
            )
          : true;

        const isValidDrop = !hasCollision && heightCompatible;

        dropZones.push({
          key: `drop-preview-${col}-${row}`,
          col,
          row,
          colSpan,
          rowSpan,
          isValidDrop,
          heightIncompatible: !heightCompatible, // Flag for visual feedback
        });
      }

      // Invisible drop zone for each cell (but restrict full-width headers to x=0)
      if (!isFullWidthHeader || col === 0) {
        // Check height compatibility for the invisible drop zone as well
        const heightCompatible = draggedBlockData?.size
          ? isBlockCompatibleWithRow(
              allBlocks,
              draggedBlockData.size,
              row,
              draggedBlock || undefined
            )
          : true;

        dropZones.push({
          key: `drop-${col}-${row}`,
          col,
          row,
          colSpan: 1,
          rowSpan: 1,
          isDropZone: true,
          heightIncompatible: !heightCompatible, // Flag for visual feedback
        });
      }
    }
  }

  return dropZones;
};
