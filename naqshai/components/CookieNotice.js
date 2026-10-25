'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';

const DISMISSAL_KEY = 'naqshai-cookie-notice-dismissed';
const NOTICE_CHANGE_EVENT = 'naqshai-cookie-notice-change';

function subscribeToNoticeChanges(onChange) {
  window.addEventListener('storage', onChange);
  window.addEventListener(NOTICE_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(NOTICE_CHANGE_EVENT, onChange);
  };
}

function getNoticeVisibility() {
  try {
    return window.localStorage.getItem(DISMISSAL_KEY) !== 'true';
  } catch (error) {
    console.warn('Could not read cookie notice preference:', error);
    return true;
  }
}

export default function CookieNotice() {
  const isVisible = useSyncExternalStore(subscribeToNoticeChanges, getNoticeVisibility, () => false);

  const dismissNotice = () => {
    try {
      window.localStorage.setItem(DISMISSAL_KEY, 'true');
    } catch (error) {
      console.warn('Could not save cookie notice preference:', error);
    }
    window.dispatchEvent(new Event(NOTICE_CHANGE_EVENT));
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie and browser storage notice"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-surface/95 p-4 shadow-overlay backdrop-blur-md sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-xl sm:rounded-panel sm:border"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-ink">
          NAQSHAI uses essential cookies and browser storage for sign-in and saved preferences. We don&apos;t currently use analytics or advertising cookies.{' '}
          <Link href="/privacy-policy" className="font-semibold text-action-hover underline underline-offset-2">
            Privacy policy
          </Link>
        </p>
        <button
          type="button"
          onClick={dismissNotice}
          className="ui-button-primary ui-focus-ring shrink-0"
        >
          Dismiss
        </button>
      </div>
    </aside>
  );
}
