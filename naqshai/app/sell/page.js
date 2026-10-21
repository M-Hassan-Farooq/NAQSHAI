'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { GoogleMap, Polygon, Marker, Autocomplete } from '@react-google-maps/api';
import { GoogleMapsSafeLoader } from '@/lib/useGoogleMapsLoader';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import { useListingDraft } from '@/lib/useListingDraft';
import { checkPolygonConflict, isPointInsideAnyPlot } from '@/lib/polygonOverlap';
import { verifyAreaMatch } from '@/lib/areaCalculator';

import UserNav from '@/components/UserNav';
import {
  Sparkles,
  Home,
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
  AlertCircle,
  X,
  Loader2,
  Check,
  CloudOff,
  RefreshCw,
  ClipboardList,
  Scale,
} from 'lucide-react';

const MAP_CONTAINER_STYLE = { width: '100%', height: '420px', borderRadius: '1rem' };
const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 };
const SELL_MAP_OPTIONS = {
  mapTypeId: 'hybrid',
  streetViewControl: false,
  mapTypeControl: true,
};
const PLOT_SIZE_OPTIONS = [
  { label: '3 Marla (20x34)', value: '3 Marla (20x34)' },
  { label: '5 Marla (25x50)', value: '5 Marla (25x50)' },
  { label: '7 Marla (30x55)', value: '7 Marla (30x55)' },
  { label: '10 Marla (35x70)', value: '10 Marla (35x70)' },
  { label: '1 Kanal (50x90)', value: '1 Kanal (50x90)' },
  { label: '2 Kanal (75x120)', value: '2 Kanal (75x120)' },
  { label: 'Commercial 2 Marla (20x25)', value: 'Commercial 2 Marla (20x25)' },
  { label: 'Commercial 4 Marla (30x30)', value: 'Commercial 4 Marla (30x30)' },
  { label: 'Commercial 8 Marla (40x45)', value: 'Commercial 8 Marla (40x45)' },
  { label: 'Commercial 10 Marla (50x45)', value: 'Commercial 10 Marla (50x45)' },
];


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

// Honest autosave status — never shows "Saved" unless the server confirmed it.
function SaveIndicator({ state, lastSavedAt, onRetry }) {
  if (state === 'saving') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (state === 'saved') {
    const t = lastSavedAt
      ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '';
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
        <Check className="w-3.5 h-3.5" />
        Saved{t ? ` · ${t}` : ''}
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
        <CloudOff className="w-3.5 h-3.5" />
        Unable to save
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 inline-flex items-center gap-1 text-amber-800 underline hover:text-amber-900"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      </span>
    );
  }
  return null;
}

