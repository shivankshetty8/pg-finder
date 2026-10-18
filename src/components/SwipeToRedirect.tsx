import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ExternalLink, Check, Sparkles } from 'lucide-react';

interface SwipeToRedirectProps {
  url: string;
  pgName: string;
  label?: string;
  className?: string;
}

export default function SwipeToRedirect({
  url,
  pgName,
  label = 'Swipe to View on Google',
  className = '',
}: SwipeToRedirectProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const KNOB_WIDTH = 42;
  const KNOB_MARGIN = 4;

  const getMaxDrag = () => {
    if (!trackRef.current) return 180;
    return Math.max(0, trackRef.current.clientWidth - KNOB_WIDTH - KNOB_MARGIN * 2);
  };

  const triggerRedirect = () => {
    setIsSuccess(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
    // Open Google page in new tab
    window.open(url, '_blank', 'noopener,noreferrer');

    // Reset after delay
    setTimeout(() => {
      setDragX(0);
      setIsSuccess(false);
    }, 1200);
  };

  const handleStart = (clientX: number) => {
    if (isSuccess) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = clientX - dragX;
  };

  useEffect(() => {
    const handleMove = (clientX: number) => {
      if (!isDraggingRef.current) return;
      const maxDrag = getMaxDrag();
      const newX = Math.max(0, Math.min(clientX - startXRef.current, maxDrag));
      setDragX(newX);
    };

    const handleEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);

      const maxDrag = getMaxDrag();
      // Threshold: if dragged > 65% of max
      if (dragX >= maxDrag * 0.65) {
        setDragX(maxDrag);
        triggerRedirect();
      } else {
        // Snap back
        setDragX(0);
      }
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) handleMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, dragX]);

  const maxDrag = getMaxDrag();
  const progressRatio = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Slider Track */}
      <div
        ref={trackRef}
        onClick={(e) => {
          // If clicked directly without drag, trigger redirection
          if (!isDragging && dragX === 0 && !isSuccess) {
            triggerRedirect();
          }
        }}
        className="group relative flex h-12 w-full cursor-pointer select-none items-center overflow-hidden rounded-2xl border border-purple-500/35 bg-gradient-to-r from-zinc-950/90 via-purple-950/20 to-zinc-950/90 shadow-[0_0_20px_rgba(168,85,247,0.15)] backdrop-blur-xl transition-all duration-300 hover:border-purple-400/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
        title={`Swipe or click to view ${pgName} on Google`}
      >
        {/* Glowing Progress Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/40 to-purple-500/50 transition-all duration-75"
          style={{ width: `${Math.max(0, dragX + KNOB_WIDTH)}px` }}
        />

        {/* Center Text with Shimmer Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 text-center">
          {isSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 animate-pulse">
              <Check className="h-3.5 w-3.5" />
              Opening Google...
            </span>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-300/80 transition-colors group-hover:text-purple-100 sm:text-xs">
              <Sparkles className="h-3 w-3 text-purple-400 animate-pulse hidden sm:inline" />
              <span>{label}</span>
              <div className="flex items-center text-purple-400/60 group-hover:text-purple-300 transition-colors">
                <ChevronRight className="h-3.5 w-3.5 animate-[pulse_1.5s_ease-in-out_infinite]" />
                <ChevronRight className="h-3.5 w-3.5 -ml-2 animate-[pulse_1.5s_ease-in-out_infinite_200ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Draggable Knob */}
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            handleStart(e.clientX);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            if (e.touches[0]) handleStart(e.touches[0].clientX);
          }}
          style={{
            transform: `translateX(${dragX}px)`,
            transition: isDragging ? 'none' : 'transform 0.25s ease-out',
          }}
          className={`absolute left-1 top-1 bottom-1 z-10 flex w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.6)] cursor-grab active:cursor-grabbing hover:brightness-110 active:scale-95 transition-shadow ${
            isSuccess ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : ''
          }`}
        >
          {isSuccess ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <div className="flex items-center">
              {/* Google G icon styling / external link */}
              <ExternalLink className="h-4 w-4 text-white transition-transform group-hover:translate-x-0.5" />
            </div>
          )}
        </div>
      </div>

      {/* Direct Click Helper Link */}
      <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-zinc-400">
        <span className="text-purple-300/70">Drag slider or click anywhere to open</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 hover:underline"
        >
          Google Page
          <ExternalLink className="h-2.5 w-2.5" />
        </a>
      </div>
    </div>
  );
}
