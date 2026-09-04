'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Navbar from '@/components/Navbar';
import UserNav from '@/components/UserNav';
import { useFavorites } from '@/context/FavoritesContext';
import { 
  Heart, 
  Home,
  MapPin, 
  ArrowLeft, 
  ShieldCheck, 
  Eye, 
  Building2, 
  Trash2, 
  Compass, 
  ExternalLink,
  Loader2 
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useProfile();
  const { favoritePlotIds, favoritePlots, toggleFavorite, isFavorite, loading: favLoading } = useFavorites();
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [localPlots, setLocalPlots] = useState([]);
  const [plotsLoading, setPlotsLoading] = useState(false);

  // Fallback: If favoritePlots is empty but we have favoritePlotIds, fetch from /api/plots
  useEffect(() => {
    if (favoritePlotIds.size === 0) {
      setLocalPlots([]);
      return;
    }

    let cancelled = false;
    async function loadAllPlots() {
      try {
        setPlotsLoading(true);
        const res = await fetch('/api/plots');
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        const list = Array.isArray(data.plots) ? data.plots : [];
        const matching = list.filter((p) => favoritePlotIds.has(p.id));
        setLocalPlots(matching);
      } catch (e) {
        console.warn('Error loading fallback plots:', e);
      } finally {
        if (!cancelled) setPlotsLoading(false);
      }
    }

    loadAllPlots();

    return () => {
      cancelled = true;
    };
  }, [favoritePlots.length, favoritePlotIds]);

  const activePlots = favoritePlots.length > 0 ? favoritePlots : localPlots;
  const isLoading = favLoading || (favoritePlotIds.size > 0 && activePlots.length === 0 && plotsLoading);

  // Available unique cities in favorites
  const cities = useMemo(() => {
    const set = new Set();
    activePlots.forEach((p) => {
      if (p.city && p.city.trim()) set.add(p.city.trim());
    });
    return Array.from(set);
  }, [activePlots]);

  // Filtered list
  const filteredPlots = useMemo(() => {
    if (selectedCity === 'ALL') return activePlots;
    return activePlots.filter(
      (p) => (p.city || '').trim().toLowerCase() === selectedCity.toLowerCase()
    );
  }, [activePlots, selectedCity]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      {/* Standardized Header Navigation Bar */}
      <Navbar
        badgeText={`${favoritePlotIds.size} ${favoritePlotIds.size === 1 ? 'plot' : 'plots'}`}
      />


      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* City Filter Tabs (When multiple cities present) */}
        {cities.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedCity('ALL')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                selectedCity === 'ALL'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
              }`}
            >
              All Regions ({favoritePlots.length})
            </button>
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                  selectedCity.toLowerCase() === city.toLowerCase()
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {city} ({favoritePlots.filter((p) => (p.city || '').trim().toLowerCase() === city.toLowerCase()).length})
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-7 h-7 text-emerald-700 animate-spin" />
            <p className="text-sm font-medium text-slate-500">Loading your saved properties…</p>
          </div>
        ) : favoritePlotIds.size === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500">
              <Heart className="w-7 h-7 stroke-[1.5]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No Saved Properties Yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Explore our registered inventory on the 3D map and tap the heart icon on any plot to save it to your personal watchlist.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => router.push('/explore')}
                className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-xs transition cursor-pointer inline-flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Plots on Map</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlots.map((plot) => {
              const isFav = isFavorite(plot.id);
              const priceFormatted = plot.price || (plot.price_pkr ? `PKR ${Number(plot.price_pkr).toLocaleString()}` : 'Price on Request');
              const sizeFormatted = plot.details?.size || plot.size_dimensions || 'Standard';

              return (
                <div
                  key={plot.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-emerald-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Header: Plot ID & Heart Toggle */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                          {plot.id}
                        </span>
                        {plot.is_verified && (
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleFavorite(plot.id, plot)}
                        className="p-1.5 rounded-full hover:bg-rose-50 transition cursor-pointer text-rose-500"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                      </button>
                    </div>

                    {/* Title & Price */}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {plot.title || plot.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{plot.city || 'Islamabad'}</span>
                      </p>
                    </div>

                    {/* Price and Specs */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {priceFormatted}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono">
                        {sizeFormatted}
                      </span>
                    </div>

                    {/* Risk Tag */}
                    {(plot.details?.floodRisk || plot.flood_risk) && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Flood: {plot.details?.floodRisk || plot.flood_risk}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`/explore?plot=${encodeURIComponent(plot.id)}`)}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View on 3D Map</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFavorite(plot.id, plot)}
                      className="p-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
