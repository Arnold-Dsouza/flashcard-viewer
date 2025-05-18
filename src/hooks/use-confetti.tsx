"use client";

import { useState, useCallback, useEffect } from 'react';
import ReactConfetti from 'react-confetti';

export type ConfettiOptions = {
  recycle?: boolean;
  numberOfPieces?: number;
  tweenDuration?: number;
};

export const useConfetti = (options?: ConfettiOptions) => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  // Initialize as false to prevent automatic confetti on component mount
  const [isActive, setIsActive] = useState(false);
  
  // Set window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined') {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    
    updateDimensions();
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Start confetti
  const startConfetti = useCallback(() => {
    setIsActive(true);
  }, []);
  
  // Stop confetti
  const stopConfetti = useCallback(() => {
    setIsActive(false);
  }, []);
  
  // Run confetti for a specific duration
  const burstConfetti = useCallback((duration = 3000) => {
    startConfetti();
    setTimeout(() => {
      stopConfetti();
    }, duration);
  }, [startConfetti, stopConfetti]);
    const ConfettiComponent = useCallback(() => {
    // Only render confetti when active
    if (!isActive) return null;
    
    return (
      <ReactConfetti
        width={dimensions.width}
        height={dimensions.height}
        recycle={options?.recycle ?? false}
        numberOfPieces={options?.numberOfPieces ?? 200}
        tweenDuration={options?.tweenDuration ?? 5}
      />
    );
  }, [dimensions, isActive, options]);
  
  return {
    isActive,
    startConfetti,
    stopConfetti,
    burstConfetti,
    Confetti: ConfettiComponent,
  };
};
