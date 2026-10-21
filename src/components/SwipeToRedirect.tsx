import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ExternalLink, Check, Sparkles, MapPin, Search, Share2, Navigation } from 'lucide-react';

interface SwipeToRedirectProps {
  url: string;
  searchUrl?: string;
  pgName: string;
  collegeName?: string;
  area?: string;
  label?: string;
  className?: string;
}

export default function SwipeToRedirect({
  url,
  searchUrl,
  pgName,
  collegeName,
  area,
  label = 'Slide to Open on Google Maps & Share',
  className = '',
}: SwipeToRedirectProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  const KNOB_WIDTH = 44;
  const KNOB_MARGIN = 4;

  const getMaxDrag = () => {
    if (!trackRef.current) return 180;
    return Math.max(0, trackRef.current.clientWidth - KNOB_WIDTH - KNOB_MARGIN * 2);
  };

  // Ensure clean, verified Google Maps Place URL that resolves directly to the exact PG business listing
  const getCleanMapsUrl = () => {
    if (url && !url.includes('/maps/place//')) {
      return url;
    }
    const cleanQuery = `${pgName}, ${area || 'Bangalore'}, Bengaluru`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanQuery)}`;
  };

  const triggerRedirect = (targetUrl?: string) => {
    setIsSuccess(true);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }

    const finalUrl = targetUrl || getCleanMapsUrl();
    window.open(finalUrl, '_blank', 'noopener,noreferrer');

    // Reset after delay
    setTimeout(() => {
      setDragX(0);
      setIsSuccess(false);
    }, 1500);
  };

  // Direct Share action (native mobile share sheet or copy place link)
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const finalUrl = getCleanMapsUrl();
    const shareText = `Check out ${pgName} (Paying Guest Accommodation) near ${collegeName || 'college'} on Google Maps:`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${pgName} - Google Maps`,
          text: shareText,
          url: finalUrl,
        });
        return;
      } catch (err) {
        // User cancelled or share unavailable, fall through to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(finalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      } catch {
        window.open(finalUrl, '_blank');
      }
    }
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
      // Threshold: if dragged > 60% of max
      if (dragX >= maxDrag * 0.6) {
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

  const mapsUrl = getCleanMapsUrl();
  const cleanDestination = `${pgName}, ${area || 'Bangalore'}, Bengaluru`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(cleanDestination)}`;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Slider Track */}
      <div
        ref={trackRef}
        onClick={() => {
          // If clicked directly without drag, trigger redirection
          if (!isDragging && dragX === 0 && !isSuccess) {
            triggerRedirect();
          }
        }}
        className="group relative flex h-12 w-full cursor-pointer select-none items-center overflow-hidden rounded-2xl border border-purple-500/35 bg-gradient-to-r from-zinc-950/95 via-purple-950/30 to-zinc-950/95 shadow-[0_0_20px_rgba(168,85,247,0.18)] backdrop-blur-xl transition-all duration-300 hover:border-purple-400/70 hover:shadow-[0_0_25px_rgba(168,85,247,0.35)]"
        title={`Slide or click to view ${pgName} on Google Maps`}
      >
        {/* Glowing Progress Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-600/40 via-fuchsia-600/45 to-purple-500/60 transition-all duration-75"
          style={{ width: `${Math.max(0, dragX + KNOB_WIDTH)}px` }}
        />

        {/* Center Text with Shimmer Animation */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 text-center">
          {isSuccess ? (
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 animate-pulse">
              <Check className="h-3.5 w-3.5" />
              Opening Google Maps Place Card...
            </span>
          ) : (
            <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-purple-200/90 transition-colors group-hover:text-purple-100 sm:text-xs">
              <Sparkles className="h-3 w-3 text-purple-400 animate-pulse hidden sm:inline" />
              <span>{label}</span>
              <div className="flex items-center text-purple-400/80 group-hover:text-purple-300 transition-colors">
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
          className={`absolute left-1 top-1 bottom-1 z-10 flex w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.7)] cursor-grab active:cursor-grabbing hover:brightness-110 active:scale-95 transition-shadow ${
            isSuccess ? 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-500/50' : ''
          }`}
        >
          {isSuccess ? (
            <Check className="h-4 w-4 text-white" />
          ) : (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-white transition-transform group-hover:scale-110" />
            </div>
          )}
        </div>
      </div>

      {/* Direct Action Links & Quick Actions */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px]">
        {/* Direct Google Place link */}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 hover:underline transition-colors"
          title="Open exact Google Maps place listing"
        >
          <MapPin className="h-3 w-3 text-purple-400" />
          <span>Google Maps Listing</span>
          <ExternalLink className="h-2.5 w-2.5" />
        </a>

        <div className="flex items-center gap-2.5 ml-auto">
          {/* Share Button (Web Share / Copy Link) */}
          <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold transition-all ${
              copied
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                : 'bg-purple-950/70 text-purple-300 border border-purple-500/30 hover:bg-purple-900/80 hover:text-white'
            }`}
            title="Share this PG's Google Maps link via WhatsApp, Telegram, or copy"
          >
            {copied ? (
              <>
                <Check className="h-2.5 w-2.5 text-emerald-400" />
                <span>Copied Link!</span>
              </>
            ) : (
              <>
                <Share2 className="h-2.5 w-2.5 text-purple-400" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Directions button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 font-medium text-zinc-400 hover:text-purple-300 hover:underline transition-colors"
            title="Get turn-by-turn directions on Google Maps"
          >
            <Navigation className="h-2.5 w-2.5 text-zinc-400" />
            <span>Directions</span>
          </a>

          {/* Reviews search */}
          {searchUrl && (
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-medium text-zinc-400 hover:text-purple-300 hover:underline transition-colors"
              title="Read verified reviews & ratings on Google"
            >
              <Search className="h-2.5 w-2.5 text-zinc-400" />
              <span>Reviews</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
