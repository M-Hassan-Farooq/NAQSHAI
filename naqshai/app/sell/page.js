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

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%', borderRadius: '0.75rem' };
const DEFAULT_CENTER = { lat: 33.6844, lng: 73.0479 };
const SELL_MAP_OPTIONS = {
  mapTypeId: 'hybrid',
  streetViewControl: false,
  mapTypeControl: true,
};
const RESIDENTIAL_PLOT_SIZE_OPTIONS = [
  { label: '3 Marla (20x34)', value: '3 Marla (20x34)' },
  { label: '5 Marla (25x50)', value: '5 Marla (25x50)' },
  { label: '7 Marla (30x55)', value: '7 Marla (30x55)' },
  { label: '10 Marla (35x70)', value: '10 Marla (35x70)' },
  { label: '1 Kanal (50x90)', value: '1 Kanal (50x90)' },
  { label: '2 Kanal (75x120)', value: '2 Kanal (75x120)' },
];
const COMMERCIAL_PLOT_SIZE_OPTIONS = [
  { label: 'Commercial 2 Marla (20x25)', value: 'Commercial 2 Marla (20x25)' },
  { label: 'Commercial 4 Marla (30x30)', value: 'Commercial 4 Marla (30x30)' },
  { label: 'Commercial 8 Marla (40x45)', value: 'Commercial 8 Marla (40x45)' },
  { label: 'Commercial 10 Marla (50x45)', value: 'Commercial 10 Marla (50x45)' },
];
const DEFAULT_PLOT_SIZE_BY_CATEGORY = {
  Residential: '10 Marla (35x70)',
  Commercial: 'Commercial 4 Marla (30x30)',
};

