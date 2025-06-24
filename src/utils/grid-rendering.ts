import { BentoBlock } from '@/types/bento';
import { getBlockDimensions } from './grid-calculations';

export const createOccupiedCellsMap = (blocks: BentoBlock[]) => {
  const occupiedCells = new Set<string>();

  blocks.forEach(block => {
    if (block.size === 'section-header') {
      // Section headers span all 4 columns and 1 row
      for (let col = 0; col < 4; col++) {
        occupiedCells.add(`${col}-${block.position.y}`);
      }
    } else {
      const { colSpan, rowSpan } = getBlockDimensions(block.size);

      for (
        let row = block.position.y;
        row < block.position.y + rowSpan;
        row++
      ) {
        for (
          let col = block.position.x;
          col < block.position.x + colSpan;
          col++
        ) {
          occupiedCells.add(`${col}-${row}`);
        }
      }
    }
  });

  return occupiedCells;
};

export const createGridCells = (
  totalRows: number,
  maxRow: number,
  occupiedCells: Set<string>
) => {
  const gridCells = [];

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < 4; col++) {
      const cellKey = `${col}-${row}`;
      // Only show grid lines in empty cells
      if (!occupiedCells.has(cellKey)) {
        // Check if this is a new empty row (beyond current content)
        const isNewRow = row >= maxRow;

        gridCells.push({
          key: cellKey,
          col,
          row,
          isNewRow,
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
  checkCollisionFn: (blockId: string, x: number, y: number) => boolean
) => {
  const dropZones = [];
  const { colSpan, rowSpan } = draggedBlockSize;
  const isSectionHeader = draggedBlockData?.size === 'section-header';

  for (let row = 0; row < totalRows; row++) {
    for (let col = 0; col < 4; col++) {
      // For section headers, only allow dropping at x=0
      if (isSectionHeader && col !== 0) {
        continue;
      }

      // Check if this position can fit the block
      const canFit = col + colSpan <= 4 && row + rowSpan <= totalRows;
      const isHoverStart = dragOverCell?.x === col && dragOverCell?.y === row;

      if (isHoverStart && canFit) {
        // Render the preview for the entire block size
        const hasCollision = draggedBlock
          ? checkCollisionFn(draggedBlock, col, row)
          : false;
        const isValidDrop = !hasCollision;

        dropZones.push({
          key: `drop-preview-${col}-${row}`,
          col,
          row,
          colSpan,
          rowSpan,
          isValidDrop,
        });
      }

      // Invisible drop zone for each cell (but restrict section headers to x=0)
      if (!isSectionHeader || col === 0) {
        dropZones.push({
          key: `drop-${col}-${row}`,
          col,
          row,
          colSpan: 1,
          rowSpan: 1,
          isDropZone: true,
        });
      }
    }
  }

  return dropZones;
};
