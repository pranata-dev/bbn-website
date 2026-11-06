# Implementation & Architecture Roadmap: Belajar Bareng Nata (BBN)

> **Document Status:** Phases 0A through 2 completed, verified, and committed. Phase 3 & 4 execution plan prepared.  
> **Repository:** `bbn-website` (`c:\Users\p\.gemini\antigravity\scratch\bbn-website`)  
> **Tech Stack:** Next.js 16.1 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage, RLS), Vitest.

---

## Part 1: Previous Phases Execution & Verification Results

### 1.1 Milestone Audit & Git Commit Trail

| Commit | Scope / Phase | Description & Verified Impact |
| :--- | :--- | :--- |
| `770727a` | **Step -1 (Baseline Snapshot)** | Captured the uncommitted 19 dirty files before starting production refactoring. |
| `6a754cd` | **Phase 0A (Security Lockdown)** | Backdoor deletion, Supabase Auth admin migration, fail-closed proxy, PII centralization, remote storage whitelisting, account lockout prevention. |
| `7707d95` | **Phase 0B, 0C, 0D (Supabase Layer & UI)** | Total removal of Prisma, non-recursive RLS `public.is_admin()`, dynamic `courses` and unified `subscriptions` table, `src/lib/entitlements.ts`, Soft Cream/Olive token unification. |
| `d2f7371` | **Phase 1 & Phase 2 (CBT & Notes Reader)** | Anti-exploit CBT scoring, timer stale-closure fix, database-backed results/history, interactive study notes reader (`/dashboard/materi/[slug]`) with LaTeX display scroll & sticky TOC, freemium barrier, admin split-pane live editor, wired access modal. |

---

### 1.2 Summary of Completed Fixes & Enhancements

#### Phase 0A — Security Lockdown & PII Centralization
- **Backdoor Removal:** Deleted the unauthenticated database wipe/seed endpoint `src/app/api/seed/route.ts`.
- **Admin Auth Migration:** Retired the separate env password JWT cookie system (`admin_session`). Standardized admin authentication on Supabase Auth (`users.role = 'ADMIN'`). Implemented server-side `requireAdmin()` guard reading the Supabase SSR session and injected it at the entry point of all 14 `/api/admin/**` route handlers and `/api/auth/approve`.
- **Fail-Closed Security Proxy:** Fixed `src/proxy.ts` so that missing environment variables trigger HTTP 503 instead of failing open with `NextResponse.next()`. Protected `/admin` routes via Supabase Auth session validation.
- **Single-Source Business & Pricing Configuration:**
  - Created `src/config/business.ts` centralizing SeaBank, GoPay, WhatsApp admin URL, and Brevo email parameters.
  - Created `src/config/plans.ts` establishing the authoritative pricing catalog:
    - `FREE`: Free preview access (Module 1 notes, diagnostic sample tryout).
    - `MONTHLY`: Rp 49.000 (strike-through Rp 79.000), 30 days active access.
    - `SEMESTER`: Rp 129.000 (strike-through Rp 199.000), 180 days active access.
    - Offline tutoring (Rp 55k / 205k / 380k) designated as marketing cards with direct WhatsApp CTAs.
- **Account Lockout & Bypasses Prevented:**
  - Fixed `POST /api/register` to never overwrite active accounts (`is_active: false`), eliminated fallback to `storage.placeholder.com`, and mandated password collection during registration.
  - Removed the `type === "REGULAR"` auto-approval bypass in `POST /api/dashboard/purchase`.
  - Configured `images.remotePatterns` for Supabase Storage in `next.config.ts`.

#### Phase 0B, 0C, 0D — Supabase Data Layer, Curriculum & UI Unification
- **Prisma Completely Decommissioned:**
  - Uninstalled `prisma`, `@prisma/client`, `pg`, `react-latex-next`, and `@types/uuid`.
  - Removed `postinstall` (`prisma generate`) and package overrides from `package.json`.
  - Deleted `prisma/`, `prisma.config.ts`, `src/lib/db.ts`, and root log clutter (`enum.txt`, `prisma_error.txt`, `prisma_out.txt`, `refresh.log`, `tsconfig.tsbuildinfo`).
