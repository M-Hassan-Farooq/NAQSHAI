# NAQSHAI: Strategic 4-Tier Improvement Roadmap — Implementation Blueprint

**Document Version:** 1.0  
**Project:** NAQSHAI — Pakistan Cadastral AI & Geospatial Land Advisory  
**Target Platform:** Next.js 16 (App Router), Supabase (PostgreSQL, Storage, pgvector), Google Maps JavaScript API, Google Gen AI SDK  
**Audience:** Core Engineering Team, Product Leads, and Future Contributors  

---

## Roadmap Overview

This blueprint translates NAQSHAI's strategic vision into an actionable, step-by-step engineering plan. Each tier is structured with:
- **Objective & Business Rationale**
- **Affected Files & Architecture**
- **Concrete Code Patterns & Step-by-Step Instructions**
- **Validation Criteria & Edge Cases**

```mermaid
graph TD
    subgraph Tier 1: Immediate Hardening
        T1_1[AI Multi-Model Sequence] --> T1_2[Node.js Runtime Standardization]
        T1_2 --> T1_3[Execute Migration 13 in Supabase]
        T1_3 --> T1_4[Package.json ESM Module Definition]
    end

    subgraph Tier 2: Frontend Architecture & UX
        T2_1[Deconstruct Monolithic Pages] --> T2_2[Accessible In-App Dialogs]
        T2_2 --> T2_3[Downloadable PDF Cadastral Dossier]
    end

    subgraph Tier 3: Geospatial & Verification
        T3_1[Aks-e-Shajra Master Plan Overlays] --> T3_2[Direct WhatsApp Webhook Bot]
        T3_2 --> T3_3[Multi-Plot Comparative Matrix]
    end

    subgraph Tier 4: Enterprise & Monetization
        T4_1[Bank Mortgage Verification Portal] --> T4_2[Government Registry Scraping Bridges]
        T4_2 --> T4_3[Local Payment Rails: JazzCash / EasyPaisa]
    end

    Tier 1 --> Tier 2
    Tier 2 --> Tier 3
    Tier 3 --> Tier 4
```

---

# TIER 1: Immediate System Hardening & Housekeeping (Days 1–3)

Tier 1 targets low-effort, high-impact optimizations that stabilize production builds, eliminate API latency, and ensure database RLS policies match backend application logic.

---

### Step 1.1: Optimize Multimodal Gemini Model Priority

#### Problem
In [`lib/aiDocumentVerifier.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/lib/aiDocumentVerifier.js), `gemini-2.5-flash` was originally the first model in `SUPPORTED_MODELS`. Because Google has deprecated `gemini-2.5-flash` for new API keys, every document verification call generated an initial HTTP 404 error before catching and falling back to `gemini-3.5-flash`, wasting **800ms–1,200ms** of user wait time.

#### Implementation
Set active, performant models at the top of the array:

```javascript
// lib/aiDocumentVerifier.js
export const SUPPORTED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
  'gemini-2.5-flash', // Retained only as a legacy fallback
];
```

#### Verification
Run the verification pipeline test suite:
```bash
npm run test:pipeline
```
**Success Metric:** Log output must show `Attempting vision document audit via: gemini-3.5-flash` succeeding directly without any prior 404 warning.

---

### Step 1.2: Standardize API Runtimes to Node.js

#### Problem
In Next.js 16+, `export const runtime = 'edge'` produces deprecation warnings during `next build` because Turbopack and Edge Runtime middleware have converged toward standard Node.js serverless functions.

#### Implementation
In [`app/api/amenities/route.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/api/amenities/route.js#L4):
```javascript
// app/api/amenities/route.js
import { NextResponse } from 'next/server';
import { calculateAmenityScores } from '@/lib/amenityCalculator';

export const runtime = 'nodejs'; // Replaced 'edge'

export async function GET(request) {
  // Existing calculation logic...
}
```

#### Verification
Run `npm run build`. The build output must show:
`✓ Compiled successfully in 14.0s` without `⚠ The Edge Runtime is deprecated`.

---

### Step 1.3: Execute Database Migration 13 in Supabase

