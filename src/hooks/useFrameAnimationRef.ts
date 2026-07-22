import { useEffect, useRef } from 'react';

export const useFrameAnimationRef = (folder: string, frameCount: number, fps: number = 24) => {
  const ref = useRef<HTMLImageElement>(null);
  const frameIndex = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasError = useRef(false);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    hasError.current = false;

    const intervalTime = 1000 / fps;
    intervalRef.current = setInterval(() => {
      if (ref.current && !hasError.current) {
        frameIndex.current = (frameIndex.current + 1) % frameCount;
        const padded = String(frameIndex.current + 1).padStart(3, '0');
        ref.current.src = `/${folder}/ezgif-frame-${padded}.jpg`;
      }
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [folder, frameCount, fps]);

  // Handle image load errors – stop updates and show fallback
  const handleError = () => {
    hasError.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (ref.current) {
      // Fallback to a static image or hide
      ref.current.style.display = 'none';
    }
  };

  return { ref, onError: handleError };
};