- **Typed Supabase Client & RLS Architecture:**
  - Created `src/types/database.types.ts` with explicit foreign key relationships (`Relationships: [...]`) for PostgREST v12.
  - Added additive migration `supabase/migrations/20260316000000_baseline_and_rls.sql` introducing `public.is_admin()` as a `SECURITY DEFINER` function with `search_path = public` and replaced recursive RLS policies on `public.users`.
- **Dynamic Courses & Unified Subscriptions:**
  - Added additive migration `supabase/migrations/20260317000000_courses_and_subscriptions.sql` creating the `courses` table and `subscriptions` table (`user_id`, `plan_code`, `track`, `status`, `starts_at`, `expires_at`, `registration_id`).
  - Added backfill script migrating paid rows from `user_subject_access` into `subscriptions` (`expires_at = now() + interval '180 days'`, `track = 'LEGACY'`).
  - Created `src/lib/entitlements.ts` (`getEntitlements`) providing server-authoritative tier checks and lazy expiration on read.
  - Updated `src/contexts/SubjectContext.tsx` to handle dynamic course slugs and tracks (`PHYSICS_SEM_3`, `NON_PHYSICS`, `LEGACY`, `ALL`).
- **UI Token Restyling & Anti-Slop Cleanup:**
  - Added token aliases in `src/app/globals.css` for `cream`, `dark-brown`, `soft-brown`, `warm-beige`, and `warm-gray`.
  - Restyled `dashboard/beli-paket`, removed duplicate headers in `DashboardClient.tsx`, and stripped chunky 8-bit retro pixel fonts from all admin dashboards.

#### Phase 1 — CBT Examination Engine Hardening
- **Stale-Closure Timer Bug Fixed:**
  - Added `answersRef = useRef(answers)` and `submittingRef = useRef(false)` in `src/app/dashboard/tryouts/[id]/attempt/page.tsx`.
  - When the countdown timer reaches 0, auto-submit reads fresh answers from `answersRef.current` rather than initial `null` state, ending the 0% timeout bug.
- **Server-Authoritative Anti-Exploit Scoring:**
  - In `src/services/tryoutService.ts`, rewritten scoring so `totalWeight` is evaluated against the complete set of questions linked via `tryout_questions`.
  - Closed the 1-answer = 100% exploit (answering 1 question correctly out of 5 now yields 20%).
- **Quota & Attempt Counting Fixes:**
  - Corrected `access.tryout_attempts_used` (snake_case column), eliminating the `undefined + 1` (`NaN`) database corruption bug.
- **Server-Side Timeout Enforcement:**
  - In `PATCH /api/submissions/[id]/answers`, auto-save enforces `now <= started_at + duration + gracePeriod`. Submissions past duration are marked `TIMED_OUT` and rejected with HTTP 403.
- **Database-Backed Results & History:**
  - Created `GET /api/submissions/[id]` with ownership verification.
  - Refactored `dashboard/tryouts/[id]/result` to display verified server scores rather than spoofable query params.
  - Replaced hardcoded empty state in `dashboard/history` with a database-backed attempt log.
  - Handled `TIMED_OUT` and `COMPLETED` attempt states in `dashboard/tryouts/[id]`.
- **CBT Scoping:**
  - Scoped CBT strictly to `MULTIPLE_CHOICE` (A–E) in admin, disabling `ESSAY` for v1.
  - Fixed FormData casing mismatch (`camelCase` vs `snake_case`) and added `z.coerce.number()` for question weights in `src/lib/validations/admin.ts`.

#### Phase 2 — Study Notes Reader & Subscription RBAC
- **Extended Materials Schema:**
  - Added columns `slug`, `course_id`, `summary`, `content_md`, `module_number`, `sort_order`, `reading_time_minutes`, and `is_free_preview`.
- **Enhanced Markdown & LaTeX Component:**
  - Upgraded `src/components/ui/markdown-latex.tsx` to automatically generate slugified heading IDs on `<h1>`, `<h2>`, and `<h3>` for Table of Contents generation.
  - Configured horizontal scrolling for KaTeX display math in `globals.css` (`.katex-display { overflow-x: auto; -webkit-overflow-scrolling: touch; }`).