function getPlotSizeOptions(category) {
  return category === 'Commercial' ? COMMERCIAL_PLOT_SIZE_OPTIONS : RESIDENTIAL_PLOT_SIZE_OPTIONS;
}


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
      <span className="flex items-center gap-1.5 text-xs font-medium text-muted" role="status">
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
      <span className="flex items-center gap-1.5 text-xs font-medium text-action-hover" role="status">
        <Check className="w-3.5 h-3.5" />
        Saved{t ? ` · ${t}` : ''}
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="flex items-center gap-1.5 text-xs font-medium text-caution" role="status">
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
    if (formData.plotDetails) {
      setPlotDetails((prev) => {
        const hydratedPlotDetails = { ...prev, ...formData.plotDetails };
        const category = hydratedPlotDetails.category === 'Commercial' ? 'Commercial' : 'Residential';
        const sizeOptions = getPlotSizeOptions(category);
        return {
          ...hydratedPlotDetails,
          category,
          sizeDimensions: sizeOptions.some(({ value }) => value === hydratedPlotDetails.sizeDimensions)
            ? hydratedPlotDetails.sizeDimensions
            : DEFAULT_PLOT_SIZE_BY_CATEGORY[category],
        };
      });
    }
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
    <div className="min-h-screen bg-page text-ink font-sans selection:bg-action-soft selection:text-action-hover pb-16">

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7">

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
        <div className="mb-5 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            List Your Plot on NAQSHAI
          </h1>
          <p className="text-sm text-muted mt-1.5 max-w-2xl">
            Add the listing details, map the plot boundary, then upload documents for review.
          </p>
          <p className="text-xs text-muted mt-1.5">
            Your draft saves automatically and can be resumed later.
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

        {/* Compact step progress */}
        {currentStep <= 3 && (
          <div className="mb-4 sm:mb-5" role="group" aria-label={`Step ${currentStep} of 3`}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-ink">
                Step {currentStep} of 3
                <span className="font-normal text-muted"> · {['Plot details', 'Boundary map', 'Documents'][currentStep - 1]}</span>
              </span>
              <span className="hidden sm:block text-xs text-muted">Autosaves as you go</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-border" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={currentStep}>
              <div className="h-full rounded-full bg-action transition-[width] duration-300" style={{ width: `${(currentStep / 3) * 100}%` }} />
            </div>
            <div className="mt-2 grid grid-cols-3 text-xs">
              {['Plot details', 'Boundary map', 'Documents'].map((label, index) => (
                <span key={label} className={`${index + 1 === currentStep ? 'font-semibold text-action-hover' : 'text-muted'} ${index === 1 ? 'text-center' : ''} ${index === 2 ? 'text-right' : ''}`}>
                  {label}
                </span>
              ))}
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
        <div className="ui-panel p-4 sm:p-6">

          {/* STEP 1: Plot & Seller Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-sm text-muted">Fields marked <span className="font-semibold text-danger">*</span> are required to continue.</div>
              <fieldset disabled={isReadOnly} className="space-y-7 border-0 p-0 m-0 min-w-0 disabled:opacity-70">
              <div>
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <User className="w-4 h-4 text-action" />
                  <span>Your contact details</span>
                </h2>
                <p className="text-sm text-muted mt-1">How the review team or interested buyers can identify and contact you.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label htmlFor="seller-full-name" className="block text-sm font-medium text-ink mb-1.5">
                      Full name <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="seller-full-name"
                      placeholder="e.g. Ahsan Khan"
                      autoComplete="name"
                      required
                      className="ui-input"
                      value={sellerInfo.fullName}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, fullName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="seller-phone-number" className="block text-sm font-medium text-ink mb-1.5">
                      WhatsApp phone number <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      placeholder="e.g. +923001234567"
                      type="tel"
                      id="seller-phone-number"
                      autoComplete="tel"
                      required
                      aria-describedby="seller-phone-help"
                      className="ui-input"
                      value={sellerInfo.phoneNumber}
                      onChange={(e) => setSellerInfo({ ...sellerInfo, phoneNumber: e.target.value })}
                    />
                    <p id="seller-phone-help" className="mt-1 text-xs text-muted">Include country code, for example +923001234567.</p>
                  </div>

                  <div>
                    <label htmlFor="seller-role" className="block text-sm font-medium text-ink mb-1.5">
                      Your relationship to the plot
                    </label>
                    <select
                      id="seller-role"
                      className="ui-input"
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
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-action" />
                  <span>Plot details</span>
                </h2>
                <p className="text-sm text-muted mt-1">Enter the plot’s location, size, type, and asking price.</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label htmlFor="plot-city" className="block text-sm font-medium text-ink mb-1.5">
                      City <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="plot-city"
                      required
                      className="ui-input"
                      value={plotDetails.city}
                      onChange={(e) => setPlotDetails({ ...plotDetails, city: e.target.value })}
                    >
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plot-society" className="block text-sm font-medium text-ink mb-1.5">
                      Society / housing scheme <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="plot-society"
                      placeholder="e.g. Gulberg Greens"
                      required
                      className="ui-input"
                      value={plotDetails.society}
                      onChange={(e) => setPlotDetails({ ...plotDetails, society: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="plot-number" className="block text-sm font-medium text-ink mb-1.5">
                      Plot number / ID <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="text"
                      id="plot-number"
                      placeholder="e.g. Plot-101"
                      required
                      className="ui-input font-mono"
                      value={plotDetails.plotNumber}
                      onChange={(e) => setPlotDetails({ ...plotDetails, plotNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-4">
                  <div>
                    <label htmlFor="plot-size" className="block text-sm font-medium text-ink mb-1.5">
                      Plot size / dimensions <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <select
                      id="plot-size"
                      required
                      className="ui-input"
                      value={plotDetails.sizeDimensions}
                      onChange={(e) => setPlotDetails({ ...plotDetails, sizeDimensions: e.target.value })}
                    >
                      {getPlotSizeOptions(plotDetails.category).map(({ label, value }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plot-category" className="block text-sm font-medium text-ink mb-1.5">
                      Plot use
                    </label>
                    <select
                      id="plot-category"
                      className="ui-input"
                      value={plotDetails.category}
                      onChange={(e) => {
                        const category = e.target.value;
                        const sizeOptions = getPlotSizeOptions(category);
                        const sizeDimensions = sizeOptions.some(({ value }) => value === plotDetails.sizeDimensions)
                          ? plotDetails.sizeDimensions
                          : DEFAULT_PLOT_SIZE_BY_CATEGORY[category];
                        setPlotDetails({ ...plotDetails, category, sizeDimensions });
                      }}
                    >
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="plot-price" className="block text-sm font-medium text-ink mb-1.5">
                      Asking price (PKR) <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                    <input
                      type="number"
                      id="plot-price"
                      placeholder="e.g. 18500000"
                      min="1"
                      required
                      className="ui-input"
                      value={plotDetails.pricePkr}
                      onChange={(e) => setPlotDetails({ ...plotDetails, pricePkr: e.target.value })}
                    />
                    {plotDetails.pricePkr && (
                      <p className="text-xs font-medium text-action-hover mt-1 font-mono">
                        {formatPkr(plotDetails.pricePkr)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="plot-proximity-notes" className="block text-sm font-medium text-ink mb-1.5">
                    Nearby landmarks or access notes <span className="font-normal text-muted">(optional)</span>
                  </label>
                  <textarea
                    id="plot-proximity-notes"
                    rows={3}
                    placeholder="e.g. 200m from Main Expressway, 500m from Mosque, 30ft wide front road"
                    className="ui-input"
                    value={plotDetails.proximityNotes}
                    onChange={(e) => setPlotDetails({ ...plotDetails, proximityNotes: e.target.value })}
                  />
                </div>
              </div>

              </fieldset>

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ui-button-primary ui-focus-ring"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-action" />
                    <span>Map the plot boundary</span>
                  </h2>
                  <p className="text-sm text-muted mt-1">
                    Search for the society or landmark, then click each plot corner in order. Add at least three points; drag the outline or its points to adjust.
                  </p>
                  <p className="text-xs text-muted mt-1">This is a technical map-area check, not legal or cadastral verification.</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={handleRemoveLastPoint}
                    disabled={isReadOnly || polygonCoordinates.length === 0}
                    className="ui-button-secondary ui-focus-ring disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Undo Point</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearPolygon}
                    disabled={isReadOnly || polygonCoordinates.length === 0}
                    className="ui-button-quiet ui-focus-ring text-danger hover:bg-danger-soft disabled:opacity-50"
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
                      <div className="relative h-[min(58vh,34rem)] min-h-[24rem] overflow-hidden rounded-card border border-border bg-surface-subtle sm:h-[28rem]">
                        <GoogleMap
                          mapContainerStyle={MAP_CONTAINER_STYLE}
                          center={DEFAULT_CENTER}
                          zoom={15}
                          onLoad={onMapLoad}
                          onClick={isReadOnly ? undefined : handleMapClick}
                          options={SELL_MAP_OPTIONS}
                        >
                          {/* Search Bar Overlay */}
                          <div className="absolute top-3 left-3 right-14 z-10 sm:left-1/2 sm:right-auto sm:w-[min(24rem,calc(100%-2rem))] sm:-translate-x-1/2">
                            <Autocomplete
                              onLoad={onAutocompleteLoad}
                              onPlaceChanged={onPlaceChanged}
                            >
                              <input
                                type="text"
                                aria-label="Search plot location on map"
                                placeholder="Search society, sector, landmark"
                                className="ui-input bg-surface/95 shadow-raised"
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

                        </GoogleMap>
                      </div>
                    )}
                  </>
                )}
              </GoogleMapsSafeLoader>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted" aria-label="Map legend">
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-action bg-action/30" aria-hidden="true" />
                  Your mapped boundary
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm border border-slate-500 bg-slate-500/20" aria-hidden="true" />
                  Registered plot boundaries
                </span>
                {boundaryConflict.hasConflict && (
                  <span className="flex items-center gap-2 font-medium text-danger">
                    <span className="h-3 w-3 rounded-sm border border-danger bg-danger/30" aria-hidden="true" />
                    Overlap detected
                  </span>
                )}
              </div>

              {/* Boundary Overlap Warning Banner */}
              {boundaryConflict.hasConflict && (
                <div className="ui-alert-danger flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold">Boundary overlap detected</p>
                    <p className="leading-relaxed">
                      Your boundary overlaps with existing registered plot{' '}
                      <span className="font-semibold underline">
                        {boundaryConflict.conflictingPlot?.title || boundaryConflict.conflictingPlot?.id}
                      </span>
                      . Adjust the mapped outline so it no longer overlaps this registered boundary.
                    </p>
                  </div>
                </div>
              )}

              {/* Technical area comparison */}
              {polygonCoordinates.length >= 3 && areaVerification && (
                <section className={`rounded-card border p-4 transition ${areaVerification.isValid ? 'border-action/25 bg-action-soft/50' : 'border-caution/30 bg-caution-soft/60'}`} aria-labelledby="area-check-title">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <Scale className={`w-4 h-4 ${areaVerification.isValid ? 'text-action-hover' : 'text-caution'}`} />
                      <h3 id="area-check-title" className="text-sm font-semibold text-ink">
                        Technical area check
                      </h3>
                    </div>
                    <div>
                      {areaVerification.isValid ? (
                        <span className="ui-badge-success">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Meets area threshold
                        </span>
                      ) : (
                        <span className="ui-badge-caution">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Below 90% threshold
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                    <p><span className="block text-xs text-muted">Declared size</span><span className="font-semibold text-ink">{areaVerification.claimed.raw} · ~{areaVerification.claimed.sqFt.toLocaleString()} sq ft</span></p>
                    <p><span className="block text-xs text-muted">Mapped area</span><span className="font-semibold text-ink">~{areaVerification.calculated.sqFt.toLocaleString()} sq ft · {Math.round(areaVerification.calculated.sqMeters)} sq m</span></p>
                    <p><span className="block text-xs text-muted">Area ratio · minimum 90%</span><span className={`font-semibold ${areaVerification.isValid ? 'text-action-hover' : 'text-caution'}`}>{areaVerification.percentage}%</span></p>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border" role="progressbar" aria-label="Mapped area relative to declared area" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.min(areaVerification.percentage, 100)}>
                    <div className={`h-full transition-all duration-500 ${areaVerification.isValid ? 'bg-action' : 'bg-caution'}`} style={{ width: `${Math.min(areaVerification.percentage, 100)}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted">This compares the drawn polygon area with the declared plot-size estimate; it does not confirm legal boundaries, ownership, or on-site dimensions.</p>

                  {!areaVerification.isValid && (
                    <div className="mt-3 text-sm leading-relaxed text-caution">
                      <strong>Update the outline:</strong> It covers only{' '}
                      <strong>{areaVerification.calculated.sqFt.toLocaleString()} sq ft</strong> ({areaVerification.percentage}%), which is below the required 90% threshold ({areaVerification.minRequiredSqFt.toLocaleString()} sq ft) of your claimed {areaVerification.claimed.raw}. Please extend your boundary points to match the full plot area before proceeding.
                    </div>
                  )}
                </section>
              )}

              <section className="space-y-3" aria-labelledby="boundary-points-title">
                <div className="flex items-center justify-between">
                  <span id="boundary-points-title" className="text-sm font-semibold text-ink">
                    Boundary points <span className="font-normal text-muted">({polygonCoordinates.length})</span>
                  </span>
                  {boundaryConflict.hasConflict ? (
                    <span className="ui-badge-danger">
                      <AlertCircle className="w-3 h-3" />
                      Overlap detected
                    </span>
                  ) : polygonCoordinates.length >= 3 ? (
                    <span className="ui-badge-success">
                      <CheckCircle2 className="w-3 h-3" />
                      3+ points placed
                    </span>
                  ) : (
                    <span className="ui-badge-caution">
                      Add {3 - polygonCoordinates.length} more {3 - polygonCoordinates.length === 1 ? 'point' : 'points'}
                    </span>
                  )}
                </div>

                {polygonCoordinates.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 border-y border-border py-2 font-mono text-xs text-muted">
                    {polygonCoordinates.map((pt, idx) => (
                      <div key={idx} className="flex gap-2 py-1">
                        <span className="font-semibold text-action-hover">Point {idx + 1}</span>
                        <span>{pt.lat}, {pt.lng}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">
                    No points yet. Search for the plot, then tap or click its corners on the map.
                  </p>
                )}
              </section>

              <div className="flex justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="ui-button-secondary ui-focus-ring"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ui-button-primary ui-focus-ring"
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
              <div>
                <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                  <FileText className="w-5 h-5 text-action" />
                  <span>Upload documents for review</span>
                </h2>
                <p className="text-sm text-muted mt-1">
                  Add the allotment or transfer letter to submit. CNIC front and back are optional supporting documents.
                </p>
              </div>

              <div className="ui-alert-info space-y-1.5">
                <p className="font-semibold">What the review checks</p>
                <p className="text-sm">
                  The document review may read names, plot number, society, and stated size, compare them with your listing and CNIC, and flag unclear or conflicting information for operator review.
                </p>
                <p className="text-xs">
                  This automated comparison does not confirm legal ownership, title, or document authenticity. Your listing remains under review after submission.
                </p>
              </div>

              {docError && (
                <div className="ui-alert-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-danger mt-0.5" />
                  <span>{docError}</span>
                </div>
              )}

              <fieldset disabled={isReadOnly} className="border-0 p-0 m-0 min-w-0 disabled:opacity-70">
                <div className="divide-y divide-border border-y border-border">
                  {[
                    { field: 'allotmentLetter', title: 'Allotment / transfer letter', detail: 'Required · Used to compare the listed plot number, society, allottee name, and stated size.', required: true },
                    { field: 'cnicFront', title: 'CNIC front', detail: 'Optional · Used for name and identity comparison with the seller details and allotment letter.', required: false },
                    { field: 'cnicBack', title: 'CNIC back', detail: 'Optional · Supporting identity document for operator review.', required: false },
                  ].map(({ field, title, detail, required }) => {
                    const file = uploadedFiles[field];
                    const uploading = !!docUploading[field];
                    return (
                      <div key={field} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-3">
                          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-action" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink">
                              {title} {required ? <span className="text-danger" aria-label="required">*</span> : <span className="font-normal text-muted">(optional)</span>}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">{detail}</p>
                            <p className="mt-1 text-xs text-muted">PDF or image · Maximum 10 MB</p>
                            {uploading ? (
                              <p className="mt-2 flex items-center gap-2 text-sm text-muted" role="status">
                                <Loader2 className="h-4 w-4 animate-spin text-action" />
                                Uploading file… please wait
                              </p>
                            ) : file ? (
                              <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-action-hover" role="status">
                                <Check className="h-4 w-4 shrink-0" />
                                <span className="truncate font-medium">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(field)}
                                  className="ui-button-quiet ui-focus-ring min-h-8 px-2 text-danger"
                                  aria-label={`Remove ${title}`}
                                >
                                  <X className="h-4 w-4" />
                                  Remove
                                </button>
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-muted">No file uploaded</p>
                            )}
                          </div>
                        </div>
                        <label className="ui-button-secondary ui-focus-ring shrink-0 cursor-pointer">
                          {uploading ? 'Uploading…' : file ? 'Replace file' : 'Choose file'}
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="sr-only"
                            aria-label={`Choose ${title} (PDF or image, maximum 10 MB)`}
                            onChange={(e) => handleFileChange(field, e)}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="ui-button-secondary ui-focus-ring disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleSubmitListing}
                  disabled={submitting || isReadOnly}
                  className="ui-button-primary ui-focus-ring disabled:opacity-50"
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
