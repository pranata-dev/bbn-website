# Implementation Plan: UI Refactoring with Google Stitch Design System

## Project Context
- **Workspace**: `bbn-website` (Next.js 16 + React 19 + Tailwind CSS v4 + Shadcn UI)
- **Stitch Project**: `STEM Physics Learning Platform` (`projects/12413023623642634809`)
- **Design Philosophy & Brand**: **BBN Education** (Technical Blueprint & Geometric Brutalism)
  - High-density information architecture with coordinate graph grids (`24px 24px`)
  - Hairline carbon borders (`1px solid #171717`), drafting tick marks, and 0px border radius (sharp geometric brutalism)
  - Bold typographic contrast: **Geist** (editorial prose & headlines) + **JetBrains Mono** (technical markers, formulas, metrics, tags)
  - Mechanical hard drop shadows (`box-shadow: 3px 3px 0px #171717`) replacing soft blurry shadows
  - Canary Yellow (`#FDE047`) for primary call-to-action & active states; Alert Rust Orange (`#B85014`) for physical formulas, constants, and urgency indicators

---

## Status Summary
- [x] **Phase 1: Design System Foundation & Token Synchronization** (Completed & Verified)
- [x] **Phase 2: Milestone 1 - Top Navigation & Hero Section** (Completed & Verified)
- [x] **Phase 2: Milestone 2 - Metrics Strip & Bento Grid** (Completed & Verified)
- [x] **Phase 2: Milestone 3 - Methodology, FAQ, CTA Banner & Footer** (Completed & Verified)
- [x] **Phase 2: Milestone 4 - Pricing Access Credentials & Dashboard Shell** (Completed & Verified)
- [x] **Phase 3: Dashboard Main Canvas & Interactive Lesson Viewer** (Completed & Verified)
  - `src/app/dashboard/DashboardClient.tsx`
  - `src/components/dashboard/TableOfContents.tsx`
  - `src/app/dashboard/materi/[slug]/page.tsx`
  - `src/components/ui/markdown-latex.tsx`

---

## Phase 1: Design System Foundation & Token Synchronization

### 1.1 Font Configuration (`src/app/layout.tsx`)
Replace legacy `Montserrat` font with Google Fonts **Geist** and **JetBrains Mono** via `next/font/google`.

- `--font-geist`: Sans-serif base for headings, navigation text, and body copy.
- `--font-jetbrains-mono`: Monospace base for mathematical coordinates, syllabus tokens, terminal tags, code, and badges.

### 1.2 Global Styles & Theme Variables (`src/app/globals.css`)
Update Tailwind CSS v4 `@theme inline` and `:root` variables:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist), sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;

  /* Stitch Tokens */
  --color-canvas-paper: #F5F4EE;
  --color-surface-white: #FFFFFF;
  --color-surface-container: #F0EDED;
  --color-accent-canary: #FDE047;
  --color-alert-rust: #B85014;
  --color-border-grid: #D4D2C9;
  --color-ink-muted: #52525B;
  --radius: 0px;
}

:root {
  --radius: 0px;
  --background: #F5F4EE;
  --foreground: #1C1B1B;
  --card: #FFFFFF;
  --card-foreground: #1C1B1B;
  --popover: #FFFFFF;
  --popover-foreground: #1C1B1B;
  --primary: #FDE047;
  --primary-foreground: #1C1B1B;
  --secondary: #B85014;
  --secondary-foreground: #FFFFFF;
  --muted: #F0EDED;
  --muted-foreground: #52525B;
  --accent: #FDE047;
  --accent-foreground: #1C1B1B;
  --destructive: #BA1A1A;
  --border: #171717;
  --input: #171717;
  --ring: #171717;
}
```

### 1.3 Technical Utility Classes
Add custom utility classes in `globals.css`:
- `.bg-grid-blueprint`: Technical graph grid pattern background (24px x 24px)
- `.technical-shadow`: Hard offset box shadow (`box-shadow: 3px 3px 0px #171717`)
- `.technical-shadow-sm`: Subtle offset box shadow (`box-shadow: 1px 1px 0px #171717`)
- `.ruler-tick-h`: Horizontal coordinate drafting tick marks (repeating 1px solid ticks at 12px intervals)

---

## Phase 2: Component-by-Component Mapping & Execution

### Milestone 1: Top Navigation & Hero Section (Landing Page)
- **Reference**: `Landing Page - Physica Blueprint Archive` (`projects/12413023623642634809/screens/9cc6bf1a04264a44a613e15168233892`)
- **Files**:
  - `src/components/landing/Navbar.tsx`
  - `src/components/landing/HeroSection.tsx`