- **Interactive Reading Experience (`/dashboard/materi/[slug]`):**
  - Built dedicated reading page with breadcrumb navigation, estimated reading time, sticky Table of Contents sidebar, KaTeX rendering, and direct CBT tryout launch CTA.
- **Freemium Entitlement Gates:**
  - Connected `/api/materials` and `/api/materials/[slug]` to `getEntitlements`: free tier users can read `is_free_preview = true` modules; locked modules return HTTP 403 `UPGRADE_REQUIRED` and trigger an upgrade modal.
- **Admin Split-Pane Live Preview Editor:**
  - Replaced legacy Google Drive form in `src/app/admin/materials/page.tsx` with a dual-pane live editor (left: markdown/LaTeX input, right: live rendered preview).
- **Admin User Access Management Wired:**
  - Fixed the silent no-op in `AdminUsersPage` ("Kelola Akses"): `PATCH /api/admin/users` now updates `student_category` and provisions active records in `subscriptions`.
- **Unified Registration Experience:**
  - Refactored `src/components/register/ProductSelector.tsx` so `/register` defaults to the unified E-Learning platform subscription flow, routing offline tutoring inquiries to WhatsApp.

---

### 1.3 Verification Metrics

| Verification Check | Tool / Test Command | Result |
| :--- | :--- | :--- |
| **Static Type Check** | `npx tsc --noEmit` | **0 errors** across entire codebase |
| **Unit Test Suite** | `npm test` (`vitest run`) | **3 test files, 28/28 tests passed** (100%) |
| **Scoring Anti-Exploit** | `src/lib/tryout-scoring.test.ts` | **3/3 unit tests passed** |
| **Production Build** | `npm run build` (Turbopack) | **33 static & dynamic routes compiled** in 16.2s |

---

## Part 2: Next Phase Implementation Plan

```mermaid
flowchart TD
    subgraph Phase 3: Database Cleanup & Decommissioning
        P3_PRE["3.1 Data Safety Backup & Pre-Flight Audit"]
        P3_MIG["3.2 Destructive Migration Execution"]
        P3_TYP["3.3 Regenerate Database Types & Update Codebase"]
        P3_VER["3.4 Verification: Typecheck & Test Suite"]
        P3_PRE --> P3_MIG --> P3_TYP --> P3_VER
    end

    subgraph Phase 4: Remote Sync, E2E & Production Launch
        P4_CLI["4.1 Remote Supabase Project Link & Push"]
        P4_STG["4.2 Storage Buckets & Policies Configuration"]
        P4_EML["4.3 Email Automation & Brevo Verification"]
        P4_CICD["4.4 GitHub Actions CI Workflow Setup"]
        P4_LCH["4.5 Production Smoke Testing & Deployment"]
        P3_VER --> P4_CLI --> P4_STG --> P4_EML --> P4_CICD --> P4_LCH
    end
```

---

### Phase 3 — Destructive Schema Cleanup & Legacy Decommissioning

> [!CAUTION]
> **User Approval Gate:** Phase 3 removes legacy tables and deprecated columns. All active access has already been backfilled into `subscriptions` during Phase 0C. This migration drops the old, unused tables to achieve a clean database schema.

#### 3.1 Data Safety Pre-Flight Audit
1. Verify all students with paid roles in `user_subject_access` have corresponding active records in `subscriptions`.
2. Consolidate any existing `users.full_name` values into `users.name` before column removal:
   ```sql
   update public.users set name = coalesce(name, full_name) where name is null and full_name is not null;
   ```
3. Export a snapshot / backup dump of legacy tables (`user_subject_access`, `payments`, `regular_class_details`, `uts_package_details`, `kelas_besar_details`).

#### 3.2 Destructive Migration (`supabase/migrations/20260318000000_decommission_legacy.sql`)
1. **Drop Deprecated Tables:**
   - `drop table if exists public.user_subject_access cascade;`
   - `drop table if exists public.payments cascade;`
   - `drop table if exists public.regular_class_details cascade;`
   - `drop table if exists public.uts_package_details cascade;`
   - `drop table if exists public.kelas_besar_details cascade;`
