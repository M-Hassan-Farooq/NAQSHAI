'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker, StreetViewPanorama, GoogleMapsMarkerClusterer } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import { Search, ShieldAlert, Phone, MapPin, Eye, X, ArrowLeft, MessageSquare, Home, Loader2, RefreshCw, User, LogOut } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

// Fallback camera only — used before plots load or when no plot has geometry.
const defaultCenter = { lat: 33.6844, lng: 73.0479 };
const DEFAULT_ZOOM = 12;
const MAX_AUTO_ZOOM = 18;

// Below this zoom, show the green availability-marker layer (clustered). At/above it,
// individual plot polygons take over. Clustering stops just under this level so the
// markers fully separate into individual pins before the boundaries appear.
const POLYGON_MIN_ZOOM = 16;

// Programmatically generated green "availability" pin (SVG data URI — no image asset).
function availabilityPinDataUri() {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52">' +
    '<path d="M20 1C9.5 1 1 9.5 1 20c0 13.5 19 31 19 31s19-17.5 19-31C39 9.5 30.5 1 20 1z" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>' +
    '<circle cx="20" cy="20" r="7.5" fill="#ffffff"/>' +
    '<circle cx="20" cy="20" r="3.5" fill="#059669"/>' +
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

// Green cluster bubble; the plot count is drawn as the marker label on top.
function clusterBubbleDataUri(size) {
  const c = size / 2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">` +
    `<circle cx="${c}" cy="${c}" r="${c - 2}" fill="#059669" fill-opacity="0.22"/>` +
    `<circle cx="${c}" cy="${c}" r="${c - 9}" fill="#059669" stroke="#ffffff" stroke-width="3"/>` +
    '</svg>';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plotParam = searchParams ? searchParams.get('plot') : null;

  const [map, setMap] = useState(null);
  const [session, setSession] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM); // drives the marker-layer ↔ polygon transition

  // Auth session state check
  useEffect(() => {
    let isMounted = true;
    async function fetchSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(activeSession);
      } catch (err) {
        console.error('Session error on Explore page:', err);
      }
    }
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) setSession(currentSession);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    setSession(null);
    router.refresh();
  };

  // Database-backed plot data.
  const [plots, setPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [plotsError, setPlotsError] = useState(null);

  const mapRef = useRef(null);
  const didFitRef = useRef(false); // ensures we auto-fit the camera only once
  const plotParamRef = useRef(plotParam); // latest deep-link param, read without re-fetching
  const clustererRef = useRef(null); // active MarkerClusterer instance (marker layer)
  const markersRef = useRef([]); // google.maps.Marker instances backing the clusterer

  const [reloadKey, setReloadKey] = useState(0); // bump to re-run the fetch (retry)

  // Keep the deep-link ref current without triggering re-fetches.
  useEffect(() => {
    plotParamRef.current = plotParam;
  }, [plotParam]);

  // --- Data fetching -------------------------------------------------------
  // The fetch lives inside the effect as an async callback, so state is only set in
  // the awaited continuation — never synchronously in the effect body. `reloadKey`
  // re-runs it for retry; `cancelled` guards against setState-after-unmount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/plots', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.plots) ? data.plots : [];
        setPlots(list);
        setPlotsError(null);
        didFitRef.current = false; // re-fit after a fresh load / retry

        // Deep-link: open ?plot=<id> once its data is available.
        const param = plotParamRef.current;
        if (param) {
          const match = list.find((p) => p.id.toLowerCase() === param.toLowerCase());
          if (match) {
            setSelectedPlot(match);
            setSearchQuery(match.name);
            didFitRef.current = true; // focusing a specific plot; skip auto-fit
          }
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load registered plots:', err);
        setPlotsError('We couldn’t load the registered plots. Please try again.');
        setPlots([]);
      } finally {
        if (!cancelled) setPlotsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Retry from the error state — reset to loading and re-run the fetch effect.
  const handleRetry = useCallback(() => {
    setPlotsLoading(true);
    setPlotsError(null);
    setReloadKey((k) => k + 1);
  }, []);

  // --- Map lifecycle -------------------------------------------------------
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  // Track zoom (event-driven, not an effect) so the map can switch between the green
  // availability-marker layer and the individual plot polygons.
  const handleZoomChanged = useCallback(() => {
    const z = mapRef.current?.getZoom?.();
    if (typeof z === 'number') setZoom(z);
  }, []);

  // Fit the viewport to every plot that has valid geometry. Returns whether it did.
  const fitToPlots = useCallback((mapInstance, plotList) => {
    if (!mapInstance || typeof window === 'undefined' || !window.google?.maps) return false;
    const withGeo = plotList.filter((p) => p.hasGeometry && p.paths.length);
    if (!withGeo.length) return false;
    try {
      const bounds = new window.google.maps.LatLngBounds();
      withGeo.forEach((p) => p.paths.forEach((pt) => bounds.extend(pt)));
      mapInstance.fitBounds(bounds);
      // Prevent over-zoom when there's a single small plot.
      window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > MAX_AUTO_ZOOM) mapInstance.setZoom(MAX_AUTO_ZOOM);
      });
      return true;
    } catch (e) {
      console.warn('fitBounds failed:', e);
      return false;
    }
  }, []);

  const handleSelectPlot = useCallback((plot) => {
    setSelectedPlot(plot);
    setSearchQuery(plot.name);
    setIsDropdownOpen(false);
    setIs3DMode(false);
  }, []);

  // Auto-fit the camera once, after the map + plots are ready (unless a plot is selected).
  useEffect(() => {
    if (!map || plotsLoading || didFitRef.current || selectedPlot) return;
    if (fitToPlots(map, plots)) {
      didFitRef.current = true;
    }
  }, [map, plots, plotsLoading, selectedPlot, fitToPlots]);

  // Pan/zoom into the selected plot.
  useEffect(() => {
    if (selectedPlot?.center && map) {
      map.panTo(selectedPlot.center);
      map.setZoom(MAX_AUTO_ZOOM);
    }
  }, [selectedPlot, map]);

  // --- Availability marker layer (green markers + clustering) --------------
  // Built imperatively from the same DB-backed `plots` (marker at each plot's centroid).
  // Shown only when zoomed out; polygons take over past POLYGON_MIN_ZOOM. This effect
  // only syncs the map (an external system) and sets no React state.
  const showMarkerLayer = zoom < POLYGON_MIN_ZOOM;

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return undefined;
    if (!showMarkerLayer) return undefined;

    const g = window.google;
    const markerPlots = plots.filter((p) => p.center); // center exists only with valid geometry
    if (!markerPlots.length) return undefined;

    const { MarkerClusterer, SuperClusterAlgorithm } = GoogleMapsMarkerClusterer;

    const pinIcon = {
      url: availabilityPinDataUri(),
      scaledSize: new g.maps.Size(36, 47),
      anchor: new g.maps.Point(18, 47),
      labelOrigin: new g.maps.Point(18, 18),
    };

    // One green marker per registered plot; click reuses the existing details flow.
    const markers = markerPlots.map((plot) => {
      const marker = new g.maps.Marker({ position: plot.center, icon: pinIcon, title: plot.name });
      marker.addListener('click', () => handleSelectPlot(plot));
      return marker;
    });

    // Green cluster bubble with the count of available plots in that area.
    const renderer = {
      render: ({ count, position }) => {
        const size = count < 10 ? 46 : count < 50 ? 54 : 62;
        return new g.maps.Marker({
          position,
          icon: {
            url: clusterBubbleDataUri(size),
            scaledSize: new g.maps.Size(size, size),
            anchor: new g.maps.Point(size / 2, size / 2),
            labelOrigin: new g.maps.Point(size / 2, size / 2),
          },
          label: { text: String(count), color: '#ffffff', fontSize: '13px', fontWeight: '700' },
          zIndex: 1000 + count,
        });
      },
    };

    const clusterer = new MarkerClusterer({
      map,
      markers,
      renderer,
      // Stop clustering just below the polygon threshold so pins fully separate first.
      algorithm: new SuperClusterAlgorithm({ radius: 130, maxZoom: POLYGON_MIN_ZOOM - 1 }),
    });

    clustererRef.current = clusterer;
    markersRef.current = markers;

    return () => {
      try {
        clusterer.clearMarkers();
        clusterer.setMap(null);
      } catch (e) {
        /* clusterer teardown is best-effort */
      }
      markers.forEach((m) => {
        g.maps.event.clearInstanceListeners(m);
        m.setMap(null);
      });
      clustererRef.current = null;
      markersRef.current = [];
    };
  }, [map, plots, showMarkerLayer, handleSelectPlot]);

  const handleResetSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedPlot(null);
    setIsDropdownOpen(false);
    setIs3DMode(false);
    if (map) {
      const fitted = fitToPlots(map, plots);
      if (!fitted) {
        map.panTo(defaultCenter);
        map.setZoom(DEFAULT_ZOOM);
      }
      didFitRef.current = true;
    }
  }, [map, plots, fitToPlots]);

  // Search filters the dropdown list only; the map always shows all registered plots.
  const filteredPlots = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return plots;
    return plots.filter((plot) =>
      (plot.name || '').toLowerCase().includes(q) ||
      (plot.society || '').toLowerCase().includes(q) ||
      (plot.id || '').toLowerCase().includes(q) ||
      (plot.city || '').toLowerCase().includes(q) ||
      (plot.price || '').toLowerCase().includes(q) ||
      (plot.details?.size || '').toLowerCase().includes(q) ||
      (plot.details?.floodRisk || '').toLowerCase().includes(q)
    );
  }, [plots, searchQuery]);

  const showEmptyState = !plotsLoading && !plotsError && plots.length === 0;

  return (
    <GoogleMapsSafeLoader>
      {({ isLoaded, loadError }) => {
        if (loadError) return <div className="p-4 text-red-500">Error loading maps. Check your API key.</div>;
        if (!isLoaded) return <div className="p-4 text-slate-500">Loading Map...</div>;

        return (
          <div className="relative w-full h-screen overflow-hidden font-sans bg-slate-100 text-slate-800">

      {/* 2. Navigation Bridge (Home, Sell Plot & Back to AI Advisor) */}
      <div className="absolute top-3 right-6 z-20 flex items-center gap-3">
        <button
          onClick={() => router.push('/sell')}
          className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
        >
          <span>List Your Plot</span>
        </button>
        <button
          onClick={() => router.push('/')}
          className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
        >
          <Home className="w-4 h-4 text-emerald-700" />
          <span>Home</span>
        </button>
        <button
          onClick={() => router.push('/recommend')}
          className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-700" />
          <span>Back to AI Advisor</span>
        </button>

        {session?.user ? (
          <UserNav
            session={session}
            onSignOut={handleSignOut}
            onUserUpdated={(updatedUser) => setSession((prev) => ({ ...prev, user: updatedUser }))}
            className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl px-2 py-1"
          />
        ) : (
          <button
            onClick={() => router.push('/login?redirect=/explore')}
            className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl px-4 py-2.5 flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer"
          >
            <User className="w-4 h-4 text-emerald-700" />
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* 3. Floating Command Center (Search & Filters) */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-3 space-y-2">

          {/* Search Bar Input */}
          <div className="relative">
            <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-8 py-1.5">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search plot, society, or ID..."
                className="w-full outline-none text-sm text-slate-800 placeholder:text-slate-400 bg-transparent"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Clear search and reset map"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Dropdown Results */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-30 max-h-60 overflow-y-auto">
                {plotsLoading ? (
                  <div className="p-3 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" /> Loading registered plots…
                  </div>
                ) : filteredPlots.length > 0 ? (
                  filteredPlots.map((plot) => (
                    <button
                      key={plot.id}
                      onClick={() => handleSelectPlot(plot)}
                      className="w-full text-left px-4 py-3 hover:bg-emerald-50/70 transition border-b border-slate-100 last:border-0 flex items-start space-x-2.5"
                    >
                      <MapPin className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-semibold text-slate-800">{plot.name}</p>
                          <span className="text-xs font-bold text-emerald-700">{plot.price}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {plot.society ? `${plot.society}, ` : ''}{plot.city} • {plot.id}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-slate-500 text-center">No matching plots found</div>
                )}
              </div>
            )}
          </div>

          {/* Filter Pills Row */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pt-0.5">
            <button
              onClick={() => {
                setSearchQuery('Low');
                setIsDropdownOpen(true);
              }}
              className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition whitespace-nowrap"
            >
              Low Flood Risk
            </button>
            <button
              onClick={() => {
                setSearchQuery('10 Marla');
                setIsDropdownOpen(true);
              }}
              className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition whitespace-nowrap"
            >
              10 Marla
            </button>
            <button
              onClick={() => {
                setSearchQuery('Crore');
                setIsDropdownOpen(true);
              }}
              className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition whitespace-nowrap"
            >
              Priced in Crore
            </button>
          </div>

          {/* Registered plot count / reset */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">
              {plotsLoading
                ? 'Loading…'
                : `${plots.length} registered plot${plots.length === 1 ? '' : 's'}`}
            </span>
            {selectedPlot && (
              <button
                onClick={handleResetSearch}
                className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1 px-2 rounded-lg transition"
              >
                Reset view
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 1. Google Map Container (3D terrain) */}
      <GoogleMapsSafeLoader>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={DEFAULT_ZOOM}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onZoomChanged={handleZoomChanged}
          onIdle={handleZoomChanged}
          options={{
            mapTypeId: 'terrain',
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {/* Render real plot boundary polygons from the database.
              Hidden while zoomed out (the green marker layer represents them there);
              the selected plot's polygon always renders so its highlight stays visible. */}
          {plots.map((plot) => {
            if (!plot.hasGeometry) return null;
            const isSelected = selectedPlot?.id?.toLowerCase() === plot.id.toLowerCase();
            if (zoom < POLYGON_MIN_ZOOM && !isSelected) return null;
            const isHovered = hoveredPlotId === plot.id;
            return (
              <Polygon
                key={plot.id}
                paths={plot.paths}
                onClick={() => handleSelectPlot(plot)}
                onMouseOver={() => setHoveredPlotId(plot.id)}
                onMouseOut={() => setHoveredPlotId((cur) => (cur === plot.id ? null : cur))}
                options={{
                  fillColor: isSelected ? '#10b981' : isHovered ? '#34d399' : '#94a3b8',
                  fillOpacity: isSelected ? 0.25 : isHovered ? 0.22 : 0.15,
                  strokeColor: isSelected ? '#047857' : isHovered ? '#059669' : '#64748b',
                  strokeWeight: isSelected ? 4 : isHovered ? 3 : 2,
                  zIndex: isSelected ? 99 : isHovered ? 50 : 1,
                  clickable: true,
                }}
              />
            );
          })}

          {/* Selected Plot Marker Pin */}
          {selectedPlot && selectedPlot.center && (
            <Marker
              position={selectedPlot.center}
              title={selectedPlot.name}
            />
          )}

          {/* 3D Walkthrough View */}
          {is3DMode && selectedPlot && selectedPlot.center && (
            <StreetViewPanorama
              position={selectedPlot.center}
              visible={is3DMode}
              options={{
                pov: { heading: 100, pitch: 0 },
                zoom: 1,
              }}
            />
          )}
        </GoogleMap>
      </GoogleMapsSafeLoader>

      {/* Data status overlays: loading / error / empty (non-blocking card) */}
      {(plotsLoading || plotsError || showEmptyState) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4">
          <div className="pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl px-6 py-5 max-w-sm w-full text-center">
            {plotsLoading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
                <p className="text-sm font-semibold text-slate-800">Loading registered plots…</p>
                <p className="text-xs text-slate-500">Fetching the latest properties from the database.</p>
              </div>
            ) : plotsError ? (
              <div className="flex flex-col items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                <p className="text-sm font-semibold text-slate-800">Couldn’t load plots</p>
                <p className="text-xs text-slate-500">{plotsError}</p>
                <button
                  onClick={handleRetry}
                  className="mt-1 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Retry
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <MapPin className="w-6 h-6 text-slate-400" />
                <p className="text-sm font-semibold text-slate-800">No registered plots found</p>
                <p className="text-xs text-slate-500">Once plots are registered, they’ll appear here on the map.</p>
                <button
                  onClick={() => router.push('/sell')}
                  className="mt-1 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-sm"
                >
                  List a Plot
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Availability legend (bottom-left) — explains the green markers and current mode */}
      {!plotsLoading && !plotsError && plots.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-2 flex items-center gap-2.5">
          <span className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow shrink-0" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-slate-700">Available plots</p>
            <p className="text-[11px] text-slate-400">
              {showMarkerLayer ? 'Zoom in to see plot boundaries' : 'Showing plot boundaries'}
            </p>
          </div>
        </div>
      )}

      {/* 4. Slide-Out Property Inspector (Sidebar) */}
      <div
        className={`absolute top-0 right-0 h-full w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 z-30 transform transition-transform duration-300 flex flex-col ${
          selectedPlot ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedPlot && (
          <>
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/80">
              <div className="flex items-center gap-2">
                <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-700 text-xs font-bold">
                  {selectedPlot.id}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                  {selectedPlot.price}
                </span>
              </div>
              <button
                onClick={() => setSelectedPlot(null)}
                className="p-1 hover:bg-slate-200/60 rounded-full text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Content (Scrollable) */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-slate-800">

              {/* Title & Location */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedPlot.name}</h2>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{selectedPlot.society ? `${selectedPlot.society}, ` : ''}{selectedPlot.city}</span>
                </p>
              </div>

              {/* 3D Walkthrough Toggle */}
              <button
                onClick={() => setIs3DMode(!is3DMode)}
                disabled={!selectedPlot.center}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition text-xs shadow-sm"
              >
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>
                  {!selectedPlot.center
                    ? 'Walkthrough Unavailable (No Boundary)'
                    : is3DMode
                    ? 'Exit 3D Walkthrough'
                    : 'Launch 3D Walkthrough'}
                </span>
              </button>

              {/* Architectural Breakdown */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Architectural Breakdown</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Plot Size</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPlot.details.size}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[11px]">Category</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPlot.details.category || 'Residential'}</span>
                  </div>
                </div>
              </div>

              {/* Risk Intelligence Badges */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Risk Intelligence Assessment</h3>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                    Flood: {selectedPlot.details.floodRisk}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Noise: {selectedPlot.details.noiseLevel}
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md text-xs font-semibold">
                    Elevation: {selectedPlot.details.elevation}
                  </span>
                </div>
              </div>

              {/* Landmarks & Proximity */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Landmarks & Proximity</h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {selectedPlot.details.landmarks}
                </p>
              </div>

              {/* WhatsApp Secondary Link */}
              <div className="pt-2">
                {selectedPlot.ownerContact ? (
                  <a
                    href={`https://wa.me/${selectedPlot.ownerContact.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(selectedPlot.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition text-xs shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contact Owner via WhatsApp</span>
                  </a>
                ) : (
                  <div className="w-full text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl py-2.5">
                    Owner contact not available
                  </div>
                )}
              </div>

            </div>

            {/* Sidebar Footer / CTA */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => router.push(`/recommend?context=${selectedPlot.id}`)}
                className="bg-emerald-700 hover:bg-emerald-600 text-white w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 text-sm shadow-sm transition"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Discuss with AI</span>
              </button>
            </div>
          </>
        )}
      </div>

    </div>
        );
      }}
    </GoogleMapsSafeLoader>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-400">Loading Map...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
