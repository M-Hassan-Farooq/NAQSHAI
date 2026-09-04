'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserNav from '@/components/UserNav';
import { Home, MapPin, Sparkles, PlusCircle } from 'lucide-react';

export default function Navbar({
  session = null,
  onSignOut,
  badgeText,
  leftSlot,
  rightSlot,
  className = '',
}) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore 3D Map', href: '/explore', icon: MapPin },
    { label: 'AI Advisor', href: '/recommend', icon: Sparkles },
    { label: 'List Your Plot', href: '/sell', icon: PlusCircle },
  ];

  return (
    <header className={`h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between z-50 shrink-0 shadow-xs sticky top-0 ${className}`}>
      {/* Left Section: Brand Logo & Optional Page Badge */}
      <div className="flex items-center gap-3">
        {leftSlot}

        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="relative w-8 h-8 overflow-hidden rounded-xl border border-emerald-500/20 shadow-xs group-hover:scale-105 transition-transform">
            <Image
              src="/Masaod.jpeg"
              alt="NAQSHAI Mascot Logo"
              fill
              className="object-cover"
              sizes="32px"
            />
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>NAQSHAI</span>
          </span>
        </Link>

        {badgeText && (
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full hidden sm:inline-block shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      {/* Middle Section: Fixed Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right Section: Actions & Profile Dropdown */}
      <div className="flex items-center gap-2.5">
        {rightSlot}

        {/* Mobile Navigation Shortcuts */}
        <div className="flex md:hidden items-center gap-1.5">
          {pathname !== '/explore' && (
            <Link
              href="/explore"
              className="bg-white hover:bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-emerald-700 transition flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">3D Map</span>
            </Link>
          )}
          {pathname !== '/sell' && (
            <Link
              href="/sell"
              className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1.5 rounded-xl text-xs font-semibold transition shadow-xs"
            >
              Sell Plot
            </Link>
          )}
        </div>

        {/* User Account Dropdown */}
        <UserNav session={session} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
