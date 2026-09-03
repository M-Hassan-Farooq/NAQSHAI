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
  const fetchFavorites = useCallback(async () => {
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
      console.warn('[FavoritesContext] Failed to load remote favorites:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchFavorites();
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
            fetchFavorites();
          }
        } catch (e) {
          console.warn('[FavoritesContext] Network error syncing favorite:', e);
          fetchFavorites();
        }
      } else {
        // If not authenticated, inform the user they can sign in to sync
        console.log('[FavoritesContext] Saved locally. Sign in to sync across devices.');
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
      loading,
      count: favoritePlotIds.size,
    }),
    [favoritePlotIds, favoritePlots, isFavorite, toggleFavorite, fetchFavorites, loading]
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
