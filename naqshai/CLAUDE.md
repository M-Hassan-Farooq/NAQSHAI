# NAQSHAI Coding Agent Rules & Guidelines

## 1. Project Overview & Tech Stack
- **Framework**: Next.js (App Router), React, Tailwind CSS.
- **APIs & Cloud**: Google Maps JavaScript API (`@react-google-maps/api`), Google Gen AI SDK (`@google/genai` with `gemini-2.5-flash`), Supabase (PostgreSQL, Storage, Auth).
- **Domain**: Pakistan real estate intelligence (Islamabad & Rawalpindi).

## 2. Design System: Refined Architectural Light
- Always use the established color palette:
  - Page Canvas: `bg-slate-100 text-slate-800`
  - Cards & Modals: `bg-white border border-slate-200 shadow-sm rounded-2xl`
  - Primary Buttons & Accents: `emerald-700` (`hover:bg-emerald-600 text-white`)
  - Badges: `bg-emerald-50 text-emerald-800` (verified/low risk), `bg-amber-50 text-amber-800` (moderate)
- **Do not** introduce dark-mode black containers unless explicitly requested.

## 3. Code Standards & Safety
- **No Unsaved Assumptions**: When editing files, ensure imports are valid and paths align with `@/...`.
- **API Responses**: Always wrap API route handlers (`/api/*`) in clean `try/catch` blocks and return consistent JSON structures.
- **No Hallucinated Packages**: Use only installed libraries (`@google/genai`, `@react-google-maps/api`, `@supabase/supabase-js`, `lucide-react`).
- **File Discipline**: Never overwrite working map configurations or clear existing coordinates unless instructed.