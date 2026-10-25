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
import { formatWhatsAppUrl } from '@/lib/formatPlot';
import { PlotPolygon } from '@/components/explore/PlotPolygon';
import { availabilityPinDataUri, clusterBubbleDataUri, floodRiskClasses } from '@/components/explore/MapPinIcons';
import PlotSidebar from '@/components/explore/PlotSidebar';
import PlotDetailsDrawer from '@/components/explore/PlotDetailsDrawer';
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
              <PlotSidebar
                isMobile={isMobile}
                isSidebarOpen={isSidebarOpen}
                sidebarWidth={sidebarWidth}
                setSidebarWidth={setSidebarWidth}
                isDragging={isDragging}
                sidebarSearchQuery={sidebarSearchQuery}
                setSidebarSearchQuery={setSidebarSearchQuery}
                activeCityFilter={activeCityFilter}
                setActiveCityFilter={setActiveCityFilter}
                plots={plots}
                uniqueCities={uniqueCities}
                plotsLoading={plotsLoading}
                plotsError={plotsError}
                plotsByCity={plotsByCity}
                selectedPlot={selectedPlot}
                expandedPlotIds={expandedPlotIds}
                togglePlotDetails={togglePlotDetails}
                handleSeeOnMap={handleSeeOnMap}
                handleRetry={handleRetry}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                mapRef={mapRef}
              />

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
                  <PlotDetailsDrawer
                    selectedPlot={selectedPlot}
                    isInspectorMinimized={isInspectorMinimized}
                    setIsInspectorMinimized={setIsInspectorMinimized}
                    is3DMode={is3DMode}
                    handleToggle3D={handleToggle3D}
                    handleExit3D={handleExit3D}
                    handleClosePlot={handleClosePlot}
                    isFavorite={isFavorite}
                    toggleFavorite={toggleFavorite}
                    onDiscussWithAi={() => router.push(`/recommend?context=${selectedPlot.id}`)}
                  />
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
