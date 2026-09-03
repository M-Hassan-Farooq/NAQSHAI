'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import UserNav from '@/components/UserNav';
import GuideChatbot from '@/components/GuideChatbot';
import {
  Sparkles,
  ArrowRight,
  MapPin,
  Waves,
  Mountain,
  Volume2,
  Languages,
  ShieldCheck,
  Bot,
  Eye,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  User,
  LogOut
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchSession() {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (isMounted) setSession(activeSession);
      } catch (e) {
        console.error('Session error on Home page:', e);
      }
    }
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) setSession(currentSession);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?');
    if (!confirmed) return;
    await supabase.auth.signOut();
    setSession(null);
    router.refresh();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* 1. Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="w-full pl-4 pr-6 md:pl-6 md:pr-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 shadow-sm group-hover:bg-emerald-100 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">NAQSHAI</span>
            </Link>
          </div>

          {/* Anchor Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            <a href="#overview" className="hover:text-emerald-700 transition">Overview</a>
            <a href="#risk-intelligence" className="hover:text-emerald-700 transition">Risk Intelligence</a>
            <a href="#how-it-works" className="hover:text-emerald-700 transition">How It Works</a>
            <a href="#faqs" className="hover:text-emerald-700 transition">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sell"
              className="bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-sm"
            >
              List Your Plot
            </Link>
            <Link
              href="/explore"
              className="flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm transition"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>3D Map</span>
            </Link>
            <Link
              href="/recommend"
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>Launch AI Advisor</span>
            </Link>

            <div className="border-l border-slate-200 pl-3 ml-1">
              <UserNav
                session={session}
                onSignOut={handleSignOut}
              />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section with Cartographic Topographic Watermark */}
      <section id="overview" className="relative bg-slate-100 py-20 md:py-28 px-4 overflow-hidden border-b border-slate-200 scroll-mt-28">
        {/* Subtle Topographic Contour Lines SVG Watermark */}
        <svg
          className="absolute inset-0 w-full h-full text-slate-200/60 pointer-events-none stroke-current fill-none"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
        >
          <path d="M-100,100 Q200,50 400,200 T900,150 T1100,300" strokeWidth="1.5" />
          <path d="M-100,180 Q250,120 450,280 T950,220 T1100,380" strokeWidth="1.5" />
          <path d="M-100,260 Q300,200 500,360 T1000,300 T1100,460" strokeWidth="1.5" />
          <path d="M-100,340 Q350,280 550,440 T1050,380 T1100,540" strokeWidth="1.5" />
          <path d="M-100,420 Q400,360 600,520 T1100,460" strokeWidth="1.5" />
          <circle cx="500" cy="280" r="140" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="500" cy="280" r="220" strokeWidth="1" strokeDasharray="6 6" />
        </svg>

        <div className="relative max-w-5xl mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-emerald-800 shadow-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            AI-Driven Geospatial Land Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-4xl">
            Geospatial Intelligence for <span className="text-emerald-700">Pakistan&apos;s Real Estate</span>.
          </h1>

          <p className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
            AI-powered land advisory, automated flood risk analysis, and interactive 3D terrain inspection designed for smart plot discovery.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Link
              href="/recommend"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3.5 rounded-xl shadow-md transition text-sm"
            >
              <span>Launch AI Plot Advisor</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/explore"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold px-6 py-3.5 rounded-xl shadow-sm transition text-sm"
            >
              <MapPin className="w-4 h-4 text-emerald-700" />
              <span>Inspect 3D Map</span>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 border-t border-slate-200/80 pt-6 max-w-2xl w-full">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multilingual Gemini AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Flood Plain & Noise Metrics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>3D Plot Polygons</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Risk Intelligence Value Proposition (Core Showcase) */}
      <section id="risk-intelligence" className="py-20 px-4 max-w-7xl mx-auto w-full scroll-mt-28">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Geospatial Risk Intelligence & Analysis
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Going beyond traditional listing portals by evaluating land suitability, environmental exposure, and natural hazards before you invest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 mb-4 shadow-sm">
                <Waves className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Flood Risk Analysis</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Evaluates proximity to natural rainwater drains, historical monsoon floodplains, and ridge elevations.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-md border border-cyan-200">
                Low/Moderate Hazard Mapping
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-sm">
                <Mountain className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Elevation & Topography</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Determines hill slope, ridge contours, and soil elevation levels to ensure safe, cost-effective construction.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                Contour & Slope Profiling
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-sm">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Ambient Noise Index</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Calculates proximity distance buffers from main expressways, commercial hubs, and quiet residential park zones.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                Acoustic Proximity Index
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-emerald-300 transition flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 shadow-sm">
                <Languages className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Multilingual AI Advisor</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Powered by Gemini 2.5 to converse fluently in English, Roman Urdu, or Nastaliq Urdu script (اردو).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Gemini 2.5 Multi-Script
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "How NAQSHAI Works" (3-Step Flow) */}
      <section id="how-it-works" className="py-20 px-4 bg-white border-y border-slate-200 scroll-mt-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">How NAQSHAI Works</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Three seamless steps from initial plot requirement to 3D land verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md mb-5">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 mb-1">Step 1</span>
              <h3 className="font-bold text-lg text-slate-900">State Your Criteria</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Chat naturally with NAQSHAI AI regarding your preferred city, society, budget limit, and plot size in Marla or Kanal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md mb-5">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 mb-1">Step 2</span>
              <h3 className="font-bold text-lg text-slate-900">Automated Risk Analysis</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                The recommendation engine evaluates matching inventory against flood risk histories, noise buffers, and elevation ridge maps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-6 bg-slate-50 border border-slate-200 rounded-2xl relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-md mb-5">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-800 mb-1">Step 3</span>
              <h3 className="font-bold text-lg text-slate-900">3D Map Inspection</h3>
              <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                Inspect plot boundary polygons on the interactive 3D terrain map and directly contact verified owners via WhatsApp.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/recommend"
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition text-sm"
            >
              <span>Try NAQSHAI AI Advisor Now</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faqs" className="py-20 px-4 max-w-5xl mx-auto w-full scroll-mt-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          <details className="group bg-white border border-slate-200 rounded-2xl shadow-sm">
            <summary className="flex justify-between items-center p-5 font-semibold text-slate-800 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>What makes NAQSHAI different from standard real estate portals?</span>
              <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3 mt-1">
              Standard portals only display static prices and unverified seller claims. NAQSHAI integrates geospatial risk analysis, automated flood risk metrics, terrain elevation profiles, and interactive 3D polygon mapping paired with a conversational AI advisor.
            </div>
          </details>

          <details className="group bg-white border border-slate-200 rounded-2xl shadow-sm">
            <summary className="flex justify-between items-center p-5 font-semibold text-slate-800 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>How are flood risk and elevation metrics calculated?</span>
              <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3 mt-1">
              NAQSHAI analyzes topographically mapped ridge elevations, natural rainwater drainage channels, and historical flood hazard data for premier residential developments across Pakistan.
            </div>
          </details>

          <details className="group bg-white border border-slate-200 rounded-2xl shadow-sm">
            <summary className="flex justify-between items-center p-5 font-semibold text-slate-800 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>Which cities and societies are supported?</span>
              <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3 mt-1">
              Currently, NAQSHAI features verified inventory across Islamabad, Rawalpindi, Lahore, and Karachi — including DHA, Bahria Town, Gulberg Greens, Park View City, and Clifton.
            </div>
          </details>

          <details className="group bg-white border border-slate-200 rounded-2xl shadow-sm">
            <summary className="flex justify-between items-center p-5 font-semibold text-slate-800 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <span>Can I chat with the AI in Urdu or Roman Urdu?</span>
              <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-3 mt-1">
              Yes! NAQSHAI includes a manual language toggle (Auto, EN, UR, RO) enabling seamless conversation in English, Roman Urdu (e.g. &quot;10 Marla plot chahiye&quot;), or fluent Nastaliq Urdu script (اردو).
            </div>
          </details>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-12 px-4 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-2 max-w-md">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="font-bold text-sm text-slate-900 tracking-tight">NAQSHAI</span>
            </div>
            <p className="text-slate-500 leading-relaxed">
              NAQSHAI is a geospatial land intelligence and real estate advisory platform.
            </p>
          </div>

          {/* Core Technology Stack removed as requested */}
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 gap-4">
          <p>© 2026 NAQSHAI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/recommend" className="hover:text-slate-600 transition">AI Advisor</Link>
            <Link href="/explore" className="hover:text-slate-600 transition">3D Map</Link>
          </div>
        </div>
      </footer>

      {/* Floating Collapsible Guide Chatbot */}
      <GuideChatbot />

    </div>
  );
}
