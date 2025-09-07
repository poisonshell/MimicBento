let autoScrollActive = false;
let autoScrollFrame: number | null = null;

interface ScrollConfig {
  sensitivity: number;
  speed: number;
}

declare global {
  interface Window {
    __dragMouseX?: number;
    __dragMouseY?: number;
  }
}

const config: ScrollConfig = {
  sensitivity: 120,
  speed: 12,
};

function getScrollDirection(
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const { innerWidth, innerHeight } = window;
  const { sensitivity, speed } = config;

  let scrollX = 0;
  let scrollY = 0;

  if (clientX < sensitivity) {
    const intensity = (sensitivity - clientX) / sensitivity; // 0-1 based on distance from edge
    scrollX = -Math.ceil(intensity * speed);
  } else if (clientX > innerWidth - sensitivity) {
    const intensity = (clientX - (innerWidth - sensitivity)) / sensitivity;
    scrollX = Math.ceil(intensity * speed);
  }

  if (clientY < sensitivity) {
    const intensity = (sensitivity - clientY) / sensitivity;
    scrollY = -Math.ceil(intensity * speed);
  } else if (clientY > innerHeight - sensitivity) {
    const intensity = (clientY - (innerHeight - sensitivity)) / sensitivity;
    scrollY = Math.ceil(intensity * speed);
  }

  return { x: scrollX, y: scrollY };
}

function performAutoScroll() {
  if (!autoScrollActive) return;

  const currentMouseX = window.__dragMouseX || 0;
  const currentMouseY = window.__dragMouseY || 0;

  const { x, y } = getScrollDirection(currentMouseX, currentMouseY);

  if (x !== 0 || y !== 0) {
    window.scrollBy(x, y);
  }

  autoScrollFrame = requestAnimationFrame(performAutoScroll);
}

function trackMousePosition(e: DragEvent) {
  window.__dragMouseX = e.clientX;
  window.__dragMouseY = e.clientY;
}

export function startAutoScroll() {
  if (autoScrollActive) return;

  autoScrollActive = true;

  document.addEventListener('dragover', trackMousePosition);

  performAutoScroll();
}

export function stopAutoScroll() {
  autoScrollActive = false;

  document.removeEventListener('dragover', trackMousePosition);

  if (autoScrollFrame) {
    cancelAnimationFrame(autoScrollFrame);
    autoScrollFrame = null;
  }

  delete window.__dragMouseX;
  delete window.__dragMouseY;
}