#### Problem
The local file [`supabase/migrations/13_secure_document_storage_and_paths.sql`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/supabase/migrations/13_secure_document_storage_and_paths.sql) enforces storage bucket RLS, restricts uploads to PDF/JPEG/PNG/WEBP, limits file sizes to 10MB, and ensures the public `plots` table receives document status badges instead of sensitive file storage paths. This SQL must be applied to your live Supabase database.

#### Step-by-Step Execution
1. Log into your **Supabase Dashboard** (`https://supabase.com/dashboard`).
2. Select the **NAQSHAI** project.
3. In the left navigation menu, click **SQL Editor**.
4. Click **New Query**.
5. Copy the entire contents of [`supabase/migrations/13_secure_document_storage_and_paths.sql`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/supabase/migrations/13_secure_document_storage_and_paths.sql).
6. Paste the query into the editor and click **Run**.
7. Confirm output returns `Success. No rows returned`.

#### What Migration 13 Enforces:
- Creates private bucket `plot-documents` with `file_size_limit = 10485760` (10MB).
- Whitelists only safe MIME types (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
- Adds RLS policy `Sellers can upload to own draft folder`:
  ```sql
  (bucket_id = 'plot-documents' AND (storage.foldername(name))[1] = auth.uid()::text)
  ```
- Adds column `document_badges text[]` to `plots` and migrates historical data safely.

---

### Step 1.4: Define Native ESM Module Type in `package.json`

#### Problem
When running test scripts (e.g., `node scripts/test-area-verification.mjs`), Node outputs:
`(node:16872) [MODULE_TYPELESS_PACKAGE_JSON] Warning: Module type of ... is not specified`.

#### Implementation
In [`package.json`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/package.json), add `"type": "module"`:

```json
{
  "name": "naqshai",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": { ... }
}
```

---

# TIER 2: Frontend Architecture & UX Modernization (Weeks 1–2)

Tier 2 resolves technical debt arising from monolithic page files and introduces investor-grade PDF reporting.

---

### Step 2.1: Decompose Monolithic Pages into Feature Sub-Components

#### Problem
Three key pages in `app/` are overly large and monolithic:
- [`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/explore/page.js): **1,915 lines** (94.4 KB)
- [`app/sell/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/sell/page.js): **1,750+ lines** (88.9 KB)
- [`app/review/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/review/page.js): **1,358 lines** (76.2 KB)

This monolith structure causes:
1. Re-rendering of unrelated UI trees (e.g. typing in search re-evaluates map polygons).
2. Difficulty navigating code and high merge conflict risk.

#### Target Architecture: Explore Page

Create a modular directory structure under `components/explore/`:

```
components/
└── explore/
    ├── MapCanvas.js            # Google Maps container, tilt, heading, terrain mode
    ├── MapPolygonLayer.js      # Memoized boundary polygons (PlotPolygon)
    ├── MapClusterLayer.js      # Marker clusterer and availability pins
    ├── PlotSidebar.js          # Search input, category pills, price/size filters
    ├── PlotCard.js             # Single listing preview card in sidebar
    ├── PlotDetailsDrawer.js    # Split-view drawer showing amenity scores & metrics
    ├── StreetViewModal.js      # 360-degree panorama viewer
    └── MapControls.js          # Reset bearing, 3D toggle, elevation legend
```

#### Implementation Pattern for `MapCanvas.js`:
```jsx
// components/explore/MapCanvas.js
'use client';

import React, { memo } from 'react';
import { GoogleMap } from '@react-google-maps/api';

export const MapCanvas = memo(function MapCanvas({
  mapCenter,
  zoom,
  onLoad,
  onUnmount,
  children,
  options,
}) {
  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={mapCenter}
      zoom={zoom}
      options={options}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {children}
    </GoogleMap>
  );
});
```

#### Target Architecture: Sell Listing Flow (`app/sell/`)

Split the 5-step wizard into dedicated components:
```
components/
└── sell/
    ├── StepProgressHeader.js   # 5-step indicator with completion checkmarks
    ├── Step1BasicDetails.js    # City, society, plot number, dimensions, price
    ├── Step2MapDrawing.js      # Drawing manager, geodesic area live feedback
    ├── Step3DocumentUpload.js  # Allotment letter, CNIC front/back drag-and-drop
    ├── Step4PhoneAuth.js       # SMS OTP input with signed token validation
    └── Step5ReviewSummary.js   # Final pre-submission audit summary
```

---

### Step 2.2: Downloadable PDF Cadastral Inspection Dossier

#### Business Value
Overseas Pakistanis and local buyers need physical, printable proof of a plot's due diligence before depositing token money (*biyana*). Offering an instant **"Download Cadastral Due-Diligence Certificate"** creates a powerful trust signal.

#### Library Stack
Install `@react-pdf/renderer` or `jspdf` with `qrcode`:
```bash
npm install jspdf qrcode
```

#### Implementation Pattern: [`lib/generatePlotPdf.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/lib/generatePlotPdf.js)
```javascript
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export async function generatePlotDossier(plot) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryEmerald = '#06644E';
  const slateDark = '#1E293B';
  const slateMuted = '#64748B';

  // 1. Header Banner
  doc.setFillColor(6, 100, 78); // Emerald-700
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NAQSHAI CADASTRAL DUE DILIGENCE DOSSIER', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Pakistan Real Estate Intelligence · Islamabad & Rawalpindi', 14, 20);

  // 2. Plot Identifiers
  doc.setTextColor(slateDark);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(plot.title || 'Plot Inspection Report', 14, 38);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Location: ${plot.society || 'N/A'}, ${plot.city || 'Islamabad'}`, 14, 45);
  doc.text(`Declared Size: ${plot.size_dimensions || 'N/A'}`, 14, 51);
  doc.text(`Asking Demand: PKR ${plot.price_pkr?.toLocaleString('en-PK') || 'N/A'}`, 14, 57);

  // 3. Cadastral Boundary & Surface Area Math
  doc.setDrawColor(220, 227, 222);
  doc.roundedRect(14, 65, 182, 36, 3, 3);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryEmerald);
  doc.text('1. CADASTRAL & GEODESIC BOUNDARY VERIFICATION', 20, 74);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateDark);
  doc.text(`Calculated Surface Area: ${plot.calculated_sqft || '—'} sq ft (~${plot.calculated_marla || '—'} Marla)`, 20, 82);
  doc.text(`Area Match Ratio: ${plot.area_match_percentage || '100%'} (CDA/RDA 90%-110% Tolerance Compliant)`, 20, 88);
  doc.text(`Boundary Encroachment Risk: ${plot.is_encroaching ? 'FLAGGED CONFLICT' : 'Zero Overlap Detected'}`, 20, 94);

  // 4. Regulatory & Legal Clearance
  doc.roundedRect(14, 107, 182, 36, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryEmerald);
  doc.text('2. HOUSING AUTHORITY CLEARANCE (CDA / RDA)', 20, 116);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateDark);
  doc.text(`Authority Jurisdiction: ${plot.regulatory?.authority || 'CDA / RDA'}`, 20, 124);
  doc.text(`NOC / Gazette Status: ${plot.regulatory?.statusLabel || 'Verified Gazetted Scheme'}`, 20, 130);
  doc.text(`Gazette Reference / NOC #: ${plot.regulatory?.nocNumber || 'CDA Master Plan Ordinance 1960'}`, 20, 136);

  // 5. Environmental & Acoustic Matrix
  doc.roundedRect(14, 149, 182, 36, 3, 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(primaryEmerald);
  doc.text('3. ENVIRONMENTAL & DISASTER RISK AUDIT', 20, 158);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(slateDark);
  doc.text(`Elevation Contour: ${plot.details?.elevation || 'Graded Plateau'}`, 20, 166);
  doc.text(`Monsoon Flood Hazard: ${plot.details?.floodRisk || 'Low Hazard (Master Planned Drainage)'}`, 20, 172);
  doc.text(`Acoustic Exposure: ${plot.details?.noiseLevel || 'Quiet Residential Pocket'}`, 20, 178);

  // 6. Verification QR Code
  const qrUrl = `https://naqshai.pk/explore?plotId=${plot.id}`;
  const qrDataUri = await QRCode.toDataURL(qrUrl, { margin: 1, width: 80 });
  doc.addImage(qrDataUri, 'PNG', 145, 195, 45, 45);

  doc.setFontSize(8);
  doc.setTextColor(slateMuted);
  doc.text('Scan with smartphone camera', 145, 245);
  doc.text('to inspect live on 3D Map', 145, 249);

  // 7. Legal Disclaimer Footer
  doc.setFontSize(7.5);
  doc.setTextColor(slateMuted);
  doc.text(
    'Disclaimer: NAQSHAI is an independent cadastral intelligence platform. This document synthesizes satellite calculations, AI document cross-audits, and public authority records. Physical demarcation by an authorized patwari/surveyor is recommended prior to financial transaction.',
    14,
    275,
    { maxWidth: 182 }
  );

  doc.save(`NAQSHAI-Dossier-${plot.id || 'plot'}.pdf`);
}
```

---

### Step 2.3: Accessible In-App Confirmation Dialogs

#### Problem
Currently, sign-out in [`components/UserNav.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/components/UserNav.js) and draft deletion in [`app/dashboard/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/dashboard/page.js) occasionally invoke browser-native `window.confirm()`. This breaks UI theme consistency, blocks the browser thread, and fails accessibility (a11y) standards.

#### Implementation
Create a reusable modal: [`components/ConfirmModal.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/components/ConfirmModal.js):

