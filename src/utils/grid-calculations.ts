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
    case 'tall':
      return 'col-span-1 row-span-3';
    case 'section-header':
      return 'col-span-4 row-span-1';
    default:
      return 'col-span-1 row-span-1';
  }
};

export const getBlockDimensions = (size: string) => {
  let colSpan = 1,
    rowSpan = 1;

  if (size === 'section-header') {
    colSpan = 4;
    rowSpan = 1;
  } else if (size === 'wide' || size === 'large') {
    colSpan = 2;
  }

  if (size === 'medium' || size === 'large') {
    rowSpan = 2;
  } else if (size === 'tall') {
    rowSpan = 3;
  }

  return { colSpan, rowSpan };
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
    const hasSectionHeader = blocksInRow.some(
      block => block.type === 'section-header'
    );
    rowHeights.push(hasSectionHeader ? '60px' : '175px');
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
  // Enhanced size transitions with more intuitive progressions
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
    },
    large: {
      left: 'medium', // 2x2 → 1x2
      up: 'wide', // 2x2 → 2x1
    },
    tall: {
      right: 'large', // 1x3 → 2x2 (best fit)
      up: 'medium', // 1x3 → 1x2
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
      wide: ['small', 'large'],
      large: ['small', 'medium', 'wide'],
      tall: ['medium', 'large'],
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
    small: { cols: 1, rows: 1, label: 'Small (1×1)' },
    medium: { cols: 1, rows: 2, label: 'Medium (1×2)' },
    wide: { cols: 2, rows: 1, label: 'Wide (2×1)' },
    large: { cols: 2, rows: 2, label: 'Large (2×2)' },
    tall: { cols: 1, rows: 3, label: 'Tall (1×3)' },
    'section-header': { cols: 4, rows: 1, label: 'Section Header (4×1)' },
  };

  return info[size as keyof typeof info] || info.small;
};
