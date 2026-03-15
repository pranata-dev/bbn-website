# BBN Website

A computer-based test (CBT) platform built for university-level exact science courses. It supports timed tryouts, practice question banks, per-subject content isolation, LaTeX-rendered math expressions, and a tiered subscription model with role-based access control.

The platform currently serves two courses: Fisika Dasar 2 (Basic Physics 2) and Fisika Matematika (Mathematical Physics). Content, tryouts, practice sets, and dashboard statistics are all scoped per subject.

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router)                         |
| Language       | TypeScript                                      |
| Styling        | Tailwind CSS 4                                  |
| Database       | PostgreSQL, hosted on Supabase                  |
| ORM            | Prisma 7                                        |
| Auth           | Supabase Auth (email/password, service role)     |
| Math Rendering | KaTeX via react-latex-next, rehype-katex         |
| UI Components  | Radix UI primitives, shadcn/ui                  |
| Animations     | Framer Motion                                   |
| Forms          | React Hook Form + Zod validation                |
| Testing        | Vitest + Testing Library                        |

---

## Core Features

### CBT Engine

- Timed tryout sessions with automatic submission on expiry.
- Practice mode with unlimited retries and no timer.
- Per-question answer persistence to localStorage (auto-save).
- "Mark for Review" flagging on individual questions.
- Visual navigation grid reflecting answered, unanswered, and flagged states.
- Post-submission result pages with score breakdown and full discussion/explanation views.

### Multi-Subject Architecture

- Subject switcher in the sidebar (FISDAS2 / FISMAT).
- All data-fetching endpoints accept a subject parameter and filter accordingly.
- Dashboard statistics, tryout lists, practice sets, and materials are all scoped to the active subject.
- No cross-subject data leakage by design.

### Subscription and RBAC

- Tiered packages (Reguler, Flux, Senku, Einstein) with distinct tryout quotas and feature gates.
- Per-subject access records stored in a `user_subject_access` table.
- Admins can grant or revoke subject access per user.
- Package features (tryout limits, practice access, discussion access) are derived from a centralized `getPackageFeatures` utility.

### Admin Panel

- Full CRUD for questions, tryouts, users, and payments.
- Bulk question deletion by category and/or subject via API.
- Image upload support for question attachments (stored in Supabase Storage).
- Zod-validated question ingestion with automatic LaTeX formatting transforms.

### LaTeX Auto-Formatting

- All ingested question text passes through Zod schema transforms that fix common LaTeX issues:
  - Missing exponent brackets: `10^-7` is corrected to `10^{-7}`.
  - Non-standard multiplication: `x 10^` is corrected to `\times 10^`.
  - Unescaped micro symbols: `uC` is corrected to `\mu\text{C}`.
- These transforms run at validation time, before any data reaches the database.

---

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project with a PostgreSQL database
- npm

### Installation

```bash
git clone https://github.com/pranata-dev/bbn-website.git
cd bbn-website
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

### Running Locally

```bash
npx prisma generate
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Database and Auth

### Prisma

The schema lives in `prisma/schema.prisma`. After changes, run:

```bash
npx prisma migrate dev
npx prisma generate
```

### Supabase Auth Triggers

Two PostgreSQL triggers maintain atomic synchronization between `auth.users` and `public.users`:

1. `on_auth_user_created` -- When a user signs up through Supabase Auth, a corresponding row is automatically inserted into `public.users` with default values.
2. `on_auth_user_deleted` -- When an auth user is deleted (via the API, dashboard, or any other means), the corresponding `public.users` row is automatically removed.

The trigger definitions live in `supabase/migrations/20260315000000_auth_sync_triggers.sql`. Apply them by running the SQL against your Supabase project, either through the SQL Editor in the Supabase dashboard or via the Supabase CLI.

---

## Data Seeding

Question data is ingested through the `DataImporter` service located at `src/services/DataImporter.ts`. This service handles parsing raw text files, validating and transforming questions through Zod schemas, checking for duplicates, inserting into the database, and optionally creating and linking tryout records.

A unified CLI script wraps this service:

```bash
npx ts-node scripts/import_data.ts \
  --file "./data/raw_week1.txt" \
  --category "WEEK_1" \
  --subject "FISDAS2" \
  --tryout-title "Latihan Soal WEEK 1"
```

Run `npx ts-node scripts/import_data.ts --help` for the full list of available options.

---

## Project Structure

```
src/
  app/
    api/              # API routes (admin, auth, dashboard, tryouts, etc.)
    dashboard/        # Student-facing pages (tryouts, latihan, materi, profile)
    admin/            # Admin panel pages
  components/         # Reusable UI components (shadcn/ui based)
  contexts/           # React contexts (SubjectContext, etc.)
  lib/                # Utilities, Supabase clients, validation schemas
  services/           # Business logic (DataImporter)
  types/              # Shared TypeScript type definitions
scripts/
  import_data.ts      # Unified data ingestion CLI
prisma/
  schema.prisma       # Database schema
supabase/
  migrations/         # SQL migration files (auth sync triggers)
```

---

## License

This project is proprietary. All rights reserved.
