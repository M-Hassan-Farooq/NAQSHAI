'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';
import { Settings, LogOut, ChevronDown, Heart } from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useFavorites } from '@/context/FavoritesContext';
import { getLocalCachedProfile } from '@/lib/profileHelper';

export default function UserNav({ session, onSignOut, className = '' }) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user: contextUser, profile: contextProfile } = useProfile();
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

  if (!activeUser) return null;

  const localCache = getLocalCachedProfile(activeUser.id);
  const userMeta = activeUser.user_metadata || {};
  const activeProfile = contextProfile || localCache;
  const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || activeUser.email || 'Account';

  const handleSignOutClick = async () => {
    setIsDropdownOpen(false);
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    if (onSignOut) {
      await onSignOut();
    }
  };

  const handleGoToSettings = () => {
    setIsDropdownOpen(false);
    router.push('/settings');
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Clickable Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
        className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100/80 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
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
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header User Summary */}
          <div className="px-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl mb-1">
            <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
            <p className="text-[11px] text-slate-500 truncate">{activeUser.email}</p>
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
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