```jsx
'use client';

import React, { useEffect, useRef } from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl p-6 focus:outline-hidden"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${isDestructive ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="confirm-dialog-title" className="text-base font-bold text-slate-900">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition shadow-xs ${
              isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-700 hover:bg-emerald-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

# TIER 3: Advanced Geospatial & Verification Features (Weeks 3–5)

Tier 3 introduces deep cadastral intelligence overlays and automated communication channels.

---

### Step 3.1: Cadastral & Khasra Map Sheet Overlays (*Aks-e-Shajra*)

#### Problem
Buyers frequently ask: *"Which Khasra number does this plot belong to?"* or *"Does this plot touch the nullah boundary on the original CDA sector layout plan?"* Currently, Google Maps only displays generic satellite imagery.

#### Technical Solution
Implement Google Maps `GroundOverlay` layers allowing users to superimpose official georeferenced raster/vector master plans directly on top of satellite imagery with adjustable opacity.

```
       [ GeoTIFF / Vector Master Plan ]
                      │
                      ▼
            Georeferenced Bounds:
         [ South-West: {lat, lng} ]
         [ North-East: {lat, lng} ]
                      │
                      ▼
     Google Maps GroundOverlay Component
      (Opacity Slider: 0% ──●── 100%)
```

#### Implementation in [`components/explore/CadastralOverlay.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/components/explore/CadastralOverlay.js)
```jsx
'use client';

import React, { useEffect, useState } from 'react';
import { GroundOverlay } from '@react-google-maps/api';

// Registry of georeferenced sector master plans
export const SECTOR_OVERLAYS = {
  'b-17': {
    name: 'Sector B-17 (MPCHS) Master Cadastral Plan',
    url: '/overlays/cda-b17-masterplan.webp',
    bounds: {
      north: 33.7020,
      south: 33.6780,
      east: 72.8550,
      west: 72.8150,
    },
  },
  'g-13': {
    name: 'Sector G-13 (FGEHA) Layout Plan',
    url: '/overlays/fgeha-g13-layout.webp',
    bounds: {
      north: 33.6620,
      south: 33.6390,
      east: 72.9810,
      west: 72.9510,
    },
  },
};

export default function CadastralOverlay({ activeSector, opacity = 0.65 }) {
  const overlayData = SECTOR_OVERLAYS[activeSector];

  if (!overlayData) return null;

  return (
    <GroundOverlay
      url={overlayData.url}
      bounds={overlayData.bounds}
      options={{
        opacity: Math.max(0, Math.min(1, opacity)),
        clickable: false,
      }}
    />
  );
}
```

