'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  MessageSquare,
  Search,
  Filter,
  Coins,
  Award,
  Layers,
  Database,
  ArrowUpDown,
  ShieldAlert,
  Users,
  TrendingUp,
  QrCode,
  Smartphone,
  Laptop,
  Globe,
  Calendar,
} from 'lucide-react';
import VerificationCertificateModal from '@/components/VerificationCertificateModal';

// Operator review console. A single operator unlocks it with the shared passphrase
// (OPERATOR_PASSPHRASE, a server secret), which is then sent as a bearer token to
// the operator-gated endpoints. For Zero-Trust security, the passphrase lives ONLY
// in volatile React memory — it is never written to sessionStorage or localStorage.

const PASS_STORAGE_KEY = 'naqshai_operator_passphrase';

const DOC_NAMES = {
  allotmentLetter: 'Allotment Letter',
  cnicFront: 'CNIC (Front)',
  cnicBack: 'CNIC (Back)',
};

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

function formatValuationSummary(totalPkr) {
  if (!totalPkr || totalPkr <= 0) return 'PKR 0';
  if (totalPkr >= 10000000) {
    const crores = (totalPkr / 10000000).toFixed(2);
    return `PKR ${crores} Cr`;
  }
  if (totalPkr >= 100000) {
    const lacs = (totalPkr / 100000).toFixed(1);
    return `PKR ${lacs} Lac`;
  }
  return `PKR ${totalPkr.toLocaleString('en-US')}`;
}

