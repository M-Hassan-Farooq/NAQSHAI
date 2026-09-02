'use client';

import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const MAP_LIBRARIES = ['places'];
const SCRIPT_ID = 'google-map-script';

// Clean up stale script tags from previous hot reloads if google object isn't fully ready
if (typeof window !== 'undefined') {
  try {
    const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    scripts.forEach((s) => {
      if (s.id && s.id !== SCRIPT_ID) {
        s.remove();
      }
    });
  } catch (e) {
    // Ignore DOM cleanup errors
  }
}

function InternalLoader({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAP_LIBRARIES,
  });

  return children({ isLoaded, loadError });
}

export function GoogleMapsSafeLoader({ children }) {
  const isReady = typeof window !== 'undefined' && Boolean(window.google && window.google.maps);

  if (isReady) {
    return children({ isLoaded: true, loadError: null });
  }

  return <InternalLoader>{children}</InternalLoader>;
}

export function useGoogleMaps() {
  const isAvailable = typeof window !== 'undefined' && Boolean(window.google && window.google.maps);

  if (isAvailable) {
    return { isLoaded: true, loadError: null };
  }

  return { isLoaded: false, loadError: null };
}