---

### Step 3.2: Direct WhatsApp Verification Bot & Inquiry Webhook

#### Objective
Enable users in Pakistan and abroad to check any plot listing directly via WhatsApp by sending a text like `CHECK PLOT-1049` to receive an automated verification card and PDF link.

#### Architecture
```
[ User sends WhatsApp message ] ──> [ Meta WhatsApp Cloud API Webhook ]
                                                    │
                                                    ▼
                                     [ /api/webhook/whatsapp ]
                                                    │
                                   ┌────────────────┴────────────────┐
                                   ▼                                 ▼
                         Fetch Plot from DB             Query Gemini AI Summary
                                   │                                 │
                                   └────────────────┬────────────────┘
                                                    ▼
                                     [ Send Rich WhatsApp Message ]
                                     • Verified Cadastral Status
                                     • CDA/RDA Clearance Badge
                                     • Download PDF Dossier Link
```

#### Implementation in [`app/api/webhook/whatsapp/route.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/api/webhook/whatsapp/route.js)
```javascript
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { checkRegulatoryStatus } from '@/lib/regulatoryRegistry';

export async function POST(req) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const message = entry?.changes?.[0]?.value?.messages?.[0];

    if (!message || message.type !== 'text') {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const senderPhone = message.from;
    const text = message.text.body.trim();

    // Check pattern: "CHECK <id>" or "VERIFY <id>"
    const match = text.match(/^(?:check|verify)\s+([a-zA-Z0-9_-]+)/i);
    if (!match) {
      await sendWhatsAppText(
        senderPhone,
        'Welcome to NAQSHAI WhatsApp Advisory!\nSend: "CHECK <Plot ID>" to receive instant cadastral due-diligence.'
      );
      return NextResponse.json({ status: 'sent_guide' }, { status: 200 });
    }

    const plotId = match[1];
    const { data: plot } = await supabase
      .from('plots')
      .select('id, title, city, price_pkr, size_dimensions, is_verified')
      .eq('id', plotId)
      .maybeSingle();

    if (!plot) {
      await sendWhatsAppText(senderPhone, `Plot "${plotId}" not found in NAQSHAI verified registry.`);
      return NextResponse.json({ status: 'not_found' }, { status: 200 });
    }

    const reply = 
      `*NAQSHAI VERIFIED CADASTRAL REPORT*\n` +
      `📌 *Plot:* ${plot.title}\n` +
      `📐 *Size:* ${plot.size_dimensions}\n` +
      `💰 *Price:* PKR ${plot.price_pkr?.toLocaleString('en-PK')}\n` +
      `🛡️ *Status:* ${plot.is_verified ? '✅ Cadastral AI Verified' : '⚠️ Under Review'}\n\n` +
      `👉 *View on 3D Map:* https://naqshai.pk/explore?plotId=${plot.id}`;

    await sendWhatsAppText(senderPhone, reply);
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (err) {
    console.error('[whatsapp/webhook] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function sendWhatsAppText(to, text) {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneId) return;

  await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
}
```

---

### Step 3.3: Multi-Plot Comparative Matrix

#### Objective
Allow buyers to pin up to 3 plots on the 3D map and view a comparative side-by-side analysis of:
- Price per square foot / Marla
- Distance to key amenities (schools, hospitals, metro stations)
- Environmental scores (Elevation, Noise dB, Flood Contours)
- Legal risk tiers

#### Implementation Pattern
Store selected plot IDs in client-side state or URL params:
`?compare=plot-101,plot-204,plot-308`

Render a floating sticky comparison dock at the bottom of [`app/explore/page.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/app/explore/page.js) when $\ge 2$ plots are selected.

