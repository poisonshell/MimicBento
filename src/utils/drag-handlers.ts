import { BentoBlock } from '@/types/bento';
import { createDragImage, checkCollision } from '@/utils';

export interface DragHandlers {
  handleDragStart: (e: React.DragEvent, blockId: string) => void;
  handleDragOver: (e: React.DragEvent, x?: number, y?: number) => void;
  handleDragLeave: () => void;
  handleDrop: (e: React.DragEvent, x: number, y: number) => void;
}

export interface DragState {
  draggedBlock: string | null;
  dragOverCell: { x: number; y: number } | null;
}

export const createDragHandlers = (
  blocks: BentoBlock[],
  dragState: DragState,
  setDragState: {
    setDraggedBlock: (blockId: string | null) => void;
    setDragOverCell: (cell: { x: number; y: number } | null) => void;
  },
  onBlockPositionChange?: (
    blockId: string,
    newPosition: { x: number; y: number }
  ) => void
): DragHandlers => {
  const handleDragStart = (e: React.DragEvent, blockId: string) => {
    setDragState.setDraggedBlock(blockId);
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
      setDragState.setDragOverCell({ x, y });
    }
  };

  const handleDragLeave = () => {
    setDragState.setDragOverCell(null);
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    if (dragState.draggedBlock && onBlockPositionChange) {
      const draggedBlockData = blocks.find(
        b => b.id === dragState.draggedBlock
      );
      const finalX = draggedBlockData?.size === 'section-header' ? 0 : x;

      if (!checkCollision(blocks, dragState.draggedBlock, finalX, y)) {
        onBlockPositionChange(dragState.draggedBlock, { x: finalX, y });
      }
    }
    setDragState.setDraggedBlock(null);
    setDragState.setDragOverCell(null);
  };

  return {
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
  };
};
