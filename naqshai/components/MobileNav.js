'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  Building2,
  Compass,
  Heart,
  Home,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore 3D Map', icon: Compass },
  { href: '/recommend', label: 'AI Advisor', icon: Bot },
  { href: '/sell', label: 'List Your Plot', icon: Building2 },
  { href: '/favorites', label: 'My Favorites', icon: Heart },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-3 right-3 z-[60]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        className="w-11 h-11 inline-flex items-center justify-center rounded-xl bg-white/95 border border-slate-200 text-slate-700 shadow-lg backdrop-blur-md hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <nav
          aria-label="Mobile navigation"
          className="absolute right-0 top-13 w-60 p-2 bg-white border border-slate-200 rounded-2xl shadow-xl"
        >
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition ${
                  active
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-700'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
