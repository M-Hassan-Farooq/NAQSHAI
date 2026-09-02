'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker, StreetViewPanorama } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import { Search, ShieldAlert, Phone, MapPin, Eye, X, ArrowLeft, MessageSquare, Home } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = { lat: 33.6844, lng: 73.0479 };

const MOCK_PLOTS = [
  {
    id: 'Plot-101',
    name: 'Plot 101 - Block A, Gulberg Greens',
    society: 'Gulberg Greens',
    city: 'Islamabad',
    price: '1.85 Crore',
    center: { lat: 33.5971, lng: 73.1483 },
    paths: [
      { lat: 33.5975, lng: 73.1479 },
      { lat: 33.5975, lng: 73.1487 },
      { lat: 33.5967, lng: 73.1487 },
      { lat: 33.5967, lng: 73.1479 },
    ],
    details: {
      size: '1 Kanal (50x90)',
      category: 'Residential',
      elevation: 'High Ridge (Optimal)',
      floodRisk: 'Low Hazard',
      noiseLevel: 'Low (Quiet Zone)',
      landmarks: '200m from Main Expressway, 500m from Mosque',
    },
    ownerContact: '+923001234567',
  },
  {
    id: 'Plot-204',
    name: 'Plot 204 - Phase 8, Bahria Town',
    society: 'Bahria Town',
    city: 'Rawalpindi',
    price: '1.20 Crore',
    center: { lat: 33.5244, lng: 73.1022 },
    paths: [
      { lat: 33.5248, lng: 73.1018 },
      { lat: 33.5248, lng: 73.1026 },
      { lat: 33.5240, lng: 73.1026 },
      { lat: 33.5240, lng: 73.1018 },
    ],
    details: {
      size: '10 Marla (35x70)',
      category: 'Residential',
      elevation: 'Medium Plateau',
      floodRisk: 'Moderate Hazard',
      noiseLevel: 'Medium Buffer',
      landmarks: '100m from Commercial Market',
    },
    ownerContact: '+923129876543',
  },
  {
    id: 'Plot-309',
    name: 'Plot 309 - Sector F, DHA Phase 1',
    society: 'DHA Phase 1',
    city: 'Islamabad',
    price: '85 Lakh',
    center: { lat: 33.5478, lng: 73.1311 },
    paths: [
      { lat: 33.5482, lng: 73.1307 },
      { lat: 33.5482, lng: 73.1315 },
      { lat: 33.5474, lng: 73.1315 },
      { lat: 33.5474, lng: 73.1307 },
    ],
    details: {
      size: '5 Marla (25x45)',
      category: 'Residential',
      elevation: 'High Plateau',
      floodRisk: 'Very Low Risk',
      noiseLevel: 'Low (Park Facing)',
      landmarks: 'Adjacent to Park, 300m from School',
    },
    ownerContact: '+923335557788',
  },
  {
    id: 'Plot-402',
    name: 'Plot 402 - Sector B, Park View City',
    society: 'Park View City',
    city: 'Islamabad',
    price: '1.45 Crore',
    center: { lat: 33.6892, lng: 73.1856 },
    paths: [
      { lat: 33.6896, lng: 73.1852 },
      { lat: 33.6896, lng: 73.1860 },
      { lat: 33.6888, lng: 73.1860 },
      { lat: 33.6888, lng: 73.1852 },
    ],
    details: {
      size: '10 Marla (35x70)',
      category: 'Residential',
      elevation: 'High Hillside',
      floodRisk: 'Low Hazard',
      noiseLevel: 'Very Low (Peaceful Zone)',
      landmarks: 'Panoramic Margalla Hills view, 400m from Main Boulevard',
    },
    ownerContact: '+923014448899',
  },
  {
    id: 'Plot-510',
    name: 'Plot 510 - Phase 6, DHA',
    society: 'DHA Phase 6',
    city: 'Lahore',
    price: '2.50 Crore',
    center: { lat: 31.4722, lng: 74.4378 },
    paths: [
      { lat: 31.4726, lng: 74.4374 },
      { lat: 31.4726, lng: 74.4382 },
      { lat: 31.4718, lng: 74.4382 },
      { lat: 31.4718, lng: 74.4374 },
    ],
    details: {
      size: '1 Kanal (50x90)',
      category: 'Residential',
      elevation: 'Standard Level',
      floodRisk: 'Low Hazard',
      noiseLevel: 'Low Noise',
      landmarks: 'Near Ring Road Interchange & Main CCA',
    },
    ownerContact: '+923218889900',
  },
  {
    id: 'Plot-615',
    name: 'Plot 615 - Block 5, Clifton',
    society: 'Clifton',
    city: 'Karachi',
    price: '1.90 Crore',
    center: { lat: 24.8138, lng: 67.0305 },
    paths: [
      { lat: 24.8142, lng: 67.0301 },
      { lat: 24.8142, lng: 67.0309 },
      { lat: 24.8134, lng: 67.0309 },
      { lat: 24.8134, lng: 67.0301 },
    ],
    details: {
      size: '10 Marla (35x70)',
      category: 'Residential',
      elevation: 'Coastal Terrain',
      floodRisk: 'Low (Coastal Plain)',
      noiseLevel: 'Medium Buffer',
      landmarks: '200m from Sea View Promenade, near Clifton Park',
    },
    ownerContact: '+923009991122',
  }
];

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plotParam = searchParams ? searchParams.get('plot') : null;

  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [is3DMode, setIs3DMode] = useState(false);

  const mapRef = useRef(null);

  const onLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
    mapRef.current = null;
  }, []);

  const handleSelectPlot = useCallback((plot) => {
    setSelectedPlot(plot);
    setSearchQuery(plot.name);
    setIsDropdownOpen(false);
    setIs3DMode(false);
  }, []);

  const [syncedPlotParam, setSyncedPlotParam] = useState(null);
  if (plotParam !== syncedPlotParam) {
    setSyncedPlotParam(plotParam);
    if (plotParam) {
      const match = MOCK_PLOTS.find(
        (p) => p.id.toLowerCase() === plotParam.toLowerCase()
      );
      if (match) {
        setSelectedPlot(match);
        setSearchQuery(match.name);
      }
    }
  }

  // When selectedPlot OR map changes, pan and zoom into selected plot
  useEffect(() => {
    if (selectedPlot && map) {
      map.panTo(selectedPlot.center);
      map.setZoom(18);
    }
  }, [selectedPlot, map]);

  const handleResetSearch = useCallback(() => {
    setSearchQuery('');
    setSelectedPlot(null);
    setIsDropdownOpen(false);
    setIs3DMode(false);
    if (map) {
      map.panTo(defaultCenter);
      map.setZoom(12);
    }
  }, [map]);

  const filteredPlots = MOCK_PLOTS.filter((plot) =>
    plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.society.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.details.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.details.floodRisk.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                {filteredPlots.length > 0 ? (
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
                        <p className="text-xs text-slate-500">{plot.society}, {plot.city} • {plot.id}</p>
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
              Under 2 Crore
            </button>
          </div>

          {/* 5. Mock Interaction Trigger */}
          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono">Demo Inspector</span>
            <button
              onClick={() => handleSelectPlot(MOCK_PLOTS[0])}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1 px-2 rounded-lg transition"
            >
              Debug: Open Plot 101
            </button>
          </div>

        </div>
      </div>

      {/* 1. Google Map Container */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedPlot ? selectedPlot.center : defaultCenter}
        zoom={selectedPlot ? 18 : 12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: 'terrain',
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        {/* Render plot boundary polygons */}
        {MOCK_PLOTS.map((plot) => {
          const isSelected = selectedPlot?.id.toLowerCase() === plot.id.toLowerCase();
          return (
            <Polygon
              key={plot.id}
              paths={plot.paths}
              onClick={() => handleSelectPlot(plot)}
              options={{
                fillColor: isSelected ? '#10b981' : '#94a3b8',
                fillOpacity: isSelected ? 0.20 : 0.15,
                strokeColor: isSelected ? '#047857' : '#64748b',
                strokeWeight: isSelected ? 4 : 2,
                zIndex: isSelected ? 99 : 1,
              }}
            />
          );
        })}

        {/* Selected Plot Marker Pin */}
        {selectedPlot && (
          <Marker
            position={selectedPlot.center}
            title={selectedPlot.name}
          />
        )}

        {/* 3D Walkthrough View */}
        {is3DMode && selectedPlot && (
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
                  <span>{selectedPlot.society}, {selectedPlot.city}</span>
                </p>
              </div>

              {/* 3D Walkthrough Toggle */}
              <button
                onClick={() => setIs3DMode(!is3DMode)}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition text-xs shadow-sm"
              >
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>{is3DMode ? 'Exit 3D Walkthrough' : 'Launch 3D Walkthrough'}</span>
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
                <a
                  href={`https://wa.me/${selectedPlot.ownerContact.replace('+', '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(selectedPlot.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition text-xs shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Contact Owner via WhatsApp</span>
                </a>
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
