
"use client";

import type { Flashcard } from '@/types';
import { cn } from '@/lib/utils';

interface FlashcardCardProps {
  card: Flashcard;
  isFlipped: boolean;
  onFlip: () => void;
  animationTrigger?: 'idle' | 'know';
}

export function FlashcardCard({ card, isFlipped, onFlip, animationTrigger = 'idle' }: FlashcardCardProps) {
  return (
    <div
      className={cn(
        "w-full max-w-md h-60 sm:w-96 sm:h-72 [perspective:1000px] cursor-pointer group",
        animationTrigger === 'know' && 'pointer-events-none' // Disable interaction during animation
      )}
      onClick={onFlip} 
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onFlip()}
      aria-pressed={isFlipped}
      aria-label={`Flashcard: ${isFlipped ? 'Answer side' : 'Question side'}. Click to flip.`}
    >
      <div
        className={cn(
          `relative w-full h-full [transform-style:preserve-3d] transition-transform duration-500 ease-in-out [will-change:transform]`,
          !isFlipped && `group-hover:scale-[1.02] group-hover:-translate-y-1`,
          isFlipped && `[transform:rotateY(180deg)]`,
          animationTrigger === 'know' && 'animate-card-burn-out'
        )}
      >
        {/* Front face */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-gradient-to-br from-[hsl(var(--card-realism-stop1))] to-[hsl(var(--card-realism-stop2))] text-card-foreground border rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300 ease-in-out flex items-center justify-center p-6 text-center">
          <p className="text-lg sm:text-xl md:text-2xl font-medium text-card-foreground text-standard-3d">
            <strong>Question:</strong> {card.question}
          </p>
        </div>
        {/* Back face */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-gradient-to-br from-[hsl(var(--card-realism-stop1))] to-[hsl(var(--card-realism-stop2))] text-card-foreground border rounded-xl shadow-xl group-hover:shadow-2xl transition-shadow duration-300 ease-in-out flex items-center justify-center p-6 text-center">
          <p className="text-base sm:text-lg md:text-xl text-card-foreground text-standard-3d">
            <strong>Answer:</strong> {card.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
