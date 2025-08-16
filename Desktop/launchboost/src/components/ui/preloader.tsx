"use client";

import React, { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function Preloader({ isLoading, onComplete }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState<boolean>(isLoading);
  const [isHiding, setIsHiding] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimeout = useRef<NodeJS.Timeout | null>(null);


  // Play helper
  const playVideo = () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      v.playbackRate = 1.0;
      try { v.currentTime = 0; } catch {}
      void v.play();
    } catch (e) {
      // Video play failed silently
    }
  };

  // Hide when video ends (primary path)
  const handleVideoEnd = () => {
    setIsHiding(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, 500);
  };

  // React to isLoading changes to avoid blank screens
  useEffect(() => {
    // Clear any previous fallback
    if (hideTimeout.current) clearTimeout(hideTimeout.current);

    if (isLoading) {
      // Show overlay again and replay animation
      setIsHiding(false);
      setIsVisible(true);
      playVideo();

      // Fallback auto-complete if video cannot play or load
      hideTimeout.current = setTimeout(() => {
        handleVideoEnd();
      }, 3000);
    } else {
      // If requested to stop loading, gracefully hide if still visible
      if (isVisible) {
        setIsHiding(true);
        hideTimeout.current = setTimeout(() => {
          setIsVisible(false);
        }, 500);
      }
    }

    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ease-out ${
        isHiding ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: '#fbf55c' }}
    >
      <div className="relative flex flex-col items-center justify-center">
        <div className="relative w-[220px] h-[220px] rounded-[18px] border-2 border-black bg-white shadow-professional-xl flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src="/preloader.mp4" type="video/mp4" />
          </video>
        </div>
        <p className="mt-5 text-black font-bold text-sm tracking-wide">Loading IndieSaasDeals…</p>
      </div>
    </div>
  );
}
