import React, { useState, useEffect, useRef } from 'react';

interface LivingInkTextProps {
  text: string;
  speedMs?: number;
  inkColor?: string;
  className?: string;
  onComplete?: () => void;
  showQuill?: boolean;
}

export const LivingInkText: React.FC<LivingInkTextProps> = ({
  text,
  speedMs = 35,
  inkColor = '#1c2430',
  className = '',
  onComplete,
  showQuill = true,
}) => {
  const [displayedWords, setDisplayedWords] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const words = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Split into words while preserving spacing and punctuation
    words.current = text.split(/(\s+)/);
    setDisplayedWords(0);
    setIsDone(false);

    let index = 0;
    const total = words.current.length;

    const interval = setInterval(() => {
      index += 2; // Word + spacing
      if (index >= total) {
        setDisplayedWords(total);
        setIsDone(true);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayedWords(index);
      }
    }, speedMs);

    return () => clearInterval(interval);
  }, [text, speedMs]);

  // Click to instantly reveal all text (for user convenience)
  const handleFastForward = () => {
    if (!isDone) {
      setDisplayedWords(words.current.length);
      setIsDone(true);
      onComplete?.();
    }
  };

  const visibleText = words.current.slice(0, displayedWords).join('');

  return (
    <div
      ref={containerRef}
      onClick={handleFastForward}
      className={`relative inline cursor-pointer select-text ${className}`}
      title={isDone ? undefined : 'کلیک برای نمایش سریع متن'}
    >
      <span
        style={{ color: inkColor }}
        className={`transition-all duration-300 font-vazir ${!isDone ? 'ink-seep' : ''}`}
      >
        {visibleText}
      </span>

      {/* Living Pulsing Quill Tip at the active edge while writing */}
      {!isDone && showQuill && (
        <span className="inline-block relative w-3 h-4 mr-1 align-baseline select-none pointer-events-none">
          <span
            className="absolute bottom-0 right-0 w-[2.5px] h-3.5 rounded-full animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.9)]"
            style={{ backgroundColor: inkColor === '#1c2430' ? '#785b30' : inkColor }}
          />
        </span>
      )}
    </div>
  );
};