export default function SellPlotPage() {
  const router = useRouter();

  // Authentication State
  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Draft resume target (parsed from ?draft=<id>) — resolved once auth is known.
  const [resumeId, setResumeId] = useState(null);
  const [paramResolved, setParamResolved] = useState(false);

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
    society: '',
    plotNumber: '',
    sizeDimensions: '10 Marla (35x70)',
    category: 'Residential',
    pricePkr: '',
    proximityNotes: '',
  });

  // Step 2 State: Polygon Boundary Coordinates & Autocomplete Reference
  const [polygonCoordinates, setPolygonCoordinates] = useState([]);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const [existingPlots, setExistingPlots] = useState([]);

  // Fetch verified/registered plots to render them as occupied land and prevent overlaps
  useEffect(() => {
    let isMounted = true;
    async function loadExistingPlots() {
      try {
        const res = await fetch('/api/plots?limit=100');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data.plots)) {
          setExistingPlots(data.plots);
        }
      } catch (err) {
        console.warn('[sell/page] Could not load existing plots:', err);
      }
    }
    loadExistingPlots();
    return () => {
      isMounted = false;
    };
  }, []);

  // Step 3 State: Uploaded documents — each is { path, name, size } once stored.
  const [uploadedFiles, setUploadedFiles] = useState({
    allotmentLetter: null,
    cnicFront: null,
    cnicBack: null,
  });
  const [docUploading, setDocUploading] = useState({});
  const [docError, setDocError] = useState('');

  // Loading & Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ---- Rehydrate the form from a resumed draft (runs after the draft is fetched).
  const handleHydrate = useCallback((formData, meta) => {
    if (!formData || meta?.isNew) return;
    if (formData.sellerInfo) setSellerInfo((prev) => ({ ...prev, ...formData.sellerInfo }));
    if (formData.plotDetails) setPlotDetails((prev) => ({ ...prev, ...formData.plotDetails }));
    if (Array.isArray(formData.polygonCoordinates)) setPolygonCoordinates(formData.polygonCoordinates);
    if (formData.uploadedFiles) setUploadedFiles((prev) => ({ ...prev, ...formData.uploadedFiles }));
    const step = meta?.currentStep;
    if (step) setCurrentStep(Math.min(Math.max(step, 1), 3));
  }, []);

  const draftEnabled = !checkingAuth && !!session && paramResolved;
  const draft = useListingDraft({ enabled: draftEnabled, resumeId, onHydrate: handleHydrate });

  // Real-time boundary conflict detection against previously registered plots
  const boundaryConflict = useMemo(() => {
    if (polygonCoordinates.length < 3) return { hasConflict: false };
    return checkPolygonConflict(polygonCoordinates, existingPlots, draft?.published_plot_id);
  }, [polygonCoordinates, existingPlots, draft?.published_plot_id]);

  // Real-time area calculation and 90% claimed area verification
  const areaVerification = useMemo(() => {
    if (polygonCoordinates.length < 3) return null;
    return verifyAreaMatch(polygonCoordinates, plotDetails.sizeDimensions || '10 Marla (35x70)', 0.90);
  }, [polygonCoordinates, plotDetails.sizeDimensions]);
  const {
    ready: draftReady,
    status: draftStatus,
    scheduleSave,
    saveNow,
    getDraftId,
    markSubmitted,
  } = draft;

  // Editable while a fresh draft or a rejected listing being corrected; read-only
  // once submitted or published. Single source of truth for the view-only UI, in
  // scope for the handlers below and the render.
  const isReadOnly = draftStatus !== 'draft' && draftStatus !== 'rejected';

  // Snapshot the form for the save layer. `form_data` shape is stable across the app.
  const buildSnapshot = useCallback(
    (step) => ({
      current_step: step ?? currentStep,
      form_data: { sellerInfo, plotDetails, polygonCoordinates, uploadedFiles },
    }),
    [currentStep, sellerInfo, plotDetails, polygonCoordinates, uploadedFiles]
  );

  // Route Protection: Check active user session
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!activeSession) {
          router.push('/login?redirect=/sell');
        } else if (isMounted) {
          setSession(activeSession);
          const userMeta = activeSession.user?.user_metadata || {};
          setSellerInfo((prev) => ({
            ...prev,
            fullName: prev.fullName || userMeta.full_name || userMeta.name || activeSession.user?.email?.split('@')[0] || '',
            phoneNumber: prev.phoneNumber || userMeta.phone_number || '',
          }));
          // Resolve the resume target from the URL (client-only; avoids useSearchParams/Suspense).
          try {
            const dParam = new URLSearchParams(window.location.search).get('draft');
            setResumeId(dParam || null);
          } catch {
            setResumeId(null);
          }
          setParamResolved(true);
        }
      } catch (err) {
        console.error('Session verification error:', err);
        router.push('/login?redirect=/sell');
      } finally {
        if (isMounted) setCheckingAuth(false);
      }
    }

    checkAuthSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (!currentSession) {
        router.push('/login?redirect=/sell');
      } else if (isMounted) {
        setSession(currentSession);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  // ---- Debounced autosave: persist to the DB whenever the form changes.
  useEffect(() => {
    if (!draftReady || isReadOnly) return;
    scheduleSave({
      current_step: currentStep,
      form_data: { sellerInfo, plotDetails, polygonCoordinates, uploadedFiles },
    });
  }, [draftReady, isReadOnly, scheduleSave, currentStep, sellerInfo, plotDetails, polygonCoordinates, uploadedFiles]);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  // Map callbacks
  const onMapLoad = useCallback((mapInstance) => {
    mapRef.current = mapInstance;
  }, []);

  const onAutocompleteLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace?.();
    const location = place?.geometry?.location;
    if (!location || typeof location.lat !== 'function' || typeof location.lng !== 'function') return;

    const lat = location.lat();
    const lng = location.lng();
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(18);
    }
  };

  const handleMapClick = useCallback((e) => {
    if (!e.latLng) return;
    const lat = Number(e.latLng.lat().toFixed(6));
    const lng = Number(e.latLng.lng().toFixed(6));

    // Reject point if placed directly inside an existing registered plot
    const conflict = isPointInsideAnyPlot({ lat, lng }, existingPlots, draft?.published_plot_id);
    if (conflict) {
      setErrorMessage(
        `Cannot place boundary point: This location falls inside registered plot "${conflict.title}". Plot boundaries cannot overlap previously registered land.`
      );
      return;
    }

    setErrorMessage('');
    setPolygonCoordinates((prev) => {
      const next = [...prev, { lat, lng }];
      if (next.length >= 3) {
        const shapeConflict = checkPolygonConflict(next, existingPlots, draft?.published_plot_id);
        if (shapeConflict.hasConflict) {
          setErrorMessage(
            `Boundary Overlap Detected: Your polygon crosses or encloses registered plot "${shapeConflict.conflictingPlot?.title}". Please adjust your boundary.`
          );
        }
      }
      return next;
    });
  }, [existingPlots, draft?.published_plot_id]);

  const handleRemoveLastPoint = useCallback(() => {
    setErrorMessage('');
    setPolygonCoordinates((prev) => prev.slice(0, -1));
  }, []);

  const handleClearPolygon = useCallback(() => {
    setErrorMessage('');
    setPolygonCoordinates([]);
  }, []);

  // Upload a document to Storage and record only its reference in the draft, so
  // autosave persists a path (not the bytes) and never re-uploads the file.
  const uploadDocument = async (field, file) => {
    setDocError('');
    if (isReadOnly) return; // view-only (submitted/published): never upload documents
    const isAllowedType = file.type === 'application/pdf' || file.type.startsWith('image/');
    if (!isAllowedType) {
      setDocError('Please choose a PDF or image file for your verification document.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setDocError('Each verification document must be smaller than 10 MB.');
      return;
    }
    const uid = session?.user?.id;
    if (!uid) {
      setDocError('Your session has expired. Please sign in again.');
      return;
    }
    // Ensure a draft row exists first so the file is filed under this draft's folder.
    let id = getDraftId();
    if (!id) {
      await saveNow(buildSnapshot(currentStep));
      id = getDraftId();
    }
    const folder = id || 'unsaved';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `${uid}/${folder}/${field}-${Date.now()}-${safeName}`;

    setDocUploading((p) => ({ ...p, [field]: true }));
    setDocError(`Uploading ${file.name}...`);
    try {
      const { error } = await supabase.storage
        .from('plot-documents')
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      setUploadedFiles((prev) => ({ ...prev, [field]: { path, name: file.name, size: file.size } }));
      setDocError('');
    } catch (err) {
      setDocError(`Could not upload ${file.name}: ${err?.message || 'please try again.'}`);
    } finally {
      setDocUploading((p) => ({ ...p, [field]: false }));
    }
  };

  // Handle File Input Change
  const handleFileChange = (field, e) => {
    const file = e.target.files?.[0];
    if (file) uploadDocument(field, file);
    e.target.value = '';
  };

  // Remove a previously selected document (drops the reference; the file stays in
  // owner-scoped Storage and is simply no longer linked to the draft).
  const handleRemoveFile = (field) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  // Form Validation & Step Navigation
  const handleNextStep = () => {
    setErrorMessage('');
    if (isReadOnly) {
      // View-only: allow paging forward to review, but never validate or persist.
      setCurrentStep((s) => Math.min(s + 1, 3));
      return;
    }
    if (currentStep === 1) {
      if (!sellerInfo.fullName || !sellerInfo.phoneNumber) {
        setErrorMessage('Please provide your full name and WhatsApp phone number.');
        return;
      }
      if (!/^\+?[0-9\s()-]{7,20}$/.test(sellerInfo.phoneNumber.trim())) {
        setErrorMessage('Please enter a valid phone number, for example +923001234567.');
        return;
      }
      if (!plotDetails.society || !plotDetails.plotNumber || !plotDetails.pricePkr) {
        setErrorMessage('Please fill in society name, plot number, and demand price.');
        return;
      }
      if (!Number.isFinite(Number(plotDetails.pricePkr)) || Number(plotDetails.pricePkr) <= 0) {
        setErrorMessage('Demand price must be greater than zero.');
        return;
      }
    }
    if (currentStep === 2) {
      if (polygonCoordinates.length < 3) {
        setErrorMessage('Please mark at least 3 boundary points before continuing.');
        return;
      }
      const conflict = checkPolygonConflict(polygonCoordinates, existingPlots, draft?.published_plot_id);
      if (conflict.hasConflict) {
        setErrorMessage(
          `Cannot proceed: Your plot boundary overlaps with existing registered plot "${conflict.conflictingPlot?.title}". Please clear or adjust points to avoid overlap.`
        );
        return;
      }
      const areaCheck = verifyAreaMatch(polygonCoordinates, plotDetails.sizeDimensions || '10 Marla (35x70)', 0.90);
      if (!areaCheck.isValid) {
        setErrorMessage(
          `Cannot proceed: Mapped plot area (${areaCheck.calculated.sqFt.toLocaleString()} sq ft) is only ${areaCheck.percentage}% of your claimed ${areaCheck.claimed.sqFt.toLocaleString()} sq ft (${areaCheck.claimed.raw}). Plot boundary must cover at least 90% (${areaCheck.minRequiredSqFt.toLocaleString()} sq ft) of claimed size to avoid automatic rejection.`
        );
        return;
      }
    }
    const next = Math.min(currentStep + 1, 3);
    saveNow(buildSnapshot(next)); // persist progress on navigation
    setCurrentStep(next);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (isReadOnly) {
      // View-only: allow paging back to review without persisting.
      setCurrentStep((s) => Math.max(s - 1, 1));
      return;
    }
    const prev = Math.max(currentStep - 1, 1);
    saveNow(buildSnapshot(prev));
    setCurrentStep(prev);
  };

  // Final Ingestion Submission — flush the draft, then publish from server-side data.
  const handleSubmitListing = async () => {
    setSubmitting(true);
    setErrorMessage('');

    try {
      if (!uploadedFiles.allotmentLetter) {
        setErrorMessage('Please upload the allotment or transfer letter before submitting.');
        return;
      }
      if (Object.values(docUploading).some(Boolean)) {
        setErrorMessage('Please wait for document uploads to finish before submitting.');
        return;
      }

      // Make sure the newest form state is persisted and a draft row exists.
      await saveNow(buildSnapshot(currentStep));
      const id = getDraftId();
      if (!id) {
        setErrorMessage('We could not save your listing before submitting. Please check your connection and try again.');
        setSubmitting(false);
        return;
      }

      const { data: { session: current } } = await supabase.auth.getSession();
      const token = current?.access_token;

      const res = await fetch(`/api/drafts/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();

      if (data.success) {
        markSubmitted();
        setCurrentStep(4);
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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Verifying seller authorization...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">

      {/* Standardized Header Navigation Bar */}
      <Navbar
        session={session}
        onSignOut={handleSignOut}
        badgeText="Seller Portal"
        rightSlot={
          session?.user && !isReadOnly ? (
            <div className="hidden md:flex items-center pr-1">
              <SaveIndicator
                state={draft.saveState}
                lastSavedAt={draft.lastSavedAt}
                onRetry={() => saveNow(buildSnapshot(currentStep))}
              />
            </div>
          ) : null
        }
      />


      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">

        {/* Draft status banners */}
        {draft.initializing && (
          <div className="mb-6 p-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
            Restoring your saved progress…
          </div>
        )}

        {draft.loadError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Could not open this draft</p>
              <p className="text-xs text-red-600 mt-0.5">{draft.loadError}</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-2 text-xs font-semibold text-red-700 underline hover:text-red-800"
              >
                Back to My Listings
              </button>
            </div>
          </div>
        )}

        {draft.conflict && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
            <div>
              <p className="font-semibold">This draft was updated on another device</p>
              <p className="text-xs text-amber-700 mt-0.5">
                To avoid overwriting newer changes, reload to fetch the latest version before continuing.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 underline hover:text-amber-900"
              >
                <RefreshCw className="w-3 h-3" />
                Reload latest version
              </button>
            </div>
          </div>
        )}

        {isReadOnly && currentStep <= 3 && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-sm flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-700 mt-0.5" />
            <div>
              <p className="font-semibold">This listing has already been submitted</p>
              <p className="text-xs text-emerald-800 mt-0.5">
                It is under review and can no longer be edited as a draft. You can track it from My Listings.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-2 text-xs font-semibold text-emerald-800 underline hover:text-emerald-900"
              >
                Go to My Listings
              </button>
            </div>
          </div>
        )}

        {draftStatus === 'rejected' && currentStep <= 3 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold">This listing needs changes before it can be published</p>
              {draft.rejectionReason && (
                <p className="text-xs text-amber-800 mt-0.5">Reviewer note: {draft.rejectionReason}</p>
              )}
              <p className="text-xs text-amber-800 mt-0.5">
                Update the details below and submit again to send it back for verification.
              </p>
            </div>
          </div>
        )}

        {/* Title & Introduction */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            List Your Plot on NAQSHAI
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Submit plot metadata, draw interactive polygon coordinates on satellite maps, and upload ownership documents for AI risk verification.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Your progress saves automatically — you can leave and pick up right where you left off.
          </p>
          {session?.user && !isReadOnly && (
            <div className="mt-3 flex justify-center md:hidden">
              <SaveIndicator
                state={draft.saveState}
                lastSavedAt={draft.lastSavedAt}
                onRetry={() => saveNow(buildSnapshot(currentStep))}
              />
            </div>
          )}
        </div>

        {/* 2. Step Progress Bar */}
        {currentStep <= 3 && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">

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
              <fieldset disabled={isReadOnly} className="space-y-8 border-0 p-0 m-0 min-w-0 disabled:opacity-70">
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
                      {PLOT_SIZE_OPTIONS.map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
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

              </fieldset>

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
                    Search your location, then click on the satellite map to place corner points for your plot boundary.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleRemoveLastPoint}
                    disabled={isReadOnly || polygonCoordinates.length === 0}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Point</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPolygon}
                    disabled={isReadOnly || polygonCoordinates.length === 0}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear & Redraw</span>
                  </button>
                </div>
              </div>

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
                          onClick={isReadOnly ? undefined : handleMapClick}
                          options={SELL_MAP_OPTIONS}
                        >
                          {/* Search Bar Overlay */}
                          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 w-72 sm:w-96 px-4">
                            <Autocomplete
                              onLoad={onAutocompleteLoad}
                              onPlaceChanged={onPlaceChanged}
                            >
                              <input
                                type="text"
                                placeholder="Search society, sector, or landmark..."
                                className="w-full px-4 py-2 bg-white/95 backdrop-blur-md text-slate-800 font-medium text-xs rounded-xl shadow-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                              />
                            </Autocomplete>
                          </div>

                          {/* Existing Registered Plots (Reserved) */}
                          {existingPlots.map((ep) => {
                            const paths = ep.paths || ep.polygon_coordinates || ep.polygonCoordinates;
                            if (!paths || paths.length < 3) return null;
                            const isConflictTarget =
                              boundaryConflict.hasConflict &&
                              boundaryConflict.conflictingPlot?.id === ep.id;
                            return (
                              <Polygon
                                key={ep.id}
                                paths={paths}
                                options={{
                                  strokeColor: isConflictTarget ? '#dc2626' : '#64748b',
                                  strokeWeight: isConflictTarget ? 2.5 : 1.5,
                                  strokeOpacity: 0.85,
                                  fillColor: isConflictTarget ? '#ef4444' : '#64748b',
                                  fillOpacity: isConflictTarget ? 0.35 : 0.15,
                                  clickable: false,
                                  zIndex: 1,
                                }}
                              />
                            );
                          })}

                          {/* Candidate Plot Boundary */}
                          {polygonCoordinates.length > 0 && (
                            <Polygon
                              paths={polygonCoordinates}
                              options={{
                                strokeColor: boundaryConflict.hasConflict
                                  ? '#dc2626'
                                  : areaVerification && !areaVerification.isValid
                                  ? '#d97706'
                                  : '#047857',
                                strokeWeight: 2.5,
                                fillColor: boundaryConflict.hasConflict
                                  ? '#ef4444'
                                  : areaVerification && !areaVerification.isValid
                                  ? '#f59e0b'
                                  : '#10b981',
                                fillOpacity: boundaryConflict.hasConflict ? 0.4 : 0.35,
                                editable: !isReadOnly,
                                draggable: !isReadOnly,
                                zIndex: 2,
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

                          {/* Map Legend Overlay */}
                          <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-[11px] font-medium text-slate-700 flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-700 inline-block" />
                              <span>Your Plot {areaVerification?.isValid ? '(Verified)' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 rounded bg-slate-500/20 border border-slate-500 inline-block" />
                              <span>Registered Plots (Occupied)</span>
                            </div>
                            {areaVerification && !areaVerification.isValid && !boundaryConflict.hasConflict && (
                              <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                                <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-600 inline-block" />
                                <span>Area Below 90%</span>
                              </div>
                            )}
                            {boundaryConflict.hasConflict && (
                              <div className="flex items-center gap-1.5 text-red-600 font-bold animate-pulse">
                                <span className="w-3 h-3 rounded bg-red-500/40 border border-red-600 inline-block" />
                                <span>Overlap Conflict!</span>
                              </div>
                            )}
                          </div>
                        </GoogleMap>
                      </div>
                    )}
                  </>
                )}
              </GoogleMapsSafeLoader>

              {/* Boundary Overlap Warning Banner */}
              {boundaryConflict.hasConflict && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-red-900">Plot Boundary Overlap Detected</p>
                    <p className="text-red-700 leading-relaxed">
                      Your boundary overlaps with existing registered plot{' '}
                      <span className="font-semibold underline">
                        {boundaryConflict.conflictingPlot?.title || boundaryConflict.conflictingPlot?.id}
                      </span>
                      . In NAQSHAI, plots cannot be drawn over previously mapped land. Please undo or clear your points to select unclaimed land.
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Area Verification Card */}
              {polygonCoordinates.length >= 3 && areaVerification && (
                <div
                  className={`p-4 rounded-xl border transition ${
                    areaVerification.isValid
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-amber-50/70 border-amber-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
                    <div className="flex items-center gap-2">
                      <Scale className={`w-4 h-4 ${areaVerification.isValid ? 'text-emerald-700' : 'text-amber-700'}`} />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Geospatial Plot Area Verification
                      </h3>
                    </div>
                    <div>
                      {areaVerification.isValid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Verified ({areaVerification.percentage}% of Claimed)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-400">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                          Below 90% Threshold ({areaVerification.percentage}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                        Claimed Plot Size
                      </span>
                      <span className="font-bold text-slate-800 text-sm">
                        {areaVerification.claimed.raw}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ~{areaVerification.claimed.sqFt.toLocaleString()} sq ft ({areaVerification.claimed.marla} Marla)
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-0.5">
                        Mapped Boundary Area
                      </span>
                      <span className={`font-bold text-sm ${areaVerification.isValid ? 'text-emerald-700' : 'text-amber-800'}`}>
                        ~{areaVerification.calculated.sqFt.toLocaleString()} sq ft
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        ~{areaVerification.calculated.marla} Marla ({Math.round(areaVerification.calculated.sqMeters)} sq m)
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                          <span>Accuracy Ratio</span>
                          <span className={areaVerification.isValid ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                            {areaVerification.percentage}% (Min: 90%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              areaVerification.isValid ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(areaVerification.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {areaVerification.isValid
                          ? 'Satisfies mandatory verification threshold.'
                          : `Must cover at least ${areaVerification.minRequiredSqFt.toLocaleString()} sq ft.`}
                      </p>
                    </div>
                  </div>

                  {!areaVerification.isValid && (
                    <div className="mt-3 p-2.5 bg-amber-100/90 border border-amber-300 rounded-lg text-xs text-amber-900 leading-relaxed font-medium">
                      ⚠️ <strong>Automatic Rejection Guard:</strong> Your drawn polygon covers only{' '}
                      <strong>{areaVerification.calculated.sqFt.toLocaleString()} sq ft</strong> ({areaVerification.percentage}%), which is below the required 90% threshold ({areaVerification.minRequiredSqFt.toLocaleString()} sq ft) of your claimed {areaVerification.claimed.raw}. Please extend your boundary points to match the full plot area before proceeding.
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Captured Boundary Coordinates ({polygonCoordinates.length} Points)
                  </span>
                  {boundaryConflict.hasConflict ? (
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-full flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-red-600" />
                      Overlap Conflict
                    </span>
                  ) : polygonCoordinates.length >= 3 ? (
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
                    No coordinates drawn yet. Search for your plot location and click points directly on the map to define plot boundaries.
                  </p>
                )}
              </div>

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

              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Asynchronous AI Verification Notice</p>
                  <p className="mt-0.5 text-emerald-800">
                    Verification is performed asynchronously. Your listing will appear with an <strong>&apos;Under Review&apos;</strong> status until validated.
                  </p>
                </div>
              </div>

              {docError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>{docError}</span>
                </div>
              )}

              <fieldset disabled={isReadOnly} className="border-0 p-0 m-0 min-w-0 disabled:opacity-70">
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

                    {docUploading.allotmentLetter ? (
                      <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…
                      </div>
                    ) : uploadedFiles.allotmentLetter && (
                      <div className="mt-2 flex items-center gap-1.5 max-w-full">
                        <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md truncate">
                          ✓ {uploadedFiles.allotmentLetter.name}
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

                {/* CNIC Front Upload */}
                <div className="p-5 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-white hover:border-emerald-300 transition group">
                  <div className="flex flex-col items-center text-center">
                    <UploadCloud className="w-8 h-8 text-emerald-700 group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-xs font-bold text-slate-800">CNIC Front & Back</span>
                    <span className="text-xs text-slate-400 mt-0.5">National Identity Card Scan</span>

                    <div className="flex gap-2 mt-4">
                      <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm">
                        CNIC Front
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange('cnicFront', e)}
                        />
                      </label>

                      <label className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm">
                        CNIC Back
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileChange('cnicBack', e)}
                        />
                      </label>
                    </div>

                    <div className="mt-2 space-y-1 w-full flex flex-col items-center">
                      {docUploading.cnicFront && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading front…
                        </div>
                      )}
                      {!docUploading.cnicFront && uploadedFiles.cnicFront && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded truncate">
                            Front: {uploadedFiles.cnicFront.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('cnicFront')}
                            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      {docUploading.cnicBack && (
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading back…
                        </div>
                      )}
                      {!docUploading.cnicBack && uploadedFiles.cnicBack && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded truncate">
                            Back: {uploadedFiles.cnicBack.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile('cnicBack')}
                            className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              </fieldset>

              <div className="flex justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={submitting || isReadOnly}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Listing</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Success View */}
          {currentStep === 4 && (
            <div className="py-8 text-center space-y-5">
              <div className="w-16 h-16 bg-emerald-100 border-2 border-emerald-300 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900">Listing Submitted for Verification</h2>
                <p className="text-sm text-slate-600 mt-3 max-w-md mx-auto leading-relaxed">
                  Your listing is now <strong>under review</strong>. It is not public yet — once our team verifies it, it will be published to the 3D Map. You can track its status any time from My Listings.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
                >
                  Go to My Listings
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