---

# TIER 4: Enterprise Institutional Scaling & Commercialization (Months 2–3)

Tier 4 moves NAQSHAI into commercial monetized operations and institutional partnerships.

---

### Step 4.1: Bank & Mortgage Collateral Valuation Portal

#### Opportunity
Pakistani commercial banks (Meezan Bank, HBL Islamic, Bank Alfalah) process billions in home construction and land financing. A persistent issue in mortgage financing is **collateral boundary mismatch** — loans issued against land where boundaries encroach on nullahs or overlap other mortgaged parcels.

#### Architectural Specification
1. **Dedicated Role:** Add `is_bank_officer` role in `profiles` table.
2. **Batch Cadastral Ingestion:** Enable bank valuation officers to upload survey coordinates or deed registry scans.
3. **Automated Collateral Audit Output:**
   - Geodesic boundary overlap verification against all registered properties in the database.
   - Official CDA/RDA master plan compliance check.
   - Legal status certificate generation with tamper-evident digital signature.

---

### Step 4.2: Government Registry Scraping Bridges

#### Opportunity
While manual seller document uploads are verified via Gemini Vision OCR, a live verification bridge to public portals provides real-time status confirmations:
1. **Punjab Land Records Authority (PLRA):** Query computerized fard status via `https://punjab-zameen.gov.pk`.
2. **Digital RDA Portal:** Validate society status against live RDA public notices (`https://digital-rda.gop.pk`).
3. **CDA Directorate of Housing:** Real-time synchronization of illegal housing scheme alerts.

