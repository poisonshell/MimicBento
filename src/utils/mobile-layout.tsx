import React from 'react';
import { BentoBlock, AnimationSettings } from '@/types/bento';
import BentoBlockComponent from '@/components/BentoBlock';
import { sortBlocksForMobile } from './drag-drop';
import { AnimatedWrapper, AnimatedGrid } from '@/components/AnimatedWrapper';

interface MobileLayoutProps {
  blocks: BentoBlock[];
  isAdmin: boolean;
  animations?: AnimationSettings;
  onBlockEdit?: (block: BentoBlock) => void;
  onBlockDelete?: (blockId: string) => void;
  onAddBlock?: (position: { x: number; y: number }) => void;
}

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

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  blocks,
  isAdmin,
  animations,
  onBlockEdit,
  onBlockDelete,
  onAddBlock,
}) => {
  const sortedBlocks = sortBlocksForMobile(blocks);

  return (
    <AnimatedGrid animations={animations}>
      <div className="w-full space-y-4">
        {sortedBlocks.map((block, index) => {
          if (block.type === 'section-header') {
            return (
              <AnimatedWrapper
                key={block.id}
                className="w-full mb-4"
                animations={animations}
                index={index}
              >
                <BentoBlockComponent
                  block={block}
                  isMobile={true}
                  isAdmin={isAdmin}
                  onEdit={onBlockEdit}
                  onDelete={onBlockDelete}
                />
              </AnimatedWrapper>
            );
          }

          const nextSectionIndex = sortedBlocks.findIndex(
            (b, i) => i > index && b.type === 'section-header'
          );
          const sectionBlocks =
            nextSectionIndex === -1
              ? sortedBlocks
                  .slice(index)
                  .filter(b => b.type !== 'section-header')
              : sortedBlocks
                  .slice(index, nextSectionIndex)
                  .filter(b => b.type !== 'section-header');

          const isFirstInSection =
            index === 0 || sortedBlocks[index - 1].type === 'section-header';

          if (!isFirstInSection) return null;

          return (
            <div key={`section-${index}`} className="grid grid-cols-2 gap-4">
              {sectionBlocks.map((sectionBlock, blockIndex) => (
                <AnimatedWrapper
                  key={sectionBlock.id}
                  className="aspect-square rounded-2xl overflow-hidden relative"
                  animations={animations}
                  index={index + blockIndex}
                >
                  <BentoBlockComponent
                    block={{ ...sectionBlock, size: 'small' }}
                    isMobile={true}
                    isAdmin={isAdmin}
                    onEdit={onBlockEdit}
                    onDelete={onBlockDelete}
                  />
                </AnimatedWrapper>
              ))}

              {}
              {isAdmin && onAddBlock && sectionBlocks.length % 2 !== 0 && (
                <MobileAddButton
                  onClick={() => onAddBlock({ x: 0, y: index + 1 })}
                />
              )}
            </div>
          );
        })}

        {}
        {isAdmin && onAddBlock && (
          <div className="grid grid-cols-2 gap-4">
            <MobileAddButton
              onClick={() => onAddBlock({ x: 0, y: sortedBlocks.length })}
            />
          </div>
        )}
      </div>
    </AnimatedGrid>
  );
};
