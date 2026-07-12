import { useEffect, useRef } from 'react';

/**
 * A DOM‑based frame animation hook – updates image src directly without React re‑renders.
 * This is the recommended version for performance.
 */
export const useFrameAnimationRef = (folder: string, frameCount: number, fps: number = 24) => {
  const ref = useRef<HTMLImageElement>(null);
  const frameIndex = useRef(0);

  useEffect(() => {
    const intervalTime = 1000 / fps;
    const interval = setInterval(() => {
      if (ref.current) {
        frameIndex.current = (frameIndex.current + 1) % frameCount;
        const padded = String(frameIndex.current + 1).padStart(3, '0');
        // Build the path directly using the folder prop
        ref.current.src = `/${folder}/ezgif-frame-${padded}.jpg`;
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [folder, frameCount, fps]);

  return ref;
};