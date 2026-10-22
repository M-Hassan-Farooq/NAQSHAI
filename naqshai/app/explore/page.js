'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker, StreetViewPanorama, GoogleMapsMarkerClusterer } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import UserNav from '@/components/UserNav';

import AmenityScoreCard from '@/components/AmenityScoreCard';
import { useFavorites } from '@/context/FavoritesContext';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  Phone,
  MapPin,
  Eye,
  X,
  ArrowLeft,
  MessageSquare,
  Home,
  Loader2,
  Heart,
  RefreshCw,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Maximize2,
  Minimize2,
  Navigation,
  Compass,
  SlidersHorizontal,
  Layers,
  GripVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const STREET_VIEW_OPTIONS = {
  pov: { heading: 100, pitch: 0 },
  zoom: 1,
  disableDefaultUI: false,
};

const BASE_MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: false,
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

function floodRiskClasses(value) {
  const risk = String(value || '').split('(')[0].trim().toLowerCase();
  if (/\b(high|severe|very high)\b/.test(risk)) {
    return 'bg-danger-soft text-danger border-danger/20';
  }
  if (/\b(elevated|significant)\b/.test(risk)) {
    return 'bg-orange-50 text-orange-800 border-orange-200';
  }
  if (/\b(moderate|medium)\b/.test(risk)) {
    return 'bg-caution-soft text-caution border-caution/20';
  }
  if (/\b(low|minimal)\b/.test(risk)) {
    return 'bg-action-soft text-action-hover border-action/20';
  }
  return 'bg-surface-subtle text-muted border-border';
}

