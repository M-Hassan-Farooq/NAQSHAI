'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
  X,
  FileText,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  User,
  Phone,
  Building2,
  Trash2,
  ChevronDown,
  Scale,
  Bot,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';

// Operator review console. A single operator unlocks it with the shared passphrase
// (OPERATOR_PASSPHRASE, a server secret), which is then sent as a bearer token to
// the operator-gated endpoints. The passphrase lives only in memory + sessionStorage
// on the operator's own device; it is never baked into the bundle. The service-role
// key that actually performs the privileged DB work stays entirely server-side.

const PASS_STORAGE_KEY = 'naqshai_operator_passphrase';

function timeAgo(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  if (secs < 60) return 'just now';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

function formatPkr(v) {
  const n = Number(v);
  if (!v || Number.isNaN(n)) return v ? `PKR ${v}` : '—';
  return `PKR ${n.toLocaleString('en-US')}`;
}

// Extract clean numeric [{x,y}] screen points (viewBox 0..100, north up) for a
// lightweight boundary preview. Returns null when there is nothing to draw.
function polygonToSvgPoints(polygon) {
  const pts = (polygon || [])
    .map((p) => ({ lat: Number(p?.lat), lng: Number(p?.lng) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (pts.length < 3) return null;

  const lats = pts.map((p) => p.lat);
  const lngs = pts.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const spanLat = maxLat - minLat || 1e-6;
  const spanLng = maxLng - minLng || 1e-6;
  const pad = 8; // leave a margin inside the 100x100 box

  return pts
    .map((p) => {
      const x = pad + ((p.lng - minLng) / spanLng) * (100 - pad * 2);
      const y = pad + (1 - (p.lat - minLat) / spanLat) * (100 - pad * 2); // invert: north up
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function polygonCentroid(polygon) {
  const pts = (polygon || [])
    .map((p) => ({ lat: Number(p?.lat), lng: Number(p?.lng) }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
  if (!pts.length) return null;
  const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
  const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
  return { lat, lng };
}

export default function ReviewPage() {
  // Gate state
  const [authed, setAuthed] = useState(false);
  const [booting, setBooting] = useState(true);
  const [passInput, setPassInput] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [gateError, setGateError] = useState('');

  // Queue state
  const [listings, setListings] = useState([]);
  const [verifiedPlots, setVerifiedPlots] = useState([]);
  const [expandedListingId, setExpandedListingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Per-card action state
  const [action, setAction] = useState({ id: null, type: null }); // type: 'approve' | 'reject'
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notice, setNotice] = useState('');
  const [removalTarget, setRemovalTarget] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // The passphrase we authenticate with lives in a ref-like state that we never
  // render into an input, so it is not echoed back to the screen.
  const [passphrase, setPassphrase] = useState('');

  const fetchQueue = useCallback(async (pass) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/review', {
        headers: { Authorization: `Bearer ${pass}` },
      });
      if (res.status === 403) {
        // Bad/expired passphrase — drop back to the gate.
        try { sessionStorage.removeItem(PASS_STORAGE_KEY); } catch (_) {}
        setAuthed(false);
        setPassphrase('');
        setGateError('That passphrase was not accepted.');
        setListings([]);
        setVerifiedPlots([]);
        return false;
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        setError(json.error || 'Could not load the review queue.');
        setListings([]);
        setVerifiedPlots([]);
        return false;
      }
      setListings(json.listings || []);
      setVerifiedPlots(json.verifiedPlots || []);
      setAuthed(true);
      setPassphrase(pass);
      try { sessionStorage.setItem(PASS_STORAGE_KEY, pass); } catch (_) {}
      return true;
    } catch {
      setError('Network error while loading the review queue.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, silently resume a session if a passphrase was already accepted in
  // this tab. The kickoff is deferred out of the effect body so we never call
  // setState synchronously during commit (which triggers cascading renders).
  useEffect(() => {
    document.title = 'Review Console · NAQSHAI';
    let cancelled = false;
    let stored = '';
    try { stored = sessionStorage.getItem(PASS_STORAGE_KEY) || ''; } catch (_) {}
    const t = setTimeout(async () => {
      if (cancelled) return;
      if (stored) await fetchQueue(stored);
      if (!cancelled) setBooting(false);
    }, 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [fetchQueue]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    const pass = passInput.trim();
    if (!pass) {
      setGateError('Enter the operator passphrase to continue.');
      return;
    }
    setGateError('');
    setUnlocking(true);
    const ok = await fetchQueue(pass);
    setUnlocking(false);
    if (ok) setPassInput('');
  };

  const handleLock = () => {
    try { sessionStorage.removeItem(PASS_STORAGE_KEY); } catch (_) {}
    setAuthed(false);
    setPassphrase('');
    setPassInput('');
    setListings([]);
    setVerifiedPlots([]);
    setGateError('');
    setNotice('');
  };

  const handleApprove = async (id) => {
    setNotice('');
    setError('');
    setAction({ id, type: 'approve' });
    try {
      const res = await fetch(`/api/drafts/${id}/approve`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${passphrase}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setNotice(`Approved & published${json.plotId ? ` as ${json.plotId}` : ''}.`);
      } else {
        setError(json.error || 'Could not approve this listing.');
      }
    } catch {
      setError('Network error while approving the listing.');
    } finally {
      setAction({ id: null, type: null });
    }
  };

  const handleReject = async (id) => {
    setNotice('');
    setError('');
    setAction({ id, type: 'reject' });
    try {
      const res = await fetch(`/api/drafts/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${passphrase}` },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setRejectingId(null);
        setRejectReason('');
        setNotice('Listing returned to the owner for changes.');
      } else {
        setError(json.error || 'Could not reject this listing.');
      }
    } catch {
      setError('Network error while rejecting the listing.');
    } finally {
      setAction({ id: null, type: null });
    }
  };

  const handleCopySerial = async (serial, id) => {
    if (!serial) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(serial);
      } else {
        const el = document.createElement('textarea');
        el.value = serial;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedId(id);
      setTimeout(() => {
        setCopiedId((prev) => (prev === id ? null : prev));
      }, 2500);
    } catch (err) {
      console.warn('Failed to copy serial:', err);
    }
  };

  const handleRunAiVerification = async (id) => {
    setVerifyingId(id);
    setError('');
    try {
      const res = await fetch('/api/review/verify-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${passphrase}`,
        },
        body: JSON.stringify({ draftId: id }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success && (json.ai_verification_report || json.report || json.aiVerification)) {
        const report = json.ai_verification_report || json.report || json.aiVerification;
        setListings((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  aiVerification: report,
                  ai_verification_report: report,
                  document_serial_number: report.extracted_serial_or_qr || item.document_serial_number,
                  authority_doc_type: report.detected_authority !== 'UNKNOWN' ? report.detected_authority : item.authority_doc_type,
                }
              : item
          )
        );
        setNotice('AI Document & Portal Verification audit complete.');
      } else {
        setError(json.error || 'AI verification failed.');
      }
    } catch {
      setError('Network error while running AI verification.');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleRemoveVerifiedPlot = async (plot) => {
    setNotice('');
    setError('');
    setAction({ id: plot.id, type: 'remove' });
    try {
      const res = await fetch(`/api/review/plots/${encodeURIComponent(plot.id)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${passphrase}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setVerifiedPlots((prev) => prev.filter((item) => item.id !== plot.id));
        setRemovalTarget(null);
        setNotice(`${plot.title} was removed from the live marketplace.`);
      } else {
        setError(json.error || 'Could not remove this verified plot.');
      }
    } catch {
      setError('Network error while removing the verified plot.');
    } finally {
      setAction({ id: null, type: null });
    }
  };

  // ---- Boot (resuming a stored session) ---------------------------------
  if (booting) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Opening review console…</span>
        </div>
      </div>
    );
  }

  // ---- Gate screen -------------------------------------------------------
  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-2xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Review Console</h1>
            <p className="text-sm text-slate-600 mt-2">
              Operator access only. Enter the shared passphrase to review submitted listings.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="mt-6 space-y-4">
            <div>
              <label htmlFor="passphrase" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Operator passphrase
              </label>
              <input
                id="passphrase"
                type="password"
                autoComplete="off"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-500"
              />
            </div>

            {gateError && (
              <div className="flex items-start gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{gateError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={unlocking}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {unlocking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Unlocking…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Unlock console
                </>
              )}
            </button>
          </form>

          <Link href="/" className="mt-6 block text-center text-xs font-medium text-slate-500 hover:text-emerald-700">
            ← Back to NAQSHAI
          </Link>
        </div>
      </div>
    );
  }

  // ---- Console -----------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-emerald-500/20 shadow-sm">
                <Image alt="NAQSHAI Mascot Logo" className="object-cover" fill src="/Masaod.jpeg" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">NAQSHAI</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full hidden sm:inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Review Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchQueue(passphrase)}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5 disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleLock}
              className="bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            Listings awaiting verification
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl">
            Review the seller details, boundary, and documents for each submitted plot. Approving publishes a
            verified plot to the public 3D map; rejecting returns it to the owner with your note so they can fix and
            resubmit.
          </p>
        </div>

        {notice && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <span className="font-medium">{notice}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={() => fetchQueue(passphrase)}
              className="text-xs font-semibold text-red-700 underline hover:text-red-800 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 flex items-center justify-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            Loading the review queue…
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Queue is clear</h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto">
              There are no listings awaiting verification right now. New submissions will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((l) => {
              const svgPoints = polygonToSvgPoints(l.polygon);
              const centroid = polygonCentroid(l.polygon);
              const busy = action.id === l.id;
              const isRejecting = rejectingId === l.id;
              const isExpanded = expandedListingId === l.id;
              return (
                <div
                  key={l.id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 sm:p-5"
                >
                  {/* Header row */}
                  <button
                    type="button"
                    onClick={() => setExpandedListingId(isExpanded ? null : l.id)}
                    className="w-full text-left flex items-start justify-between gap-3 pb-1"
                    aria-expanded={isExpanded}
                  >
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        {l.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted {timeAgo(l.updated_at)}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {l.plot.city || '—'} · {l.plot.sizeDimensions || 'Size not provided'} · {formatPkr(l.plot.pricePkr)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {(l.ai_verification_report || l.aiVerification) && (
                        (() => {
                          const rep = l.ai_verification_report || l.aiVerification;
                          const score = rep.confidence_score ?? rep.confidenceScore ?? 0;
                          const verdict = rep.verdict || rep.overallStatus;
                          const badgeClass =
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : score >= 50
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-rose-50 text-rose-800 border-rose-200';
                          return (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                              AI: {score}% Match {verdict ? `(${verdict})` : ''}
                            </span>
                          );
                        })()
                      )}
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border bg-sky-50 text-sky-800 border-sky-200">
                        Awaiting review
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {isExpanded && <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Seller + plot details */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Seller</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <User className="w-4 h-4 text-slate-400" />
                            {l.seller.fullName || '—'}
                          </span>
                          <span className="flex items-center gap-1.5 text-slate-700">
                            <Phone className="w-4 h-4 text-slate-400" />
                            {l.seller.phoneNumber || '—'}
                          </span>
                          {l.seller.sellerRole && (
                            <span className="flex items-center gap-1.5 text-slate-500">
                              <Building2 className="w-4 h-4 text-slate-400" />
                              {l.seller.sellerRole}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Plot</p>
                        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2.5 text-sm">
                          <div>
                            <dt className="text-xs text-slate-400">Demand price</dt>
                            <dd className="font-semibold text-slate-800">{formatPkr(l.plot.pricePkr)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Size</dt>
                            <dd className="font-medium text-slate-700">{l.plot.sizeDimensions || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Category</dt>
                            <dd className="font-medium text-slate-700">{l.plot.category || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Plot number</dt>
                            <dd className="font-medium text-slate-700">{l.plot.plotNumber || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Society</dt>
                            <dd className="font-medium text-slate-700">{l.plot.society || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">City</dt>
                            <dd className="font-medium text-slate-700">{l.plot.city || '—'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Regulatory Authority Clearance (CDA / RDA) */}
                      {l.regulatory && (
                        <div className={`p-3.5 rounded-xl border ${
                          l.regulatory.tier === 'unauthorized'
                            ? 'bg-amber-50/70 border-amber-200'
                            : l.regulatory.tier === 'conditional'
                            ? 'bg-amber-50/70 border-amber-200'
                            : 'bg-emerald-50/60 border-emerald-200'
                        }`}>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5">
                              <ShieldCheck className={`w-4 h-4 ${
                                l.regulatory.tier === 'unauthorized'
                                  ? 'text-amber-600'
                                  : l.regulatory.tier === 'conditional'
                                  ? 'text-amber-600'
                                  : 'text-emerald-700'
                              }`} />
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Regulatory Clearance ({l.regulatory.authority})
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${l.regulatory.badgeClass}`}>
                              {l.regulatory.badgeText}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
                            <div>
                              <span className="text-slate-500 font-medium">Jurisdiction: </span>
                              <span className="font-semibold">{l.regulatory.jurisdiction}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 font-medium">Layout Plan: </span>
                              <span className="font-semibold">{l.regulatory.lopStatus}</span>
                            </div>
                            <div className="sm:col-span-2">
                              <span className="text-slate-500 font-medium">NOC / Gazette: </span>
                              <span className="font-mono text-[11px] font-semibold text-slate-800">{l.regulatory.nocNumber}</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
                            {l.regulatory.summary}
                          </p>

                          {l.regulatory.warning && (
                            <div className={`mt-2 p-2 rounded-lg text-[11px] font-medium flex items-start gap-1.5 ${
                              l.regulatory.tier === 'unauthorized'
                                ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                                : 'bg-amber-100/90 text-amber-900 border border-amber-300'
                            }`}>
                              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{l.regulatory.warning}</span>
                            </div>
                          )}

                          {l.regulatory.officialVerificationUrl && (
                            <div className="mt-2 text-right">
                              <a
                                href={l.regulatory.officialVerificationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline"
                              >
                                <span>Check {l.regulatory.authority} Official Portal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Documents */}
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Documents</p>
                        {l.documents && l.documents.length ? (
                          <div className="flex flex-wrap gap-2">
                            {l.documents.map((doc) =>
                              doc.signedUrl ? (
                                <a
                                  key={doc.field}
                                  href={doc.signedUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {doc.label}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span
                                  key={doc.field}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg"
                                  title="File reference could not be loaded"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  {doc.label} (unavailable)
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">No documents attached.</p>
                        )}
                      </div>

                      {/* AI Document & Portal Verification Audit Panel */}
                      {(() => {
                        const report = l.ai_verification_report || l.aiVerification;
                        const score = report?.confidence_score ?? report?.confidenceScore ?? 0;
                        const verdict = report?.verdict || report?.overallStatus || '';
                        const checks = report?.checks || {
                          name_matches_claim: report?.cnicAudit?.nameMatch,
                          plot_matches_claim: report?.allotmentAudit?.plotMatch,
                          size_matches_claim: report?.allotmentAudit?.sizeMatch !== false,
                          polygon_area_reasonable: true,
                          serial_number_present: Boolean(report?.extracted_serial_or_qr || l.document_serial_number),
                        };
                        const flags = (report?.flags && Array.isArray(report.flags) && report.flags.length > 0)
                          ? report.flags
                          : (report?.redFlags || []);
                        const serialNumber = report?.extracted_serial_or_qr || l.document_serial_number || '';
                        const detectedAuthority = (report?.detected_authority || l.authority_doc_type || 'UNKNOWN').toUpperCase();
                        const isPlra = detectedAuthority.includes('PLRA') || detectedAuthority.includes('FARD');
                        const isEstamp = detectedAuthority.includes('ESTAMP') || detectedAuthority.includes('STAMP');
                        const isCda = detectedAuthority.includes('CDA') || detectedAuthority.includes('SOCIETY');

                        return (
                          <div className="pt-4 border-t border-slate-100 space-y-4">
                            {/* Panel Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                  <Bot className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                      AI Document &amp; Portal Verification
                                    </span>
                                    {report && (
                                      <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                          score >= 80
                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                            : score >= 50
                                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                                            : 'bg-rose-50 text-rose-800 border-rose-200'
                                        }`}
                                      >
                                        {score}% Match {verdict ? `· ${verdict}` : ''}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-normal">
                                    Gemini 2.5 Flash Multimodal Vision OCR + Official Authority Check
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRunAiVerification(l.id)}
                                disabled={verifyingId === l.id}
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition disabled:opacity-50 cursor-pointer shadow-2xs self-start sm:self-auto shrink-0"
                                title="Run or re-run AI document audit"
                              >
                                {verifyingId === l.id ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                                    <span>Auditing…</span>
                                  </>
                                ) : (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>{report ? 'Re-run AI Document Audit' : 'Run AI Document Audit'}</span>
                                  </>
                                )}
                              </button>
                            </div>

                            {report ? (
                              <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                {/* Summary banner */}
                                <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs">
                                  <span className="font-bold text-slate-900">AI Audit Summary: </span>
                                  <span>{report.summary || 'Document audit completed.'}</span>
                                </div>

                                {/* Cross-Match Checklist Pills */}
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Field-by-Field Cross-Match Checklist
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    {/* Owner Name Match */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${
                                      checks.name_matches_claim
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}>
                                      <span>{checks.name_matches_claim ? '✓' : '⚠️'}</span>
                                      <span>Owner Name:</span>
                                      <strong className="font-semibold">{report.extracted_owner_name || l.seller.fullName || 'Not detected'}</strong>
                                    </span>

                                    {/* CNIC Extracted */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${
                                      report.extracted_cnic
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}>
                                      <span>{report.extracted_cnic ? '✓' : '⚠️'}</span>
                                      <span>CNIC:</span>
                                      <strong className="font-mono font-semibold">{report.extracted_cnic || 'Missing from doc'}</strong>
                                    </span>

                                    {/* Plot # & Sector Match */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${
                                      checks.plot_matches_claim
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}>
                                      <span>{checks.plot_matches_claim ? '✓' : '⚠️'}</span>
                                      <span>Plot #:</span>
                                      <strong className="font-semibold">{report.extracted_plot_number || l.plot.plotNumber || 'Unverified'}</strong>
                                    </span>

                                    {/* Size & Polygon Match */}
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium ${
                                      checks.size_matches_claim && checks.polygon_area_reasonable
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}>
                                      <span>{checks.size_matches_claim && checks.polygon_area_reasonable ? '✓' : '⚠️'}</span>
                                      <span>Size &amp; Boundary:</span>
                                      <strong className="font-semibold">{report.extracted_size || l.plot.sizeDimensions || 'Check boundary'}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Discrepancy & Flags Callout */}
                                {flags.length > 0 && (
                                  <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs space-y-1.5">
                                    <p className="font-bold flex items-center gap-1.5 text-xs text-amber-950 uppercase tracking-wide">
                                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                      <span>Audit Flags &amp; Discrepancies ({flags.length})</span>
                                    </p>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
                                      {flags.map((flag, idx) => (
                                        <li key={idx} className="leading-snug">{flag}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* 1-Click Reverse Portal Lookup Box (Anti-Forgery Check) */}
                                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                                    <div>
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 block">
                                        Cryptographic Serial / Tracking Number Verification
                                      </span>
                                      <span className="text-[11px] text-slate-500">
                                        Copy official tracking number and verify past government CAPTCHA before approving:
                                      </span>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 self-start sm:self-auto">
                                      Authority: {detectedAuthority}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                                    {serialNumber ? (
                                      <>
                                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 tracking-wider">
                                          {serialNumber}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleCopySerial(serialNumber, l.id)}
                                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition cursor-pointer"
                                        >
                                          {copiedId === l.id ? (
                                            <>
                                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                                              <span className="text-emerald-700">Copied!</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3.5 h-3.5" />
                                              <span>Copy Serial</span>
                                            </>
                                          )}
                                        </button>
                                      </>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                                        No tracking serial detected on document
                                      </span>
                                    )}
                                  </div>

                                  {/* Deep-link action buttons to Official Government Verification Portals */}
                                  <div className="pt-2.5 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                                      Verify on Official Govt Portal:
                                    </span>
                                    <a
                                      href="https://punjab-zameen.gov.pk"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                                        isPlra
                                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm ring-2 ring-emerald-600/30'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium'
                                      }`}
                                    >
                                      <span>Verify PLRA Fard ↗</span>
                                      {isPlra && <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100">Recommended</span>}
                                    </a>

                                    <a
                                      href="https://estamp.punjab.gov.pk"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                                        isEstamp
                                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm ring-2 ring-emerald-600/30'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium'
                                      }`}
                                    >
                                      <span>Verify e-Stamp ↗</span>
                                      {isEstamp && <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100">Recommended</span>}
                                    </a>

                                    <a
                                      href="https://www.cda.gov.pk/housing/noc.asp"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                                        isCda
                                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm ring-2 ring-emerald-600/30'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium'
                                      }`}
                                    >
                                      <span>Verify CDA Record / NOC ↗</span>
                                      {isCda && <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100">Recommended</span>}
                                    </a>
                                  </div>
                                </div>

                                {/* Detailed side-by-side comparison table */}
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-[11px] border-collapse bg-white rounded-lg overflow-hidden border border-slate-200">
                                    <thead>
                                      <tr className="bg-slate-100/80 text-slate-600 border-b border-slate-200 font-semibold text-[10px] uppercase">
                                        <th className="p-2">Verification Item</th>
                                        <th className="p-2">Declared Listing</th>
                                        <th className="p-2">Extracted Document</th>
                                        <th className="p-2">Match Status</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      <tr>
                                        <td className="p-2 font-medium text-slate-700">Seller Identity (CNIC)</td>
                                        <td className="p-2 text-slate-600">{l.seller.fullName || '—'}</td>
                                        <td className="p-2 text-slate-800 font-mono">
                                          {report.extracted_owner_name || 'Not detected'}
                                          {report.extracted_cnic ? ` (${report.extracted_cnic})` : ''}
                                        </td>
                                        <td className="p-2">
                                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                                            checks.name_matches_claim
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                                          }`}>
                                            {checks.name_matches_claim ? '✓ Verified' : '⚠️ Discrepancy'}
                                          </span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="p-2 font-medium text-slate-700">Plot Number (Allotment)</td>
                                        <td className="p-2 text-slate-600">{l.plot.plotNumber || '—'}</td>
                                        <td className="p-2 text-slate-800 font-mono">
                                          {report.extracted_plot_number || 'Not detected'}
                                        </td>
                                        <td className="p-2">
                                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                                            checks.plot_matches_claim
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                                          }`}>
                                            {checks.plot_matches_claim ? '✓ Verified' : '⚠️ Discrepancy'}
                                          </span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="p-2 font-medium text-slate-700">Society / Sector</td>
                                        <td className="p-2 text-slate-600">{l.plot.society || '—'}</td>
                                        <td className="p-2 text-slate-800">
                                          {report.extracted_society_or_sector || 'Not detected'}
                                        </td>
                                        <td className="p-2">
                                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                                            checks.plot_matches_claim
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                                          }`}>
                                            {checks.plot_matches_claim ? '✓ Verified' : '⚠️ Review'}
                                          </span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="p-2 font-medium text-slate-700">Plot Size &amp; Polygon</td>
                                        <td className="p-2 text-slate-600">{l.plot.sizeDimensions || '—'}</td>
                                        <td className="p-2 text-slate-800">
                                          {report.extracted_size || 'Not detected'}
                                        </td>
                                        <td className="p-2">
                                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                                            checks.size_matches_claim && checks.polygon_area_reasonable
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-amber-50 text-amber-900 border border-amber-300'
                                          }`}>
                                            {checks.size_matches_claim && checks.polygon_area_reasonable
                                              ? '✓ Verified'
                                              : '⚠️ Check Tolerance'}
                                          </span>
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="p-2 font-medium text-slate-700">Official Tracking Serial</td>
                                        <td className="p-2 text-slate-600 font-mono">{l.document_serial_number || 'None declared'}</td>
                                        <td className="p-2 text-slate-800 font-mono">
                                          {report.extracted_serial_or_qr || 'Not detected'}
                                        </td>
                                        <td className="p-2">
                                          <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-1.5 py-0.5 rounded ${
                                            serialNumber
                                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                                          }`}>
                                            {serialNumber ? '✓ Available' : 'Optional'}
                                          </span>
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : (
                              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                <span>AI document audit has not been generated yet. Click &apos;Run AI Document Audit&apos; above to verify uploaded files.</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Boundary preview */}
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Boundary</p>
                      <div className="border border-slate-200 rounded-xl bg-slate-50 p-3">
                        {svgPoints ? (
                          <svg viewBox="0 0 100 100" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
                            <polygon
                              points={svgPoints}
                              fill="rgba(4,120,87,0.12)"
                              stroke="#047857"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <div className="text-xs text-slate-400 text-center py-6">No boundary drawn</div>
                        )}
                        <p className="text-[11px] text-slate-500 mt-2 text-center">
                          {(l.polygon?.length || 0)} boundary point{(l.polygon?.length || 0) === 1 ? '' : 's'}
                        </p>
                        {l.areaVerification && (
                          <div className={`mt-2 p-2.5 rounded-lg border text-[11px] ${
                            l.areaVerification.isValid
                              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                              : 'bg-amber-50/90 border-amber-300 text-amber-900'
                          }`}>
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="flex items-center gap-1">
                                <Scale className="w-3.5 h-3.5 shrink-0" />
                                <span>Area Verification</span>
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                l.areaVerification.isValid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-200 text-amber-900'
                              }`}>
                                {l.areaVerification.isValid
                                  ? `${l.areaVerification.percentage}% (90%–110% match)`
                                  : l.areaVerification.isOversized
                                  ? `⚠️ Oversized: ${l.areaVerification.percentage}%`
                                  : `⚠️ Undersized: ${l.areaVerification.percentage}%`}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-600 flex justify-between mt-1">
                              <span>Mapped: ~{l.areaVerification.calculated.sqFt.toLocaleString()} sq ft</span>
                              <span>Claimed: ~{l.areaVerification.claimed.sqFt.toLocaleString()} sq ft</span>
                            </div>
                            {!l.areaVerification.isValid && (
                              <p className="mt-1.5 font-semibold text-amber-900 text-[10px] leading-tight">
                                {l.areaVerification.isOversized
                                  ? `⚠️ Mapped boundary is oversized by ${l.areaVerification.percentage - 100}% (~${l.areaVerification.calculated.sqFt.toLocaleString()} vs max ${l.areaVerification.maxAllowedSqFt?.toLocaleString()} sq ft). Possible encroachment. Approval blocked.`
                                  : `⚠️ Below 90% threshold (${l.areaVerification.minRequiredSqFt.toLocaleString()} sq ft). Approval blocked.`}
                              </p>
                            )}
                          </div>
                        )}
                        {l.overlapConflict && (
                          <div className="mt-2 p-2 bg-red-100/90 border border-red-300 rounded-lg text-red-900 text-[11px] flex items-start gap-1.5 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <span>Overlaps with <strong>{l.overlapConflict.title}</strong>. Approval is blocked.</span>
                          </div>
                        )}
                        {centroid && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${centroid.lat},${centroid.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 bg-white border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            Open in Google Maps
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reject reason panel */}
                  {isRejecting && (
                    <div className="mt-4 p-4 bg-red-50/60 border border-red-200 rounded-xl">
                      <label className="block text-xs font-semibold text-red-700 mb-1.5">
                        Reason (shown to the owner)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="Explain what needs to be corrected before this listing can be published…"
                        className="w-full px-3 py-2 rounded-lg border border-red-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                      />
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleReject(l.id)}
                          disabled={busy}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {busy && action.type === 'reject' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Confirm rejection
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          disabled={busy}
                          className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-2 disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {!isRejecting && (
                    <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(l.id)}
                        disabled={busy || !!l.overlapConflict || (l.areaVerification && !l.areaVerification.isValid)}
                        title={
                          l.overlapConflict
                            ? 'Cannot approve: Boundary overlaps with another plot'
                            : l.areaVerification && !l.areaVerification.isValid
                            ? 'Cannot approve: Mapped area is below 90% of claimed area'
                            : 'Approve & publish'
                        }
                        className="flex-1 sm:flex-none bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {busy && action.type === 'approve' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve &amp; publish
                      </button>
                      <button
                        onClick={() => { setRejectingId(l.id); setRejectReason(''); setError(''); }}
                        disabled={busy}
                        className="flex-1 sm:flex-none bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-5 py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                  </div>}
                </div>
              );
            })}
          </div>
        )}

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                All plots on sale
              </h2>
              <p className="text-sm text-slate-600 mt-1">Manage every listing currently visible to buyers. Verification status is shown on each plot.</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
              {verifiedPlots.length} live
            </span>
          </div>

          {verifiedPlots.length === 0 ? (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 text-center text-sm text-slate-500">
              No verified plots are currently on sale.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedPlots.map((plot) => {
                const busy = action.id === plot.id && action.type === 'remove';
                return (
                  <article key={plot.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                          {plot.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {plot.city || '—'} · {plot.society || 'Society not provided'}
                        </p>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full shrink-0 ${plot.isVerified
                        ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                        : 'text-amber-800 bg-amber-50 border border-amber-200'
                      }`}>
                        {plot.isVerified ? 'Verified' : 'Needs verification'}
                      </span>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-sm">
                      <div>
                        <dt className="text-xs text-slate-400">Price</dt>
                        <dd className="font-semibold text-slate-800">{formatPkr(plot.pricePkr)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Size</dt>
                        <dd className="font-medium text-slate-700">{plot.sizeDimensions || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Seller</dt>
                        <dd className="font-medium text-slate-700 truncate">{plot.seller.fullName || '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-slate-400">Phone</dt>
                        <dd className="font-medium text-slate-700 truncate">{plot.seller.phoneNumber || '—'}</dd>
                      </div>
                    </dl>

                    <button
                      type="button"
                      onClick={() => setRemovalTarget(plot)}
                      disabled={busy}
                      className="mt-4 w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      Remove from sale
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {removalTarget && (
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div role="dialog" aria-modal="true" aria-labelledby="remove-plot-title" className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="remove-plot-title" className="text-lg font-bold text-slate-900">Remove plot from sale?</h2>
                  <p className="text-sm text-slate-600 mt-1">{removalTarget.title} will be removed from the live marketplace and map.</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setRemovalTarget(null)}
                  disabled={action.type === 'remove'}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveVerifiedPlot(removalTarget)}
                  disabled={action.type === 'remove'}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 flex items-center gap-2 disabled:opacity-60"
                >
                  {action.type === 'remove' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Remove plot
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
