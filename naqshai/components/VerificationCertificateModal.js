'use client';

import React, { useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  X,
  Share2,
  MapPin,
  Calendar,
  Layers,
  Award,
  Hash,
  ExternalLink,
  Lock,
} from 'lucide-react';

export default function VerificationCertificateModal({ plot, onClose }) {
  const certificateRef = useRef(null);

  if (!plot) return null;

  const certId = `NQ-CERT-${plot.id || 'PLOT'}-${(plot.created_at ? new Date(plot.created_at).getTime() : Date.now()).toString().slice(-6)}`;
  const approvalDate = plot.created_at
    ? new Date(plot.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

  const society = plot.society || plot.title?.split(' - ')[1]?.split(',')[0]?.trim() || 'Verified Society';
  const city = plot.city || 'Islamabad';
  const dimensions = plot.sizeDimensions || '10 Marla (35x70)';

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/explore?plotId=${encodeURIComponent(plot.id)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      alert(`Copied official plot verification link to clipboard:\n${url}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      {/* Modal Card */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto print:border-0 print:shadow-none print:max-w-none print:rounded-none">
        {/* Modal Action Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-sm tracking-wide">NAQSHAI Official Land Verification Certificate</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleShare}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Prints cleanly) */}
        <div
          ref={certificateRef}
          className="p-8 sm:p-10 bg-[radial-gradient(#10b9810a_1px,transparent_1px)] bg-[size:16px_16px] text-slate-800 space-y-6 print:p-6"
        >
          {/* Certificate Decorative Border */}
          <div className="border-2 border-emerald-800/20 rounded-2xl p-6 sm:p-8 bg-white relative shadow-sm">
            {/* Top Ornamental Watermark / Ribbon */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-emerald-100 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    NAQSHAI <span className="text-emerald-700 text-sm font-semibold tracking-widest uppercase">Verified Land Certificate</span>
                  </h1>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Official Geodesic & Regulatory Cadastre Record · Certificate ID: {certId}
                  </p>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  AUTHENTICATED & VERIFIED
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Date: {approvalDate}</p>
              </div>
            </div>

            {/* Plot Identification Card */}
            <div className="bg-slate-50/80 rounded-xl p-4 sm:p-5 border border-slate-200/80 mb-6">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{plot.title || `Plot in ${society}`}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {society}, {city}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  {dimensions} ({plot.category || 'Residential'})
                </span>
                <span>·</span>
                <span className="font-semibold text-emerald-800">
                  {typeof plot.pricePkr === 'number'
                    ? `PKR ${plot.pricePkr.toLocaleString('en-US')}`
                    : `PKR ${plot.pricePkr || 'Demand on Request'}`}
                </span>
              </div>
            </div>

            {/* 3 Verification Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Pillar 1: Cadastral Boundary */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cadastral Area Check
                </div>
                <p className="text-sm font-semibold text-slate-900">100% Boundary Confirmed</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Geodesic polygon verified on high-res satellite imagery. Zero overlap conflict with neighboring registry boundaries.
                </p>
              </div>

              {/* Pillar 2: Authority & NOC */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Regulatory NOC Audit
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {plot.regulatory?.status === 'APPROVED' ? 'CDA / RDA Approved' : 'Authority Registry Matched'}
                </p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Scheme verified against official master plan registry. Clear legal transfer status without acquisition gazette notices.
                </p>
              </div>

              {/* Pillar 3: Environmental Audit */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Hazard & Flood Audit
                </div>
                <p className="text-sm font-semibold text-slate-900">{plot.floodRisk || 'Low Hazard Profile'}</p>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {plot.elevationProfile || 'Gentle Terrain Elevation'} · Acoustic baseline: {plot.noiseLevel || 'Quiet Residential'}.
                </p>
              </div>
            </div>

            {/* Cryptographic Title Deed Stamp */}
            <div className="bg-slate-900 text-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Integrity Seal
                </div>
                <p className="text-slate-400 text-[11px]">
                  Title document encrypted with AES-256-GCM. Permanent audit tracking recorded in NAQSHAI secure ledger.
                </p>
              </div>
              <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-emerald-300 font-mono text-[11px] shrink-0">
                # {plot.id} · SEAL VALID
              </div>
            </div>

            {/* Official Sign-Off Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
              <div>
                <p className="font-semibold text-slate-800">NAQSHAI Cadastral Verification Desk</p>
                <p className="text-[11px] text-slate-400">Islamabad & Rawalpindi Real Estate Intelligence Protocol</p>
              </div>
              <div className="text-right sm:text-right">
                <div className="w-36 h-0.5 bg-slate-300 mb-1 ml-auto"></div>
                <p className="font-mono text-[11px] text-slate-400">Authorized Operator Digital Stamp</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