- **Key Transformations**:
  - **Navbar**: Hairline bottom border (`border-b border-[#171717]`), brand logo with square rust indicator (`PHYSICA // ARCHIVE`), monospace nav pills, search shortcut badge (`⌘K Cari Silabus`), and Canary yellow primary button.
  - **Hero**: Technical graph grid backdrop (`.bg-grid-blueprint`), horizontal coordinate ticks, dual-column layout (7-col typography / 5-col SVG scientific simulation window showing vector field, wave packet curve, and phase space annotations), monospace curl command box with clipboard copy button.

### Milestone 2: Metrics Strip & Course Catalog Bento Grid
- **Reference**: Sections 2 & 3 in Stitch Landing Screen
- **Files**:
  - `src/components/landing/ProgramsSection.tsx` (transforming into Catalog Bento Grid)
  - `src/components/landing/FeaturesSection.tsx`
- **Key Transformations**:
  - **Metrics Strip**: 4-column divided grid with statistics (850+ Modul Interaktif, 4.9/5.0 Rating, OSN/IPhO Standards, 100% First Principles Proofs).
  - **Bento Grid**: 3-card structural catalog for syllabus modules (Mekanika Klasik, Kalkulus Sains Dasar, Gelombang & Termodinamika) featuring callout mathematical equations (`d²x/dt² + 2γ(dx/dt) + ω₀²x = 0`), instructor spec credentials, and Canary CTA buttons.

### Milestone 3: Methodology (3-Tier Pedagogy), FAQ Accordion & Footer
- **Reference**: Sections 4, 5, 6 & Footer in Stitch Landing Screen
- **Files**:
  - `src/components/landing/HowItWorksSection.tsx`
  - `src/components/landing/FAQSection.tsx`
  - `src/components/landing/CTASection.tsx`
  - `src/components/landing/Footer.tsx`
- **Key Transformations**:
  - **Methodology**: 3-step blueprint boxes (`01. Fase Intuitif`, `02. Fase Formalisme`, `03. Fase Aplikasi`) + Feynman quotation banner.
  - **FAQ & Testimonials**: 5-col index card testimonials (`INDEX CARD // 0841`) + 7-col technical accordion (`[Q1]`, `[Q2]`, ...).
  - **CTA Banner**: Canary bordered conversion block.
  - **Footer**: Monospace version token (`v2.4.0`), license disclaimer, and clean underline navigation links.

### Milestone 4: Student Portal Dashboard
- **Reference**: `Student Portal Desktop - Physica Blueprint Archive` (`projects/12413023623642634809/screens/df748807ed614f0fab9109efbf2b24cd`)
- **Files**:
  - `src/app/dashboard/layout.tsx`
  - `src/app/dashboard/DashboardClient.tsx`
  - `src/components/dashboard/PageHeader.tsx`
- **Key Transformations**:
  - **Top Telemetry Utility Bar**: Server latency (`LATENCY: 24ms`), study streak badge (`14D`), search prompt, and student ID token.
  - **Fixed 240px Left Navigation**: Technical workspace registry with numbered indices (`[01] Dashboard`, `[02] Materi Modul`, etc.), student snapshot box, and streak counter.
  - **Dashboard Content Canvas**: Active student greeting card with daily target progress bar, 4-metric precision cards (Materi Selesai, Akurasi Latihan with sparklines, Peringkat Kelas, Tryout Terakhir), Schedule & Agenda list, and horizontal roadmap phase blocks (`Fase 01` to `Fase 04`).

### Milestone 5: Lesson / Course Viewer (Interactive Course Drawer)
- **Reference**: `Interactive Course Drawer - Mekanika Klasik` (`projects/12413023623642634809/screens/3e88042920b0454ca13966a1ae05da45`)
- **Files**:
  - `src/app/dashboard/materi/[slug]/page.tsx`
  - `src/components/dashboard/TableOfContents.tsx`
  - `src/components/ui/markdown-latex.tsx`
- **Key Transformations**:
  - Blueprint styling for LaTeX formulas with KaTeX display blocks
  - Technical sidebar drawer with sharp section markers and collapsible tree
  - Audio podcast & PDF drive download action bars with mechanical buttons

---

## Safety & Non-Breaking Verification Protocol
1. **Preserve Business Logic**: Zero changes to Supabase authentication, server actions, route handlers, user state tracking, role permissions, or test suites.
2. **Component Interface Stability**: Props interfaces (`Props`, `ComponentProps`) remain 100% backwards-compatible.
3. **Automated Verification**: Run `npm test` (Vitest) and `npm run build` at each milestone to confirm type integrity and build health.
