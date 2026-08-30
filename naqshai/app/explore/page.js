'use client';

import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, StreetViewPanorama } from '@react-google-maps/api';
import { Search, ShieldAlert, Phone, MapPin, Eye, X } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const center = { lat: 33.6844, lng: 73.0479 }; 

const MOCK_PLOTS = [
  {
    id: 'plot-101',
    name: 'Plot 101 - Block A, Gulberg Greens',
    society: 'Gulberg Greens',
    city: 'Islamabad',
    center: { lat: 33.5971, lng: 73.1483 },
    paths: [
      { lat: 33.5973, lng: 73.1481 },
      { lat: 33.5973, lng: 73.1485 },
      { lat: 33.5969, lng: 73.1485 },
      { lat: 33.5969, lng: 73.1481 },
    ],
    details: {
      size: '1 Kanal (50x90)',
      elevation: 'High (Optimal)',
      floodRisk: 'Low',
      noiseLevel: 'Low (Residential Zone)',
      landmarks: '200m from Main Expressway, 500m from Mosque',
    },
    ownerContact: '+923001234567',
  },
  {
    id: 'plot-204',
    name: 'Plot 204 - Phase 8, Bahria Town',
    society: 'Bahria Town',
    city: 'Rawalpindi',
    center: { lat: 33.5244, lng: 73.1022 },
    paths: [
      { lat: 33.5246, lng: 73.1020 },
      { lat: 33.5246, lng: 73.1024 },
      { lat: 33.5242, lng: 73.1024 },
      { lat: 33.5242, lng: 73.1020 },
    ],
    details: {
      size: '10 Marla (35x70)',
      elevation: 'Medium',
      floodRisk: 'Moderate (Near Nullah)',
      noiseLevel: 'Medium',
      landmarks: '100m from Commercial Market',
    },
    ownerContact: '+923129876543',
  },
  {
    id: 'plot-309',
    name: 'Plot 309 - Sector F, DHA Phase 1',
    society: 'DHA Phase 1',
    city: 'Islamabad',
    center: { lat: 33.5478, lng: 73.1311 },
    paths: [
      { lat: 33.5480, lng: 73.1309 },
      { lat: 33.5480, lng: 73.1313 },
      { lat: 33.5476, lng: 73.1313 },
      { lat: 33.5476, lng: 73.1309 },
    ],
    details: {
      size: '5 Marla (25x45)',
      elevation: 'High',
      floodRisk: 'Very Low',
      noiseLevel: 'Low',
      landmarks: 'Adjacent to Park, 300m from School',
    },
    ownerContact: '+923335557788',
  },
];

const libraries = ['places'];

export default function ExplorePage() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

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
  }, []);

  const handleSelectPlot = (plot) => {
    setSelectedPlot(plot);
    setSearchQuery(plot.name);
    setIsDropdownOpen(false);
    setIs3DMode(false);

    if (mapRef.current) {
      mapRef.current.panTo(plot.center);
      mapRef.current.setZoom(18);
    }
  };

  const filteredPlots = MOCK_PLOTS.filter((plot) =>
    plot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plot.society.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loadError) return <div className="p-4 text-red-500">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="p-4 text-gray-500">Loading Maps...</div>;

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-md">
        <div className="relative">
          <div className="flex items-center bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
            <Search className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search plot, society..."
              className="w-full outline-none text-sm text-gray-800"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-30">
              {filteredPlots.length > 0 ? (
                filteredPlots.map((plot) => (
                  <button
                    key={plot.id}
                    onClick={() => handleSelectPlot(plot)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-50 last:border-0 flex items-start space-x-2"
                  >
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{plot.name}</p>
                      <p className="text-xs text-gray-500">{plot.society}, {plot.city}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-xs text-gray-500 text-center">No plots found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: 'hybrid',
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        {MOCK_PLOTS.map((plot) => {
          const isSelected = selectedPlot?.id === plot.id;
          return (
            <Polygon
              key={plot.id}
              paths={plot.paths}
              onClick={() => handleSelectPlot(plot)}
              options={{
                fillColor: isSelected ? '#3B82F6' : '#10B981',
                fillOpacity: isSelected ? 0.6 : 0.4,
                strokeColor: isSelected ? '#1D4ED8' : '#059669',
                strokeWeight: 2,
              }}
            />
          );
        })}

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

      {selectedPlot && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-20 flex flex-col border-l border-gray-200 transition-all duration-300">
          <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                Verified Listing
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-1">{selectedPlot.name}</h2>
              <p className="text-xs text-gray-500">{selectedPlot.society}, {selectedPlot.city}</p>
            </div>
            <button
              onClick={() => setSelectedPlot(null)}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg shadow transition text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>{is3DMode ? 'Exit 3D Walkthrough' : 'Launch 3D Walkthrough'}</span>
            </button>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Area Size</span>
                <span className="font-semibold text-gray-800">{selectedPlot.details.size}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-gray-500 block">Elevation</span>
                <span className="font-semibold text-gray-800">{selectedPlot.details.elevation}</span>
              </div>
            </div>

            <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
              <div className="flex items-center text-amber-800 text-xs font-semibold mb-1">
                <ShieldAlert className="w-4 h-4 mr-1 text-amber-600" />
                Risk & Environmental Assessment
              </div>
              <ul className="text-xs text-amber-900 space-y-1 mt-2">
                <li><strong className="font-medium">Flood Risk:</strong> {selectedPlot.details.floodRisk}</li>
                <li><strong className="font-medium">Noise Index:</strong> {selectedPlot.details.noiseLevel}</li>
              </ul>
            </div>

            <div className="space-y-1">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Landmarks & Proximity</h3>
              <p className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                {selectedPlot.details.landmarks}
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-white">
            <a
              href={`https://wa.me/${selectedPlot.ownerContact.replace('+', '')}?text=Hi,%20I%20am%20interested%20in%20${encodeURIComponent(selectedPlot.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>Contact Owner via WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}