<div align="center">

# 🗺️ NAQSHAI

### AI-Powered Real Estate Intelligence for Pakistan

Interactive 3D map exploration, semantic plot search, and environmental risk
intelligence for Islamabad & Rawalpindi — built on Next.js, Supabase (pgvector),
and Google Gemini.

![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.8-149eca?logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Postgres_+_pgvector-3ecf8e?logo=supabase&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_flash-8e75ff?logo=googlegemini&logoColor=white)
![License](https://img.shields.io/badge/license-Private-lightgrey)

</div>

---

## 📖 Overview

**NAQSHAI** ("نقش" — *map/blueprint* in Urdu) is a full-stack property intelligence
platform for the Islamabad / Rawalpindi land market. Buyers explore verified plot
listings on an interactive 3D Google Map, ask natural-language questions in
**English, Urdu, or Roman Urdu**, and get grounded recommendations backed by live
database inventory and vector similarity search. Sellers submit listings through a
gated draft → review → publish lifecycle with document verification.

Every plot carries **environmental risk intelligence** (flood risk, noise level in
dB, elevation profile) and a **neighborhood amenity score** (healthcare, education,
commerce, transit proximity).

> ⚠️ **Scope note:** The app source lives in the [`naqshai/`](naqshai) subdirectory.
> All commands below run from there.

---

## ✨ Key Features

| Feature | Description |
| --- | --- |
| 🗺️ **3D Map Explorer** | Interactive Google Maps terrain with hand-drawn plot polygons, markers, and an in-map inspector. |
| 🤖 **AI Advisor (RAG Chatbot)** | Gemini-powered assistant with intent routing, multilingual NLP constraint parsing, and hybrid vector + keyword retrieval. |
| 🔎 **Semantic Search** | `pgvector` embeddings (`gemini-embedding-001`, 768-dim) power meaning-based plot matching via the `match_plots` RPC. |
| 🌊 **Environmental Intelligence** | Deterministic per-plot flood-risk, noise (dB), and elevation modelling keyed to sector/zone geography. |
| 🏥 **Amenity Scoring** | Haversine proximity scoring against a curated Islamabad/Rawalpindi landmark registry (0–100 weighted score). |
| ⭐ **Favorites** | Guest favorites in `localStorage`, seamlessly migrated to the server on login (owner-scoped RLS). |
| 📝 **Seller Draft Lifecycle** | Multi-step listing drafts → submit → operator review → atomic approval & publish. |
| 🛡️ **Operator Review Queue** | Passphrase-gated dashboard to inspect submitted listings and signed verification documents. |
| 🔐 **Secure Auth** | Supabase Auth (email + OAuth), bearer-token API verification, and Postgres Row Level Security. |

---

## 🧱 Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | [Next.js](https://nextjs.org) `16.3.3` (App Router, Edge + Node runtimes) |
| **UI** | [React](https://react.dev) `19.2.8` (React Compiler enabled), [Tailwind CSS](https://tailwindcss.com) `v4`, [lucide-react](https://lucide.dev) icons |
| **Maps** | [Google Maps JavaScript API](https://developers.google.com/maps) via `@react-google-maps/api` (Places library) |
| **AI / LLM** | [Google Gen AI SDK](https://ai.google.dev) `@google/genai` — `gemini-2.5-flash` (chat) + `gemini-embedding-001` (vectors) |
| **Database** | [Supabase](https://supabase.com) — PostgreSQL + `pgvector` (HNSW index), Storage, Auth |
| **Auth** | `@supabase/ssr` + `@supabase/supabase-js` (browser sessions, RLS, service-role for privileged ops) |
| **Image** | `sharp` (server-side image processing dependency) |
| **Linting** | ESLint `9` (flat config) + `eslint-config-next` (core-web-vitals) + React Compiler rules |
| **Language** | JavaScript (ESM) with JSDoc annotations — no TypeScript build step |

---

## 🏗️ Architecture

```
┌──────────────────────────── Browser (React 19) ────────────────────────────┐
│  Pages: / /explore /recommend /sell /dashboard /review /favorites /settings  │
│  Contexts: FavoritesContext · ProfileContext    Components: Navbar, Chatbot… │
└───────────────┬──────────────────────────────────────────┬─────────────────┘
                │ Bearer token (localStorage session)       │ Google Maps JS API
                ▼                                            ▼
┌──────────────────────── Next.js API Routes ────────────────────────┐   (Map tiles)
│  Public:  /api/plots · /api/chat · /api/recommend · /api/amenities   │
│  User:    /api/favorites · /api/drafts · /api/drafts/[id]/submit     │
│  Operator:/api/review · /api/drafts/[id]/approve · /api/embeddings…  │
└───────┬───────────────────────────────┬──────────────────┬──────────┘
        │ anon / user / service-role     │ Gemini API        │
        ▼                                ▼                   ▼
┌───────────────┐            ┌────────────────────┐   ┌──────────────┐
│   Supabase    │            │  Google Gen AI      │   │  Supabase    │
│  Postgres +   │            │  chat + embeddings  │   │  Storage     │
│  pgvector     │            └────────────────────┘   │ (documents)  │
│  (RLS)        │                                      └──────────────┘
└───────────────┘
```

**Auth model.** Sessions live in the browser (`@supabase/ssr` `createBrowserClient`).
Every privileged API call sends `Authorization: Bearer <access_token>`; the server
verifies identity via [`lib/authServer.js`](naqshai/lib/authServer.js) and **never**
trusts a client-supplied owner id. Ownership is enforced a second time by Postgres
RLS. Operator-only routes accept either an `OPERATOR_PASSPHRASE` or a service-role
token, compared with `timingSafeEqual`.

**Write path.** Published `plots` rows can **only** be written by server-side
privileged code (writes are revoked from `anon`/`authenticated` in migration `07`).
User listings flow through `listing_drafts` and become plots only after an operator
approves them via the atomic `approve_listing` RPC (migration `08`).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 20.9+** (Next.js 16 requirement) and **npm**
- A **Supabase** project (Postgres + Auth + Storage)
- A **Google Cloud** API key with the **Maps JavaScript API** enabled
- A **Google AI Studio / Gemini** API key

### 1. Clone & install

```bash
git clone https://github.com/<your-username>/NAQSHAI.git
cd NAQSHAI/naqshai
npm install
```

### 2. Configure environment

Create `naqshai/.env.local`:

```env
# Supabase (Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only, never expose

# Operator gating for /review + approve/reject
OPERATOR_PASSPHRASE=a-long-random-secret

# Google Maps (browser) + Gemini (server)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-key
GEMINI_API_KEY=your-gemini-key

# Canonical site URL used for auth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

| Variable | Required | Description |
| --- | :--: | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Bypasses RLS — **server only**. Required for approvals, review queue, embedding backfill. |
| `OPERATOR_PASSPHRASE` | ⚠️ | Shared secret granting operator access. Required for `/review`. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | ✅ | Loads the interactive map. |
| `GEMINI_API_KEY` | ✅ | Powers chat + embeddings. |
| `NEXT_PUBLIC_SITE_URL` | ✅ | Base URL for OAuth/email redirect callbacks. |

> ✅ = needed to run the app · ⚠️ = needed for operator/admin features

### 3. Set up the database

Apply the SQL migrations in [`naqshai/supabase/migrations/`](naqshai/supabase/migrations)
**in numeric order** (Supabase SQL Editor or `psql`). They create tables, RLS
policies, the `pgvector` extension + HNSW index, the `match_plots` /
`approve_listing` / `handle_new_user` functions, and the private `plot-documents`
storage bucket.

```text
01_schema.sql                  → sellers, plots, base RLS, storage bucket, triggers
02_listing_drafts.sql          → listing_drafts table
02_vector_hnsw_index.sql       → pgvector + plots.embedding vector(768) + match_plots()
03_profiles_table.sql          → profiles + handle_new_user() trigger
04_favorites_table.sql         → favorites (owner-scoped RLS)
04_listing_rejection.sql       → draft rejection_reason column
05_listing_draft_lockdown.sql  → owner-only draft policies
06_fix_published_plot_id_type.sql → published_plot_id type fix
07_lock_down_plot_writes.sql   → revoke client writes on plots
08_atomic_listing_approval.sql → approve_listing() RPC (draft → plot, atomic)
09_restore_seller_user_id.sql  → sellers.user_id index
10_create_profiles_table.sql   → profiles hardening
11_plots_created_at_index.sql  → created_at DESC index
```

> After seeding plots, populate their embeddings once via the operator-only
> backfill endpoint (see [API Reference](#-api-reference)).

### 4. Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve production build
npm run lint       # ESLint (flat config)
```

---

## 📁 Project Structure

```text
NAQSHAI/
└── naqshai/                        # Next.js application root
    ├── app/
    │   ├── (pages)                 # page.js, explore, recommend, sell,
    │   │                           # dashboard, review, favorites, settings, login
    │   ├── api/                    # Route handlers (see API Reference)
    │   ├── auth/callback/          # Supabase OAuth/email code exchange
    │   ├── layout.js               # Root layout (Navbar, providers, fonts)
    │   └── globals.css             # Tailwind v4 theme
    ├── components/                 # Navbar, GuideChatbot, AmenityScoreCard, …
    ├── context/                    # FavoritesContext, ProfileContext
    ├── lib/                        # Shared logic (see below)
    ├── supabase/migrations/        # 13 ordered SQL migrations
    ├── public/                     # Static assets
    ├── next.config.mjs
    └── package.json
```

**`lib/` modules**

| File | Responsibility |
| --- | --- |
| `authServer.js` | Bearer-token verification, user/operator/admin client factories |
| `supabaseClient.js` | Browser + server Supabase clients (fail-fast admin client) |
| `formatPlot.js` | **Shared** DB-row → UI plot shape (used by `/api/plots` & `/api/favorites`) |
| `plotEmbedding.js` | `gemini-embedding-001` text/plot embedding helpers (768-dim) |
| `environmentalMetrics.js` | Deterministic flood/noise/elevation synthesis |
| `amenityCalculator.js` | Haversine amenity proximity scoring |
| `conversationHelper.js` | Zero-latency canned replies for casual chat |
| `useListingDraft.js` / `draftProgress.js` | Multi-step draft state + progress |
| `publishListing.js` | Draft → plot publication logic |
| `profileHelper.js` | User profile read/write |
| `useGoogleMapsLoader.js` | Safe Google Maps script loader + states |
| `voiceHelper.js` | Voice input support for the chatbot |

---

## 🔌 API Reference

| Endpoint | Method | Runtime | Access | Description |
| --- | --- | --- | --- | --- |
| `/api/plots` | `GET` | Node | Public | Formatted, cached plot inventory for the map. |
| `/api/chat` | `POST` | **Edge** | Public | Gemini RAG chatbot; streams structured JSON (`reply`, `recommendedPlots`). |
| `/api/recommend` | `POST` | Node | Public | Thin delegate to the chat pipeline. |
| `/api/amenities` | `GET` | **Edge** | Public | Amenity score for `?lat=&lng=&plotId=` (cached 1h). |
| `/api/favorites` | `GET`/`POST` | Node | User | List favorites; `POST` toggles a plot. |
| `/api/drafts` | `GET`/`POST` | Node | User | List / create the caller's listing drafts. |
| `/api/drafts/[id]` | `GET`/`PUT`/`DELETE` | Node | User | Read / update / delete an owned draft. |
| `/api/drafts/[id]/submit` | `POST` | Node | User | Submit a draft for operator review. |
| `/api/drafts/[id]/approve` | `POST` | Node | **Operator** | Atomically publish a draft as a verified plot + embed it. |
| `/api/drafts/[id]/reject` | `POST` | Node | **Operator** | Reject a draft with a reason. |
| `/api/review` | `GET` | Node | **Operator** | Cross-user submitted queue + signed document URLs. |
| `/api/review/plots/[id]` | `DELETE` | Node | **Operator** | Remove a live verified plot (and reject its linked draft). |
| `/api/embeddings/backfill` | `POST` | Node | **Operator** | Idempotent, bounded batch embedding backfill. |
| `/api/sell` | `POST` | Node | User | Legacy direct-publish — returns `410 Gone` (use drafts). |
| `/auth/callback` | `GET` | Node | — | Exchanges the auth code, then redirects (same-origin guard). |

> **Operator access** = send `Authorization: Bearer <OPERATOR_PASSPHRASE>` *or* a
> Supabase service-role token.

---

## 🗄️ Data Model

| Table | Purpose | Notes |
| --- | --- | --- |
| `sellers` | Listing owners (name, phone, role, verification) | Linked to `auth.users` via `user_id` |
| `plots` | Published listings (title, city, `price_pkr`, size, category, risk fields, `polygon_coordinates` JSONB, `documents`, `embedding vector(768)`, `is_verified`) | Public read; **server-only writes** |
| `listing_drafts` | In-progress seller submissions (`form_data` JSONB, `status`, `current_step`, `published_plot_id`) | Owner-scoped RLS |
| `profiles` | App user profile (avatar, preferences) | Owner-scoped; auto-created by `handle_new_user()` |
| `favorites` | User ↔ plot favorites | Owner-scoped RLS |

**Key functions:** `match_plots(query_embedding, match_threshold, match_count)` —
pgvector similarity search; `approve_listing(p_draft_id)` — atomic draft→plot
publication; `handle_new_user()` — profile bootstrap trigger; `update_modified_column()`
— `updated_at` trigger. **Storage:** private `plot-documents` bucket (signed URLs).

---

## 🤖 AI Pipeline

`POST /api/chat` (Edge runtime) runs a guarded retrieval-augmented pipeline:

1. **Fast path** — casual greetings short-circuit to instant canned replies.
2. **Intent classification** — decides whether live inventory lookup is needed.
3. **Constraint parsing** — extracts plot ID, size (Marla/Kanal), budget
   (Crore/Lakh/Million), city, society/sector, flood/noise/category/verified
   filters from **English, Urdu, or Roman Urdu** text.
4. **Hybrid retrieval** — `pgvector` semantic matches (`match_plots`) **merged**
   with a keyword/DB inventory query, deduplicated.
5. **Constraint filtering** — candidates are cross-checked against parsed filters.
6. **Grounded generation** — Gemini (`2.5-flash → 2.5-flash-lite → 2.0-flash`
   fallback chain) produces **schema-constrained JSON**; if every model fails,
   deterministic multilingual fallbacks answer from the retrieved data.
7. **Streaming** — the JSON reply is streamed back in chunks.

Guardrails: request size limits (≤ 30 messages, ≤ 4000 chars each), per-stage
timeouts, and strict "never fabricate inventory" system instructions.

---

## 🔒 Security Model

- **Defense in depth:** bearer-token identity check **and** Postgres RLS.
- **Least privilege:** the service-role key is server-only; `getSupabaseAdminClient()`
  **fails fast** if it is missing (never silently downgrades to anon).
- **Gated writes:** clients cannot write `plots`; publication requires operator approval.
- **Operator gating:** constant-time (`timingSafeEqual`) passphrase comparison.
- **Redirect safety:** auth callbacks and the login redirect param allow only
  same-origin relative paths.
- **Private documents:** verification files live in a non-public bucket, exposed
  only through short-lived signed URLs to operators.

---

## 🩺 Known Limitations

- Environmental metrics (flood/noise/elevation) are **deterministic heuristics**
  derived from sector/zone geography — not live GIS or sensor telemetry.
- No automated test suite yet; quality is enforced via ESLint + React Compiler rules.
- A few large page components (`explore`, `sell`) would benefit from decomposition.

See the audit notes in the repository history for the full, prioritized backlog.

---

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server (`next dev`) |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serve the production build (`next start`) |
| `npm run lint` | Run ESLint over the project |

---

## 🚢 Deployment

NAQSHAI deploys to [Vercel](https://vercel.com) with a Supabase backend:

1. Push the repo to GitHub and import it into Vercel (root directory: `naqshai/`).
2. Add every variable from the [environment table](#2-configure-environment) to
   the Vercel project settings.
3. In Supabase, add your production URL to **Auth → URL Configuration** (site URL +
   redirect allow-list) and set `NEXT_PUBLIC_SITE_URL` accordingly.
4. Apply all migrations, then run `/api/embeddings/backfill` (operator token) to
   embed existing plots.
5. Restrict the Google Maps key by HTTP referrer and the Gemini key by quota/budget.

---

<div align="center">

**Built for the Islamabad & Rawalpindi land market.**

`Next.js 16` · `React 19` · `Supabase + pgvector` · `Google Gemini` · `Google Maps`

</div>
