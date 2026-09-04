'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import {
  Sparkles,
  Home,
  Plus,
  ClipboardList,
  MapPin,
  Clock,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight,
  Eye,
  Building2,
  ShieldCheck,
} from 'lucide-react';

// Presentation config for each lifecycle state.
const LIFECYCLE = {
  draft: {
    label: 'Draft',
    description: 'Continue where you left off.',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    bar: 'bg-amber-400',
  },
  submitted: {
    label: 'Submitted · Under Review',
    description: 'Our team is checking your listing. It is not public yet.',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    bar: 'bg-sky-500',
  },
  published: {
    label: 'Published · Verified',
    description: 'Your verified listing is live on the 3D map.',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bar: 'bg-emerald-500',
  },
  rejected: {
    label: 'Needs Changes',
    description: 'Update the requested details and resubmit.',
    badge: 'bg-red-50 text-red-700 border-red-200',
    bar: 'bg-red-400',
  },
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

export default function DashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session: current } } = await supabase.auth.getSession();
      const token = current?.access_token;
      if (!token) {
        router.push('/login?redirect=/dashboard');
        return;
      }
      const res = await fetch('/api/drafts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Could not load your listings.');
        setDrafts([]);
      } else {
        setDrafts(json.drafts || []);
      }
    } catch {
      setError('Network error while loading your listings.');
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Route protection + initial load.
  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!activeSession) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        if (isMounted) {
          setSession(activeSession);
          setCheckingAuth(false);
          loadDrafts();
        }
      } catch {
        router.push('/login?redirect=/dashboard');
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (event === 'SIGNED_OUT' || !currentSession) {
        router.push('/');
      } else if (isMounted) {
        setSession(currentSession);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [router, loadDrafts]);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  const handleDiscard = async (id) => {
    const confirmed = window.confirm('Discard this draft? This cannot be undone.');
    if (!confirmed) return;
    setDeletingId(id);
    try {
      const { data: { session: current } } = await supabase.auth.getSession();
      const token = current?.access_token;
      const res = await fetch(`/api/drafts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
      } else {
        setError(json.error || 'Could not discard the draft.');
      }
    } catch {
      setError('Network error while discarding the draft.');
    } finally {
      setDeletingId(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 bg-white border border-slate-200 px-6 py-4 rounded-2xl shadow-sm">
          <Loader2 className="w-5 h-5 text-emerald-700 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-16">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 overflow-hidden rounded-xl border border-emerald-500/20 shadow-sm">
                <Image alt="NAQSHAI Mascot Logo" className="object-cover" fill src="/Masaod.jpeg"/>
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">NAQSHAI</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full hidden sm:inline-block">
              My Listings
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 text-emerald-700" />
              <span>Home</span>
            </Link>
            <button
              onClick={() => router.push('/explore')}
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm"
            >
              Explore 3D Map
            </button>
            <button
              onClick={() => router.push('/sell')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Listing</span>
            </button>
            <UserNav session={session} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ClipboardList className="w-7 h-7 text-emerald-700" />
              My Listings
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-xl">
              Every listing you start is saved automatically. Resume a draft where you left off, or track submitted plots as they move through AI verification.
            </p>
          </div>
          <button
            onClick={() => router.push('/sell')}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Start new listing</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Something went wrong</p>
              <p className="text-xs text-red-600 mt-0.5">{error}</p>
            </div>
            <button
              onClick={loadDrafts}
              className="text-xs font-semibold text-red-700 underline hover:text-red-800 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 flex items-center justify-center gap-3 text-slate-500 text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-700" />
            Loading your listings…
          </div>
        ) : drafts.length === 0 ? (
          /* Empty state */
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No listings yet</h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-sm mx-auto">
              Start listing a plot and your progress will be saved automatically — even if you close the tab.
            </p>
            <button
              onClick={() => router.push('/sell')}
              className="mt-5 inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first listing
            </button>
          </div>
        ) : (
          /* Listing cards */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {drafts.map((d) => {
              const cfg = LIFECYCLE[d.lifecycle] || LIFECYCLE.draft;
              const isDraft = d.lifecycle === 'draft';
              const isRejected = d.lifecycle === 'rejected';
              const isEditable = isDraft || isRejected;
              return (
                <div
                  key={d.id}
                  className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        {d.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Updated {timeAgo(d.updated_at)}
                      </p>
                    </div>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${cfg.badge}`}
                    >
                      {cfg.label}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 -mt-2">{cfg.description}</p>

                  {/* Progress (drafts), rejection note, or verification state */}
                  {isDraft ? (
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1.5">
                        <span>Completion</span>
                        <span className="font-bold text-slate-700">{d.progress}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${cfg.bar} rounded-full transition-all`}
                          style={{ width: `${d.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : isRejected ? (
                    <div className="flex items-start gap-2 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span>{d.rejection_reason || 'Needs changes before it can be published. Edit the details and submit again.'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      {d.lifecycle === 'published'
                        ? 'Verified and live on the 3D map.'
                        : 'Submitted — awaiting verification. Not public yet.'}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1 mt-auto">
                    {isEditable ? (
                      <>
                        <button
                          onClick={() => router.push(`/sell?draft=${d.id}`)}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <span>{isRejected ? 'Edit & Resubmit' : 'Resume'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDiscard(d.id)}
                          disabled={deletingId === d.id}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition disabled:opacity-50"
                          title={isRejected ? 'Discard listing' : 'Discard draft'}
                        >
                          {deletingId === d.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : d.lifecycle === 'published' ? (
                      <button
                        onClick={() =>
                          router.push(
                            d.published_plot_id
                              ? `/explore?plot=${d.published_plot_id}`
                              : '/explore'
                          )
                        }
                        className="flex-1 bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 font-semibold px-4 py-2 rounded-xl text-sm transition flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View on 3D Map</span>
                      </button>
                    ) : (
                      <span className="flex-1 text-center text-xs font-medium text-slate-500 px-4 py-2">
                        In review — you&apos;ll be notified once it&apos;s verified.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
