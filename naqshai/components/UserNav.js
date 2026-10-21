'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import { Settings, LogOut, ChevronDown, Heart, User, UserPlus, Phone, Loader2, ClipboardList } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getLocalCachedProfile } from '@/lib/profileHelper';
import { supabase } from '@/lib/supabaseClient';

export default function UserNav({ session, onSignOut, className = '' }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
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

  const handleOpenSignOutModal = () => {
    setIsDropdownOpen(false);
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = async () => {
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
      setShowSignOutConfirm(false);
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
          className="ui-button-secondary ui-focus-ring"
        >
          <User className="w-3.5 h-3.5 text-emerald-700" />
          <span>Sign In</span>
        </Link>
        <Link
          href="/login?signup=true"
          className="ui-button-primary ui-focus-ring hidden sm:flex"
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
    <>
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        {/* Clickable Avatar Trigger Button */}
        <button
          type="button"
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          disabled={signingOut}
          className="flex items-center gap-1.5 p-1 rounded-control hover:bg-surface-subtle transition ui-focus-ring cursor-pointer disabled:opacity-50"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          aria-label={`Open account menu for ${displayName}`}
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
          <div className="absolute right-0 top-full mt-2 w-60 bg-surface border border-border shadow-overlay rounded-panel p-2 z-50 pointer-events-auto animate-in fade-in zoom-in-95 duration-150">
            
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
                  router.push('/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-ui-caption font-semibold text-ink hover:text-action-hover hover:bg-action-soft rounded-control transition cursor-pointer ui-focus-ring"
              >
                <ClipboardList className="w-4 h-4 text-emerald-700" />
                <span>My Listings</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/favorites');
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-ui-caption font-semibold text-ink hover:text-action-hover hover:bg-action-soft rounded-control transition cursor-pointer ui-focus-ring"
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
                className="w-full flex items-center gap-2.5 px-3 py-2 text-ui-caption font-semibold text-ink hover:text-action-hover hover:bg-action-soft rounded-control transition cursor-pointer ui-focus-ring"
              >
                <Settings className="w-4 h-4 text-emerald-700" />
                <span>Account Settings</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={handleOpenSignOutModal}
                disabled={signingOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-ui-caption font-semibold text-slate-700 hover:text-danger hover:bg-danger-soft rounded-control transition cursor-pointer disabled:opacity-50 ui-focus-ring"
              >
                {signingOut ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4 text-red-500" />
                )}
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        )}
      </div>

      {/* Sign Out Confirmation Dialog Overlay.
          Portaled to <body>: the Navbar header uses backdrop-blur (a
          backdrop-filter), which creates a containing block that hijacks
          position:fixed and traps this overlay inside the 56px header,
          pushing the dialog off-screen. Portaling escapes every ancestor
          transform/filter so fixed inset-0 is viewport-relative again. */}
      {showSignOutConfirm && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signout-modal-title"
        >
          <div className="ui-panel shadow-overlay rounded-panel p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 id="signout-modal-title" className="text-sm font-bold text-slate-900">
                  Confirm Sign Out
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Are you sure you want to end your current session?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={signingOut}
                className="ui-button-secondary ui-focus-ring"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                disabled={signingOut}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-control border border-danger bg-danger px-4 py-2 text-ui-caption font-semibold text-white transition hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-50 ui-focus-ring"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
