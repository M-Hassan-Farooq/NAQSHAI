'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker, StreetViewPanorama, GoogleMapsMarkerClusterer } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import AmenityScoreCard from '@/components/AmenityScoreCard';
import {
  Search,
  ShieldAlert,
  Phone,
  MapPin,
  Eye,
  X,
  ArrowLeft,
  MessageSquare,
  Home,
  Loader2,
  RefreshCw,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  SlidersHorizontal,
  Building2,
  Layers,
  GripVertical
} from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

// Fallback camera only — used before plots load or when no plot has geometry.
const defaultCenter = { lat: 33.6844, lng: 73.0479 };
const DEFAULT_ZOOM = 12;
const MAX_AUTO_ZOOM = 18;

// Below this zoom, show the green availability-marker layer (clustered). At/above it,
// individual plot polygons take over.
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
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [hoveredPlotId, setHoveredPlotId] = useState(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);

  // Split-Screen Interface States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlacesSearchOpen, setIsPlacesSearchOpen] = useState(true);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('ALL');

  // Resizable Split Pane States (300px min - 600px max, default 400px)
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);

  // Restore saved width from localStorage on mount
  useEffect(() => {
    try {
      const savedWidth = localStorage.getItem('naqshai_explorer_sidebar_width');
      if (savedWidth) {
        const parsed = parseInt(savedWidth, 10);
        if (!Number.isNaN(parsed) && parsed >= 300 && parsed <= 600) {
          setSidebarWidth(parsed);
        }
      }
    } catch (_) {}
  }, []);

  // Handle Dragging to Resize Sidebar
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const newWidth = Math.max(300, Math.min(600, e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Persist width to localStorage
      setSidebarWidth((latest) => {
        try {
          localStorage.setItem('naqshai_explorer_sidebar_width', String(latest));
        } catch (_) {}
        return latest;
      });

      // Recalculate Google Maps bounds & viewport
      if (mapRef.current && window.google?.maps?.event) {
        window.google.maps.event.trigger(mapRef.current, 'resize');
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  // Google Places Autocomplete States & Services
  const [placesQuery, setPlacesQuery] = useState('');
  const [placesPredictions, setPlacesPredictions] = useState([]);
  const [isPlacesDropdownOpen, setIsPlacesDropdownOpen] = useState(false);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);
  const [searchedLocation, setSearchedLocation] = useState(null);

  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const placesSearchContainerRef = useRef(null);
  const searchTimeoutRef = useRef(null);

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

  // Database-backed plot data
  const [plots, setPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(true);
  const [plotsError, setPlotsError] = useState(null);

  const mapRef = useRef(null);
  const didFitRef = useRef(false);
  const plotParamRef = useRef(plotParam);
  const clustererRef = useRef(null);
  const markersRef = useRef([]);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    plotParamRef.current = plotParam;
  }, [plotParam]);

  // Data fetching
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
        didFitRef.current = false;

        const param = plotParamRef.current;
        if (param) {
          const match = list.find((p) => p.id.toLowerCase() === param.toLowerCase());
          if (match) {
            setSelectedPlot(match);
            didFitRef.current = true;
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

  const handleRetry = useCallback(() => {
    setPlotsLoading(true);
    setPlotsError(null);
    setReloadKey((k) => k + 1);
  }, []);

  // Map lifecycle
  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  const handleZoomChanged = useCallback(() => {
    const z = mapRef.current?.getZoom?.();
    if (typeof z === 'number') setZoom(z);
  }, []);

  const fitToPlots = useCallback((mapInstance, plotList) => {
    if (!mapInstance || typeof window === 'undefined' || !window.google?.maps) return false;
    const withGeo = plotList.filter((p) => p.hasGeometry && p.paths.length);
    if (!withGeo.length) return false;
    try {
      const bounds = new window.google.maps.LatLngBounds();
      withGeo.forEach((p) => p.paths.forEach((pt) => bounds.extend(pt)));
      mapInstance.fitBounds(bounds);
      window.google.maps.event.addListenerOnce(mapInstance, 'idle', () => {
        if (mapInstance.getZoom() > MAX_AUTO_ZOOM) mapInstance.setZoom(MAX_AUTO_ZOOM);
      });
      return true;
    } catch (e) {
      console.warn('fitBounds failed:', e);
      return false;
    }
  }, []);

  // Select plot and focus
  const handleSelectPlot = useCallback((plot) => {
    setSelectedPlot(plot);
    setIs3DMode(false);
  }, []);

  // "See on Map" action: pans, zooms, highlights and opens inspector drawer
  const handleSeeOnMap = useCallback((plot) => {
    setSelectedPlot(plot);
    setIs3DMode(false);
    if (plot.center && mapRef.current) {
      mapRef.current.panTo(plot.center);
      mapRef.current.setZoom(17);
    }
  }, []);

  // Auto-fit camera once
  useEffect(() => {
    if (!map || plotsLoading || didFitRef.current || selectedPlot) return;
    if (fitToPlots(map, plots)) {
      didFitRef.current = true;
    }
  }, [map, plots, plotsLoading, selectedPlot, fitToPlots]);

  // Pan into selected plot
  useEffect(() => {
    if (selectedPlot?.center && map) {
      map.panTo(selectedPlot.center);
      map.setZoom(MAX_AUTO_ZOOM);
    }
  }, [selectedPlot, map]);

  // Availability marker layer
  const showMarkerLayer = zoom < POLYGON_MIN_ZOOM;

  useEffect(() => {
    if (!map || typeof window === 'undefined' || !window.google?.maps) return undefined;
    if (!showMarkerLayer) return undefined;

    const g = window.google;
    const markerPlots = plots.filter((p) => p.center);
    if (!markerPlots.length) return undefined;

    const { MarkerClusterer, SuperClusterAlgorithm } = GoogleMapsMarkerClusterer;

    const pinIcon = {
      url: availabilityPinDataUri(),
      scaledSize: new g.maps.Size(36, 47),
      anchor: new g.maps.Point(18, 47),
      labelOrigin: new g.maps.Point(18, 18),
    };

    const markers = markerPlots.map((plot) => {
      const marker = new g.maps.Marker({ position: plot.center, icon: pinIcon, title: plot.name });
      marker.addListener('click', () => handleSelectPlot(plot));
      return marker;
    });

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
      algorithm: new SuperClusterAlgorithm({ radius: 130, maxZoom: POLYGON_MIN_ZOOM - 1 }),
    });

    clustererRef.current = clusterer;
    markersRef.current = markers;

    return () => {
      try {
        clusterer.clearMarkers();
        clusterer.setMap(null);
      } catch (e) {}
      markers.forEach((m) => {
        g.maps.event.clearInstanceListeners(m);
        m.setMap(null);
      });
      clustererRef.current = null;
      markersRef.current = [];
    };
  }, [map, plots, showMarkerLayer, handleSelectPlot]);

  // Initialize AutocompleteService and PlacesService when map is ready
  useEffect(() => {
    if (typeof window === 'undefined' || !window.google?.maps) return;

    if (window.google.maps.places) {
      if (!autocompleteServiceRef.current && window.google.maps.places.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }
      if (map && window.google.maps.places.PlacesService) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(map);
      }
    }

    if (typeof window.google.maps.Geocoder === 'function') {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [map]);

  // Click-outside listener to dismiss places suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (placesSearchContainerRef.current && !placesSearchContainerRef.current.contains(e.target)) {
        setIsPlacesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle typing in Google Places search input
  const handlePlacesInputChange = (val) => {
    setPlacesQuery(val);
    if (!val || val.trim().length < 2) {
      setPlacesPredictions([]);
      setIsPlacesDropdownOpen(false);
      setIsPlacesLoading(false);
      return;
    }

    setIsPlacesLoading(true);
    setIsPlacesDropdownOpen(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (!autocompleteServiceRef.current && window.google?.maps?.places?.AutocompleteService) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      }

      if (autocompleteServiceRef.current) {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: val,
            componentRestrictions: { country: 'pk' },
          },
          (results, status) => {
            setIsPlacesLoading(false);
            if (status === 'OK' && Array.isArray(results)) {
              setPlacesPredictions(results);
            } else {
              setPlacesPredictions([]);
            }
          }
        );
      } else {
        setIsPlacesLoading(false);
      }
    }, 250);
  };

  // Select place prediction from dropdown
  const handleSelectPrediction = useCallback((prediction) => {
    const mainTitle = prediction.structured_formatting?.main_text || prediction.description;
    setPlacesQuery(mainTitle);
    setIsPlacesDropdownOpen(false);
    setPlacesPredictions([]);

    const applyLocation = (lat, lng, name, address) => {
      setSearchedLocation({ lat, lng, name, address });
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    };

    // 1. Primary: Use PlacesService.getDetails
    if (placesServiceRef.current && prediction.place_id) {
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ['geometry', 'name', 'formatted_address'],
        },
        (place, status) => {
          if (
            (status === 'OK' || status === window.google?.maps?.places?.PlacesServiceStatus?.OK) &&
            place?.geometry?.location
          ) {
            applyLocation(
              place.geometry.location.lat(),
              place.geometry.location.lng(),
              mainTitle,
              place.formatted_address || mainTitle
            );
            return;
          }

          fallbackGeocode();
        }
      );
    } else {
      fallbackGeocode();
    }

    function fallbackGeocode() {
      if (!geocoderRef.current && typeof window.google?.maps?.Geocoder === 'function') {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      if (geocoderRef.current) {
        const queryParam = prediction.place_id
          ? { placeId: prediction.place_id }
          : { address: prediction.description, componentRestrictions: { country: 'pk' } };

        geocoderRef.current.geocode(queryParam, (results, status) => {
          if (status === 'OK' && results?.[0]?.geometry?.location) {
            const loc = results[0].geometry.location;
            applyLocation(loc.lat(), loc.lng(), mainTitle, results[0].formatted_address);
          }
        });
      }
    }
  }, []);

  // Form submit (Enter key or search click)
  const handlePlacesSearchSubmit = (e) => {
    e?.preventDefault?.();
    if (!placesQuery.trim()) return;

    // If suggestions exist, pick first
    if (placesPredictions.length > 0) {
      handleSelectPrediction(placesPredictions[0]);
      return;
    }

    const applyLocation = (lat, lng, name, address) => {
      setSearchedLocation({ lat, lng, name, address });
      setIsPlacesDropdownOpen(false);
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(15);
      }
    };

    if (placesServiceRef.current && typeof placesServiceRef.current.findPlaceFromQuery === 'function') {
      setIsPlacesLoading(true);
      placesServiceRef.current.findPlaceFromQuery(
        { query: placesQuery, fields: ['geometry', 'name', 'formatted_address'] },
        (results, status) => {
          setIsPlacesLoading(false);
          if (
            (status === 'OK' || status === window.google?.maps?.places?.PlacesServiceStatus?.OK) &&
            results?.[0]?.geometry?.location
          ) {
            applyLocation(
              results[0].geometry.location.lat(),
              results[0].geometry.location.lng(),
              placesQuery,
              results[0].formatted_address || placesQuery
            );
            return;
          }
          fallbackGeocodeSubmit();
        }
      );
    } else {
      fallbackGeocodeSubmit();
    }

    function fallbackGeocodeSubmit() {
      if (!geocoderRef.current && typeof window.google?.maps?.Geocoder === 'function') {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      if (geocoderRef.current) {
        setIsPlacesLoading(true);
        geocoderRef.current.geocode(
          { address: placesQuery, componentRestrictions: { country: 'pk' } },
          (results, status) => {
            setIsPlacesLoading(false);
            if (status === 'OK' && results?.[0]?.geometry?.location) {
              const loc = results[0].geometry.location;
              applyLocation(loc.lat(), loc.lng(), placesQuery, results[0].formatted_address);
            }
          }
        );
      }
    }
  };

  const handleClearPlacesSearch = () => {
    setPlacesQuery('');
    setPlacesPredictions([]);
    setIsPlacesDropdownOpen(false);
    setSearchedLocation(null);
  };

  // Sidebar Filter Logic
  const uniqueCities = useMemo(() => {
    const set = new Set();
    plots.forEach((p) => {
      if (p.city && p.city.trim()) {
        set.add(p.city.trim());
      }
    });
    return Array.from(set);
  }, [plots]);

  const filteredPlots = useMemo(() => {
    return plots.filter((plot) => {
      // City filter
      if (activeCityFilter !== 'ALL') {
        const cityMatch = (plot.city || '').trim().toLowerCase() === activeCityFilter.toLowerCase();
        if (!cityMatch) return false;
      }

      // Query filter
      const q = sidebarSearchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        (plot.name || '').toLowerCase().includes(q) ||
        (plot.society || '').toLowerCase().includes(q) ||
        (plot.id || '').toLowerCase().includes(q) ||
        (plot.city || '').toLowerCase().includes(q) ||
        (plot.price || '').toLowerCase().includes(q) ||
        (plot.details?.size || '').toLowerCase().includes(q) ||
        (plot.details?.floodRisk || '').toLowerCase().includes(q)
      );
    });
  }, [plots, activeCityFilter, sidebarSearchQuery]);

  // Group filtered plots by city
  const plotsByCity = useMemo(() => {
    const groups = {};
    filteredPlots.forEach((plot) => {
      const cityName = (plot.city && plot.city.trim()) || 'Islamabad';
      if (!groups[cityName]) groups[cityName] = [];
      groups[cityName].push(plot);
    });
    return groups;
  }, [filteredPlots]);

  const showEmptyState = !plotsLoading && !plotsError && plots.length === 0;

  return (
    <GoogleMapsSafeLoader>
      {({ isLoaded, loadError }) => {
        if (loadError) return <div className="p-4 text-red-500">Error loading maps. Check your API key.</div>;
        if (!isLoaded) return <div className="p-4 text-slate-500">Loading Map...</div>;

        return (
          <div className="relative w-full h-screen overflow-hidden font-sans bg-slate-100 text-slate-800 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between z-20 shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition flex items-center gap-1.5 text-xs font-semibold"
                  title={isSidebarOpen ? 'Collapse plot list to maximize map' : 'Expand plot list'}
                >
                  {isSidebarOpen ? (
                    <>
                      <PanelLeftClose className="w-4 h-4 text-emerald-700" />
                      <span className="hidden sm:inline">Maximize Map</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftOpen className="w-4 h-4 text-emerald-700" />
                      <span className="hidden sm:inline">Show Plots</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <span className="font-bold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    NAQSHAI Explorer
                  </span>
                  <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                    {plotsLoading ? 'Loading…' : `${plots.length} Verified Plots`}
                  </span>
                </div>
              </div>

              {/* Navigation Action Links */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => router.push('/sell')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
                >
                  List Your Plot
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
                >
                  <Home className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">Home</span>
                </button>
                <button
                  onClick={() => router.push('/recommend')}
                  className="bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">AI Advisor</span>
                </button>

                {session?.user ? (
                  <UserNav
                    session={session}
                    onSignOut={handleSignOut}
                    onUserUpdated={(updatedUser) => setSession((prev) => ({ ...prev, user: updatedUser }))}
                    className="bg-white border border-slate-200 shadow-xs rounded-xl px-2 py-0.5"
                  />
                ) : (
                  <button
                    onClick={() => router.push('/login?redirect=/explore')}
                    className="bg-white border border-slate-200 shadow-xs rounded-xl px-3 py-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition"
                  >
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </header>

            {/* Split View Body: Left Sidebar + Right Map */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* LEFT SIDEBAR: Available Plots List (Grouped by City) */}
              <aside
                style={{
                  width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
                  transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className="bg-white border-r border-slate-200 flex flex-col h-full z-10 shrink-0 overflow-hidden"
              >
                {/* Sidebar Header with Internal Filter & City Tabs */}
                <div className="p-3.5 border-b border-slate-200 space-y-3 bg-slate-50/70 shrink-0">
                  {/* Search Plots Input & Width Presets */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus-within:border-emerald-500 transition">
                      <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search by society, size, or plot ID..."
                        value={sidebarSearchQuery}
                        onChange={(e) => setSidebarSearchQuery(e.target.value)}
                        className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                      />
                      {sidebarSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSidebarSearchQuery('')}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Width Preset Buttons (S / M / L) */}
                    <div className="hidden sm:flex items-center gap-0.5 bg-white border border-slate-200 p-1 rounded-xl shadow-xs shrink-0">
                      {[
                        { label: 'S', width: 320, title: 'Compact width (320px)' },
                        { label: 'M', width: 400, title: 'Default width (400px)' },
                        { label: 'L', width: 520, title: 'Wide width (520px)' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setSidebarWidth(preset.width);
                            try {
                              localStorage.setItem('naqshai_explorer_sidebar_width', String(preset.width));
                            } catch (_) {}
                            if (mapRef.current && window.google?.maps?.event) {
                              setTimeout(() => window.google.maps.event.trigger(mapRef.current, 'resize'), 250);
                            }
                          }}
                          className={`w-5 h-6 flex items-center justify-center rounded text-[10px] font-mono font-bold transition ${
                            sidebarWidth === preset.width
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                          title={preset.title}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* City Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                    <button
                      type="button"
                      onClick={() => setActiveCityFilter('ALL')}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap ${
                        activeCityFilter === 'ALL'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      All Cities ({plots.length})
                    </button>
                    {uniqueCities.map((city) => {
                      const count = plots.filter((p) => (p.city || '').trim().toLowerCase() === city.toLowerCase()).length;
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => setActiveCityFilter(city)}
                          className={`text-[11px] font-semibold px-3 py-1 rounded-lg border transition whitespace-nowrap ${
                            activeCityFilter.toLowerCase() === city.toLowerCase()
                              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {city} ({count})
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Scrollable Plot List */}
                <div className="flex-1 overflow-y-auto p-3.5 space-y-5">
                  {plotsLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400 space-y-2.5">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
                      <p className="text-xs font-medium">Loading verified properties…</p>
                    </div>
                  ) : plotsError ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-2">
                      <ShieldAlert className="w-5 h-5 text-red-600 mx-auto" />
                      <p className="text-xs text-red-700">{plotsError}</p>
                      <button
                        onClick={handleRetry}
                        className="text-xs font-semibold text-emerald-700 underline"
                      >
                        Retry Loading
                      </button>
                    </div>
                  ) : Object.keys(plotsByCity).length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No matching plots found for this filter.
                    </div>
                  ) : (
                    Object.entries(plotsByCity).map(([city, cityPlots]) => (
                      <div key={city} className="space-y-2.5">
                        {/* City Group Header */}
                        <div className="flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs py-1 z-1 border-b border-slate-100">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                            {city}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            {cityPlots.length} {cityPlots.length === 1 ? 'plot' : 'plots'}
                          </span>
                        </div>

                        {/* City Plot Cards */}
                        <div className="space-y-2.5">
                          {cityPlots.map((plot) => {
                            const isSelected = selectedPlot?.id === plot.id;
                            const isLowFlood = plot.details?.floodRisk?.toLowerCase().includes('low');

                            return (
                              <div
                                key={plot.id}
                                className={`rounded-xl border p-3.5 transition flex flex-col justify-between space-y-2.5 shadow-xs ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                                }`}
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                          {plot.id}
                                        </span>
                                        {plot.isVerified && (
                                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                            Verified
                                          </span>
                                        )}
                                      </div>
                                      <h4 className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                                        {plot.name}
                                      </h4>
                                    </div>
                                    <span className="text-xs font-extrabold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {plot.price}
                                    </span>
                                  </div>

                                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>
                                      {plot.society ? `${plot.society}, ` : ''}{plot.city}
                                    </span>
                                  </p>
                                </div>

                                {/* Spec Badges */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                  <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                    {plot.details?.size || 'Plot'}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded border font-medium ${
                                      isLowFlood
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                    }`}
                                  >
                                    Flood: {plot.details?.floodRisk || 'N/A'}
                                  </span>
                                  {plot.details?.elevation && (
                                    <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                      {plot.details.elevation}
                                    </span>
                                  )}
                                </div>

                                {/* "See on Map" Action Button */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSeeOnMap(plot)}
                                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                                      isSelected
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{isSelected ? 'Viewing on Map' : 'See on Map'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </aside>

              {/* Resizable Divider Handle (Draggable Splitter) */}
              {isSidebarOpen && (
                <div
                  onMouseDown={handleMouseDown}
                  className={`w-2 hover:w-2.5 bg-slate-200 hover:bg-emerald-500 active:bg-emerald-600 cursor-col-resize z-20 flex items-center justify-center transition-colors relative select-none group shrink-0 ${
                    isDragging ? 'bg-emerald-600 w-2.5 shadow-md' : ''
                  }`}
                  title="Drag to resize sidebar width (300px - 600px)"
                >
                  <div className="w-0.5 h-8 rounded-full bg-slate-400 group-hover:bg-white transition-colors" />
                </div>
              )}

              {/* RIGHT AREA: Interactive Google Maps Viewport */}
              <main className="flex-1 h-full relative overflow-hidden">
                {/* Floating Google Places Search Bar Overlay */}
                <div className="absolute top-3.5 left-4 z-20 flex items-center gap-2 max-w-sm sm:max-w-md w-full">
                  {/* Toggle Sidebar Button when sidebar is collapsed */}
                  {!isSidebarOpen && (
                    <button
                      type="button"
                      onClick={() => setIsSidebarOpen(true)}
                      className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
                      title="Show plot list"
                    >
                      <PanelLeftOpen className="w-4 h-4 text-emerald-700" />
                      <span className="hidden sm:inline">Plots</span>
                    </button>
                  )}

                  {/* Hideable Places Search Box with Dropdown Predictions */}
                  {isPlacesSearchOpen ? (
                    <div ref={placesSearchContainerRef} className="flex-1 relative">
                      <form
                        onSubmit={handlePlacesSearchSubmit}
                        className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3.5 py-2 flex items-center gap-2 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                      >
                        <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                        <input
                          type="text"
                          value={placesQuery}
                          onChange={(e) => handlePlacesInputChange(e.target.value)}
                          onFocus={() => {
                            if (placesPredictions.length > 0) setIsPlacesDropdownOpen(true);
                          }}
                          placeholder="Search real-world locations, landmarks, cities..."
                          className="w-full text-xs text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                        />
                        {isPlacesLoading && (
                          <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                        )}
                        {placesQuery && (
                          <button
                            type="button"
                            onClick={handleClearPlacesSearch}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                            title="Clear search"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsPlacesSearchOpen(false)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded border-l border-slate-200 pl-1.5 ml-0.5 cursor-pointer"
                          title="Hide Google Places search bar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </form>

                      {/* Dropdown Suggestions UI */}
                      {isPlacesDropdownOpen && placesPredictions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {placesPredictions.map((pred) => (
                            <button
                              key={pred.place_id}
                              type="button"
                              onClick={() => handleSelectPrediction(pred)}
                              className="w-full text-left px-3.5 py-2.5 hover:bg-emerald-50/80 transition flex items-start gap-2.5 group cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-800 truncate">
                                  {pred.structured_formatting?.main_text || pred.description}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {pred.structured_formatting?.secondary_text || ''}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsPlacesSearchOpen(true)}
                      className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 text-slate-700 hover:text-emerald-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      title="Show Google Places search bar"
                    >
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>Search Places</span>
                    </button>
                  )}
                </div>

                {/* Active Searched Place Badge */}
                {searchedLocation && (
                  <div className="absolute top-16 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                      {searchedLocation.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSearchedLocation(null)}
                      className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                      title="Clear location pin"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* 1. Google Map Container */}
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={DEFAULT_ZOOM}
                  onLoad={onLoad}
                  onUnmount={onUnmount}
                  onZoomChanged={handleZoomChanged}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: true,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeId: is3DMode ? 'hybrid' : 'roadmap',
                  }}
                >
                  {/* Searched Location Marker */}
                  {searchedLocation && (
                    <Marker
                      position={{ lat: searchedLocation.lat, lng: searchedLocation.lng }}
                      title={searchedLocation.name}
                      zIndex={999}
                    />
                  )}
                  {/* 2. Individual Plot Polygons (Zoom >= POLYGON_MIN_ZOOM) */}
                  {!showMarkerLayer &&
                    plots.map((plot) => {
                      if (!plot.hasGeometry || !plot.paths.length) return null;
                      const isSelected = selectedPlot?.id === plot.id;
                      const isHovered = hoveredPlotId === plot.id;

                      const strokeColor = isSelected ? '#047857' : isHovered ? '#059669' : '#059669';
                      const fillColor = isSelected ? '#059669' : isHovered ? '#10b981' : '#10b981';

                      return (
                        <Polygon
                          key={plot.id}
                          paths={plot.paths}
                          options={{
                            strokeColor,
                            strokeOpacity: 0.95,
                            strokeWeight: isSelected ? 3 : 2,
                            fillColor,
                            fillOpacity: isSelected ? 0.45 : isHovered ? 0.35 : 0.22,
                            clickable: true,
                            zIndex: isSelected ? 100 : isHovered ? 50 : 1,
                          }}
                          onClick={() => handleSelectPlot(plot)}
                          onMouseOver={() => setHoveredPlotId(plot.id)}
                          onMouseOut={() => setHoveredPlotId(null)}
                        />
                      );
                    })}

                  {/* 3. Street View 3D Panorama */}
                  {is3DMode && selectedPlot?.center && (
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

                {/* Data status overlays */}
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

                {/* Availability legend (bottom-left) */}
                {!plotsLoading && !plotsError && plots.length > 0 && (
                  <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-2 flex items-center gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs shrink-0" />
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-slate-700">Available plots</p>
                      <p className="text-[11px] text-slate-400">
                        {showMarkerLayer ? 'Zoom in to see plot boundaries' : 'Showing plot boundaries'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Slide-Out Property Inspector (Sidebar Drawer) */}
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
                          className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition text-xs shadow-xs"
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

                        {/* Interactive Neighborhood Amenity Scoring */}
                        <AmenityScoreCard
                          plotId={selectedPlot.id}
                          lat={selectedPlot.center?.lat}
                          lng={selectedPlot.center?.lng}
                        />

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
                              className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition text-xs shadow-xs"
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
                          className="bg-emerald-700 hover:bg-emerald-600 text-white w-full py-3 rounded-xl font-semibold flex justify-center items-center gap-2 text-sm shadow-xs transition"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Discuss with AI</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </main>
            </div>
          </div>
        );
      }}
    </GoogleMapsSafeLoader>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-4 text-slate-400">Loading Map Explorer...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
