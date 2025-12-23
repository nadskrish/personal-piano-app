/**
 * useAnimationFrame - Hook for running animation loops
 */

import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook that calls a callback on every animation frame
 * @param {function} callback - Called each frame with delta time
 * @param {boolean} isRunning - Whether the animation should run
 */
export function useAnimationFrame(callback, isRunning = true) {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  const animate = useCallback((time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      callback(deltaTime, time);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, animate]);
}
