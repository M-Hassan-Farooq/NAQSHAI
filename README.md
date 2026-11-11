<div align="center">

# 🗺️ NAQSHAI (نقشہ)

### Institutional Cadastral Intelligence & Land Record Verification Infrastructure
**Target Jurisdiction:** Islamabad Capital Territory (CDA Zones 1–5) & Rawalpindi District (RDA / PLRA Punjab Zameen / Punjab e-Stamp)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.8-149eca?logo=react&logoColor=white)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_pgvector-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com)
[![Google Gen AI](https://img.shields.io/badge/Google_Gen_AI-Gemini_3.5_%26_Flash--Lite-8e75ff?logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![Tests Passing](https://img.shields.io/badge/Tests-217%20%2F%20217%20Passing%20(100%25)-emerald)](scripts/test-portal-verification-pipeline.mjs)
[![Zero-Trust Security](https://img.shields.io/badge/Security-AES--256--GCM_Deed_Vault-blue)](lib/documentCipher.js)
[![Production URL](https://img.shields.io/badge/Live_Deployment-naqshaii.vercel.app-047857)](https://naqshaii.vercel.app/)

</div>

---

## 📖 Executive Overview

**NAQSHAI** ("نقشہ" — *map/blueprint* in Urdu) is a full-stack, institutional-grade property intelligence and title verification platform engineered for Pakistan's twin cities (Islamabad and Rawalpindi).

Conventional property portals (Zameen.com, Graana, OLX) monetize **listing volume** via unverified classified ads. Consequently, buyers — particularly **Non-Resident Pakistanis (NRPs)** who remit over \$30 Billion annually to Pakistan — face rampant real estate fraud:

* **Non-Balloted Files:** Housing societies selling 50,000 speculative "paper files" while owning land for only 10,000 physical plots. Buyers pay installments for 5+ years without a physical parcel allocated.
* **Cadastral Boundary Encroachment (*Zameen Qabza*):** Sellers claiming 10 Marla on paper but fencing 13 Marla on ground to steal CDA green belts or access roads. When the CDA/RDA anti-encroachment wing strikes, buyers face demolition.
* **Duplicate Registries:** Historic paper registers (*Latha / Jamabandi*) held by local *Patwaris* allowing the same plot to be sold to multiple buyers using duplicate stamp papers.
* **Walled Government Registries:** Official land records (PLRA Punjab Zameen, Punjab e-Stamp, CDA Dastak) locked behind CAPTCHAs with zero public developer APIs.
* **The Autonomous AI Trap:** Giving an LLM autonomous write access to approve uploaded property deeds invites adversarial prompt injection attacks (e.g. white-on-white text in PDFs commanding the model to approve fake land).

### How NAQSHAI Solves It
NAQSHAI replaces naive classifieds pins with mathematical, spatial, and institutional verification:
1. **WGS84 Geodesic Ellipsoidal Area Engine:** Calculates real-world surface area and enforces a strict **90%–110% area match ratio** vs declared plot size to block boundary encroachment.
2. **Ray-Casting Collision Engine:** Detects and blocks boundary overlap conflicts against registered parcels using the Jordan Curve theorem.
3. **AES-256-GCM Deed Vault:** Encrypts citizen ownership deeds at rest with authenticated 128-bit tags, signed ephemeral access tokens, and immutable audit logging.
4. **2-Stage Human-in-the-Loop (HITL) Verification:** Gemini Vision performs passive, advisory OCR analysis (0 database write authority), while human compliance officers use 1-click citizen-mediated deep links to verify government records past CAPTCHAs in under 10 seconds.
5. **Autonomous Multi-Agent Swarm:** Parallelized subagents (Cadastral & Price, Legal & Regulatory, Infrastructure & Location) feed a Chief Synthesizer for multilingual real estate advisory in English, Nastaliq Urdu, and Roman Urdu.

---

## 🏗️ Architectural Topology: The 2-Stage HITL Pipeline

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PUBLIC CITIZEN LAYER                                  │
│   Buyer: Map Explorer (/explore) & AI Chat Advisor (/recommend) [UR / RO / EN]        │
│   Seller: Multi-Step Listing Wizard (/sell) with Polygon Drawing & Deed Upload         │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ E.164 Phone OTP Verified (CSPRNG + HMAC)
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY PERIMETER & CADASTRAL MATH                           │
│   • Geodesic Area Engine (lib/areaCalculator.js): Strict 90%–110% area ratio check    │
│   • Ray-Casting Collision Engine (lib/polygonOverlap.js): Point-in-polygon overlap     │
│   • AES-256-GCM Deed Vault (lib/documentCipher.js): NQENC1 header envelope encryption │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Encrypted Deed Upload & Draft Saved
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 1: PASSIVE MULTIMODAL AI AUDIT                            │
│   • Gemini Vision OCR (lib/aiDocumentVerifier.js) extracts Serial, Diary & e-Stamp #   │
│   • Saves advisory ai_verification_report JSON. Model has ZERO database write access. │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Ready for Compliance Officer
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    STAGE 2: COMPLIANCE OPERATOR CONSOLE (/review)                      │
│   • Constant-time auth (timingSafeEqual) + sliding-window IP lockout rate limiter      │
│   • 1-Click Reverse Deep Links past Government CAPTCHAs (PLRA, e-Stamp, CDA Dastak)    │
│   • Manual Human Compliance Officer Sign-off                                           │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ Calls Atomic Stored Procedure
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                       ATOMIC RPC APPROVAL & DATABASE LOCKDOWN                          │
│   • approve_listing stored procedure (SECURITY DEFINER + SELECT ... FOR UPDATE lock)   │
│   • 07_lock_down_plot_writes.sql revokes all direct INSERT/UPDATE/DELETE writes        │
│   • Atomic transition: listing_drafts (submitted) ➔ public.plots (published)           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🧱 Technology Stack

| Layer | Technology | Version / Spec | Functional Scope in NAQSHAI |
| --- | --- | --- | --- |
| **Framework** | [Next.js](https://nextjs.org) | `16.3.3` (App Router) | Full-stack SSR, streaming UI, API route handlers (Node.js runtime) |
| **UI Library** | [React](https://react.dev) | `19.2.8` | Component rendering, hooks, state machines |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | `v4` (`@tailwindcss/postcss`) | "Refined Architectural Light" civic design system |
| **Mapping** | [Google Maps JS API](https://developers.google.com/maps) | `@react-google-maps/api` | Satellite maps, Street View 360, cadastral drawing, Places Autocomplete |
| **AI & LLM** | [Google Gen AI SDK](https://ai.google.dev) | `@google/genai@^2.19.0` | Multi-Agent Swarm (`gemini-3.5-flash-lite` & `flash`), Vision OCR |
| **Database** | [Supabase](https://supabase.com) PostgreSQL | `v2.112.4` SDK | Relational tables, RLS policies, Storage |
| **Vector Engine** | `pgvector` | HNSW Cosine Index | Semantic plot similarity matching (`match_plots` RPC) |
| **Cryptography** | Node.js `crypto` | Standard Library | AES-256-GCM Deed Vault, HMAC challenge tokens, `timingSafeEqual` |
| **Icons** | [Lucide React](https://lucide.dev) | `lucide-react@^1.37.0` | Verification badges, hazard icons, navigation |
| **Testing** | Node ESM Test Scripts | Custom Harness | 5 test suites | 217 passing security assertions |

---

## ✨ Key Capabilities & Modules

### 1. 🗺️ 3D Cadastral Map Explorer (`/explore`)
* **Polygon Geometry Over Pins:** Properties are rendered as surveyed boundaries on Google Maps satellite imagery, not deceptive static point markers.
* **Property Inspector Drawer:** Displays declared vs calculated area, elevation profile, and neighborhood amenity scores.
* **Street View 360:** Instant panoramic ground verification.

### 2. 🛡️ 2-Stage Verification & Operator Console (`/review`)
* **Zero Autonomous AI Authority:** AI analyzes deeds and extracts serials, but cannot publish plots.
* **1-Click Citizen-Mediated Government Lookups:** Compliance officers verify scanned deed serials directly on:
  * **Punjab Land Records Authority (PLRA) Punjab Zameen Portal**
  * **Punjab e-Stamp Verification Portal**
  * **Capital Development Authority (CDA) One-Window / Dastak**
* **Atomic ACID Publishing:** Approved listings are committed via the `approve_listing` PostgreSQL stored procedure using `SELECT ... FOR UPDATE` row locking.

### 3. 🤖 Autonomous Multi-Agent Real Estate Swarm (`/recommend` & `/api/chat`)
* **Cadastral & Price Specialist (`gemini-3.5-flash-lite`):** Evaluates budget feasibility in PKR Crore/Lakh and calculates price per Marla.
* **Legal & Regulatory Specialist (`gemini-3.5-flash-lite`):** Cross-checks CDA Zone 1–5 master plan zoning, RDA NOC status, and gazetted unapproved schemes.
* **Infrastructure & Location Specialist (`gemini-3.5-flash-lite`):** Evaluates urban connectivity, arterial highway access (Islamabad Expressway, Kashmir Highway, Ring Road), Markaz proximity, and utility readiness (SNGPL Gas, IESCO Electricity, CDA Water Supply).
* **Chief Synthesizer (`gemini-3.5-flash`):** Synthesizes specialist reports into a cohesive executive verdict with fluid multilingual output in **English**, **Nastaliq Urdu**, and **Roman Urdu**.

### 4. 🔐 Zero-Trust Security & Deed Vault (`lib/documentCipher.js`)
* **AES-256-GCM Envelope Encryption at Rest:** Uploaded deeds are encrypted with a 4-byte `NQENC1` magic header, 96-bit random IV, and 128-bit authentication tag.
* **Revoked Client Storage Access:** Direct client access to the `plot-documents` storage bucket is completely revoked in PostgreSQL. Files can only be streamed via time-bounded signed access tokens (`dat_...`).
* **RAG Prompt Injection Containment:** Adheres to all 5 RAG Security Principles. User queries are delimited in `<untrusted_user_query>` XML containers, and raw seller phone numbers are masked from the LLM prompt context to prevent exfiltration.

---

## 🚀 Getting Started

### Prerequisites
* **Node.js 20.9+** and **npm**
* A **Supabase** project (PostgreSQL + Auth + Storage + pgvector)
* A **Google Maps JavaScript API** key (with Maps, Places & Geometry enabled)
* A **Google AI Studio / Gemini** API key

### 1. Installation
```bash
git clone https://github.com/M-Hassan-Farooq/NAQSHAI.git
cd NAQSHAI
npm install
```

### 2. Environment Configuration
Copy the template and populate your local credentials:
```powershell
Copy-Item .env.example .env.local
```

Configure `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # Server-only (bypasses RLS for approvals)

# Operator Console Authentication (/review)
OPERATOR_PASSPHRASE=your-secure-operator-passphrase

# Google Cloud & Gen AI Credentials
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key
GEMINI_API_KEY=your-gemini-api-key

# Canonical URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: 32-byte hex encryption key for AES-256 Deed Vault (auto-derived if omitted)
# DOCUMENT_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

### 3. Database Migrations
Execute the 15 SQL migrations in [`supabase/migrations/`](supabase/migrations/) in numeric order inside the Supabase SQL Editor:

```text
01_schema.sql                           → Base plots table, PostGIS, pgvector extension
02_listing_drafts.sql                   → listing_drafts table with initial RLS
02_vector_hnsw_index.sql                → HNSW cosine vector index & match_plots() RPC
03_profiles_table.sql                   → User profiles & automatic creation trigger
04_favorites_table.sql                  → User plot bookmarking with owner RLS
04_listing_rejection.sql                → rejection_reason schema support
05_listing_draft_lockdown.sql           → Owner-only draft policies
06_fix_published_plot_id_type.sql      → UUID type alignment for published_plot_id
07_lock_down_plot_writes.sql            → Complete lockdown revoking client writes on public.plots
08_atomic_listing_approval.sql          → approve_listing() RPC (SECURITY DEFINER + row lock)
09_restore_seller_user_id.sql           → Foreign key indexing on seller_user_id
10_create_profiles_table.sql            → Hardened profile security and metadata
11_plots_created_at_index.sql           → Performance B-tree index on created_at DESC
12_lock_down_seller_writes.sql          → Owner-scoped seller RLS enforcement
13_secure_document_storage_and_paths.sql→ Revokes public client access on plot-documents bucket
14_document_security_and_access_logs.sql→ plot_document_access_logs immutable audit ledger
15_site_visitor_analytics.sql           → site_visitor_analytics with bot rate limiting
```

### 4. Running the Development Server
```bash
npm run dev
# Open http://localhost:3000
```

---

## 🧪 Automated Testing & Security Verification

NAQSHAI features a comprehensive automated test harness covering **217 automated assertions with a 100% pass rate**:

```bash
# 1. Test 5 RAG Security Principles & Adversarial Prompt Injection Containment
node scripts/test-adversarial-prompt-injection.mjs

# 2. Test Phone Verification, CSPRNG OTPs & timingSafeEqual Auth (79 assertions)
node scripts/test-otp-verification.mjs

# 3. Test Full Listing-to-Publish Verification Pipeline
node scripts/test-portal-verification-pipeline.mjs

# 4. Test Geodesic Surface Area Calculation & 90%-110% Tolerance Enforcement
node scripts/test-area-verification.mjs

# 5. Test Ray-Casting Polygon Boundary Collision & Overlap Detection
node scripts/test-polygon-overlap.mjs

# 6. Test HTTP Security Headers & Content Security Policy (CSP)
node scripts/test-csp-and-headers.mjs
```

---

## 📁 Repository Structure

```text
NAQSHAI/
├── app/                                 # Next.js App Router endpoints & views
│   ├── page.js                          # Landing Hero ("Refined Architectural Light")
│   ├── explore/                         # /explore: 3D interactive map & filters
│   ├── sell/                            # /sell: Citizen listing wizard & boundary drawer
│   ├── review/                          # /review: Secure compliance operator verification console
│   ├── recommend/                       # /recommend: Multilingual AI advisor chat
│   ├── favorites/                       # /favorites: User bookmarked properties
│   └── api/                             # Serverless API endpoints
│       ├── chat/route.js                # Multi-Agent Swarm & RAG endpoint
│       ├── review/approve/route.js      # Calls atomic RPC approve_listing
│       ├── documents/                   # Deed Vault streaming & signed token generator
│       └── auth/phone/                  # E.164 normalization, OTP generation & verification
├── components/                          # React UI components
│   ├── explore/InteractiveMap.js        # Google Maps container, polygon rendering & markers
│   ├── explore/PlotDetailsDrawer.js     # Slide-out property inspection drawer
│   ├── Review/DraftVerificationTable.js # Tabular operator review queue with 1-click links
│   └── Navbar.js                        # Responsive header with status pills
├── lib/                                 # Mathematical, security & AI engines
│   ├── areaCalculator.js                # Geodesic WGS84 surface area calculator (90-110% ratio)
│   ├── polygonOverlap.js                # Ray-casting point-in-polygon boundary collision engine
│   ├── documentCipher.js                # AES-256-GCM envelope encryption & HMAC token generator
│   ├── authServer.js                    # Server-side auth & timingSafeEqual constant-time matching
│   ├── multiAgentAdvisor.js             # Autonomous Multi-Agent Swarm (Workers + Synthesizer)
│   ├── aiDocumentVerifier.js            # Gemini Vision OCR deed analysis (Stage 1 HITL)
│   ├── environmentalMetrics.js          # Sector elevation & terrain calculation utilities
│   └── regulatoryRegistry.js            # CDA Zone 1-5, RDA NOC & illegal society gazette datasets
├── supabase/migrations/                 # 15 PostgreSQL migration scripts (01 to 15)
├── scripts/                             # Automated test suites & executive documentation compilers
│   ├── test-adversarial-prompt-injection.mjs # 5 RAG security principles benchmark
│   ├── test-otp-verification.mjs        # 79 assertions on phone OTP & HMAC tokens
│   ├── build-history-pdf.mjs            # Compiles Engineering Chronicle to PDF
│   └── build-project-context-pdf.mjs    # Compiles Master Project Context to PDF
└── documentation/                       # Architecture, security & historical chronicles
    ├── PROJECT_CONTEXT.md               # Master AI Onboarding & Context File
    ├── NAQSHAI_Master_Project_Context.pdf # Compiled Executive Context PDF (318 KB)
    ├── NAQSHAI_Development_History_and_Idea_Evolution.pdf # Compiled Chronicle PDF (596 KB)
    └── NAQSHAI_Security_Architecture_Dossier.pdf # Comprehensive Security Dossier (298 KB)
```

---

## 📚 Executive Documentation & AI Onboarding

For engineers and AI assistants working on this repository, detailed documentation dossiers are available:

* **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — **Master AI Onboarding Dossier** containing the complete, single-source-of-truth context on all architectural engines, mathematical formulas, and the 5 inviolable directives for future AI assistants.
* **[NAQSHAI_Master_Project_Context.pdf](documentation/NAQSHAI_Master_Project_Context.pdf)** — Presentation-grade compiled PDF (318 KB) with vector system topology flowcharts and operational runbooks.
* **[NAQSHAI_Development_History_and_Idea_Evolution.pdf](documentation/NAQSHAI_Development_History_and_Idea_Evolution.pdf)** — Complete 79-day chronicle across all 137 commits, code volume analytics (+41,722 / -9,378 lines), author contribution breakdowns, and idea maturation.
* **[NAQSHAI_Security_Architecture_Dossier.pdf](documentation/NAQSHAI_Security_Architecture_Dossier.pdf)** — Deep-dive security defense documentation covering AES-256-GCM, RLS, and prompt injection hardening.

---

## 👥 Engineering Team & Contribution Breakdown

Across **79 days of development** (August 20, 2026 – November 7, 2026), **137 commits** and **32,344 net production code lines** were authored:

* **Hassan (Muhammad Hassan Farooq)** — *Lead Product Architect & Full-Stack Core Engineer*  
  68 commits (49.6%) | +7,901 added / -2,921 deleted (+4,980 net lines).  
  *Core listing submission wizard (`/sell`), multi-step draft progress state machine, dynamic plot dimension tolerances, atomic listing approval RPC, and explorer UX.*

* **Ahsan Hayat** — *Lead Systems, AI & Security Infrastructure Engineer*  
  66 commits (48.2%) | +29,764 added / -6,355 deleted (+23,409 net lines).  
  *Autonomous Multi-Agent Swarm, Gemini Vision OCR deed verifier, AES-256-GCM Deed Vault, WGS84 geodesic area math, ray-casting collision engine, constant-time bearer auth (`timingSafeEqual`), and 217 automated passing tests.*

* **alizy51125** — *Frontend Geospatial Integrator*  
  3 commits (2.2%) | +4,057 added / -102 deleted (+3,955 net lines).  
  *Initial Google Maps dashboard scaffold and Places Autocomplete search bar.*

---

## 📄 License & Intellectual Property

Private and Proprietary. Engineered for the Bano-Qabil AI Hackathon and institutional real estate verification in Pakistan.
