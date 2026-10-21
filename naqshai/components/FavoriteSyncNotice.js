'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useFavorites } from '@/context/FavoritesContext';

export default function FavoriteSyncNotice() {
  const { syncNotice, clearSyncNotice } = useFavorites();

  useEffect(() => {
    if (!syncNotice) return undefined;
    const timeout = window.setTimeout(clearSyncNotice, 4000);
    return () => window.clearTimeout(timeout);
  }, [syncNotice, clearSyncNotice]);

  if (!syncNotice) return null;

  const Icon = syncNotice.type === 'error'
    ? XCircle
    : syncNotice.type === 'success'
      ? CheckCircle2
      : Info;
  const colors = syncNotice.type === 'error'
    ? 'ui-alert-danger'
    : syncNotice.type === 'success'
      ? 'ui-alert-success'
      : 'ui-alert-info';

  return (
    <div
      role="status"
      className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm z-[70] flex items-center gap-2.5 shadow-raised ${colors}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{syncNotice.text}</span>
      <button
        type="button"
        onClick={clearSyncNotice}
        aria-label="Dismiss favorite notification"
        className="shrink-0 rounded-control p-1 hover:bg-black/5 ui-focus-ring"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