2. **Drop Deprecated Columns from Core Tables:**
   - **`public.users`:**
     - Drop `full_name`, `student_category`, `package_type`, `billing_cycle`, `session_token`, `access_ends_at`.
     - Retain: `id`, `auth_id`, `email`, `name`, `nim`, `avatar_url`, `is_active`, `role`, `created_at`, `updated_at`.
   - **`public.tryouts`:**
     - Drop redundant `question_ids` text array column (superseded by `tryout_questions` join table).
     - Drop `subject` enum column (superseded by `course_id uuid references courses(id)`).
   - **`public.questions`:**
     - Drop `subject` enum column (superseded by `course_id uuid references courses(id)`).
   - **`public.materials`:**
     - Drop `subject` enum column (superseded by `course_id uuid references courses(id)`).
3. **Drop Deprecated Postgres Enums:**
   - Drop `Subject` (`FISDAS2`, `FISMAT`), `Role`, `PackageType`, `PaymentStatus`.

#### 3.3 Regenerate Database Types & Update Code References
1. Update `src/types/database.types.ts`:
   - Remove deleted tables and dropped columns from `Database["public"]["Tables"]`.
   - Ensure all join relations on `courses`, `subscriptions`, `tryout_questions`, `submissions`, `answers`, and `materials` remain typed.
2. Remove any remaining legacy references across the codebase:
   - Remove `user_subject_access` queries in `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx`.
   - Remove fallback references to `subject` enum in admin filters (use `course_id` / dynamic courses).
3. Re-run `npx.cmd tsc --noEmit` and `npm.cmd test` to guarantee zero regressions.

---

### Phase 4 — Remote Sync, E2E Verification & Production Readiness

#### 4.1 Remote Supabase Synchronization
1. Link project via Supabase CLI (`supabase link --project-ref <project-ref>`).
2. Run database migration push outside sandbox:
   ```powershell
   supabase db push
   ```
3. Generate fresh TypeScript definitions directly from the remote database:
   ```powershell
   supabase gen types typescript --linked > src/types/database.types.ts
   ```

#### 4.2 Storage Buckets & Access Policies
1. Verify public / authenticated access policies on Supabase Storage buckets:
   - `question-images`: Public read access; write access restricted to `public.is_admin()`.
   - `payment-proofs`: Write access for authenticated and anonymous registration uploads; read access restricted to owner (`auth.uid()`) and `public.is_admin()`.
   - `material-attachments`: Public read for free preview; authenticated read for active subscription holders.

#### 4.3 Email Automation Verification (Brevo)
1. Verify `BREVO_API_KEY`, `EMAIL_SENDER_ADDRESS`, and `EMAIL_SENDER_NAME` in production environment.
2. Test transactional email dispatches:
   - **Registration Received:** Notifies user that payment proof is under review.
   - **Account Approved:** Dispatches activation confirmation with direct login link.
   - **Payment Rejected:** Explains rejection reason with instructions to re-upload.

#### 4.4 Automated CI/CD Workflow (`.github/workflows/ci.yml`)
Configure a GitHub Actions pipeline enforcing quality gates on every Pull Request and push to `main`:
```yaml
name: CI Quality Gate
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npm test
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

#### 4.5 Production Smoke Test Checklist
- [ ] **Freemium Onboarding:** Register a new user $\to$ lands in `/dashboard` with `FREE` badge $\to$ able to read Module 1 free preview notes $\to$ blocked from Module 2 with upgrade prompt.
- [ ] **Diagnostic Tryout:** Able to take 1 free diagnostic tryout attempt $\to$ auto-submit on timeout grades accurately $\to$ results display from database.
- [ ] **Subscription Upgrade:** User submits payment proof from `/dashboard/beli-paket` $\to$ status displays `PENDING` $\to$ admin verifies and approves in `/admin/users` $\to$ user receives active `SEMESTER` subscription $\to$ all 7 modules and full CBT bank immediately unlock.
- [ ] **Anti-Cheating & Scoring Smoke:** Tab-switching counter increments $\to$ single-answer submission grades against full question count.
- [ ] **Mobile Responsiveness:** Markdown notes, KaTeX equations, exam cards, and admin live preview render smoothly on mobile (375px) and desktop viewports.

