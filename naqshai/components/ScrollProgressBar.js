'use client';

import React, { useState, useEffect } from 'react';

/**
 * ScrollProgressBar Component
 * Listens to window scroll events and renders a thin, smooth progress bar
 * attached to the bottom of the main navigation bar.
 */
export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setScrollProgress(0);
      }
    };

    // Calculate initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-transparent overflow-hidden pointer-events-none z-50">
      <div
        className="h-full bg-emerald-700 transition-all duration-150 ease-out rounded-r-full"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  );
}
