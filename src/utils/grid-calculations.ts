import { BentoBlock } from '@/types/bento';

export const getSizeClasses = (size: string, isMobile: boolean = false) => {
  if (isMobile) {
    // In mobile view, all blocks are the same size
    return '';
  }

  switch (size) {
    case 'small':
      return 'col-span-1 row-span-1';
    case 'medium':
      return 'col-span-1 row-span-2';
    case 'large':
      return 'col-span-2 row-span-2';
    case 'wide':
      return 'col-span-2 row-span-1';
    case 'extra-wide':
      return 'col-span-4 row-span-1';
    case 'tall':
      return 'col-span-1 row-span-3';
    case 'header-full':
      return 'col-span-4 row-span-1';
    case 'header-half':
      return 'col-span-2 row-span-1';
    // Legacy support - will be migrated to header-full
    case 'section-header':
      return 'col-span-4 row-span-1';
    default:
      return 'col-span-1 row-span-1';
  }
};

export const getBlockDimensions = (size: string) => {
  let colSpan = 1,
    rowSpan = 1;

  switch (size) {
    case 'header-full':
    case 'section-header': // Legacy support
      colSpan = 4;
      rowSpan = 1;
      break;
    case 'header-half':
      colSpan = 2;
      rowSpan = 1;
      break;
    case 'extra-wide':
      colSpan = 4;
      rowSpan = 1;
      break;
    case 'wide':
    case 'large':
      colSpan = 2;
      break;
  }

  if (size === 'medium' || size === 'large') {
    rowSpan = 2;
  } else if (size === 'tall') {
    rowSpan = 3;
  }

  return { colSpan, rowSpan };
};

// Helper function to check if a size is a header type (60px height)
export const isHeaderSize = (size: string): boolean => {
  return ['header-full', 'header-half', 'section-header'].includes(size);
};

// Helper function to get the height category of a block size
export const getHeightCategory = (size: string): 'header' | 'regular' => {
  return isHeaderSize(size) ? 'header' : 'regular';
};

// Check if a row has header blocks (60px height constraint)
export const getRowHeightConstraint = (
  blocks: BentoBlock[],
  row: number
): 'header' | 'regular' | null => {
  const blocksInRow = blocks.filter(block => block.position.y === row);

  if (blocksInRow.length === 0) {
    return null; // No constraint, row is empty
  }

  // Check if any block in the row is a header type
  const hasHeaderBlocks = blocksInRow.some(
    block => isHeaderSize(block.size) || block.type === 'section-header'
  );

  if (hasHeaderBlocks) {
    return 'header'; // Row is constrained to 60px height
  }

  return 'regular'; // Row has regular 175px height blocks
};

// Check if a block size is compatible with the row's height constraint
export const isBlockCompatibleWithRow = (
  blocks: BentoBlock[],
  blockSize: string,
  targetRow: number,
  excludeBlockId?: string
): boolean => {
  // Filter out the block being moved if specified
  const relevantBlocks = excludeBlockId
    ? blocks.filter(b => b.id !== excludeBlockId)
    : blocks;

  const { rowSpan } = getBlockDimensions(blockSize);
  const blockHeightCategory = getHeightCategory(blockSize);

  // For multi-row blocks (like tall blocks), check all rows they will occupy
  for (let i = 0; i < rowSpan; i++) {
    const rowToCheck = targetRow + i;
    const rowConstraint = getRowHeightConstraint(relevantBlocks, rowToCheck);

    // If row is empty, any block type is allowed
    if (rowConstraint === null) {
      continue;
    }

    // Block must match the row's height constraint
    if (rowConstraint !== blockHeightCategory) {
      return false;
    }
  }

  return true;
};

// Get available positions for a block size considering height constraints
export const getValidDropPositions = (
  blocks: BentoBlock[],
  blockSize: string,
  totalRows: number,
  excludeBlockId?: string
): Array<{ x: number; y: number }> => {
  const validPositions: Array<{ x: number; y: number }> = [];
  const { colSpan, rowSpan } = getBlockDimensions(blockSize);

  for (let row = 0; row < totalRows; row++) {
    // Check if block is compatible with this row's height constraint
    if (!isBlockCompatibleWithRow(blocks, blockSize, row, excludeBlockId)) {
      continue;
    }

    for (let col = 0; col < 4; col++) {
      // For full-width headers and extra-wide blocks, only allow dropping at x=0
      if (
        (blockSize === 'header-full' ||
          blockSize === 'section-header' ||
          blockSize === 'extra-wide') &&
        col !== 0
      ) {
        continue;
      }

      // Check if this position can fit the block
      const canFit = col + colSpan <= 4 && row + rowSpan <= totalRows;
      if (!canFit) {
        continue;
      }

      validPositions.push({ x: col, y: row });
    }
  }

  return validPositions;
};

export const getDraggedBlockSize = (
  blocks: BentoBlock[],
  draggedBlockId: string | null
) => {
  if (!draggedBlockId) return { colSpan: 1, rowSpan: 1 };
  const block = blocks.find(b => b.id === draggedBlockId);
  if (!block) return { colSpan: 1, rowSpan: 1 };

  return getBlockDimensions(block.size);
};

