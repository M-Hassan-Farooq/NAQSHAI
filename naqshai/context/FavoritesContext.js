'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

const FavoritesContext = createContext(null);

const LOCAL_FAVORITES_KEY = 'naqshai_local_favorites';

export function FavoritesProvider({ children }) {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [favoritePlotIds, setFavoritePlotIds] = useState(new Set());
  const [favoritePlots, setFavoritePlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState(null);

  // 1. Listen to Supabase Auth State
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(activeSession);
      } catch (e) {
        console.warn('[FavoritesContext] Session check error:', e);
      }
    }
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) setSession(currentSession);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 2. Fetch User Favorites (from server if authenticated, fallback to local storage)
  const fetchFavorites = useCallback(async (signal) => {
    if (!session?.access_token) {
      // Unauthenticated: load from localStorage
      try {
        const raw = localStorage.getItem(LOCAL_FAVORITES_KEY);
        if (raw) {
          const ids = JSON.parse(raw);
          if (Array.isArray(ids)) {
            setFavoritePlotIds(new Set(ids));
          }
        }
      } catch (_) {}
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/favorites', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.favorites)) {
          setFavoritePlotIds(new Set(data.favorites));
        }
        if (Array.isArray(data.plots)) {
          setFavoritePlots(data.plots);
        }
      }
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.warn('[FavoritesContext] Failed to load remote favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    const controller = new AbortController();
    fetchFavorites(controller.signal);
    return () => controller.abort();
  }, [fetchFavorites]);

  // 3. Check if plot is in favorites
  const isFavorite = useCallback(
    (plotId) => {
      if (!plotId) return false;
      return favoritePlotIds.has(plotId);
    },
    [favoritePlotIds]
  );

  // 4. Toggle Favorite (Optimistic UI with 0ms visual response)
  const toggleFavorite = useCallback(
    async (plotId, plotData = null) => {
      if (!plotId) return;

      const wasFavorite = favoritePlotIds.has(plotId);
      const nextIds = new Set(favoritePlotIds);

      if (wasFavorite) {
        nextIds.delete(plotId);
        setFavoritePlotIds(nextIds);
        setFavoritePlots((prev) => prev.filter((p) => p.id !== plotId));
      } else {
        nextIds.add(plotId);
        setFavoritePlotIds(nextIds);
        if (plotData) {
          setFavoritePlots((prev) => [plotData, ...prev.filter((p) => p.id !== plotId)]);
        }
      }

      // Persist locally for instant recovery
      try {
        localStorage.setItem(LOCAL_FAVORITES_KEY, JSON.stringify(Array.from(nextIds)));
      } catch (_) {}

      // If user is authenticated, sync with database
      if (session?.access_token) {
        try {
          const res = await fetch('/api/favorites', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ plotId }),
          });

          if (!res.ok) {
            // Revert on failure
            console.warn('[FavoritesContext] Toggle sync failed, reverting optimistic state');
            setSyncNotice({ type: 'error', text: 'Could not sync this favorite. Your saved list was restored.' });
            fetchFavorites();
          } else {
            setSyncNotice({ type: 'success', text: wasFavorite ? 'Removed from your synced favorites.' : 'Saved to your synced favorites.' });
          }
        } catch (e) {
          console.warn('[FavoritesContext] Network error syncing favorite:', e);
          setSyncNotice({ type: 'error', text: 'Could not sync this favorite. Check your connection and retry.' });
          fetchFavorites();
        }
      } else {
        // If not authenticated, inform the user they can sign in to sync
        console.log('[FavoritesContext] Saved locally. Sign in to sync across devices.');
        setSyncNotice({ type: 'info', text: 'Saved on this device. Sign in to sync across devices.' });
      }
    },
    [favoritePlotIds, session?.access_token, fetchFavorites]
  );

  const value = useMemo(
    () => ({
      favoritePlotIds,
      favoritePlots,
      isFavorite,
      toggleFavorite,
      refreshFavorites: fetchFavorites,
      syncNotice,
      clearSyncNotice: () => setSyncNotice(null),
      loading,
      count: favoritePlotIds.size,
    }),
    [favoritePlotIds, favoritePlots, isFavorite, toggleFavorite, fetchFavorites, syncNotice, loading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return ctx;
}
