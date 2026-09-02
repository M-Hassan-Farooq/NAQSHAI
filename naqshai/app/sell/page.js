'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  FileText,
  UploadCloud,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Building2,
  User,
  Phone,
  Tag,
  DollarSign,
  Maximize2,
  Compass,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';

const MAP_CONTAINER_STYLE = { width: '100%', height: '420px', borderRadius: '1rem' };
const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 };

function formatPkr(num) {
  if (!num || isNaN(num)) return '';
  const val = Number(num);
  if (val >= 10000000) {
    return `${(val / 10000000).toFixed(2)} Crore PKR`;
  } else if (val >= 100000) {
    return `${(val / 100000).toFixed(2)} Lakh PKR`;
  }
  return `PKR ${val.toLocaleString('en-PK')}`;
}

export default function SellPlotPage() {
  const router = useRouter();

  // Step state: 1 = Details, 2 = Boundary Map, 3 = Documents, 4 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State: Seller & Plot Details
  const [sellerInfo, setSellerInfo] = useState({
    fullName: '',
    phoneNumber: '',
    sellerRole: 'Direct Owner',
  });

  const [plotDetails, setPlotDetails] = useState({
    city: 'Islamabad',
    society: 'Gulberg Greens',
    plotNumber: '',
    sizeDimensions: '10 Marla (35x70)',
    category: 'Residential',
    pricePkr: '',
    proximityNotes: '',
  });

  // Step 2 State: Polygon Boundary Coordinates
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const polygonRef = useRef(null);
  const mapRef = useRef(null);

  // Step 3 State: Uploaded File Names
  const [uploadedFiles, setUploadedFiles] = useState({
    allotmentLetter: null,
    cnicFront: null,
    cnicBack: null,
  });

  // Loading & Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submittedPlotId, setSubmittedPlotId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Map callbacks
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const handleMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const lat = Number(e.latLng.lat().toFixed(6));
    const lng = Number(e.latLng.lng().toFixed(6));
    setPolygonCoordinates((prev) => [...prev, { lat, lng }]);
  }, []);

  const handleRemoveLastPoint = useCallback(() => {
    setPolygonCoordinates((prev) => prev.slice(0, -1));
  }, []);

  const handleClearPolygon = useCallback(() => {
    setPolygonCoordinates([]);
  }, []);

  // Handle File Input Change
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFiles((prev) => ({
        ...prev,
        [field]: file.name,
      }));
    }
    // Reset the native input value so the same file can be re-selected after removal
    e.target.value = '';
  };

  // Remove a previously selected document
  const handleRemoveFile = (field) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Form Validation & Step Navigation
  const handleNextStep = () => {
    setErrorMessage('');
    if (currentStep === 1) {
      if (!sellerInfo.fullName || !sellerInfo.phoneNumber) {
        setErrorMessage('Please provide your full name and WhatsApp phone number.');
        return;
      }
      if (!plotDetails.society || !plotDetails.plotNumber || !plotDetails.pricePkr) {
        setErrorMessage('Please fill in society name, plot number, and demand price.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Final Ingestion Submission
  const handleSubmitListing = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        seller: sellerInfo,
        plot: plotDetails,
        polygonCoordinates: polygonCoordinates,
        documents: [
          uploadedFiles.allotmentLetter ? `allotment_letters/${uploadedFiles.allotmentLetter}` : 'allotment_letter_pending.pdf',
          uploadedFiles.cnicFront ? `cnic/${uploadedFiles.cnicFront}` : 'cnic_front_pending.jpg',
          uploadedFiles.cnicBack ? `cnic/${uploadedFiles.cnicBack}` : 'cnic_back_pending.jpg',
        ].filter(Boolean),
      };

      const res = await fetch('/api/sell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSubmittedPlotId(data.plotId || 'Plot-101');
        setCurrentStep(4); // Move to Success Step
      } else {
        setErrorMessage(data.error || 'Failed to submit plot listing. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Network error occurred while submitting listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm group-hover:bg-emerald-100 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">NAQSHAI</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full hidden sm:inline-block">
              Seller Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/explore')}
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm"
            >
              Explore 3D Map
            </button>
            <button
              onClick={() => router.push('/recommend')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>AI Advisor</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Title & Introduction */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            List Your Plot on NAQSHAI
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Submit plot metadata, draw interactive 4-corner polygon coordinates on HD satellite maps, and upload ownership documents for AI risk verification.
          </p>
        </div>

        {/* 2. Step Progress Bar */}
        {currentStep <= 3 && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              
              {/* Step 1 Indicator */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 1
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    currentStep >= 1 ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  Plot Details
                </span>
              </div>

              <div
                className={`h-0.5 flex-1 transition-all ${
                  currentStep >= 2 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />

              {/* Step 2 Indicator */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 2
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    currentStep >= 2 ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  Boundary Map
                </span>
              </div>

              <div
                className={`h-0.5 flex-1 transition-all ${
                  currentStep >= 3 ? 'bg-emerald-600' : 'bg-slate-200'
                }`}
              />

              {/* Step 3 Indicator */}
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    currentStep >= 3
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  3
                </div>
                <span
                  className={`text-xs font-semibold ${
                    currentStep >= 3 ? 'text-emerald-800' : 'text-slate-400'
                  }`}
                >
                  Documents
                </span>
              </div>

            </div>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Action Required</p>
              <p className="text-xs text-red-600 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 3. Multi-Step Form Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
          
          {/* STEP 1: Plot & Seller Details */}
          {currentStep === 1 && (
            <div className="space-y-8">
              
              {/* Seller Profile Section */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <User className="w-5 h-5 text-emerald-700" />
                  <span>1. Seller & Contact Profile</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ahsan Khan"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={sellerInfo.fullName}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      WhatsApp Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. +923001234567"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={sellerInfo.phoneNumber}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, phoneNumber: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Seller Role
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={sellerInfo.sellerRole}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, sellerRole: e.target.value })}
                    >
                      <option value="Direct Owner">Direct Owner</option>
                      <option value="Family Representative">Family Representative</option>
                      <option value="Real Estate Agency">Real Estate Agency</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Plot Details Section */}
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span>2. Plot Location & Specifications</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.city}
                      onChange={(e) => setPlotDetails({ ...plotDetails, city: e.target.value })}
                    >
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Society / Housing Scheme *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Gulberg Greens"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.society}
                      onChange={(e) => setPlotDetails({ ...plotDetails, society: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Plot Number / ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Plot-101"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.plotNumber}
                      onChange={(e) => setPlotDetails({ ...plotDetails, plotNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Size & Dimensions *
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.sizeDimensions}
                      onChange={(e) => setPlotDetails({ ...plotDetails, sizeDimensions: e.target.value })}
                    >
                      <option value="5 Marla (25x50)">5 Marla (25x50)</option>
                      <option value="10 Marla (35x70)">10 Marla (35x70)</option>
                      <option value="1 Kanal (50x90)">1 Kanal (50x90)</option>
                      <option value="2 Kanal (75x120)">2 Kanal (75x120)</option>
                      <option value="Commercial 4 Marla (30x30)">Commercial 4 Marla (30x30)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Category
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.category}
                      onChange={(e) => setPlotDetails({ ...plotDetails, category: e.target.value })}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Demand Price (PKR) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 18500000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      value={plotDetails.pricePkr}
                      onChange={(e) => setPlotDetails({ ...plotDetails, pricePkr: e.target.value })}
                    />
                    {plotDetails.pricePkr && (
                      <p className="text-xs font-medium text-emerald-700 mt-1 font-mono">
                        {formatPkr(plotDetails.pricePkr)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Proximity Notes & Nearby Landmarks
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. 200m from Main Expressway, 500m from Mosque, 30ft wide front road"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    value={plotDetails.proximityNotes}
                    onChange={(e) => setPlotDetails({ ...plotDetails, proximityNotes: e.target.value })}
                  />
                </div>
              </div>

              {/* Step 1 Action Controls */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
                >
                  <span>Continue to Boundary Map</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Interactive Boundary Drawing Map */}
          {currentStep === 2 && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-700" />
                    <span>2. Draw Interactive Plot Boundary</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click anywhere on the satellite map below to place 4 corner points for your plot boundary.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleRemoveLastPoint}
                    disabled={polygonCoordinates.length === 0}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Point</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPolygon}
                    disabled={polygonCoordinates.length === 0}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear & Redraw</span>
                  </button>
                </div>
              </div>

              {/* Google Map Canvas */}
              <GoogleMapsSafeLoader>
                {({ isLoaded, loadError }) => (
                  <>
                    {loadError ? (
                      <div className="p-8 text-center bg-red-50 border border-red-200 text-red-700 rounded-xl">
                        Failed to load Google Maps. Please check your API key setup.
                      </div>
                    ) : !isLoaded ? (
                      <div className="h-96 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 text-sm">
                        Initializing Interactive Map Canvas...
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                        <GoogleMap
                          mapContainerStyle={MAP_CONTAINER_STYLE}
                          center={DEFAULT_CENTER}
                          zoom={15}
                          onLoad={onMapLoad}
                          onClick={handleMapClick}
                          options={{
                            mapTypeId: 'hybrid',
                            streetViewControl: false,
                            mapTypeControl: true,
                          }}
                        >
                          {polygonCoordinates.length > 0 && (
                            <Polygon
                              paths={polygonCoordinates}
                              options={{
                                strokeColor: '#047857',
                                strokeWeight: 2,
                                fillColor: '#10b981',
                                fillOpacity: 0.35,
                                editable: true,
                              }}
                            />
                          )}

                          {polygonCoordinates.map((pt, idx) => (
                            <Marker
                              key={`${pt.lat}-${pt.lng}-${idx}`}
                              position={pt}
                              label={{
                                text: `${idx + 1}`,
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '11px',
                              }}
                            />
                          ))}
                        </GoogleMap>
                      </div>
                    )}
                  </>
                )}
              </GoogleMapsSafeLoader>

              {/* Coordinates Preview Panel */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Captured Boundary Coordinates ({polygonCoordinates.length} Points)
                  </span>
                  {polygonCoordinates.length >= 3 ? (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full">
                      Polygon Sealed
                    </span>
                  ) : (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                      Draw at least 3 points
                    </span>
                  )}
                </div>

                {polygonCoordinates.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 font-mono text-xs text-slate-600">
                    {polygonCoordinates.map((pt, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 p-2 rounded-lg text-center">
                        <span className="text-emerald-700 font-bold mr-1">P{idx + 1}:</span>
                        {pt.lat}, {pt.lng}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic mt-2">
                    No coordinates drawn yet. Click the polygon icon on the top map bar and click points on the map.
                  </p>
                )}
              </div>

              {/* Step 2 Action Controls */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
                >
                  <span>Continue to Documents</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: Document Uploads */}
          {currentStep === 3 && (
            <div className="space-y-6">
              
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <span>3. Upload Verification Documents</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload plot ownership papers and national identity card scans for automated risk intelligence check.
                </p>
              </div>

              {/* Informative Review Notice */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Asynchronous AI Verification Notice</p>
                  <p className="mt-0.5 text-emerald-800">
                    Verification is performed asynchronously. Your listing will appear with an <strong>&apos;Under Review&apos;</strong> status until validated.
                  </p>
                </div>
              </div>

              {/* File Dropzone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Allotment Letter Upload */}
                <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-emerald-300 transition group">
                  <div className="flex flex-col items-center text-center">
                    <UploadCloud className="w-8 h-8 text-emerald-700 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-slate-800">Allotment / Transfer Letter *</span>
                    <span className="text-xs text-slate-400 mt-0.5">PDF or High-res Image (Max 10MB)</span>

                    <label className="mt-4 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm">
                      Browse File
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange('allotmentLetter', e)}
                      />
                    </label>

                    {uploadedFiles.allotmentLetter && (
                      <div className="mt-2 flex items-center gap-1.5 max-w-full">
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md truncate">
                          ✓ {uploadedFiles.allotmentLetter}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile('allotmentLetter')}
                          className="p-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition shrink-0"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* CNIC Front & Back Upload */}
                <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-emerald-300 transition group">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="w-8 h-8 text-emerald-700 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-slate-800">CNIC (Front & Back) *</span>
                    <span className="text-xs text-slate-400 mt-0.5">National ID Card Scans</span>

                    <div className="flex gap-2 mt-4">
                      <label className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm">
                        CNIC Front
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange('cnicFront', e)}
                        />
                      </label>

                      <label className="px-3 py-1.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm">
                        CNIC Back
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange('cnicBack', e)}
                        />
                      </label>
                    </div>

                    <div className="flex flex-col gap-1 mt-2">
                      {uploadedFiles.cnicFront && (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md truncate">
                            ✓ Front: {uploadedFiles.cnicFront}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('cnicFront')}
                            className="p-0.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition shrink-0"
                            title="Remove CNIC front"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {uploadedFiles.cnicBack && (
                        <div className="flex items-center gap-1.5 max-w-full">
                          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md truncate">
                            ✓ Back: {uploadedFiles.cnicBack}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('cnicBack')}
                            className="p-0.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition shrink-0"
                            title="Remove CNIC back"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Step 3 Action Controls */}
              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={submitting}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-2.5 rounded-xl text-sm transition shadow-md flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <span>Submitting Listing...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Plot Listing</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* STEP 4: Success Confirmation Screen */}
          {currentStep === 4 && (
            <div className="text-center py-8 space-y-6">
              
              <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Plot Listing Submitted Successfully!
                </h2>
                <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                  Your plot metadata and satellite boundary drawings have been registered into the NAQSHAI database.
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-left">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Assigned Plot ID:</span>
                  <span className="font-mono font-bold text-slate-900 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {submittedPlotId}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Society & City:</span>
                  <span className="font-medium text-slate-800">{plotDetails.society}, {plotDetails.city}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500 font-semibold">Demand Price:</span>
                  <span className="font-medium text-emerald-700">{formatPkr(plotDetails.pricePkr)}</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">Verification Status:</span>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-full">
                    Under Review (Pending Async Check)
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => router.push('/explore')}
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Explore All Plots on 3D Map</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentStep(1);
                    setSubmittedPlotId(null);
                    setPolygonCoordinates([]);
                  }}
                  className="w-full sm:w-auto bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  Submit Another Plot
                </button>
              </div>

            </div>
          )}

        </div>

      </main>
    </div>
  );
}
