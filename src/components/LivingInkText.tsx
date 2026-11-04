import React, { useState, useEffect, useRef } from 'react';

interface LivingInkTextProps {
  text: string;
  speedMs?: number;
  inkColor?: string;
  className?: string;
  onComplete?: () => void;
  showQuill?: boolean;
}

const PUNCTUATION_SET = new Set([
  '.', '،', '؛', '!', '؟', ':', '?', '—', '-', '…', ';', ','
]);

/**
 * Calculates organic human handwriting delay based on character type.
 * Normal letters: 12ms (scaled by speedMs ratio)
 * Spaces: 28ms
 * Punctuation: 110ms (thoughtful pen pause)
 * Newline: 180ms (line reset carriage return pause)
 */
const getCharDelay = (char: string, baseSpeedMs: number = 35): number => {
  const ratio = Math.max(0.1, baseSpeedMs / 35);
  if (char === '\n') {
    return Math.max(20, Math.round(180 * ratio));
  }
  if (PUNCTUATION_SET.has(char)) {
    return Math.max(15, Math.round(110 * ratio));
  }
  if (char === ' ' || char === '\t') {
    return Math.max(4, Math.round(28 * ratio));
  }
  return Math.max(2, Math.round(12 * ratio));
};

export const LivingInkText: React.FC<LivingInkTextProps> = ({
  text,
  speedMs = 35,
  inkColor = '#1c2430',
  className = '',
  onComplete,
  showQuill = true,
}) => {
  const [displayedIndex, setDisplayedIndex] = useState<number>(0);
  const [isDone, setIsDone] = useState<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  // Keep latest onComplete callback reference without restarting timer effect
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = () => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    clearTimer();

    if (!text || text.length === 0) {
      setDisplayedIndex(0);
      setIsDone(true);
      onCompleteRef.current?.();
      return;
    }

    setDisplayedIndex(0);
    setIsDone(false);

    let current = 0;

    const step = () => {
      current += 1;
      setDisplayedIndex(current);

      if (current >= text.length) {
        setIsDone(true);
        timeoutRef.current = null;
        onCompleteRef.current?.();
        return;
      }

      const justWrittenChar = text[current - 1];
      const delay = getCharDelay(justWrittenChar, speedMs);
      timeoutRef.current = setTimeout(step, delay);
    };

    const initialDelay = getCharDelay(text[0], speedMs);
    timeoutRef.current = setTimeout(step, initialDelay);

    return () => {
      clearTimer();
    };
  }, [text, speedMs]);

  // Click anywhere to immediately reveal complete text without waiting
  const handleFastForward = () => {
    if (!isDone) {
      clearTimer();
      setDisplayedIndex(text.length);
      setIsDone(true);
      onCompleteRef.current?.();
    }
  };

  // Once streaming completes, render fully settled text with zero overhead
  if (isDone) {
    return (
      <div className={`relative inline select-text whitespace-pre-wrap ${className}`}>
        <span style={{ color: inkColor }} className="font-vazir">
          {text}
        </span>
      </div>
    );
  }

  // Active streaming state: partition visible text into settled words and the active diffusing segment
  const visible = text.slice(0, displayedIndex);

  let lastDelim = -1;
  let chunkCount = 0;
  for (let i = 0; i < visible.length; i++) {
    const ch = visible[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || PUNCTUATION_SET.has(ch)) {
      lastDelim = i;
      chunkCount++;
    }
  }

  let stableText = '';
  let activeSegment = visible;
  let chunkKey = chunkCount;

  if (visible.length - (lastDelim + 1) > 12) {
    const forcedBreak = visible.length - 6;
    stableText = visible.slice(0, forcedBreak);
    activeSegment = visible.slice(forcedBreak);
    chunkKey = chunkCount + Math.floor(visible.length / 6);
  } else if (lastDelim !== -1) {
    stableText = visible.slice(0, lastDelim + 1);
    activeSegment = visible.slice(lastDelim + 1);
  }

  return (
    <div
      onClick={handleFastForward}
      className={`relative inline cursor-pointer select-text whitespace-pre-wrap ${className}`}
      title="کلیک برای نمایش سریع متن"
    >
      <span style={{ color: inkColor }} className="font-vazir">
        {stableText && <span>{stableText}</span>}
        {activeSegment && (
          <span key={chunkKey} className="ink-seep inline">
            {activeSegment}
          </span>
        )}
      </span>

      {/* Living Pulsing Quill Tip at the active edge while writing */}
      {showQuill && (
        <span className="inline-block relative w-2 h-3.5 mx-0.5 align-middle select-none pointer-events-none">
          <span
            className="absolute bottom-0 left-0 w-[2px] h-3 rounded-full animate-quill"
            style={{
              backgroundColor: inkColor === '#1c2430' ? '#b8860b' : inkColor,
              boxShadow: '0 0 6px rgba(212, 175, 55, 0.7)',
            }}
          />
        </span>
      )}
    </div>
  );
};