function buildWhatsAppLink(phone, sellerName, plotTitle, society) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  let formatted = digits;
  if (formatted.startsWith('03')) {
    formatted = '92' + formatted.slice(1);
  } else if (formatted.startsWith('3') && formatted.length === 10) {
    formatted = '92' + formatted;
  }
  const cleanSeller = sellerName ? sellerName.trim() : 'Respected Seller';
  const text = `Assalam-o-Alaikum ${cleanSeller}, this is NAQSHAI Verification Desk regarding your plot "${plotTitle || 'Plot'}" in ${society || 'Islamabad'}. We are auditing your cadastre submission for official verification.`;
  return `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`;
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

  // Queue & console state
  const [listings, setListings] = useState([]);
  const [verifiedPlots, setVerifiedPlots] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [visitorAnalytics, setVisitorAnalytics] = useState({
    totalVisitors: 0,
    totalPageviews: 0,
    totalQrScans: 0,
    liveVisitorsNow: 0,
    todayVisitors: 0,
    todayPageviews: 0,
    deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
    topPages: [],
    topSources: [],
    dailyTrend: [],
    recentVisits: [],
  });
  const [stats, setStats] = useState({ rejectedCount: 0, pendingCount: 0, verifiedCount: 0 });
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'verified' | 'logs' | 'analytics'
  const [expandedListingId, setExpandedListingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Per-card action state
  const [action, setAction] = useState({ id: null, type: null }); // type: 'approve' | 'reject' | 'remove'
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [notice, setNotice] = useState('');
  const [removalTarget, setRemovalTarget] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedHash, setCopiedHash] = useState(null);
  const [certificateTarget, setCertificateTarget] = useState(null);

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('ALL');
  const [verdictFilter, setVerdictFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('oldest');

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
      const json = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setAuthed(false);
        setPassphrase('');
        setGateError(json.error || 'Security Lockout: Too many failed attempts. Access blocked for 15 minutes.');
        setListings([]);
        setVerifiedPlots([]);
        setAuditLogs([]);
        return false;
      }
      if (res.status === 403) {
        // Bad/expired passphrase — drop back to the gate.
        setAuthed(false);
        setPassphrase('');
        setGateError(json.error || 'That passphrase was not accepted.');
        setListings([]);
        setVerifiedPlots([]);
        setAuditLogs([]);
        return false;
      }
      if (!res.ok || !json.success) {
        setError(json.error || 'Could not load the review queue.');
        setListings([]);
        setVerifiedPlots([]);
        setAuditLogs([]);
        return false;
      }
      setListings(json.listings || []);
      setVerifiedPlots(json.verifiedPlots || []);
      setAuditLogs(json.auditLogs || []);
      if (json.visitorAnalytics) {
        setVisitorAnalytics(json.visitorAnalytics);
      }
      setStats(json.stats || {
        rejectedCount: 0,
        pendingCount: (json.listings || []).length,
        verifiedCount: (json.verifiedPlots || []).length,
      });
      setAuthed(true);
      setPassphrase(pass);
      // Zero-Trust: ensure administrative passphrase never sits in browser storage
      try { sessionStorage.removeItem(PASS_STORAGE_KEY); } catch (_) {}
      return true;
    } catch {
      setError('Network error while loading the review queue.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, initialize gate in volatile memory (never read from persistent storage).
  useEffect(() => {
    document.title = 'Review Console · NAQSHAI';
    try { sessionStorage.removeItem(PASS_STORAGE_KEY); } catch (_) {}
    setBooting(false);
  }, []);

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
    setAuditLogs([]);
    setVisitorAnalytics({
      totalVisitors: 0,
      totalPageviews: 0,
      totalQrScans: 0,
      liveVisitorsNow: 0,
      todayVisitors: 0,
      todayPageviews: 0,
      deviceBreakdown: { mobile: 0, desktop: 0, tablet: 0 },
      topPages: [],
      topSources: [],
      dailyTrend: [],
      recentVisits: [],
    });
    setStats({ rejectedCount: 0, pendingCount: 0, verifiedCount: 0 });
    setGateError('');
    setNotice('');
    setCertificateTarget(null);
    setSearchQuery('');
    setActiveTab('queue');
  };

  const handleCopyHash = async (hash, logId) => {
    if (!hash) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(hash);
      } else {
        const el = document.createElement('textarea');
        el.value = hash;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedHash(logId);
      setTimeout(() => {
        setCopiedHash((prev) => (prev === logId ? null : prev));
      }, 2500);
    } catch (_) {}
  };

  // KPI Calculations
  const totalEncryptedDocs = useMemo(() => {
    let count = 0;
    for (const l of listings) {
      for (const d of l.documents || []) {
        if (d.encrypted) count++;
      }
    }
    return count;
  }, [listings]);

  const totalValuationPkr = useMemo(() => {
    return verifiedPlots.reduce((sum, p) => sum + (Number(p.pricePkr) || 0), 0);
  }, [verifiedPlots]);

  // Filtered Review Queue listings
  const filteredListings = useMemo(() => {
    let result = [...listings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        const title = (l.title || '').toLowerCase();
        const seller = (l.seller?.fullName || '').toLowerCase();
        const phone = (l.seller?.phoneNumber || '').toLowerCase();
        const society = (l.plot?.society || '').toLowerCase();
        const city = (l.plot?.city || '').toLowerCase();
        const plotNum = (l.plot?.plotNumber || '').toLowerCase();
        return (
          title.includes(q) ||
          seller.includes(q) ||
          phone.includes(q) ||
          society.includes(q) ||
          city.includes(q) ||
          plotNum.includes(q)
        );
      });
    }

    if (cityFilter !== 'ALL') {
      result = result.filter(
        (l) => (l.plot?.city || '').toLowerCase() === cityFilter.toLowerCase()
      );
    }

    if (verdictFilter === 'AI_VERIFIED') {
      result = result.filter((l) => {
        const rep = l.ai_verification_report || l.aiVerification;
        const score = rep?.confidence_score ?? rep?.confidenceScore ?? 0;
        return score >= 80;
      });
    } else if (verdictFilter === 'NEEDS_AUDIT') {
      result = result.filter((l) => !l.ai_verification_report && !l.aiVerification);
    } else if (verdictFilter === 'CONFLICT') {
      result = result.filter(
        (l) => !!l.overlapConflict || (l.areaVerification && !l.areaVerification.isValid)
      );
    }

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => (Number(b.plot?.pricePkr) || 0) - (Number(a.plot?.pricePkr) || 0));
    } else if (sortOrder === 'price_asc') {
      result.sort((a, b) => (Number(a.plot?.pricePkr) || 0) - (Number(b.plot?.pricePkr) || 0));
    }

    return result;
  }, [listings, searchQuery, cityFilter, verdictFilter, sortOrder]);

  // Filtered Verified Live Plots
  const filteredVerifiedPlots = useMemo(() => {
    let result = [...verifiedPlots];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const title = (p.title || '').toLowerCase();
        const seller = (p.seller?.fullName || '').toLowerCase();
        const phone = (p.seller?.phoneNumber || '').toLowerCase();
        const society = (p.society || '').toLowerCase();
        const city = (p.city || '').toLowerCase();
        return (
          title.includes(q) ||
          seller.includes(q) ||
          phone.includes(q) ||
          society.includes(q) ||
          city.includes(q)
        );
      });
    }

    if (cityFilter !== 'ALL') {
      result = result.filter(
        (p) => (p.city || '').toLowerCase() === cityFilter.toLowerCase()
      );
    }

    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortOrder === 'price_desc') {
      result.sort((a, b) => (Number(b.pricePkr) || 0) - (Number(a.pricePkr) || 0));
    } else if (sortOrder === 'price_asc') {
      result.sort((a, b) => (Number(a.pricePkr) || 0) - (Number(b.pricePkr) || 0));
    }

    return result;
  }, [verifiedPlots, searchQuery, cityFilter, sortOrder]);

  // Filtered Cryptographic Document Access Logs
  const filteredAuditLogs = useMemo(() => {
    if (!searchQuery.trim()) return auditLogs;
    const q = searchQuery.toLowerCase().trim();
    return auditLogs.filter((log) => {
      return (
        (log.action || '').toLowerCase().includes(q) ||
        (log.field_name || '').toLowerCase().includes(q) ||
        (log.file_hash || '').toLowerCase().includes(q) ||
        (log.actor_role || '').toLowerCase().includes(q) ||
        (log.ip_address || '').toLowerCase().includes(q) ||
        (log.draft_id || '').toLowerCase().includes(q)
      );
    });
  }, [auditLogs, searchQuery]);

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Title & Console Description */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-700" />
            Operator Cadastral Console
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Zero-Trust administrative console. Verify seller titles, inspect encrypted deed vaults, analyze boundary area tolerances, review security logs, and generate official cadastre verification certificates.
          </p>
        </div>

        {/* Item 1: Platform KPI & Inventory Header Bar */}
        {/* Platform KPI & Inventory Header Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-3.5 mb-6">
          {/* KPI 1: Pending Reviews */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Pending</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{listings.length}</p>
              <p className="text-[10px] text-sky-700 font-medium truncate">Awaiting review</p>
            </div>
          </div>

          {/* KPI 2: Verified Live Inventory */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Inventory</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{verifiedPlots.length}</p>
              <p className="text-[10px] text-emerald-700 font-medium truncate">Live on 3D map</p>
            </div>
          </div>

          {/* KPI 3: Total Verified Valuation */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Valuation</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight" title={`PKR ${totalValuationPkr.toLocaleString()}`}>
                {formatValuationSummary(totalValuationPkr)}
              </p>
              <p className="text-[10px] text-indigo-700 font-medium truncate">Cadastre value</p>
            </div>
          </div>

          {/* KPI 4: Total Visitors All-Time */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">All-Time Visitors</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{visitorAnalytics.totalVisitors.toLocaleString()}</p>
              <p className="text-[10px] text-emerald-700 font-medium truncate">{visitorAnalytics.totalPageviews} total views</p>
            </div>
          </div>

          {/* KPI 5: Panaflex QR Scans */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">QR Banner Scans</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{visitorAnalytics.totalQrScans.toLocaleString()}</p>
              <p className="text-[10px] text-amber-700 font-medium truncate">{visitorAnalytics.liveVisitorsNow} live online</p>
            </div>
          </div>

          {/* KPI 6: Encrypted Vault Deeds */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 truncate">Encrypted Deeds</p>
              <p className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">{totalEncryptedDocs}</p>
              <p className="text-[10px] text-teal-700 font-medium truncate">AES-256 vault</p>
            </div>
          </div>
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

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-2xs ${
              activeTab === 'queue'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Review Queue</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'queue' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {listings.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verified')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-2xs ${
              activeTab === 'verified'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Verified Inventory</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'verified' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {verifiedPlots.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-2xs ${
              activeTab === 'logs'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Security Audit Logs</span>
            <span className={`text-[11px] px-2 py-0.5 rounded-full font-extrabold ${
              activeTab === 'logs' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {auditLogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-2xs ${
              activeTab === 'analytics'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Visitor Analytics</span>
            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1.5 ${
              activeTab === 'analytics' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}>
              {visitorAnalytics.liveVisitorsNow > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              )}
              <span>{visitorAnalytics.totalVisitors.toLocaleString()} Visitors</span>
            </span>
          </button>
        </div>

        {/* Filter, Sort & Society Search Bar (Visible for Queue, Verified, and Logs) */}
        {activeTab !== 'analytics' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-3.5 sm:p-4 mb-6">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === 'logs'
                    ? 'Search audit logs by hash, IP, document, or role…'
                    : 'Search by plot title, society, seller name, or phone…'
                }
                className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-500 focus:bg-white transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {activeTab !== 'logs' && (
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                {/* City Filter */}
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-500"
                >
                  <option value="ALL">All Cities</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                </select>

                {/* AI Verdict Filter (for review queue) */}
                {activeTab === 'queue' && (
                  <select
                    value={verdictFilter}
                    onChange={(e) => setVerdictFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-500"
                  >
                    <option value="ALL">All AI Statuses</option>
                    <option value="AI_VERIFIED">AI Match ≥80%</option>
                    <option value="NEEDS_AUDIT">Awaiting AI Audit</option>
                    <option value="CONFLICT">Flagged / Conflicts</option>
                  </select>
                )}

                {/* Sort Order */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border-0 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none pr-1"
                  >
                    <option value="oldest">Oldest First</option>
                    <option value="newest">Newest First</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="price_asc">Price: Low to High</option>
                  </select>
                </div>

                {/* Reset button */}
                {(searchQuery || cityFilter !== 'ALL' || verdictFilter !== 'ALL' || sortOrder !== 'oldest') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setCityFilter('ALL');
                      setVerdictFilter('ALL');
                      setSortOrder('oldest');
                    }}
                    className="text-xs font-semibold text-slate-500 hover:text-red-600 px-2 py-1 transition"
                  >
                    Reset
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {loading ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 flex items-center justify-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            Loading the review console…
          </div>
        ) : activeTab === 'queue' ? (
          listings.length === 0 ? (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Queue is clear</h2>
              <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto">
                There are no listings awaiting verification right now. New submissions will appear here.
              </p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-slate-900">No matching listings found</h2>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search terms or filters.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCityFilter('ALL');
                  setVerdictFilter('ALL');
                  setSortOrder('oldest');
                }}
                className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {filteredListings.map((l) => {
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
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
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
                          {l.seller.phoneNumber && (
                            <a
                              href={buildWhatsAppLink(l.seller.phoneNumber, l.seller.fullName, l.title, l.plot.society || l.plot.city)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                              title="Open direct WhatsApp conversation with pre-filled inquiry"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp Seller</span>
                            </a>
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
                                <div key={doc.field} className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                  <a
                                    href={doc.signedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800 hover:text-emerald-900 transition"
                                    title="Click to view decrypted document stream"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {doc.label}
                                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                                  </a>
                                  {doc.encrypted && (
                                    <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded" title="Encrypted at rest with AES-256-GCM">
                                      <Lock className="w-2.5 h-2.5 mr-0.5" />
                                      AES-256
                                    </span>
                                  )}
                                  {doc.sha256 && (
                                    <span
                                      className="inline-flex items-center text-[10px] bg-white text-slate-600 border border-slate-200 font-mono px-1.5 py-0.5 rounded cursor-pointer hover:bg-slate-100"
                                      title={`SHA-256: ${doc.sha256}\nClick to copy`}
                                      onClick={() => {
                                        navigator.clipboard?.writeText(doc.sha256);
                                        alert(`Copied SHA-256 Hash:\n${doc.sha256}`);
                                      }}
                                    >
                                      # {doc.sha256.slice(0, 8)}…
                                    </span>
                                  )}
                                </div>
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
                        const isRda = detectedAuthority.includes('RDA') || (l.plot?.city || '').toLowerCase().includes('rawalpindi');

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
                                      href="https://www.cda.gov.pk/housing-schemes"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                                        isCda
                                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm ring-2 ring-emerald-600/30'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium'
                                      }`}
                                    >
                                      <span>Verify CDA Schemes ↗</span>
                                      {isCda && <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100">Recommended</span>}
                                    </a>

                                    <a
                                      href="https://digital-rda.gop.pk"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${
                                        isRda
                                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm ring-2 ring-emerald-600/30'
                                          : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium'
                                      }`}
                                    >
                                      <span>Verify RDA Portal ↗</span>
                                      {isRda && <span className="text-[9px] bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-100">Recommended</span>}
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
          )
        ) : activeTab === 'verified' ? (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  Verified Plots on Live Cadastre
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Plots currently verified and live on the public 3D geospatial map. Generate official certificates or manage live status.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                {filteredVerifiedPlots.length} displayed ({verifiedPlots.length} total)
              </span>
            </div>

            {verifiedPlots.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center text-sm text-slate-500">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800">No verified plots live on sale</h3>
                <p className="text-xs text-slate-400 mt-1">When you approve listings from the Review Queue, they appear here.</p>
              </div>
            ) : filteredVerifiedPlots.length === 0 ? (
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">No verified plots match your search criteria</h3>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or city filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCityFilter('ALL');
                    setSortOrder('oldest');
                  }}
                  className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVerifiedPlots.map((plot) => {
                  const busy = action.id === plot.id && action.type === 'remove';
                  return (
                    <article key={plot.id} className="bg-white border border-slate-200 shadow-xs rounded-2xl p-4 sm:p-5 flex flex-col justify-between hover:border-slate-300 transition">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 truncate flex items-center gap-1.5 text-base">
                              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                              {plot.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                              {plot.city || '—'} · {plot.society || 'Society not provided'}
                            </p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${
                            plot.isVerified
                              ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                              : 'text-amber-800 bg-amber-50 border border-amber-200'
                          }`}>
                            {plot.isVerified ? '✓ Verified Cadastre' : 'Needs verification'}
                          </span>
                        </div>

                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-3 border-t border-slate-100 text-sm">
                          <div>
                            <dt className="text-xs text-slate-400">Demand Price</dt>
                            <dd className="font-semibold text-slate-800">{formatPkr(plot.pricePkr)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Plot Dimensions</dt>
                            <dd className="font-medium text-slate-700">{plot.sizeDimensions || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Seller</dt>
                            <dd className="font-medium text-slate-700 truncate">{plot.seller?.fullName || '—'}</dd>
                          </div>
                          <div>
                            <dt className="text-xs text-slate-400">Phone</dt>
                            <dd className="font-medium text-slate-700 truncate">{plot.seller?.phoneNumber || '—'}</dd>
                          </div>
                        </dl>
                      </div>

                      {/* Card Actions: Certificate Generator + WhatsApp + Remove */}
                      <div className="flex flex-wrap items-center gap-2 mt-5 pt-3.5 border-t border-slate-100">
                        {/* Item 6: NAQSHAI Verified Certificate Generator Button */}
                        <button
                          type="button"
                          onClick={() => setCertificateTarget(plot)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-xs rounded-xl shadow-2xs transition"
                          title="Generate printable/downloadable NAQSHAI Cadastre Certificate"
                        >
                          <Award className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Official Certificate</span>
                        </button>

                        {/* Item 3: 1-Click WhatsApp Seller */}
                        {plot.seller?.phoneNumber && (
                          <a
                            href={buildWhatsAppLink(plot.seller.phoneNumber, plot.seller.fullName, plot.title, plot.society || plot.city)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-2xs transition shrink-0"
                            title="Chat with seller on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>
                        )}

                        {/* Remove from sale */}
                        <button
                          type="button"
                          onClick={() => setRemovalTarget(plot)}
                          disabled={busy}
                          className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-xl transition disabled:opacity-60 shrink-0"
                          title="Remove from public marketplace"
                        >
                          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeTab === 'logs' ? (
          /* Item 2: Security & Document Access Logs Tab */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  Live Cryptographic Document Access Logs
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time tamper-evident audit trail recording every document upload and decrypted stream download. All files are protected with AES-256-GCM encryption.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {filteredAuditLogs.length} events logged
                </span>
                <button
                  type="button"
                  onClick={() => fetchQueue(passphrase)}
                  disabled={loading}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-lg transition flex items-center gap-1"
                  title="Refresh logs from database"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {filteredAuditLogs.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                <Lock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800">No document access logs found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Audit logs are automatically written when sellers upload encrypted deeds or operators decrypt documents during review.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Event Time</th>
                      <th className="py-3 px-4">Action</th>
                      <th className="py-3 px-4">Deed / Document</th>
                      <th className="py-3 px-4">Actor Role</th>
                      <th className="py-3 px-4">SHA-256 Digest</th>
                      <th className="py-3 px-4">Source IP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditLogs.map((log) => {
                      const isUpload = log.action === 'UPLOAD';
                      const isDownload = log.action === 'DOWNLOAD';
                      const isCopied = copiedHash === log.id;
                      const docLabel = DOC_NAMES[log.field_name] || log.field_name || 'Document';

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">
                              {timeAgo(log.created_at)}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full border ${
                                isUpload
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : isDownload
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              {isUpload ? '↑ ENCRYPTED UPLOAD' : isDownload ? '↓ DECRYPT & STREAM' : log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span>{docLabel}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {log.actor_role || 'operator'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {log.file_hash ? (
                              <button
                                type="button"
                                onClick={() => handleCopyHash(log.file_hash, log.id)}
                                title={`Click to copy full SHA-256 hash:\n${log.file_hash}`}
                                className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-600 bg-white border border-slate-200 hover:border-emerald-300 hover:text-emerald-700 px-2 py-1 rounded transition shadow-2xs"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span className="text-emerald-600 font-bold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>{log.file_hash.slice(0, 10)}…{log.file_hash.slice(-6)}</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                            {log.ip_address || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          /* Visitor Analytics Dashboard */
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                  Citizen Traffic &amp; QR Cadastre Intelligence
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Permanent real-time analytics engine tracking citizen engagement, physical Panaflex QR banner scans, and active map visitors.
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                {visitorAnalytics.liveVisitorsNow > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                    <span>{visitorAnalytics.liveVisitorsNow} Online Now</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                    <span>0 Online (Past 5m)</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => fetchQueue(passphrase)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-60"
                  title="Refresh live visitor telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Telemetry</span>
                </button>
              </div>
            </div>

            {/* 4 Primary Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: All-Time Unique Visitors */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">All-Time Visitors</span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {visitorAnalytics.totalVisitors.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {visitorAnalytics.totalPageviews.toLocaleString()} total pageviews recorded
                  </p>
                </div>
              </div>

              {/* Card 2: Panaflex Banner QR Scans */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Panaflex QR Scans</span>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {visitorAnalytics.totalQrScans.toLocaleString()}
                  </div>
                  <p className="text-xs text-amber-700 font-semibold mt-1">
                    {visitorAnalytics.totalVisitors > 0
                      ? `${Math.round((visitorAnalytics.totalQrScans / visitorAnalytics.totalVisitors) * 100)}% of citizen acquisition`
                      : 'Physical banner campaign'}
                  </p>
                </div>
              </div>

              {/* Card 3: Today's Citizens & Views */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Today&apos;s Traffic</span>
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {visitorAnalytics.todayVisitors.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {visitorAnalytics.todayPageviews.toLocaleString()} views recorded today
                  </p>
                </div>
              </div>

              {/* Card 4: Live Citizens Online */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Active Citizens</span>
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>{visitorAnalytics.liveVisitorsNow.toLocaleString()}</span>
                    {visitorAnalytics.liveVisitorsNow > 0 && (
                      <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Active within the last 5 minutes
                  </p>
                </div>
              </div>
            </div>

            {/* Mid Grid: 7-Day Trend & Acquisition Channels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 7-Day Trend Chart (2 Cols) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">7-Day Traffic &amp; QR Banner Trend</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Daily breakdown of unique citizens, total page impressions, and physical QR scans.</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
                      Pageviews
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 inline-block" />
                      Visitors
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
                      QR Scans
                    </span>
                  </div>
                </div>

                {visitorAnalytics.dailyTrend.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No trend data recorded yet.
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const maxDaily = Math.max(
                        1,
                        ...visitorAnalytics.dailyTrend.map((d) =>
                          Math.max(d.pageviews || 0, d.visitors || 0, d.qrScans || 0)
                        )
                      );
                      return (
                        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4 pb-2 px-1">
                          {visitorAnalytics.dailyTrend.map((d) => {
                            const pvH = Math.max(6, Math.round(((d.pageviews || 0) / maxDaily) * 100));
                            const vH = Math.max(6, Math.round(((d.visitors || 0) / maxDaily) * 100));
                            const qrH = (d.qrScans || 0) > 0 ? Math.max(6, Math.round((d.qrScans / maxDaily) * 100)) : 0;
                            const dayName = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                              <div key={d.date} className="flex flex-col items-center h-full justify-end group">
                                <div className="text-[10px] font-bold text-slate-400 mb-1.5 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                                  {d.pageviews} views
                                </div>
                                <div className="w-full flex items-end justify-center gap-1 h-32 px-1">
                                  {/* Pageviews bar */}
                                  <div
                                    className="w-2 sm:w-3 bg-emerald-600 rounded-t-xs transition-all hover:bg-emerald-700"
                                    style={{ height: `${pvH}%` }}
                                    title={`${d.date}: ${d.pageviews} pageviews`}
                                  />
                                  {/* Visitors bar */}
                                  <div
                                    className="w-2 sm:w-3 bg-emerald-400 rounded-t-xs transition-all hover:bg-emerald-500"
                                    style={{ height: `${vH}%` }}
                                    title={`${d.date}: ${d.visitors} unique visitors`}
                                  />
                                  {/* QR Scans bar */}
                                  {qrH > 0 ? (
                                    <div
                                      className="w-2 sm:w-3 bg-amber-500 rounded-t-xs transition-all hover:bg-amber-600"
                                      style={{ height: `${qrH}%` }}
                                      title={`${d.date}: ${d.qrScans} QR scans`}
                                    />
                                  ) : (
                                    <div className="w-2 sm:w-3 h-1 bg-slate-200 rounded-t-xs" />
                                  )}
                                </div>
                                <div className="mt-2 text-center">
                                  <div className="text-[11px] font-bold text-slate-700">{dayName}</div>
                                  <div className="text-[9px] text-slate-400">{d.date.slice(5)}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Acquisition Sources & Devices (1 Col) */}
              <div className="space-y-6">
                {/* Traffic Acquisition Sources */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Acquisition Channels</h3>
                  <p className="text-xs text-slate-500 mb-4">How citizens discover the NAQSHAI platform.</p>

                  <div className="space-y-3">
                    {visitorAnalytics.topSources.length === 0 ? (
                      <p className="text-xs text-slate-400">No acquisition channels logged yet.</p>
                    ) : (
                      visitorAnalytics.topSources.map((s) => {
                        const isQr = s.source === 'panaflex_qr';
                        const isWhatsapp = s.source === 'whatsapp';
                        const pct = visitorAnalytics.totalPageviews > 0
                          ? Math.round((s.count / visitorAnalytics.totalPageviews) * 100)
                          : 0;
                        const label =
                          s.source === 'panaflex_qr'
                            ? 'Panaflex Banner QR'
                            : s.source === 'whatsapp'
                            ? 'WhatsApp Direct Share'
                            : s.source === 'google'
                            ? 'Google Organic Search'
                            : s.source === 'social'
                            ? 'Social Media'
                            : s.source === 'direct'
                            ? 'Direct / Bookmarks'
                            : s.source;

                        return (
                          <div key={s.source} className="text-xs">
                            <div className="flex items-center justify-between font-medium mb-1">
                              <span className="flex items-center gap-1.5 text-slate-800">
                                {isQr ? (
                                  <QrCode className="w-3.5 h-3.5 text-amber-600" />
                                ) : isWhatsapp ? (
                                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span className={isQr ? 'font-bold text-amber-900' : ''}>{label}</span>
                              </span>
                              <span className="text-slate-500 font-mono">
                                {s.count} ({pct}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  isQr ? 'bg-amber-500' : isWhatsapp ? 'bg-emerald-600' : 'bg-slate-400'
                                }`}
                                style={{ width: `${Math.max(4, pct)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Citizen Device Platforms</h3>
                  <p className="text-xs text-slate-500 mb-4">Hardware platforms used to inspect the cadastre.</p>

                  {(() => {
                    const devTotal =
                      (visitorAnalytics.deviceBreakdown.mobile || 0) +
                      (visitorAnalytics.deviceBreakdown.desktop || 0) +
                      (visitorAnalytics.deviceBreakdown.tablet || 0) || 1;
                    const mobPct = Math.round(((visitorAnalytics.deviceBreakdown.mobile || 0) / devTotal) * 100);
                    const dskPct = Math.round(((visitorAnalytics.deviceBreakdown.desktop || 0) / devTotal) * 100);
                    const tabPct = 100 - mobPct - dskPct;

                    return (
                      <div>
                        <div className="flex h-3 rounded-full overflow-hidden mb-3 bg-slate-100">
                          <div className="bg-emerald-600 h-full" style={{ width: `${mobPct}%` }} title={`Mobile: ${mobPct}%`} />
                          <div className="bg-sky-600 h-full" style={{ width: `${dskPct}%` }} title={`Desktop: ${dskPct}%`} />
                          <div className="bg-indigo-500 h-full" style={{ width: `${tabPct > 0 ? tabPct : 0}%` }} title={`Tablet: ${tabPct}%`} />
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <Smartphone className="w-4 h-4 text-emerald-700 mx-auto mb-1" />
                            <div className="font-bold text-slate-900">{visitorAnalytics.deviceBreakdown.mobile || 0}</div>
                            <div className="text-[10px] text-slate-500">Mobile ({mobPct}%)</div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <Laptop className="w-4 h-4 text-sky-700 mx-auto mb-1" />
                            <div className="font-bold text-slate-900">{visitorAnalytics.deviceBreakdown.desktop || 0}</div>
                            <div className="text-[10px] text-slate-500">Desktop ({dskPct}%)</div>
                          </div>
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <Smartphone className="w-4 h-4 text-indigo-700 mx-auto mb-1" />
                            <div className="font-bold text-slate-900">{visitorAnalytics.deviceBreakdown.tablet || 0}</div>
                            <div className="text-[10px] text-slate-500">Tablet</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Pages & Real-Time Live Visits Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Pages (1 Col) */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Most Visited Pages</h3>
                <p className="text-xs text-slate-500 mb-4">Top URLs requested by visiting citizens.</p>

                <div className="space-y-2.5">
                  {visitorAnalytics.topPages.length === 0 ? (
                    <p className="text-xs text-slate-400">No page views recorded yet.</p>
                  ) : (
                    visitorAnalytics.topPages.map((p, idx) => (
                      <div
                        key={p.path}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-mono text-slate-800 font-medium truncate">
                            {p.path === '/' ? '/ (3D Cadastre Map)' : p.path}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] shrink-0">
                          {p.count} views
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Real-Time Live Event Stream (2 Cols) */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Live Citizen Access Stream</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Real-time incoming page loads, banner QR scans, and referral events.</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Latest {visitorAnalytics.recentVisits.length} events
                  </span>
                </div>

                {visitorAnalytics.recentVisits.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-400">
                    No visitor events logged yet. Open the site or scan the banner QR code to see live activity.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          <th className="py-2.5 px-3">Time</th>
                          <th className="py-2.5 px-3">Acquisition Source</th>
                          <th className="py-2.5 px-3">Device &amp; Browser</th>
                          <th className="py-2.5 px-3">Page Visited</th>
                          <th className="py-2.5 px-3">Citizen ID</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visitorAnalytics.recentVisits.map((v) => {
                          const isQr = v.source === 'panaflex_qr';
                          const isWhatsapp = v.source === 'whatsapp';

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                                <span className="font-semibold text-slate-800">{timeAgo(v.created_at)}</span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                    isQr
                                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                                      : isWhatsapp
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  {isQr && <QrCode className="w-3 h-3 text-amber-600" />}
                                  {isWhatsapp && <MessageSquare className="w-3 h-3 text-emerald-600" />}
                                  <span>{isQr ? 'Panaflex Banner QR' : isWhatsapp ? 'WhatsApp' : v.source || 'Direct'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap text-slate-600">
                                <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                                  {v.device_type === 'mobile' ? (
                                    <Smartphone className="w-3 h-3 text-emerald-700" />
                                  ) : (
                                    <Laptop className="w-3 h-3 text-sky-700" />
                                  )}
                                  <span className="capitalize">{v.device_type || 'Desktop'}</span>
                                  <span className="text-slate-400">· {v.browser || 'Browser'}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                                {v.page_path || '/'}
                              </td>
                              <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                                {v.visitor_id ? `${v.visitor_id.slice(0, 8)}…` : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Item 6: NAQSHAI Verified Cadastre Certificate Modal */}
        {certificateTarget && (
          <VerificationCertificateModal
            plot={certificateTarget}
            onClose={() => setCertificateTarget(null)}
          />
        )}

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