// One plot boundary polygon. Memoized and owns its OWN hover state, so moving the
// pointer across the map restyles only THIS polygon instead of bubbling up to
// re-render the entire Explore view (sidebar list + every other polygon). Because
// `plot`, `isSelected` and `onSelect` are stable, React.memo also lets unaffected
// polygons skip re-render when the parent re-renders for unrelated reasons
// (sidebar search, resize, selection). Hover affects only fillOpacity + zIndex —
// matching the original inline behaviour exactly.
const PlotPolygon = React.memo(function PlotPolygon({ plot, isSelected, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  const options = useMemo(
    () => ({
      strokeColor: isSelected ? '#047857' : '#059669',
      strokeOpacity: 0.95,
      strokeWeight: isSelected ? 3 : 2,
      fillColor: isSelected ? '#059669' : '#10b981',
      fillOpacity: isSelected ? 0.45 : isHovered ? 0.35 : 0.22,
      clickable: true,
      zIndex: isSelected ? 100 : isHovered ? 50 : 1,
    }),
    [isSelected, isHovered]
  );

  const handleClick = useCallback(() => onSelect(plot), [onSelect, plot]);
  const handleMouseOver = useCallback(() => setIsHovered(true), []);
  const handleMouseOut = useCallback(() => setIsHovered(false), []);

  return (
    <Polygon
      paths={plot.paths}
      options={options}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    />
  );
});

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plotParam = searchParams ? searchParams.get('plot') : null;

  const [map, setMap] = useState(null);
  const [session, setSession] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);
  const [streetViewStatus, setStreetViewStatus] = useState('IDLE'); // 'IDLE' | 'CHECKING' | 'READY' | 'UNAVAILABLE' | 'ERROR'
  const [isInspectorMinimized, setIsInspectorMinimized] = useState(false);
  // Marker-cluster layer (below POLYGON_MIN_ZOOM) vs individual polygons (at/above).
  // Stored as a boolean that flips only when zoom CROSSES the threshold, so dragging
  // the zoom control no longer re-renders the whole view on every incremental tick.
  // (Per-polygon hover state now lives inside <PlotPolygon>.)
  const [showMarkerLayer, setShowMarkerLayer] = useState(DEFAULT_ZOOM < POLYGON_MIN_ZOOM);

  // Split-Screen Interface States
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPlacesSearchOpen, setIsPlacesSearchOpen] = useState(true);
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [activeCityFilter, setActiveCityFilter] = useState('ALL');
  const [isMobile, setIsMobile] = useState(false);
  const [expandedPlotIds, setExpandedPlotIds] = useState(() => new Set());

  const togglePlotDetails = useCallback((plotId) => {
    setExpandedPlotIds((prev) => {
      const next = new Set(prev);
      if (next.has(plotId)) {
        next.delete(plotId);
      } else {
        next.add(plotId);
      }
      return next;
    });
  }, []);

  const mapOptions = useMemo(
    () => ({
      ...BASE_MAP_OPTIONS,
      mapTypeId: is3DMode ? 'hybrid' : 'roadmap',
      mapTypeControlOptions: {
        position: selectedPlot && isSidebarOpen ? 9 : 3,
      },
      tilt: is3DMode ? 45 : 0,
      heading: is3DMode ? 45 : 0,
    }),
    [is3DMode, selectedPlot, isSidebarOpen]
  );

  const handlePanoLoad = useCallback((pano) => {
    if (!pano || typeof window === 'undefined' || !window.google?.maps) return;
    pano.addListener('status_changed', () => {
      try {
        if (pano.getStatus() !== window.google.maps.StreetViewStatus.OK) {
          setStreetViewStatus('UNAVAILABLE');
        }
      } catch (_) {}
    });
  }, []);


  // Verify Street View availability before rendering panorama to prevent 429 or black screen
  useEffect(() => {
    if (!is3DMode || !selectedPlot?.center || typeof window === 'undefined' || !window.google?.maps) {
      setStreetViewStatus('IDLE');
      return;
    }

    setStreetViewStatus('CHECKING');
    try {
      const svService = new window.google.maps.StreetViewService();
      svService.getPanorama(
        { location: selectedPlot.center, radius: 100 },
        (data, status) => {
          if (status === window.google.maps.StreetViewStatus.OK && data) {
            setStreetViewStatus('READY');
          } else {
            console.warn('[StreetView] Panorama status:', status);
            setStreetViewStatus('UNAVAILABLE');
          }
        }
      );
    } catch (err) {
      console.warn('[StreetView] Availability check exception:', err);
      setStreetViewStatus('ERROR');
    }
  }, [is3DMode, selectedPlot?.center]);

  // Favorites Hook
  const { isFavorite, toggleFavorite } = useFavorites();

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

  // Responsive breakpoint: on phones the plot list becomes an off-canvas drawer
  // that starts closed so the map is visible first (no full-screen takeover).
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(max-width: 767px)');
    const apply = (matches) => {
      setIsMobile(matches);
      setIsSidebarOpen(!matches);
    };
    apply(mql.matches);
    const handler = (event) => apply(event.matches);
    if (mql.addEventListener) mql.addEventListener('change', handler);
    else mql.addListener(handler);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', handler);
      else mql.removeListener(handler);
    };
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
    // Coalesce mousemove -> one width commit per animation frame. Raw mousemove
    // fires 60-120x/sec; committing each one re-rendered the whole Explore view.
    let rafId = null;
    let latestWidth = null;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      latestWidth = Math.max(300, Math.min(600, e.clientX));
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setSidebarWidth(latestWidth);
      });
    };

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Commit the final width and persist it to localStorage.
      setSidebarWidth((latest) => {
        const finalWidth = latestWidth ?? latest;
        try {
          localStorage.setItem('naqshai_explorer_sidebar_width', String(finalWidth));
        } catch (_) {}
        return finalWidth;
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
      if (rafId !== null) cancelAnimationFrame(rafId);
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
    // UserNav already shows the in-app "Confirm Sign Out" modal before calling
    // this handler; a second window.confirm() here produced a duplicate native
    // dialog. Keep this consistent with the other pages (no re-confirm).
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
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/plots', { cache: 'no-store', signal: controller.signal });
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
        if (err?.name === 'AbortError') return;
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
      controller.abort();
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
    if (typeof z !== 'number') return;
    const nextShow = z < POLYGON_MIN_ZOOM;
    // Re-render only when the layer actually flips, not on every zoom tick.
    setShowMarkerLayer((prev) => (prev === nextShow ? prev : nextShow));
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
    setStreetViewStatus('IDLE');
    setIsInspectorMinimized(false);
    setIsSidebarOpen((prev) => (isMobile ? false : prev));
  }, [isMobile]);

  // "See on Map" action: pans, zooms, highlights and opens inspector drawer
  const handleSeeOnMap = useCallback((plot) => {
    setSelectedPlot(plot);
    setIs3DMode(false);
    setStreetViewStatus('IDLE');
    setIsInspectorMinimized(false);
    setIsSidebarOpen((prev) => (isMobile ? false : prev));
    if (plot.center && mapRef.current) {
      mapRef.current.panTo(plot.center);
      mapRef.current.setZoom(17);
    }
  }, [isMobile]);

  const handleExit3D = useCallback(() => {
    setIs3DMode(false);
    setStreetViewStatus('IDLE');
  }, []);

  const handleToggle3D = useCallback(() => {
    if (!selectedPlot?.center) return;
    setIs3DMode((prev) => {
      const next = !prev;
      if (next && isMobile) {
        setIsInspectorMinimized(true);
      }
      if (!next) {
        setStreetViewStatus('IDLE');
      }
      return next;
    });
  }, [selectedPlot, isMobile]);

  const handleClosePlot = useCallback(() => {
    setSelectedPlot(null);
    setIs3DMode(false);
    setStreetViewStatus('IDLE');
    setIsInspectorMinimized(false);
  }, []);

  // Trigger map canvas resize recalculation when inspector minimizes/expands or 3D toggles
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google?.maps?.event && mapRef.current) {
      const t1 = setTimeout(() => {
        if (mapRef.current) window.google.maps.event.trigger(mapRef.current, 'resize');
      }, 50);
      const t2 = setTimeout(() => {
        if (mapRef.current) window.google.maps.event.trigger(mapRef.current, 'resize');
      }, 320);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isInspectorMinimized, is3DMode]);

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

  // Availability marker layer (rebuilt only when the layer flips or plots change)
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
            {/* Standardized Top Navigation Bar */}
            <Navbar
              session={session}
              onSignOut={handleSignOut}
              badgeText={plotsLoading ? 'Loading…' : `${plots.length} Verified Plots`}
              leftSlot={
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  className="p-1.5 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 transition flex items-center gap-1 text-xs font-semibold shrink-0"
                  title={isSidebarOpen ? 'Collapse plot list to maximize map' : 'Expand plot list'}
                >
                  {isSidebarOpen ? (
                    <>
                      <PanelLeftClose className="w-4 h-4 text-emerald-700" />
                      <span className="hidden lg:inline">Maximize Map</span>
                    </>
                  ) : (
                    <>
                      <PanelLeftOpen className="w-4 h-4 text-emerald-700" />
                      <span className="hidden lg:inline">Show Plots</span>
                    </>
                  )}
                </button>
              }
            />


            {/* Split View Body: Left Sidebar + Right Map */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Mobile drawer backdrop (tap to close the plot list) */}
              {isMobile && isSidebarOpen && (
                <div
                  className="absolute inset-0 z-20 bg-slate-900/40"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}

              {/* LEFT SIDEBAR: Available Plots List (Grouped by City) */}
              <aside
                style={
                  isMobile
                    ? { transform: isSidebarOpen ? 'translateX(0%)' : 'translateX(-100%)' }
                    : {
                        width: isSidebarOpen ? `${sidebarWidth}px` : '0px',
                        transition: isDragging ? 'none' : 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      }
                }
                className={`bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden ${
                  isMobile
                    ? 'absolute top-0 left-0 z-30 w-[85vw] max-w-[340px] shadow-2xl transition-transform duration-200 will-change-transform'
                    : 'relative z-10 shrink-0'
                }`}
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
                          aria-label="Clear search query"
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
                            const floodVal = plot.details?.floodRisk || '';
                            const noiseVal = plot.details?.noiseLevel || '';
                            const elevVal = plot.details?.elevation || '';

                            const isPendingValue = (val) => {
                              if (!val || typeof val !== 'string') return true;
                              const lower = val.trim().toLowerCase();
                              return lower === '' || lower.includes('pending') || lower === 'n/a';
                            };

                            const isFloodPending = isPendingValue(floodVal);
                            const isNoisePending = isPendingValue(noiseVal);
                            const isElevPending = isPendingValue(elevVal);

                            const noiseLower = noiseVal.toLowerCase();

                            const isQuietNoise = noiseLower.includes('quiet') || noiseLower.includes('low') || noiseLower.includes('45 db');
                            const isHighNoise = noiseLower.includes('high') || noiseLower.includes('78 db');

                            const isExpanded = expandedPlotIds.has(plot.id);

                            return (
                              <div
                                key={plot.id}
                                aria-label={`${plot.name}, ${plot.price}, ${plot.city}`}
                                className={`rounded-xl border p-3.5 transition flex flex-col justify-between space-y-2.5 shadow-xs ${
                                  isSelected
                                    ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-500/30'
                                    : 'border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm'
                                }`}
                              >
                                <div>
                                  {/* Top Bar: Plot ID + Price + Favorite */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                                      {plot.id}
                                    </span>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <span className="text-xs font-extrabold text-emerald-700 whitespace-nowrap bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        {plot.price}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(plot.id, plot);
                                        }}
                                        aria-label={isFavorite(plot.id) ? `Remove ${plot.name} from favorites` : `Save ${plot.name} to favorites`}
                                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                                        title={isFavorite(plot.id) ? 'Remove from favorites' : 'Save to favorites'}
                                      >
                                        <Heart
                                          className={`w-3.5 h-3.5 transition-transform active:scale-125 ${
                                            isFavorite(plot.id)
                                              ? 'fill-rose-500 text-rose-500'
                                              : 'text-slate-400 hover:text-rose-500'
                                          }`}
                                        />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Plot Name */}
                                  <h4 className="font-bold text-xs text-slate-900 mt-1.5 leading-snug">
                                    {plot.name}
                                  </h4>

                                  {/* Location */}
                                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>
                                      {plot.society ? `${plot.society}, ` : ''}{plot.city}
                                    </span>
                                  </p>

                                  {/* Size */}
                                  <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                                    <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                      Size: {plot.details?.size || 'Plot'}
                                    </span>
                                  </div>
                                </div>

                                {/* Expandable Remaining Details */}
                                {isExpanded && (
                                  <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-150">
                                    {/* Verification & Regulatory Clearance */}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      {plot.isVerified && (
                                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                          Verified
                                        </span>
                                      )}
                                      {plot.regulatory && (
                                        <span
                                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                                            plot.regulatory.tier === 'unauthorized'
                                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                                              : plot.regulatory.tier === 'conditional'
                                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                          }`}
                                          title={`${plot.regulatory.statusLabel} (${plot.regulatory.authority})`}
                                        >
                                          {plot.regulatory.badgeText}
                                        </span>
                                      )}
                                      {plot.details?.category && (
                                        <span className="text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                          {plot.details.category}
                                        </span>
                                      )}
                                    </div>

                                    {/* Environmental & Risk Badges */}
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                      {!isFloodPending && (
                                        <span
                                          className={`px-2 py-0.5 rounded border font-medium ${floodRiskClasses(floodVal)}`}
                                        >
                                          Flood: {floodVal}
                                        </span>
                                      )}
                                      {!isNoisePending && (
                                        <span
                                          className={`px-2 py-0.5 rounded border font-medium ${
                                            isHighNoise
                                              ? 'bg-red-50 text-red-800 border-red-200'
                                              : isQuietNoise
                                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                              : 'bg-amber-50 text-amber-800 border-amber-200'
                                          }`}
                                        >
                                          Noise: {noiseVal}
                                        </span>
                                      )}
                                      {!isElevPending && (
                                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                          Elevation: {elevVal}
                                        </span>
                                      )}
                                      {isFloodPending && isNoisePending && isElevPending && (
                                        <span className="font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                          Survey Pending
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Action Buttons: "See on Map" + "Show Details / Hide Details" */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleSeeOnMap(plot)}
                                    aria-label={`View ${plot.name} on the map`}
                                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                      isSelected
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    }`}
                                  >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>{isSelected ? 'Viewing on Map' : 'See on Map'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => togglePlotDetails(plot.id)}
                                    aria-expanded={isExpanded}
                                    aria-label={isExpanded ? `Hide details for ${plot.name}` : `Show details for ${plot.name}`}
                                    className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition flex items-center gap-1 shrink-0 cursor-pointer"
                                    title={isExpanded ? 'Hide details' : 'Show details'}
                                  >
                                    <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
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
              {isSidebarOpen && !isMobile && (
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
                {/* Floating Google Places Search Bar Overlay (Centered horizontally over map section) */}
                <div
                  className={`absolute top-4 z-10 flex items-center justify-center gap-2 max-w-xs sm:max-w-md md:max-w-lg px-4 transition-[left,right,transform] duration-300 ${
                    selectedPlot && isSidebarOpen && !isMobile
                      ? 'left-0 right-96 w-auto translate-x-0'
                      : 'left-1/2 right-auto w-full -translate-x-1/2'
                  }`}
                >
                  {/* Hideable Places Search Box with Dropdown Predictions */}
                  {isPlacesSearchOpen ? (
                    <div ref={placesSearchContainerRef} className="flex-1 relative w-full">
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
                      className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl p-2.5 text-slate-700 hover:text-emerald-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                      title="Show Google Places search bar"
                    >
                      <Compass className="w-4 h-4 text-emerald-700" />
                      <span>Search Places</span>
                    </button>
                  )}
                </div>

                {/* Active Searched Place Badge (Centered) */}
                {searchedLocation && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs max-w-xs sm:max-w-md truncate">
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
                  options={mapOptions}
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
                      return (
                        <PlotPolygon
                          key={plot.id}
                          plot={plot}
                          isSelected={selectedPlot?.id === plot.id}
                          onSelect={handleSelectPlot}
                        />
                      );
                    })}

                  {/* 3. Street View 3D Panorama (Only rendered when verified ready to prevent 429/black screen) */}
                  {is3DMode && selectedPlot?.center && streetViewStatus === 'READY' && (
                    <StreetViewPanorama
                      position={selectedPlot.center}
                      visible={is3DMode}
                      options={STREET_VIEW_OPTIONS}
                      onLoad={handlePanoLoad}
                    />
                  )}

                </GoogleMap>

                {/* 3D Walkthrough Status / Fallback Overlay */}
                {is3DMode && streetViewStatus !== 'READY' && streetViewStatus !== 'IDLE' && (
                  <div className="absolute top-16 left-4 right-4 sm:left-auto sm:right-4 z-30 max-w-sm sm:w-full mx-auto sm:mx-0">
                    <div className="bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl p-4 shadow-xl text-center space-y-3 border border-slate-200">
                      {streetViewStatus === 'CHECKING' ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                          <Loader2 className="w-6 h-6 text-emerald-700 animate-spin" />
                          <h3 className="text-xs font-bold">Verifying 3D Walkthrough Coverage...</h3>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-left">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                            <Compass className="w-4 h-4 text-emerald-700" />
                            <span>3D Aerial Satellite Walkthrough Active</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            Ground-level Street View tiles are unavailable or rate-limited for this plot. Showing 45° 3D Satellite Terrain & boundaries instead.
                          </p>
                          <div className="flex gap-2 pt-1 w-full">
                            <button
                              type="button"
                              onClick={() => setStreetViewStatus('IDLE')}
                              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-1.5 rounded-lg text-xs transition"
                            >
                              Dismiss Notice
                            </button>
                            <button
                              type="button"
                              onClick={handleExit3D}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition border border-slate-200"
                            >
                              Exit 3D View
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}



                {/* Data status overlays */}
                {(plotsLoading || plotsError || showEmptyState) && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none px-4" aria-live="polite" aria-atomic="true">
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
                  <div className={`absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-slate-200 shadow-md rounded-xl px-3 py-2 items-center gap-2.5 ${
                    selectedPlot && isInspectorMinimized ? 'hidden sm:flex' : 'flex'
                  }`}>
                    <span className="w-4 h-4 rounded-full bg-emerald-600 border-2 border-white shadow-xs shrink-0" />
                    <div className="leading-tight">
                      <p className="text-xs font-semibold text-slate-700">Available plots</p>
                      <p className="text-[11px] text-slate-400">
                        {showMarkerLayer ? 'Zoom in to see plot boundaries' : 'Showing plot boundaries'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Floating Quick Control Bar when Inspector is Minimized */}
                {selectedPlot && isInspectorMinimized && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl p-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-4 max-w-[94vw] w-auto transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="flex items-center gap-2 min-w-0">
                      {is3DMode && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                      )}
                      <div className="min-w-0 max-w-[140px] sm:max-w-[220px]">
                        <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                          {selectedPlot.name}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-700 truncate leading-tight">
                          {selectedPlot.price}
                          {is3DMode && (
                            <span className="ml-1 text-slate-400 font-normal hidden xs:inline">• 3D Active</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {is3DMode ? (
                        <button
                          type="button"
                          onClick={handleExit3D}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-2.5 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1 cursor-pointer"
                          title="Exit 3D walkthrough"
                        >
                          <X className="w-3.5 h-3.5 text-slate-500" />
                          <span>Exit 3D</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleToggle3D}
                          disabled={!selectedPlot.center}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-emerald-200 transition flex items-center gap-1 cursor-pointer"
                          title="Launch 3D walkthrough"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-700" />
                          <span>3D View</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setIsInspectorMinimized(false)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                        title="View full property details"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleClosePlot}
                        aria-label="Close plot"
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Slide-Out Property Inspector (Sidebar Drawer) */}
                <div
                  className={`absolute top-0 right-0 h-full w-96 max-w-full bg-white shadow-2xl border-l border-slate-200 z-30 transform transition-transform duration-300 flex flex-col ${
                    selectedPlot && !isInspectorMinimized ? 'translate-x-0' : 'translate-x-full'
                  }`}
                >
                  {selectedPlot && (
                    <>
                      {/* Inspector identity header */}
                      <div className="p-4 border-b border-border flex justify-between items-center bg-surface-subtle/80">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono bg-surface px-2 py-1 rounded-control border border-border text-ink text-xs font-bold truncate">
                            {selectedPlot.id}
                          </span>
                          <span className="text-sm font-bold text-action-hover bg-action-soft px-2.5 py-1.5 rounded-control whitespace-nowrap">
                            {selectedPlot.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsInspectorMinimized(true)}
                            aria-label="Minimize plot details to view map"
                            title="Minimize details to view map"
                            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-slate-200/60 rounded-control text-muted transition cursor-pointer ui-focus-ring"
                          >
                            <Minimize2 className="w-4 h-4 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleFavorite(selectedPlot.id, selectedPlot)}
                            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-rose-50 rounded-control text-muted hover:text-rose-500 transition cursor-pointer ui-focus-ring"
                            title={isFavorite(selectedPlot.id) ? 'Remove from favorites' : 'Save to favorites'}
                            aria-label={isFavorite(selectedPlot.id) ? 'Remove from favorites' : 'Save to favorites'}
                          >
                            <Heart
                              className={`w-4 h-4 transition-transform active:scale-125 ${
                                isFavorite(selectedPlot.id)
                                  ? 'fill-rose-500 text-rose-500'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>
                          <button
                            type="button"
                            onClick={handleClosePlot}
                            aria-label="Close plot details panel"
                            className="min-h-9 min-w-9 flex items-center justify-center hover:bg-slate-200/60 rounded-control text-muted transition cursor-pointer ui-focus-ring"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Plot identity and details */}
                      <div className="p-5 flex-1 overflow-y-auto space-y-5 text-ink">
                        {/* Active 3D Walkthrough Live Banner */}
                        {is3DMode && (
                          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-xs">
                            <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold min-w-0">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                              <span className="truncate">3D Walkthrough is live on the map</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => setIsInspectorMinimized(true)}
                                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100/60 px-2.5 py-1.5 rounded-lg border border-emerald-300 shadow-xs transition"
                              >
                                View 3D
                              </button>
                              <button
                                type="button"
                                onClick={handleExit3D}
                                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white px-2 py-1.5 rounded-lg border border-slate-200 shadow-xs transition"
                                title="Exit 3D view"
                              >
                                Exit
                              </button>
                            </div>
                          </div>
                        )}

                        <section aria-labelledby="selected-plot-title">
                          <h2 id="selected-plot-title" className="text-lg font-bold text-ink leading-snug">
                            {selectedPlot.name}
                          </h2>
                          <p className="text-sm text-muted mt-1 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-action shrink-0 mt-0.5" />
                            <span>{[selectedPlot.society, selectedPlot.city].filter(Boolean).join(', ') || 'Location not provided'}</span>
                          </p>
                        </section>

                        <button
                          type="button"
                          onClick={handleToggle3D}
                          disabled={!selectedPlot.center}
                          className="w-full flex items-center justify-center gap-2 bg-surface-subtle hover:bg-action-soft disabled:opacity-50 disabled:cursor-not-allowed text-ink font-medium py-2.5 px-4 rounded-control border border-border transition text-sm ui-focus-ring"
                        >
                          <Eye className="w-4 h-4 text-action" />
                          <span>
                            {!selectedPlot.center
                              ? 'Walkthrough unavailable (no map location)'
                              : is3DMode
                              ? 'Exit 3D walkthrough'
                              : 'Launch 3D walkthrough'}
                          </span>
                        </button>

                        <details className="group rounded-card border border-border">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                            <span>Property details</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                          </summary>
                          <dl className="divide-y divide-border border-t border-border px-3 text-sm">
                            <div className="flex justify-between gap-4 py-2.5">
                              <dt className="text-muted">Plot size</dt>
                              <dd className="font-semibold text-right">{selectedPlot.details?.size || 'Not provided'}</dd>
                            </div>
                            <div className="flex justify-between gap-4 py-2.5">
                              <dt className="text-muted">Property type</dt>
                              <dd className="font-semibold text-right">{selectedPlot.details?.category || 'Not provided'}</dd>
                            </div>
                          </dl>
                        </details>

                        {/* Environmental indicators */}
                        {(() => {
                          const floodVal = selectedPlot.details?.floodRisk || '';
                          const noiseVal = selectedPlot.details?.noiseLevel || '';
                          const elevVal = selectedPlot.details?.elevation || '';

                          const isPendingValue = (val) => {
                            if (!val || typeof val !== 'string') return true;
                            const lower = val.trim().toLowerCase();
                            return lower === '' || lower.includes('pending') || lower === 'n/a';
                          };

                          const isFloodPending = isPendingValue(floodVal);
                          const isNoisePending = isPendingValue(noiseVal);
                          const isElevPending = isPendingValue(elevVal);
                          const allPending = isFloodPending && isNoisePending && isElevPending;

                          const noiseLower = noiseVal.toLowerCase();

                          const isQuietNoise = noiseLower.includes('quiet') || noiseLower.includes('low') || noiseLower.includes('45 db');
                          const isHighNoise = noiseLower.includes('high') || noiseLower.includes('78 db');

                          return (
                            <details className="group rounded-card border border-border">
                              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                                <span>Environmental indicators</span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                              </summary>
                              <div className="space-y-2 border-t border-border p-3">
                                <p className="text-xs text-muted">Screening information only; not a site inspection or safety guarantee.</p>
                                {allPending ? (
                                  <div className="rounded-card border border-border bg-surface-subtle px-3 py-2.5 text-sm text-muted">
                                    No environmental indicators are available for this listing.
                                  </div>
                                ) : (
                                  <dl className="divide-y divide-border rounded-card border-y border-border text-sm">
                                    {!isFloodPending && (
                                      <div className="flex justify-between gap-4 py-2.5">
                                        <dt className="text-muted">Flood indicator</dt>
                                        <dd className={`inline-flex max-w-[65%] rounded-control border px-2 py-1 text-right text-xs font-medium ${floodRiskClasses(floodVal)}`}>{floodVal}</dd>
                                      </div>
                                    )}
                                    {!isNoisePending && (
                                      <div className="flex justify-between gap-4 py-2.5">
                                        <dt className="text-muted">Noise indicator</dt>
                                        <dd className={`inline-flex max-w-[65%] rounded-control border px-2 py-1 text-right text-xs font-medium ${isHighNoise ? 'bg-danger-soft text-danger border-danger/20' : isQuietNoise ? 'bg-action-soft text-action-hover border-action/20' : 'bg-caution-soft text-caution border-caution/20'}`}>{noiseVal}</dd>
                                      </div>
                                    )}
                                    {!isElevPending && (
                                      <div className="flex justify-between gap-4 py-2.5">
                                        <dt className="text-muted">Elevation</dt>
                                        <dd className="inline-flex max-w-[65%] rounded-control border border-border bg-surface-subtle px-2 py-1 text-right text-xs font-medium text-ink">{elevVal}</dd>
                                      </div>
                                    )}
                                  </dl>
                                )}
                                <p className="text-xs text-muted">
                                  Source and assessment date are not provided in the public plot data.
                                </p>
                              </div>
                            </details>
                          );
                        })()}

                        {/* Society-level regulatory registry lookup */}
                        {selectedPlot.regulatory && (
                          <details className="group rounded-card border border-border">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                              <span className="min-w-0 flex-1">Housing scheme status</span>
                              <span className="flex shrink-0 items-center gap-2">
                                <span className={`ui-badge whitespace-nowrap ${selectedPlot.regulatory.tier === 'approved' || selectedPlot.regulatory.tier === 'government' ? 'ui-badge-success' : 'ui-badge-caution'}`}>
                                  {selectedPlot.regulatory.badgeText}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                              </span>
                            </summary>
                            <div className="space-y-3 border-t border-border p-3">
                              <p className="text-sm text-muted leading-relaxed">
                                {selectedPlot.regulatory.summary}
                              </p>
                              <dl className="divide-y divide-border rounded-card border-y border-border text-xs">
                                <div className="flex justify-between gap-3 py-2">
                                  <dt className="text-muted">Authority</dt>
                                  <dd className="font-medium text-right text-ink">{selectedPlot.regulatory.authority || 'Not provided'}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-2">
                                  <dt className="text-muted">Jurisdiction</dt>
                                  <dd className="font-medium text-right text-ink">{selectedPlot.regulatory.jurisdiction || 'Not provided'}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-2">
                                  <dt className="text-muted">Registry NOC reference</dt>
                                  <dd className="max-w-[65%] font-medium text-right text-ink">{selectedPlot.regulatory.nocNumber || 'Not provided'}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-2">
                                  <dt className="text-muted">Layout-plan status</dt>
                                  <dd className="max-w-[65%] font-medium text-right text-ink">{selectedPlot.regulatory.lopStatus || 'Not provided'}</dd>
                                </div>
                              </dl>
                              <p className="text-xs text-muted">
                                NAQSHAI registry lookup; currentness date not provided. This is a society/sector-level match, not confirmation of this plot’s NOC, ownership, title, or transfer eligibility.
                              </p>
                              {(selectedPlot.regulatory.warning || selectedPlot.regulatory.officialVerificationUrl) && (
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  {selectedPlot.regulatory.warning && (
                                    <p className="text-xs leading-relaxed text-caution">
                                      {selectedPlot.regulatory.warning}
                                    </p>
                                  )}
                                  {selectedPlot.regulatory.officialVerificationUrl && (
                                    <a
                                      href={selectedPlot.regulatory.officialVerificationUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs font-semibold text-action-hover hover:text-action underline inline-flex items-center gap-1 ui-focus-ring"
                                    >
                                      Check with {selectedPlot.regulatory.authority}
                                      <span aria-hidden="true">→</span>
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </details>
                        )}

                        <details className="group rounded-card border border-border">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                            <span>Nearby amenities and distances</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="border-t border-border p-2">
                            <AmenityScoreCard
                              plotId={selectedPlot.id}
                              lat={selectedPlot.center?.lat}
                              lng={selectedPlot.center?.lng}
                            />
                          </div>
                        </details>

                        {/* WhatsApp Secondary Link */}
                        <details className="group rounded-card border border-border">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-3 text-sm font-semibold text-ink ui-focus-ring [&::-webkit-details-marker]:hidden">
                            <span>Owner contact</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="border-t border-border p-3">
                            {selectedPlot.ownerContact ? (
                              <a
                                href={`https://wa.me/${selectedPlot.ownerContact.replace(/[^0-9]/g, '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(selectedPlot.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 bg-surface border border-border hover:bg-surface-subtle text-ink font-medium py-2.5 px-4 rounded-control transition text-sm ui-focus-ring"
                              >
                                <Phone className="w-4 h-4 text-action" />
                                <span>Contact owner via WhatsApp</span>
                              </a>
                            ) : (
                              <div className="w-full text-center text-sm text-muted bg-surface-subtle border border-border rounded-control py-2.5">
                                Owner contact not available
                              </div>
                            )}
                          </div>
                        </details>
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
