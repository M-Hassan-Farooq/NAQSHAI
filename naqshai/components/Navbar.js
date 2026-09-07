'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import UserNav from '@/components/UserNav';
import ScrollProgressBar from '@/components/ScrollProgressBar';
import { Home, MapPin, Sparkles, PlusCircle, Menu, X, Compass, Bot, Building2, Heart } from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Explore 3D Map', href: '/explore', icon: Compass },
  { label: 'AI Advisor', href: '/recommend', icon: Bot },
  { label: 'List Your Plot', href: '/sell', icon: Building2 },
  { label: 'My Favorites', href: '/favorites', icon: Heart },
];

export default function Navbar({
  session = null,
  onSignOut,
  badgeText,
  leftSlot,
  rightSlot,
  className = '',
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close the mobile menu on an outside click / tap. Navigating from a menu
  // link already closes it via that link's onClick, so no route-change effect
  // is needed here (avoids a redundant synchronous setState-in-effect).
  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    function handleClickOutside(event) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore 3D Map', href: '/explore', icon: MapPin },
    { label: 'AI Advisor', href: '/recommend', icon: Sparkles },
    { label: 'List Your Plot', href: '/sell', icon: PlusCircle },
  ];

  return (
    <header className={`relative h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between z-50 shrink-0 shadow-xs sticky top-0 ${className}`}>
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

        {/* Mobile Navigation Menu (hamburger dropdown) */}
        <div className="relative md:hidden" ref={mobileMenuRef}>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-haspopup="true"
            className="w-9 h-9 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {isMobileMenuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-full mt-2 w-60 p-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMobileMenuOpen(false)}
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

        {/* User Account Dropdown */}
        <UserNav session={session} onSignOut={onSignOut} />
      </div>

      {/* Scroll Progress Indicator Bar */}
      <ScrollProgressBar />
    </header>
  );
}
