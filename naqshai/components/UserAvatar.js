'use client';

import React from 'react';
import { useProfile } from '@/context/ProfileContext';
import { getLocalCachedProfile } from '@/lib/profileHelper';

export default function UserAvatar({ user, profile: propProfile, className = '' }) {
  const { profile: contextProfile } = useProfile();

  if (!user) return null;

  const localCache = getLocalCachedProfile(user.id);
  const userMeta = user.user_metadata || {};
  const activeProfile = propProfile || contextProfile || localCache;

  const avatarUrl = activeProfile?.avatar_url || userMeta.avatar_url || userMeta.picture || null;
  const displayName = activeProfile?.full_name || userMeta.full_name || userMeta.name || user.email || 'User';
  const initial = displayName.trim().charAt(0).toUpperCase() || 'U';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          title={displayName}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
        />
      ) : (
        <div
          title={displayName}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center border border-emerald-800 shadow-sm shrink-0"
        >
          {initial}
        </div>
      )}
      <span className="text-xs font-semibold text-slate-700 hidden lg:inline-block max-w-[120px] truncate">
        {displayName}
      </span>
    </div>
  );
}
