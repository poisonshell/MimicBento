import React from 'react';
import { BentoBlock } from '@/types/bento';
import BentoBlockComponent from '@/components/BentoBlock';
import { sortBlocksForMobile } from './drag-drop';

interface MobileLayoutProps {
  blocks: BentoBlock[];
  isAdmin: boolean;
  onBlockEdit?: (block: BentoBlock) => void;
  onBlockDelete?: (blockId: string) => void;
  onAddBlock?: (position: { x: number; y: number }) => void;
}

// Mobile add button component
const MobileAddButton: React.FC<{
  onClick: () => void;
  className?: string;
}> = ({ onClick, className = '' }) => (
  <div
    className={`aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center ${className}`}
  >
    <button
      onClick={onClick}
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
);

// Mobile layout component
export const MobileLayout: React.FC<MobileLayoutProps> = ({
  blocks,
  isAdmin,
  onBlockEdit,
  onBlockDelete,
  onAddBlock,
}) => {
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
            ? sortedBlocks.slice(index).filter(b => b.type !== 'section-header')
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
              <MobileAddButton
                onClick={() => onAddBlock({ x: 0, y: index + 1 })}
              />
            )}
          </div>
        );
      })}

      {/* Add section for empty mobile */}
      {isAdmin && onAddBlock && (
        <div className="grid grid-cols-2 gap-4">
          <MobileAddButton
            onClick={() => onAddBlock({ x: 0, y: sortedBlocks.length })}
          />
        </div>
      )}
    </div>
  );
};
