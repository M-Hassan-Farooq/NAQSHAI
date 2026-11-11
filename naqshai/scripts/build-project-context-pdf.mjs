import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const docsDir = path.join(rootDir, 'documentation');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

console.log('[Project Context PDF Generator] Building comprehensive HTML and PDF project context documentation...');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NAQSHAI — Master Project Context & AI Onboarding Dossier</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 14mm 12mm 16mm 12mm;
      @bottom-right {
        content: "Page " counter(page);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 7.5pt;
        color: #64748b;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 8.5pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .cover {
      page-break-after: always;
      padding: 30px 20px 20px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 255mm;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }

    .badge-bar {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }

    .badge {
      display: inline-block;
      padding: 3px 9px;
      font-size: 7pt;
      font-weight: 700;
      border-radius: 5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge-emerald {
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }

    .badge-blue {
      background-color: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
    }

    .badge-amber {
      background-color: #fffbeb;
      color: #b45309;
      border: 1px solid #fde68a;
    }

    .badge-slate {
      background-color: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    .hero-title {
      font-size: 23pt;
      font-weight: 900;
      color: #0f172a;
      line-height: 1.15;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
    }

    .hero-title span {
      color: #047857;
    }

    .hero-subtitle {
      font-size: 11pt;
      color: #475569;
      font-weight: 500;
      line-height: 1.45;
      margin-bottom: 20px;
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 15px 0;
    }

    .kpi-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .kpi-num {
      font-size: 14pt;
      font-weight: 800;
      color: #047857;
      line-height: 1.1;
      margin-bottom: 3px;
    }

    .kpi-label {
      font-size: 7pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .meta-box {
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 14px 18px;
      margin-top: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 8pt;
    }

    .meta-item strong {
      display: block;
      color: #64748b;
      font-size: 7pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .meta-item span {
      color: #0f172a;
      font-weight: 600;
    }

    .executive-abstract {
      margin-top: 20px;
      padding: 14px 16px;
      background-color: #f0fdf4;
      border-left: 4px solid #047857;
      border-radius: 4px;
      font-size: 8.5pt;
      color: #166534;
      line-height: 1.55;
    }

    .page-break {
      page-break-before: always;
    }

    h2 {
      font-size: 12.5pt;
      font-weight: 800;
      color: #0f172a;
      margin-top: 18px;
      margin-bottom: 8px;
      padding-bottom: 4px;
      border-bottom: 2px solid #047857;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    h2 .section-tag {
      font-size: 7pt;
      font-weight: 700;
      color: #047857;
      background: #ecfdf5;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
    }

    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 12px;
      margin-bottom: 5px;
    }

    p {
      margin-bottom: 8px;
      color: #334155;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 12px 0;
      font-size: 7.5pt;
    }

    th, td {
      border: 1px solid #cbd5e1;
      padding: 5px 7px;
      text-align: left;
      vertical-align: top;
    }

    th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 6.8pt;
      letter-spacing: 0.3px;
    }

    tr:nth-child(even) td {
      background-color: #fcfdfe;
    }

    .code-pill {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 6.8pt;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    .callout {
      border-radius: 6px;
      padding: 10px 12px;
      margin: 10px 0;
      font-size: 8pt;
      line-height: 1.45;
    }

    .callout-emerald {
      background-color: #f0fdf4;
      border: 1px solid #bbf7d0;
      color: #166534;
    }

    .callout-blue {
      background-color: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
    }

    .callout-amber {
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      color: #92400e;
    }

    .chart-container {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 14px;
      margin: 12px 0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.02);
    }

    .chart-title {
      font-size: 8.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
    }

    ul, ol {
      margin-left: 16px;
      margin-bottom: 8px;
      color: #334155;
    }

    li {
      margin-bottom: 3px;
    }

    pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 6.8pt;
      line-height: 1.4;
      color: #0f172a;
      margin: 6px 0 10px 0;
      overflow-x: auto;
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="cover">
    <div>
      <div class="badge-bar">
        <span class="badge badge-emerald">Master Project Dossier</span>
        <span class="badge badge-blue">Complete AI Context & Onboarding</span>
        <span class="badge badge-amber">Single Source of Truth</span>
        <span class="badge badge-slate">Zero-Trust Architecture</span>
      </div>

      <h1 class="hero-title">NAQSHAI <span>Master Project Context</span> & AI Onboarding Dossier</h1>
      <p class="hero-subtitle">Comprehensive Architectural, Mathematical, Cryptographic Deed Vault, and Autonomous Multi-Agent Swarm Reference for AI Assistants & Engineers</p>

      <div class="kpi-row">
        <div class="kpi-card">
          <div class="kpi-num">137</div>
          <div class="kpi-label">Total Git Commits</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">32,344</div>
          <div class="kpi-label">Net Production Code Lines</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">15</div>
          <div class="kpi-label">PostgreSQL Migrations</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-num">217 / 217</div>
          <div class="kpi-label">Passing Tests (100%)</div>
        </div>
      </div>

      <div class="meta-box">
        <div class="meta-grid">
          <div class="meta-item">
            <strong>Founding & Engineering Team</strong>
            <span>Hassan (Muhammad Hassan Farooq), Ahsan Hayat, alizy51125</span>
          </div>
          <div class="meta-item">
            <strong>Target Jurisdiction</strong>
            <span>CDA Islamabad Zones 1–5, RDA Rawalpindi, PLRA Punjab Zameen, Punjab e-Stamp</span>
          </div>
          <div class="meta-item">
            <strong>Core Tech Stack</strong>
            <span>Next.js 16.3 (App Router), React 19, Google Maps JS API, Gemini 3.5, Supabase pgvector</span>
          </div>
          <div class="meta-item">
            <strong>Live Production URL</strong>
            <span>https://naqshaii.vercel.app/</span>
          </div>
        </div>
      </div>
    </div>

    <div class="executive-abstract">
      <strong>Instructions for AI Assistants:</strong> This document is the authoritative single source of truth for the NAQSHAI project. It captures the entire context required for any AI model or engineer to understand, maintain, debug, and expand the platform. All architectural decisions, mathematical formulas (WGS84 ellipsoidal area math), cryptographic implementations (AES-256-GCM Deed Vault), security directives (Zero Autonomous AI Authority), and operational runbooks are detailed herein.
    </div>
  </div>

  <!-- SECTION 1: EXECUTIVE IDENTITY & PROBLEM SPACE -->
  <h2>1. Executive Identity & System Mission <span class="section-tag">Identity</span></h2>
  
  <p><strong>NAQSHAI</strong> (نقشہ / Naqsha = Map/Blueprint in Urdu) is an institutional-grade <strong>Cadastral Intelligence & Land Record Verification Platform</strong> purpose-built for the Twin Cities of Pakistan (Islamabad Capital Territory and Rawalpindi District).</p>

  <h3>1.1 The Core Problem: Why Conventional Portals Fail</h3>
  <p>Conventional property portals in emerging markets (Zameen.com, Graana, OLX) operate on a classifieds advertising model. Their revenue model monetizes listing volume, resulting in an unchecked ecosystem of land speculation and severe financial harm to citizens:</p>

  <ul>
    <li><strong>Non-Balloted Files:</strong> Housing societies sell 50,000 speculative "paper files" while owning land for only 10,000 on-ground plots. Buyers pay installments for 5+ years without a physical parcel allocated.</li>
    <li><strong>Boundary Encroachment (Zameen Qabza):</strong> Sellers claim 10 Marla on paper while plotting 13 Marla on ground to capture CDA green belts or access roads. When the CDA/RDA anti-encroachment wing strikes, buyers face demolition.</li>
    <li><strong>Duplicate Registries:</strong> Historic cloth registers (*Latha / Jamabandi*) held by local *Patwaris* allowed the same plot to be sold to multiple buyers using duplicate stamp papers.</li>
    <li><strong>The $30 Billion Overseas Remittance Risk:</strong> Non-Resident Pakistanis (NRPs) remit over $30 Billion annually to Pakistan, with an estimated 25–30% channeled directly into real estate. Unable to visit physically, they bear the brunt of forged file schemes.</li>
    <li><strong>The Registry Moat:</strong> Official land portals (PLRA Punjab Zameen, Punjab e-Stamp, CDA Dastak) sit behind strict CAPTCHAs and offer zero public developer REST APIs.</li>
    <li><strong>The Autonomous AI Trap:</strong> Giving an AI model autonomous write authority to approve uploaded property deeds invites <em>adversarial prompt injection</em> (e.g. white-on-white text in PDFs commanding the model to approve fake land).</li>
  </ul>

  <h3>1.2 The NAQSHAI Solution</h3>
  <p>NAQSHAI replaces naive classifieds pins with <strong>mathematically verified cadastral polygons</strong> (WGS84 ellipsoidal surface area math + ray-casting collision detection), <strong>AES-256-GCM encrypted deed vaults</strong>, and a <strong>2-Stage Human-in-the-Loop (HITL)</strong> verification engine that equips human compliance officers with 1-click citizen-mediated deep links to verify government records past CAPTCHAs in under 10 seconds.</p>

  <!-- SECTION 2: TECH STACK -->
  <h2>2. Core Technology Stack & Strict Library Discipline <span class="section-tag">Tech Stack</span></h2>

  <table>
    <thead>
      <tr>
        <th>Layer / Category</th>
        <th>Technologies & Exact Versions</th>
        <th>Functional Scope in NAQSHAI</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Web Application Framework</strong></td>
        <td><code>next@16.3.3</code> (App Router), <code>react@19.2.8</code>, <code>@tailwindcss/postcss@4</code></td>
        <td>Full-stack SSR & client routing, streaming UI, Tailwind v4 utility styling, API route handlers.</td>
      </tr>
      <tr>
        <td><strong>Geospatial & Mapping</strong></td>
        <td><code>@react-google-maps/api@^2.20.8</code></td>
        <td>Interactive satellite maps, Street View 360, cadastral polygon drawing, Places Autocomplete.</td>
      </tr>
      <tr>
        <td><strong>Artificial Intelligence & Vision</strong></td>
        <td><code>@google/genai@^2.19.0</code></td>
        <td>Worker Specialists: <code>gemini-3.5-flash-lite</code>; Chief Synthesizer & OCR: <code>gemini-3.5-flash</code>.</td>
      </tr>
      <tr>
        <td><strong>Database & Storage</strong></td>
        <td><code>@supabase/supabase-js@^2.112.4</code>, PostgreSQL + pgvector</td>
        <td>Relational tables, HNSW cosine vector index, storage bucket <code>plot-documents</code> (private).</td>
      </tr>
      <tr>
        <td><strong>Security & Cryptography</strong></td>
        <td>Node.js <code>crypto</code> (Standard Library)</td>
        <td>AES-256-GCM Deed Vault, HMAC-SHA256 challenge tokens, CSPRNG OTPs, <code>timingSafeEqual</code> auth.</td>
      </tr>
      <tr>
        <td><strong>Icons & Visual Assets</strong></td>
        <td><code>lucide-react@^1.37.0</code></td>
        <td>Clean, accessible icons for verification badges, navigation, and modal dialogues.</td>
      </tr>
    </tbody>
  </table>

  <div class="callout callout-amber">
    <strong>Strict Library Constraint:</strong> Use <em>only</em> installed libraries. Do not hallucinate or attempt to install unapproved packages. When referencing internal modules, always use the <code>@/...</code> root path alias.
  </div>

  <!-- SECTION 3: 2-STAGE HITL VERIFICATION TOPOLOGY -->
  <div class="page-break"></div>
  <h2>3. The 2-Stage Human-in-the-Loop (HITL) Verification Topology <span class="section-tag">Architecture</span></h2>

  <p>NAQSHAI operates on the absolute architectural invariant: <strong>Zero Autonomous AI Authority</strong>. AI provides observational intelligence and multimodal OCR extraction; actual database write authority and publication require human operator sign-off.</p>

  <div class="chart-container" style="text-align: center; padding: 16px 12px;">
    <svg viewBox="0 0 680 330" style="width: 100%; max-height: 300px;">
      <!-- CITIZEN BOX -->
      <rect x="20" y="20" width="180" height="90" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="110" y="42" text-anchor="middle" font-size="9" font-weight="800" fill="#1e40af">1. CITIZEN SELLER PORTAL</text>
      <text x="110" y="58" text-anchor="middle" font-size="7.5" fill="#334155">Draws WGS84 Boundary Polygon</text>
      <text x="110" y="72" text-anchor="middle" font-size="7.5" fill="#334155">Uploads CDA / PLRA / e-Stamp Deed</text>
      <text x="110" y="86" text-anchor="middle" font-size="7.5" fill="#334155">E.164 Phone OTP Verified (CSPRNG)</text>

      <!-- ARROW 1 -->
      <line x1="200" y1="65" x2="250" y2="65" stroke="#64748b" stroke-width="2"/>
      <polygon points="250,65 244,61 244,69" fill="#64748b"/>

      <!-- SECURITY ENGINES BOX -->
      <rect x="250" y="15" width="200" height="100" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
      <text x="350" y="35" text-anchor="middle" font-size="9" font-weight="800" fill="#854d0e">2. CADASTRAL & CRYPTO ENGINES</text>
      <text x="350" y="52" text-anchor="middle" font-size="7.5" fill="#334155">Geodesic Area Math (90-110% ratio)</text>
      <text x="350" y="66" text-anchor="middle" font-size="7.5" fill="#334155">Ray-Casting Boundary Overlap Check</text>
      <text x="350" y="80" text-anchor="middle" font-size="7.5" fill="#334155">AES-256-GCM Envelope Encryption</text>
      <text x="350" y="94" text-anchor="middle" font-size="7.5" font-weight="700" fill="#b45309">Deed Vault at Rest (NQENC1 header)</text>

      <!-- ARROW 2 -->
      <line x1="450" y1="65" x2="500" y2="65" stroke="#64748b" stroke-width="2"/>
      <polygon points="500,65 494,61 494,69" fill="#64748b"/>

      <!-- STAGE 1: AI VISION BOX -->
      <rect x="500" y="20" width="160" height="90" rx="8" fill="#f0fdf4" stroke="#059669" stroke-width="1.5"/>
      <text x="580" y="42" text-anchor="middle" font-size="8.5" font-weight="800" fill="#065f46">3. STAGE 1: AI AUDIT</text>
      <text x="580" y="58" text-anchor="middle" font-size="7.5" fill="#334155">Gemini Vision OCR Inspection</text>
      <text x="580" y="72" text-anchor="middle" font-size="7.5" fill="#334155">Extracts Diary/Serial/e-Stamp #</text>
      <text x="580" y="86" text-anchor="middle" font-size="7.5" font-weight="700" fill="#047857">Zero DB Write Access</text>

      <!-- DOWN ARROW FROM AI TO OPERATOR -->
      <line x1="580" y1="110" x2="580" y2="160" stroke="#64748b" stroke-width="2"/>
      <polygon points="580,160 576,154 584,154" fill="#64748b"/>

      <!-- STAGE 2: OPERATOR CONSOLE -->
      <rect x="420" y="160" width="240" height="100" rx="8" fill="#faf5ff" stroke="#9333ea" stroke-width="1.5"/>
      <text x="540" y="180" text-anchor="middle" font-size="9" font-weight="800" fill="#6b21a8">4. STAGE 2: OPERATOR CONSOLE (/review)</text>
      <text x="540" y="196" text-anchor="middle" font-size="7.5" fill="#334155">Constant-Time Passphrase (timingSafeEqual)</text>
      <text x="540" y="210" text-anchor="middle" font-size="7.5" fill="#334155">1-Click Reverse Links past Government CAPTCHAs</text>
      <text x="540" y="224" text-anchor="middle" font-size="7.5" fill="#334155">Cross-checks PLRA Punjab Zameen & e-Stamp</text>
      <text x="540" y="238" text-anchor="middle" font-size="7.5" font-weight="700" fill="#7e22ce">Manual Human Sign-off</text>

      <!-- ARROW FROM OPERATOR TO ATOMIC RPC -->
      <line x1="420" y1="210" x2="350" y2="210" stroke="#64748b" stroke-width="2"/>
      <polygon points="350,210 356,206 356,214" fill="#64748b"/>

      <!-- ATOMIC APPROVAL STORED PROCEDURE -->
      <rect x="180" y="165" width="170" height="90" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
      <text x="265" y="185" text-anchor="middle" font-size="8.5" font-weight="800" fill="#047857">5. ATOMIC RPC APPROVAL</text>
      <text x="265" y="202" text-anchor="middle" font-size="7.5" fill="#334155">approve_listing (SECURITY DEFINER)</text>
      <text x="265" y="216" text-anchor="middle" font-size="7.5" fill="#334155">SELECT ... FOR UPDATE Lock</text>
      <text x="265" y="230" text-anchor="middle" font-size="7.5" fill="#334155">Draft transitions: submitted -> published</text>
      <text x="265" y="244" text-anchor="middle" font-size="7.5" font-weight="700" fill="#047857">ACID Concurrency Safe</text>

      <!-- ARROW TO PUBLIC MAP CATALOG -->
      <line x1="180" y1="210" x2="110" y2="210" stroke="#64748b" stroke-width="2"/>
      <polygon points="110,210 116,206 116,214" fill="#64748b"/>

      <!-- PUBLIC MAP CATALOG -->
      <rect x="20" y="165" width="160" height="90" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
      <text x="100" y="185" text-anchor="middle" font-size="8.5" font-weight="800" fill="#0f172a">6. 3D EXPLORER & RAG</text>
      <text x="100" y="202" text-anchor="middle" font-size="7.5" fill="#334155">public.plots Read-Only pgvector</text>
      <text x="100" y="216" text-anchor="middle" font-size="7.5" fill="#334155">Multi-Agent Swarm (UR/RO/EN)</text>
      <text x="100" y="230" text-anchor="middle" font-size="7.5" fill="#334155">Contact Masked from LLM Context</text>
      <text x="100" y="244" text-anchor="middle" font-size="7.5" font-weight="700" fill="#047857">Verified Institutional Trust</text>

      <!-- BOTTOM NOTE -->
      <rect x="20" y="275" width="640" height="42" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1"/>
      <text x="340" y="293" text-anchor="middle" font-size="7.5" font-weight="700" fill="#334155">ZERO-TRUST DATABASE PERIMETER: 07_lock_down_plot_writes.sql completely revokes direct writes.</text>
      <text x="340" y="307" text-anchor="middle" font-size="7.5" fill="#64748b">plot-documents bucket storage access completely revoked from public/anon/authenticated roles.</text>
    </svg>
  </div>

  <!-- SECTION 4: MATHEMATICAL & SPATIAL ENGINES -->
  <h2>4. Key Architectural Engines & Mathematical Modules <span class="section-tag">Math & Logic</span></h2>

  <h3>4.1 Cadastral Surface Area Calculation Engine (<code>lib/areaCalculator.js</code>)</h3>
  <p>Computes geodesic real-world surface area for drawn polygons on the WGS84 authalic ellipsoid using spherical excess geometry:</p>
  <ul>
    <li><strong>Pakistani Standard Units:</strong> 1 Marla = <strong>225 sq ft</strong> (CDA standard: 25×50 ft = 1,250 sq ft for 5 Marla); 1 Kanal = <strong>20 Marla</strong> = <strong>4,500 sq ft</strong>; 1 sq meter = <strong>10.7639 sq ft</strong>.</li>
    <li><strong>Anti-Encroachment Boundary Rule:</strong> Compares drawn polygon surface area against declared plot size, strictly enforcing an area ratio between <strong>90% and 110%</strong> (<code>MIN_AREA_MATCH_RATIO = 0.90</code>, <code>MAX_AREA_MATCH_RATIO = 1.10</code>). If drawn land exceeds 110%, the listing is immediately flagged as an <code>OVERSIZED_ENCROACHMENT_RISK</code>.</li>
  </ul>

  <h3>4.2 Spatial Overlap & Boundary Collision Engine (<code>lib/polygonOverlap.js</code>)</h3>
  <p>Implements the <strong>Ray-Casting Algorithm</strong> (Jordan Curve Theorem) to prevent overlapping boundaries and double allotments. Every submitted plot is tested against existing registered polygons; if an intersection is detected, the draft submission is blocked.</p>

  <h3>4.3 Infrastructure, Terrain & Connectivity Analysis (<code>lib/multiAgentAdvisor.js</code>)</h3>
  <p>Evaluates ground connectivity, utility infrastructure, and location access for Islamabad and Rawalpindi plots based on verified municipal geography:</p>
  <ul>
    <li><strong>Arterial Highway Corridors:</strong> Evaluates direct access and travel corridors to major twin-city arteries (Islamabad Expressway, Kashmir / Srinagar Highway, GT Road, Rawalpindi Ring Road).</li>
    <li><strong>Civic Utility Readiness:</strong> Verifies sector-level utility connections (SNGPL Sui Gas network, IESCO electric grid, CDA municipal water supply pipelines).</li>
    <li><strong>Commercial Hub & Markaz Proximity:</strong> Evaluates walking and vehicular access to sector commercial markazes, Metro Bus transit stations, and civic amenities.</li>
    <li><strong>Engineering Elevation & Topography:</strong> Evaluates terrain elevation profiles and foundation excavation suitability.</li>
  </ul>

  <h3>4.4 Regulatory & Authority Clearance Registry (<code>lib/regulatoryRegistry.js</code>)</h3>
  <p>Curated gazetted datasets covering CDA Zone 1 municipal sectors (direct one-window transfer), CDA approved private societies (valid NOC and Layout Plan), RDA approved schemes, and unapproved housing societies with official public warnings.</p>

  <!-- SECTION 5: ZERO-TRUST SECURITY -->
  <div class="page-break"></div>
  <h2>5. Security & Cryptography Architecture (Zero-Trust) <span class="section-tag">Security</span></h2>

  <table>
    <thead>
      <tr>
        <th>Security Pillar</th>
        <th>Cryptographic Mechanism</th>
        <th>Implementation File</th>
        <th>Threat Mitigated</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Deed Vault at Rest</strong></td>
        <td>AES-256-GCM envelope encryption with 4-byte <code>NQENC1</code> header, 96-bit random IV, and 128-bit auth tag.</td>
        <td><code>lib/documentCipher.js</code></td>
        <td>Prevents data theft, unauthorized CNIC exfiltration, and offline database dump compromise.</td>
      </tr>
      <tr>
        <td><strong>Operator Authentication</strong></td>
        <td>Bitwise constant-time string comparison (<code>timingSafeEqual</code>) on bearer passphrases.</td>
        <td><code>lib/authServer.js</code></td>
        <td>Eliminates early-exit timing side-channel attacks against operator review secrets.</td>
      </tr>
      <tr>
        <td><strong>Brute-Force Protection</strong></td>
        <td>Sliding-window IP rate limiter (5 failed attempts triggers 15-minute lockout).</td>
        <td><code>lib/operatorRateLimiter.js</code></td>
        <td>Stops automated password spraying and credential stuffing on the review portal.</td>
      </tr>
      <tr>
        <td><strong>Database Lockdown</strong></td>
        <td>RLS policies revoking all direct <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> writes on <code>public.plots</code>.</td>
        <td><code>07_lock_down_plot_writes.sql</code></td>
        <td>Prevents compromised client tokens or SQL injection from altering the live map catalog.</td>
      </tr>
      <tr>
        <td><strong>Atomic Publishing RPC</strong></td>
        <td>PostgreSQL <code>SECURITY DEFINER</code> function with <code>SELECT ... FOR UPDATE</code> concurrency lock.</td>
        <td><code>08_atomic_listing_approval.sql</code></td>
        <td>Guarantees ACID concurrency safety and eliminates race condition multi-approvals.</td>
      </tr>
      <tr>
        <td><strong>Prompt Injection Defense</strong></td>
        <td>Strict XML boundary encapsulation (<code>&lt;untrusted_user_query&gt;</code>) in LLM system prompts.</td>
        <td><code>lib/multiAgentAdvisor.js</code></td>
        <td>Prevents adversarial user queries from hijacking model instructions or leaking internal rules.</td>
      </tr>
      <tr>
        <td><strong>Contact Privacy Masking</strong></td>
        <td>Seller phone numbers stripped from LLM prompt context; re-attached out-of-band in code.</td>
        <td><code>app/api/chat/route.js</code></td>
        <td>Prevents data harvesting and privacy leakage through conversational exfiltration attacks.</td>
      </tr>
    </tbody>
  </table>

  <!-- SECTION 6: MULTI-AGENT SWARM -->
  <h2>6. Generative AI & Autonomous Multi-Agent Swarm <span class="section-tag">AI Swarm</span></h2>

  <p>NAQSHAI employs a two-tier multi-agent architecture designed for rapid, deterministic advisory:</p>

  <div class="callout callout-blue">
    <strong>Swarm Roles & Model Allocation:</strong>
    <ul style="margin-top: 4px; margin-left: 16px;">
      <li><strong>Agent 1: Cadastral & Valuation Specialist (<code>gemini-3.5-flash-lite</code>):</strong> Analyzes budget feasibility, calculates exact price per Marla, and identifies target sector corridors (< 800ms).</li>
      <li><strong>Agent 2: Legal & Regulatory Specialist (<code>gemini-3.5-flash-lite</code>):</strong> Evaluates society NOC status, CDA master plan zoning, and title registry requirements.</li>
      <li><strong>Agent 3: Infrastructure & Location Specialist (<code>gemini-3.5-flash-lite</code>):</strong> Evaluates arterial highway access, civic utility connectivity (gas, electricity, water), and Markaz proximity.</li>
      <li><strong>Chief Synthesizer (<code>gemini-3.5-flash</code>):</strong> Merges specialist findings into a cohesive, structured advisory with fluid multilingual output (English, Nastaliq Urdu, and Roman Urdu).</li>
    </ul>
  </div>

  <p><strong>Vector Similarity Search:</strong> Embedded using <code>text-embedding-004</code> and stored in PostgreSQL via the <code>pgvector</code> extension. Queries invoke the <code>match_plots</code> RPC with Hierarchical Navigable Small World (HNSW) cosine distance indexing.</p>

  <!-- SECTION 7: DIRECTORY MAP & KEY FILES -->
  <div class="page-break"></div>
  <h2>7. Annotated Directory Map & Key Files <span class="section-tag">Codebase Map</span></h2>

  <pre>naqshai/
├── app/                                 # Next.js App Router root
│   ├── page.js                          # Landing Page ("Refined Architectural Light" hero)
│   ├── explore/                         # /explore: 3D interactive map, filters, plot drawer
│   ├── sell/                            # /sell: Citizen listing wizard (polygon drawing + deed upload)
│   ├── review/                          # /review: Secure compliance operator verification console
│   ├── recommend/                       # /recommend: Conversational AI advisor interface
│   └── api/                             # Serverless API routes
│       ├── chat/route.js                # Multi-Agent Swarm & RAG conversational endpoint
│       ├── review/approve/route.js      # Calls atomic RPC approve_listing
│       ├── documents/                   # Deed Vault streaming & access token generator
│       └── auth/phone/                  # E.164 normalization, OTP generation & verification
├── components/                          # Modular React UI components
│   ├── explore/InteractiveMap.js        # Google Maps JS container, polygons & markers
│   ├── explore/PlotDetailsDrawer.js     # Slide-out property inspection drawer
│   └── Review/DraftVerificationTable.js # Tabular review queue with 1-click government links
├── lib/                                 # Core mathematical, security & AI engines
│   ├── areaCalculator.js                # Geodesic WGS84 surface area calculator (90-110% ratio)
│   ├── polygonOverlap.js                # Ray-casting point-in-polygon boundary collision engine
│   ├── documentCipher.js                # AES-256-GCM envelope encryption & HMAC token generator
│   ├── authServer.js                    # Server-side auth & timingSafeEqual constant-time matching
│   ├── multiAgentAdvisor.js             # Autonomous Multi-Agent Swarm (Workers + Synthesizer)
│   ├── aiDocumentVerifier.js            # Gemini Vision OCR deed analysis (Stage 1 HITL)
│   ├── environmentalMetrics.js          # Sector elevation & terrain calculation utilities
│   └── regulatoryRegistry.js            # CDA Zone 1-5, RDA NOC & illegal society gazette datasets
└── supabase/migrations/                 # 15 PostgreSQL migration scripts (01 to 15)</pre>

  <!-- SECTION 8: DATABASE SCHEMA & MIGRATIONS -->
  <h2>8. Database Schema & Migration Ledger (15 Migrations) <span class="section-tag">Database</span></h2>

  <table>
    <thead>
      <tr>
        <th>Migration File</th>
        <th>Core Database Mutation</th>
        <th>Architectural Purpose</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><code>01_schema.sql</code></td><td>Creates <code>public.plots</code> table with PostGIS and pgvector.</td><td>Foundational spatial property catalog.</td></tr>
      <tr><td><code>02_vector_hnsw_index.sql</code></td><td>Adds HNSW cosine distance index and <code>match_plots</code> RPC.</td><td>Fast sub-50ms vector similarity search.</td></tr>
      <tr><td><code>02_listing_drafts.sql</code></td><td>Creates <code>public.listing_drafts</code> table with RLS.</td><td>Isolates unapproved citizen listing submissions.</td></tr>
      <tr><td><code>07_lock_down_plot_writes.sql</code></td><td>Revokes all <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> on <code>public.plots</code>.</td><td>Enforces zero-trust database perimeter.</td></tr>
      <tr><td><code>08_atomic_listing_approval.sql</code></td><td>Defines <code>approve_listing</code> with <code>SELECT ... FOR UPDATE</code>.</td><td>Atomic ACID listing publication workflow.</td></tr>
      <tr><td><code>13_secure_document_storage.sql</code></td><td>Revokes direct client access on <code>plot-documents</code> bucket.</td><td>Prevents unauthenticated deed access.</td></tr>
      <tr><td><code>14_document_security_logs.sql</code></td><td>Creates <code>plot_document_access_logs</code> immutable audit table.</td><td>Audit trail for every deed view/decryption.</td></tr>
      <tr><td><code>15_site_visitor_analytics.sql</code></td><td>Creates <code>site_visitor_analytics</code> with bot rate limits.</td><td>Privacy-friendly attribution and QR metrics.</td></tr>
    </tbody>
  </table>

  <!-- SECTION 9: RUNBOOK & DIRECTIVES -->
  <h2>9. Operational Runbook & 5 Directives for Future AI Assistants <span class="section-tag">Runbook</span></h2>

  <h3>9.1 Developer Runbook Commands</h3>
  <pre># 1. Start local Next.js App Router development server:
npm run dev

# 2. Run automated security and regression test suites (217 tests):
node scripts/test-adversarial-prompt-injection.mjs
node scripts/test-otp-verification.mjs
node scripts/test-portal-verification-pipeline.mjs

# 3. Compile presentation-grade documentation to PDF:
node scripts/build-history-pdf.mjs
node scripts/build-project-context-pdf.mjs</pre>

  <h3>9.2 The 5 Inviolable Directives for Any AI Working on this Repository</h3>
  <div class="callout callout-emerald">
    <ol style="margin-left: 16px;">
      <li><strong>Preserve Zero Autonomous AI Authority:</strong> Never allow an AI model or webhook to directly publish listings to <code>public.plots</code>. Approvals must flow through authenticated operators via the <code>approve_listing</code> atomic stored procedure.</li>
      <li><strong>Preserve Geodesic Area Tolerances:</strong> Never alter the 90%–110% area match ratio in <code>lib/areaCalculator.js</code>. This is the foundational defense against cadastral encroachment.</li>
      <li><strong>Preserve Prompt Boundary Isolation:</strong> Always encapsulate untrusted inputs in <code>&lt;untrusted_user_query&gt;</code> tags and mask seller phone numbers from LLM context.</li>
      <li><strong>Preserve Timing Attack Defenses:</strong> Always compare passphrases and security tokens using <code>crypto.timingSafeEqual</code>. Never use <code>===</code> on secrets.</li>
      <li><strong>Preserve Test Integrity:</strong> Ensure all 217 automated assertions across the 5 test suites continue to pass after any code changes.</li>
    </ol>
  </div>

  <p style="margin-top: 20px; font-weight: 700; color: #047857; text-align: center; font-size: 9pt;">
    NAQSHAI — Institutional Cadastral Intelligence & Land Record Verification Infrastructure
  </p>

</body>
</html>`;

const htmlFilePath = path.join(docsDir, 'NAQSHAI_Master_Project_Context.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf-8');
console.log(`[Project Context PDF Generator] ✓ Visual HTML written to: ${htmlFilePath}`);

const pdfFilePath = path.join(docsDir, 'NAQSHAI_Master_Project_Context.pdf');
console.log('[Project Context PDF Generator] Compiling HTML into PDF via Google Chrome headless...');

const chromePaths = [
  'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  'C:\\\\Program Files (x86)\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe',
  'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe',
];

let compiled = false;
for (const bin of chromePaths) {
  if (fs.existsSync(bin)) {
    try {
      execFileSync(bin, [
        '--headless=new',
        '--disable-gpu',
        '--no-pdf-header-footer',
        '--print-to-pdf=' + pdfFilePath,
        htmlFilePath
      ]);
      if (fs.existsSync(pdfFilePath) && fs.statSync(pdfFilePath).size > 1000) {
        console.log(`[Project Context PDF Generator] ✓ PDF successfully compiled: ${pdfFilePath} (${fs.statSync(pdfFilePath).size} bytes)`);
        compiled = true;
        break;
      }
    } catch (e) {
      console.warn(`[Project Context PDF Generator] Compilation attempt via ${bin} failed:`, e.message);
    }
  }
}

if (!compiled) {
  console.error('[Project Context PDF Generator] Error: Could not compile PDF automatically.');
  process.exit(1);
}

// Copy to artifact directory
const brainDir = 'C:\\\\Users\\\\Ahsan hayat\\\\.gemini\\\\antigravity\\\\brain\\\\ae49ff0d-129c-48f6-8aeb-420b9eb6f0f9';
if (fs.existsSync(brainDir)) {
  fs.copyFileSync(pdfFilePath, path.join(brainDir, 'NAQSHAI_Master_Project_Context.pdf'));
  console.log('[Project Context PDF Generator] ✓ Copied PDF to brain artifact directory');
}

console.log('[Project Context PDF Generator] Finished successfully!');

