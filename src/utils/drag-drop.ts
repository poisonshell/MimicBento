import { BentoBlock } from '@/types/bento';

export const createDragImage = (
  element: HTMLElement,
  draggedBlockData: BentoBlock | undefined,
  e: React.DragEvent
) => {
  const rect = element.getBoundingClientRect();
  const isSectionHeader = draggedBlockData?.size === 'section-header';
  const isMapBlock = draggedBlockData?.type === 'map';

  let dragImage: HTMLElement;

  if (isMapBlock) {
    // Create a simple box with block name for map blocks
    dragImage = document.createElement('div');
    dragImage.style.width = rect.width + 'px';
    dragImage.style.height = rect.height + 'px';
    dragImage.style.backgroundColor = '#ffffff';
    dragImage.style.borderRadius = '24px';
    dragImage.style.boxShadow =
      '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.05)';
    dragImage.style.overflow = 'hidden';
    dragImage.style.opacity = '0.8';
    dragImage.style.display = 'flex';
    dragImage.style.flexDirection = 'column';
    dragImage.style.alignItems = 'center';
    dragImage.style.justifyContent = 'center';
    dragImage.style.padding = '16px';
    dragImage.style.textAlign = 'center';

    const content = draggedBlockData?.content;
    const title = draggedBlockData?.title;

    dragImage.innerHTML = `
      <div style="
        background: linear-gradient(to bottom right, rgb(224 242 254), rgb(191 219 254));
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 12px;
      ">
        <svg style="width: 24px; height: 24px; color: #3b82f6;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
      </div>
      <div style="
        font-size: 14px;
        font-weight: 600;
        color: #374151;
        margin-bottom: 4px;
      ">
        ${title || content?.location || 'Map'}
      </div>
      ${
        content?.address
          ? `
      <div style="
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      ">
        ${content.address}
      </div>
      `
          : ''
      }
    `;
  } else {
    // Clone the element to use as drag image for other block types
    dragImage = element.cloneNode(true) as HTMLElement;
    dragImage.style.width = rect.width + 'px';
    dragImage.style.height = rect.height + 'px';
    dragImage.style.transform = 'rotate(0deg)';
    dragImage.style.opacity = '0.8';

    // Force proper styling for all drag images
    dragImage.style.backgroundColor = '#ffffff';
    dragImage.style.borderRadius = '24px'; // rounded-3xl equivalent
    dragImage.style.boxShadow =
      '0 0 0 1px rgba(0,0,0,0.03), 0 2px 4px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.05)';
    dragImage.style.overflow = 'hidden';

    // Ensure text remains visible and backgrounds are proper
    const textElements = dragImage.querySelectorAll(
      'div, span, p, h1, h2, h3, h4, h5, h6'
    );
    textElements.forEach((el: Element) => {
      const htmlEl = el as HTMLElement;
      // Don't override existing background colors, and ensure text color is visible
      const computedStyle = window.getComputedStyle(htmlEl);
      if (!htmlEl.style.color && computedStyle.color) {
        htmlEl.style.color = computedStyle.color;
      }
    });
  }

  // Temporarily add to DOM for drag image
  document.body.appendChild(dragImage);

  // Calculate offset based on mouse position within the element
  let offsetX, offsetY;
  if (isSectionHeader) {
    // For section headers, use the actual mouse position relative to the element
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  } else {
    // For regular blocks, use center
    offsetX = rect.width / 2;
    offsetY = rect.height / 2;
  }

  // Set the drag image
  e.dataTransfer.setDragImage(dragImage, offsetX, offsetY);

  // Clean up after a short delay
  setTimeout(() => {
    if (document.body.contains(dragImage)) {
      document.body.removeChild(dragImage);
    }
  }, 0);
};

export const sortBlocksForMobile = (blocks: BentoBlock[]) => {
  const regularBlocks = blocks.filter(block => block.type !== 'section-header');
  const sectionHeaders = blocks.filter(
    block => block.type === 'section-header'
  );

  // Sort all blocks by position to maintain order
  return [...regularBlocks, ...sectionHeaders].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });
};
