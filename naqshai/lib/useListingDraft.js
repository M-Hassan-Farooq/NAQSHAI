'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { isDraftMeaningful } from '@/lib/draftProgress';

const AUTOSAVE_DELAY = 1200; // debounce window (ms) — autosave, not per-keystroke

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

/**
 * useListingDraft — the single source of truth for draft persistence.
 *
 * Responsibilities (kept out of the form component):
 *   - resume an existing draft (resumeId) or lazily create a new one on first
 *     meaningful change (so merely opening /sell never spawns an empty draft)
 *   - debounced autosave + explicit immediate save (next/prev/submit)
 *   - honest save state: 'saved' is set ONLY after a 2xx response
 *   - last-write-aware conflict detection via updated_at
 *   - a best-effort save when the tab is hidden / the page is being unloaded
 *
 * saveState: 'idle' | 'saving' | 'saved' | 'error'
 * status:    'draft' | 'submitted' | 'published'
 */
export function useListingDraft({ enabled = false, resumeId = null, onHydrate } = {}) {
  const [draftId, setDraftId] = useState(resumeId || null);
  const [status, setStatus] = useState('draft');
  const [saveState, setSaveState] = useState('idle');
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [initializing, setInitializing] = useState(!!resumeId);
  const [loadError, setLoadError] = useState('');
  const [conflict, setConflict] = useState(false);

  const draftIdRef = useRef(resumeId || null);
  const statusRef = useRef('draft');
  const updatedAtRef = useRef(null);
  const debounceRef = useRef(null);
  const pendingRef = useRef(null);
  const inFlightRef = useRef(false);
  const doSaveRef = useRef(null);
  const onHydrateRef = useRef(onHydrate);
  // Keep the latest onHydrate without re-subscribing effects (updated post-render).
  useEffect(() => {
    onHydrateRef.current = onHydrate;
  });

  const setDraftIdSafe = useCallback((id) => {
    draftIdRef.current = id;
    setDraftId(id);
  }, []);
  const setStatusSafe = useCallback((s) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  // ---- Resume an existing draft. (New drafts need no fetch — the form starts empty.)
  useEffect(() => {
    if (!enabled || !resumeId) return;
    let active = true;
    (async () => {
      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`/api/drafts/${resumeId}`, { headers });
        if (!active) return;
        if (res.status === 404) {
          setLoadError('This draft could not be found on your account.');
        } else if (!res.ok) {
          setLoadError('We could not load this draft. Please try again.');
        } else {
          const json = await res.json();
          if (json?.draft) {
            setDraftIdSafe(json.draft.id);
            updatedAtRef.current = json.draft.updated_at;
            setLastSavedAt(json.draft.updated_at);
            const st = json.draft.published_plot_id ? 'submitted' : (json.draft.status || 'draft');
            setStatusSafe(st);
            onHydrateRef.current?.(json.draft.form_data || {}, {
              isNew: false,
              currentStep: json.draft.current_step || 1,
              status: st,
            });
          }
        }
      } catch {
        if (active) setLoadError('Network error while loading your draft.');
      } finally {
        if (active) setInitializing(false);
      }
    })();
    return () => { active = false; };
  }, [enabled, resumeId, setDraftIdSafe, setStatusSafe]);

  // ---- The one function that talks to the save API (create-or-update).
  const doSave = useCallback(async (snapshot, { keepalive = false } = {}) => {
    if (statusRef.current !== 'draft') return false; // never mutate a submitted listing
    const meaningful = isDraftMeaningful({ ...(snapshot.form_data || {}), currentStep: snapshot.current_step });
    if (!draftIdRef.current && !meaningful) return true; // don't create an empty draft

    if (inFlightRef.current) { pendingRef.current = snapshot; return false; }
    inFlightRef.current = true;
    if (!keepalive) setSaveState('saving');
    setConflict(false);

    try {
      const headers = await getAuthHeaders();
      let res;
      if (!draftIdRef.current) {
        res = await fetch('/api/drafts', {
          method: 'POST', headers, keepalive, body: JSON.stringify(snapshot),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.draft) {
            setDraftIdSafe(json.draft.id);
            updatedAtRef.current = json.draft.updated_at;
            // Reflect the id in the URL so a refresh resumes the same draft.
            try {
              const url = new URL(window.location.href);
              if (url.searchParams.get('draft') !== json.draft.id) {
                url.searchParams.set('draft', json.draft.id);
                window.history.replaceState({}, '', url.toString());
              }
            } catch { /* ignore URL sync failures */ }
          }
        }
      } else {
        res = await fetch(`/api/drafts/${draftIdRef.current}`, {
          method: 'PUT', headers, keepalive,
          body: JSON.stringify({ ...snapshot, updated_at: updatedAtRef.current }),
        });
      }

      if (res.status === 409) {
        const json = await res.json().catch(() => ({}));
        if (json?.draft?.updated_at) updatedAtRef.current = json.draft.updated_at;
        if (json?.error === 'conflict') setConflict(true);
        setSaveState('error');
        return false;
      }
      if (!res.ok) {
        // Surface the real reason (e.g. missing table, RLS) so failures are diagnosable.
        const json = await res.json().catch(() => ({}));
        console.error('[useListingDraft] save failed', res.status, json?.error || json);
        setSaveState('error');
        return false;
      }

      const json = await res.json().catch(() => ({}));
      if (json?.draft?.updated_at) {
        updatedAtRef.current = json.draft.updated_at;
        setLastSavedAt(json.draft.updated_at);
      } else {
        setLastSavedAt(new Date().toISOString());
      }
      setSaveState('saved');
      return true;
    } catch (err) {
      console.error('[useListingDraft] save error', err);
      setSaveState('error'); // never claim "Saved" on a failure
      return false;
    } finally {
      inFlightRef.current = false;
      // If newer input arrived while this request was in flight, save it too.
      // Route the recursive call through a ref so this callback never references
      // itself (keeps it memoizable under the React Compiler).
      const queued = pendingRef.current;
      if (queued && queued !== snapshot) {
        pendingRef.current = null;
        doSaveRef.current?.(queued);
      }
    }
  }, [setDraftIdSafe]);
  // Keep the latest doSave reachable for the in-flight drain above.
  useEffect(() => {
    doSaveRef.current = doSave;
  });

  // ---- Debounced autosave, called on every form change.
  const scheduleSave = useCallback((snapshot) => {
    pendingRef.current = snapshot;
    if (statusRef.current !== 'draft') return;
    setSaveState((s) => (s === 'saved' ? 'idle' : s)); // typing again → no longer "Saved"
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const snap = pendingRef.current;
      if (snap) doSave(snap);
    }, AUTOSAVE_DELAY);
  }, [doSave]);

  // ---- Explicit immediate save (navigation / submit).
  const saveNow = useCallback(async (snapshot) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const snap = snapshot ?? pendingRef.current;
    if (!snap) return true;
    pendingRef.current = snap;
    return await doSave(snap);
  }, [doSave]);

  // ---- Best-effort save when the tab is hidden or the page unloads.
  useEffect(() => {
    if (!enabled) return;
    const flush = () => {
      if (statusRef.current !== 'draft') return;
      const snap = pendingRef.current;
      if (!snap) return;
      const meaningful = isDraftMeaningful({ ...(snap.form_data || {}), currentStep: snap.current_step });
      if (!draftIdRef.current && !meaningful) return;
      doSave(snap, { keepalive: true });
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') flush(); };
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', onVisibility);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, doSave]);

  const markSubmitted = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatusSafe('submitted');
    setSaveState('idle');
  }, [setStatusSafe]);

  const getDraftId = useCallback(() => draftIdRef.current, []);

  return {
    draftId,
    status,
    saveState,
    lastSavedAt,
    initializing,
    ready: enabled && !initializing,
    loadError,
    conflict,
    scheduleSave,
    saveNow,
    markSubmitted,
    getDraftId,
  };
}