#### Implementation Workflow
Use a decoupled background worker (e.g., Supabase Edge Functions or an isolated Node.js microservice) with a queue mechanism (PgBoss or BullMQ) to periodically poll and cache official updates into [`lib/regulatoryRegistry.js`](file:///d:/Uni/Work/Coding/Vibe%20Coding/Bano-Qabil%20AI%20Hackathon/naqshai/NAQSHAI/lib/regulatoryRegistry.js).

---

### Step 4.3: Commercial Monetization & Local Payment Rails

#### Business Model
```
┌────────────────────────────────────────────────────────┐
│                   NAQSHAI REVENUE MODEL                │
├──────────────────────────┬─────────────────────────────┤
│ 1. Free Citizen Tier     │ • Browse live 3D map        │
│                          │ • 3 plot inquiries / day    │
├──────────────────────────┼─────────────────────────────┤
│ 2. Verified Seller Pass  │ • PKR 2,500 – 4,000 / plot   │
│                          │ • AI document cross-audit   │
│                          │ • Green "Verified" map pin  │
├──────────────────────────┼─────────────────────────────┤
│ 3. Instant Dossier PDF   │ • PKR 1,200 / download      │
│                          │ • Downloadable legal report │
│                          │ • Targeted at overseas buyers│
├──────────────────────────┼─────────────────────────────┤
│ 4. Bank / Enterprise API │ • B2B monthly subscription  │
│                          │ • Collateral audit API      │
└──────────────────────────┴─────────────────────────────┘
```

#### Payment Integration Architecture
Integrate Pakistani payment gateways supporting:
- **JazzCash Mobile Wallet**
- **EasyPaisa**
- **PayFast / Safepay (1Link Debit/Credit Card Rail)**
- **Stripe (for Overseas Pakistanis in UK, US, UAE, Saudi Arabia)**

---

## 5. Execution Schedule & Milestones

| Milestone | Deliverables | Target Timeline | Dependencies |
| :--- | :--- | :---: | :--- |
| **Milestone 1** | Tier 1: AI Model Sequence, Node.js Runtime, Migration 13 | **Days 1–3** | Supabase Dashboard access |
| **Milestone 2** | Tier 2: Monolith Decomposition (`explore`, `sell`, `review`) | **Weeks 1–2** | Existing component tests |
| **Milestone 3** | Tier 2: PDF Cadastral Inspection Dossier & QR Code | **Week 2** | `jspdf`, `qrcode` packages |
| **Milestone 4** | Tier 3: Georeferenced Cadastral Master Plan Overlays | **Weeks 3–4** | High-res CDA/RDA maps |
| **Milestone 5** | Tier 3: WhatsApp Inquiry Webhook Bot | **Weeks 4–5** | Meta Cloud API Developer Account |
| **Milestone 6** | Tier 4: Bank Portal & Commercial Payment Gateways | **Months 2–3** | Safepay / JazzCash merchant account |

---

## 6. Summary

This roadmap provides a concrete, sustainable progression from a hackathon winner to a commercial Pakistani PropTech enterprise. By systematically executing Tiers 1 and 2, NAQSHAI will have enterprise code quality, zero-latency AI responses, and a unique PDF certification product that directly monetizes buyer trust.
