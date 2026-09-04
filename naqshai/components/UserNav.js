'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import { Settings, LogOut, ChevronDown, Heart, User, UserPlus, Phone, Loader2 } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getLocalCachedProfile } from '@/lib/profileHelper';
import { supabase } from '@/lib/supabaseClient';

export default function UserNav({ session, onSignOut, className = '' }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef(null);

  const { user: contextUser, profile: contextProfile, loading: profileLoading } = useProfile();
  const { count: favoritesCount } = useFavorites();
  const activeUser = session?.user || contextUser;

  // Click-outside listener to close dropdown automatically
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSignOutClick = async () => {
    setIsDropdownOpen(false);
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;

    setSigningOut(true);
    try {
      if (onSignOut) {
        await onSignOut();
      } else {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSigningOut(false);
    }
  };

  const handleGoToSettings = () => {
    setIsDropdownOpen(false);
    router.push('/settings');
  };

  // Loading state skeleton
  if (profileLoading && !session && !contextUser) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // GUEST STATE (Unauthenticated User)
  // -------------------------------------------------------------
  if (!activeUser) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Link
          href="/login"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>Sign In</span>
        </Link>
        <Link
          href="/login?signup=true"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 px-3 py-1.5 rounded-xl shadow-xs transition"
        >
          <UserPlus className="w-3.5 h-3.5 text-emerald-100" />
          <span>Sign Up</span>
        </Link>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED STATE (Logged In User)
  // -------------------------------------------------------------
  const localCache = getLocalCachedProfile(activeUser.id);
  const userMeta = activeUser.user_metadata || {};
  const activeProfile = contextProfile || localCache;
  const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || activeUser.email || 'Account';
  const phoneNumber = activeProfile?.phone_number || userMeta.phone_number || activeUser.phone;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Clickable Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        disabled={signingOut}
        className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100/80 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer disabled:opacity-50"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
      >
        <UserAvatar user={activeUser} profile={activeProfile} />
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180 text-emerald-700' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isDropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header User Summary */}
          <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-1">
            <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{activeUser.email}</p>
            {phoneNumber && (
              <div className="flex items-center gap-1 text-[10px] text-emerald-700 mt-1 font-mono font-medium">
                <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setIsDropdownOpen(false);
                router.push('/favorites');
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                <span>My Favorites</span>
              </div>
              {favoritesCount > 0 && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {favoritesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={handleGoToSettings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 rounded-xl transition cursor-pointer"
            >
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Account Settings</span>
            </button>

            <div className="border-t border-slate-100 my-1" />

            <button
              type="button"
              onClick={handleSignOutClick}
              disabled={signingOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4 text-red-500" />
              )}
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