export const getRowHeights = (totalRows: number, blocks: BentoBlock[]) => {
  const rowHeights: string[] = [];
  for (let row = 0; row < totalRows; row++) {
    const blocksInRow = blocks.filter(block => block.position.y === row);
    const hasHeaderBlock = blocksInRow.some(
      block => isHeaderSize(block.size) || block.type === 'section-header'
    );
    rowHeights.push(hasHeaderBlock ? '60px' : '175px');
  }
  return rowHeights.join(' ');
};

export const calculateMaxRow = (blocks: BentoBlock[]) => {
  return blocks.reduce((max, block) => {
    const rowSpan = block.size === 'tall' ? 3 : block.size === 'large' ? 2 : 1;
    return Math.max(max, block.position.y + rowSpan);
  }, 0);
};

export const getNextSize = (
  currentSize: string,
  direction: string,
  supportedSizes?: string[]
): string => {
  // Enhanced size transitions with header sizes included
  const sizeMap: { [key: string]: { [key: string]: string } } = {
    small: {
      right: 'wide', // 1x1 → 2x1
      down: 'medium', // 1x1 → 1x2
      corner: 'large', // 1x1 → 2x2
    },
    medium: {
      right: 'large', // 1x2 → 2x2
      up: 'small', // 1x2 → 1x1
      down: 'tall', // 1x2 → 1x3
    },
    wide: {
      left: 'small', // 2x1 → 1x1
      down: 'large', // 2x1 → 2x2
      right: 'extra-wide', // 2x1 → 4x1
    },
    'extra-wide': {
      left: 'wide', // 4x1 → 2x1
      down: 'large', // 4x1 → 2x2 (best fit)
    },
    large: {
      left: 'medium', // 2x2 → 1x2
      up: 'wide', // 2x2 → 2x1
    },
    tall: {
      right: 'large', // 1x3 → 2x2 (best fit)
      up: 'medium', // 1x3 → 1x2
    },
    'header-half': {
      right: 'header-full', // 2x1 header → 4x1 header
      left: 'header-half', // Stay same (no smaller header)
    },
    'header-full': {
      left: 'header-half', // 4x1 header → 2x1 header
      right: 'header-full', // Stay same (already full width)
    },
    // Legacy support
    'section-header': {
      left: 'header-half', // Can shrink to half-width header
      right: 'header-full', // Stay as full header
    },
  };

  const nextSize = sizeMap[currentSize]?.[direction];

  // If no supported sizes provided, return the next size or current
  if (!supportedSizes || supportedSizes.length === 0) {
    return nextSize || currentSize;
  }

  // Check if the next size is supported
  if (nextSize && supportedSizes.includes(nextSize)) {
    return nextSize;
  }

  // If the direct transition isn't supported, return current size
  return currentSize;
};

// Helper function to get all possible sizes a block can be resized to based on its supported sizes
export const getAvailableSizes = (
  currentSize: string,
  supportedSizes?: string[]
): string[] => {
  if (!supportedSizes || supportedSizes.length === 0) {
    // Fallback to generic size map if no supported sizes provided
    const sizeMap = {
      small: ['medium', 'wide', 'large'],
      medium: ['small', 'large', 'tall'],
      wide: ['small', 'large', 'extra-wide'],
      'extra-wide': ['wide', 'large'],
      large: ['small', 'medium', 'wide'],
      tall: ['medium', 'large'],
      'header-half': ['header-full'],
      'header-full': ['header-half'],
      'section-header': ['header-full', 'header-half'], // Legacy support
    };

    return sizeMap[currentSize as keyof typeof sizeMap] || [];
  }

  // Return all supported sizes except the current one
  return supportedSizes.filter(size => size !== currentSize);
};

// Helper function to check if a resize direction is valid for a block
export const isResizeDirectionValid = (
  currentSize: string,
  direction: string,
  supportedSizes?: string[]
): boolean => {
  const nextSize = getNextSize(currentSize, direction, supportedSizes);
  return nextSize !== currentSize;
};

// Helper function to get size dimensions in a more readable format
export const getSizeInfo = (size: string) => {
  const info = {
    small: { cols: 1, rows: 1, label: 'Small (1×1)', height: '175px' },
    medium: { cols: 1, rows: 2, label: 'Medium (1×2)', height: '175px' },
    wide: { cols: 2, rows: 1, label: 'Wide (2×1)', height: '175px' },
    'extra-wide': {
      cols: 4,
      rows: 1,
      label: 'Extra Wide (4×1)',
      height: '175px',
    },
    large: { cols: 2, rows: 2, label: 'Large (2×2)', height: '175px' },
    tall: { cols: 1, rows: 3, label: 'Tall (1×3)', height: '175px' },
    'header-full': {
      cols: 4,
      rows: 1,
      label: 'Full Header (4×1)',
      height: '60px',
    },
    'header-half': {
      cols: 2,
      rows: 1,
      label: 'Half Header (2×1)',
      height: '60px',
    },
    // Legacy support
    'section-header': {
      cols: 4,
      rows: 1,
      label: 'Section Header (4×1)',
      height: '60px',
    },
  };

  return info[size as keyof typeof info] || info.small;
};
