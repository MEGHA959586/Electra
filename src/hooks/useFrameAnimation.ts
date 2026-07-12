import { useState, useEffect } from 'react';

/**
 * A state‑based frame animation hook – causes re‑renders on every frame.
 * Use only when you need React to react to frame changes.
 */
export const useFrameAnimation = (folder: string, frameCount: number, fps: number = 24) => {
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const intervalTime = 1000 / fps;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frameCount);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [frameCount, fps]);

  // Returns the frame number (0‑based) and a helper to build the image path
  const frameNumber = currentFrame + 1;
  const padded = String(frameNumber).padStart(3, '0');
  const src = `/${folder}/ezgif-frame-${padded}.jpg`;

  return { currentFrame, src, frameNumber };
};