'use client';

import React from 'react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Loader2, AlertCircle } from 'lucide-react';

const MAP_LIBRARIES = ['places'];
const SCRIPT_ID = 'google-map-script';

function InternalLoader({ children }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: SCRIPT_ID,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: MAP_LIBRARIES,
  });

  // 3. Error Guard: Return safe error UI if script fails to load
  if (loadError) {
    if (typeof children === 'function') {
      return children({ isLoaded: false, loadError });
    }
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-slate-200">
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl mb-3 text-red-600">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Map Script Error</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          {loadError.message || 'Unable to connect to Google Maps service. Please verify your API key or network connection.'}
        </p>
      </div>
    );
  }

  // 2. Load Guard: Check both isLoaded AND window.google.maps.Map constructor
  const isMapConstructorReady = isLoaded && typeof window !== 'undefined' && Boolean(window.google?.maps?.Map);

  if (!isMapConstructorReady) {
    if (typeof children === 'function') {
      return children({ isLoaded: false, loadError: null });
    }
    return (
      <div className="w-full h-full min-h-[400px] bg-slate-100 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-slate-200">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Loading Map 3D Terrain...</span>
        </div>
      </div>
    );
  }

  if (typeof children === 'function') {
    return children({ isLoaded: true, loadError: null });
  }

  return children;
}

export function GoogleMapsSafeLoader({ children }) {
  const isReady = typeof window !== 'undefined' && Boolean(window.google?.maps?.Map);

  if (isReady) {
    if (typeof children === 'function') {
      return children({ isLoaded: true, loadError: null });
    }
    return children;
  }

  return <InternalLoader>{children}</InternalLoader>;
}

export function useGoogleMaps() {
  const isAvailable = typeof window !== 'undefined' && Boolean(window.google?.maps?.Map);

  if (isAvailable) {
    return { isLoaded: true, loadError: null };
  }

  return { isLoaded: false, loadError: null };
}
