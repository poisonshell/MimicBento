import { BentoBlock } from '@/types/bento';
import {
  getBlockDimensions,
  isBlockCompatibleWithRow,
} from './grid-calculations';

export const checkCollision = (
  blocks: BentoBlock[],
  blockId: string,
  newX: number,
  newY: number
) => {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return false;

  const { colSpan, rowSpan } = getBlockDimensions(block.size);

  // Check collision with other blocks
  for (const otherBlock of blocks) {
    if (otherBlock.id === blockId) continue; // Skip self

    const { colSpan: otherColSpan, rowSpan: otherRowSpan } = getBlockDimensions(
      otherBlock.size
    );

    // Check if rectangles overlap
    const block1 = {
      x1: newX,
      y1: newY,
      x2: newX + colSpan - 1,
      y2: newY + rowSpan - 1,
    };

    const block2 = {
      x1: otherBlock.position.x,
      y1: otherBlock.position.y,
      x2: otherBlock.position.x + otherColSpan - 1,
      y2: otherBlock.position.y + otherRowSpan - 1,
    };

    if (
      !(
        block1.x2 < block2.x1 ||
        block2.x2 < block1.x1 ||
        block1.y2 < block2.y1 ||
        block2.y2 < block1.y1
      )
    ) {
      return true; // Collision detected
    }
  }

  return false;
};

export const checkResizeCollision = (
  blocks: BentoBlock[],
  blockId: string,
  newSize: string
): boolean => {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return false;

  // Get the new size dimensions
  const { colSpan, rowSpan } = getBlockDimensions(newSize);

  // Check if it fits in the grid
  if (block.position.x + colSpan > 4 || block.position.y + rowSpan > 20) {
    return true; // Out of bounds
  }

  // Check collision with other blocks using the same logic as position collision
  return checkCollisionWithSize(
    blocks,
    blockId,
    block.position.x,
    block.position.y,
    newSize
  );
};

// Enhanced resize collision check that includes height constraints
export const checkResizeCollisionWithHeightConstraint = (
  blocks: BentoBlock[],
  blockId: string,
  newSize: string
): boolean => {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return false;

  // Get the new size dimensions
  const { colSpan, rowSpan } = getBlockDimensions(newSize);

  // Check if it fits in the grid
  if (block.position.x + colSpan > 4 || block.position.y + rowSpan > 20) {
    return true; // Out of bounds
  }

  // Check collision with other blocks and height constraints
  return checkCollisionWithHeightConstraint(
    blocks,
    blockId,
    block.position.x,
    block.position.y,
    newSize
  );
};

export const checkCollisionWithSize = (
  blocks: BentoBlock[],
  blockId: string,
  newX: number,
  newY: number,
  size?: string
) => {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return false;

  const blockSize = size || block.size;
  const { colSpan, rowSpan } = getBlockDimensions(blockSize);

  // Check collision with other blocks
  for (const otherBlock of blocks) {
    if (otherBlock.id === blockId) continue; // Skip self

    const { colSpan: otherColSpan, rowSpan: otherRowSpan } = getBlockDimensions(
      otherBlock.size
    );

    // Check if rectangles overlap
    const block1 = {
      x1: newX,
      y1: newY,
      x2: newX + colSpan - 1,
      y2: newY + rowSpan - 1,
    };

    const block2 = {
      x1: otherBlock.position.x,
      y1: otherBlock.position.y,
      x2: otherBlock.position.x + otherColSpan - 1,
      y2: otherBlock.position.y + otherRowSpan - 1,
    };

    if (
      !(
        block1.x2 < block2.x1 ||
        block2.x2 < block1.x1 ||
        block1.y2 < block2.y1 ||
        block2.y2 < block1.y1
      )
    ) {
      return true; // Collision detected
    }
  }

  return false;
};

// Enhanced collision check that includes height constraints
export const checkCollisionWithHeightConstraint = (
  blocks: BentoBlock[],
  blockId: string,
  newX: number,
  newY: number,
  size?: string
): boolean => {
  const block = blocks.find(b => b.id === blockId);
  if (!block) return false;

  const blockSize = size || block.size;

  // First check regular collision
  if (checkCollisionWithSize(blocks, blockId, newX, newY, size)) {
    return true;
  }

  // Then check height constraint compatibility
  if (!isBlockCompatibleWithRow(blocks, blockSize, newY, blockId)) {
    return true; // Height constraint violation
  }

  return false;
};

// Check if dropping a block would violate height constraints
export const checkDropHeightConstraint = (
  blocks: BentoBlock[],
  blockSize: string,
  targetX: number,
  targetY: number
): boolean => {
  return !isBlockCompatibleWithRow(blocks, blockSize, targetY);
};
