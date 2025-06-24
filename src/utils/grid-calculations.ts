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

export const getNextSize = (currentSize: string, direction: string): string => {
  // Define size transitions based on direction
  const sizeMap: { [key: string]: { [key: string]: string } } = {
    small: {
      right: 'wide',
      down: 'medium',
      corner: 'large',
    },
    medium: {
      right: 'large',
      up: 'small',
      down: 'tall',
    },
    wide: {
      left: 'small',
      down: 'large',
    },
    large: {
      left: 'medium',
      up: 'wide',
    },
    tall: {
      right: 'large',
      up: 'medium',
    },
  };

  return sizeMap[currentSize]?.[direction] || currentSize;
};
