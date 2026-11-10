# Belajar Bareng Nata (BBN) — Platform E-Learning & CBT Sains/Teknik

Platform pembelajaran digital dan Computer-Based Test (CBT) untuk mata kuliah sains dasar dan fisika universitas. Mendukung simulasi ujian berwaktu (Tryout), latihan soal tanpa batas waktu, modul materi interaktif berformat Markdown + LaTeX, serta sistem langganan berbasis kurikulum jalur studi (`Track`) dan paket (`SubscriptionPlan`).

---

## Tech Stack

| Layer          | Technology                                                  |
| -------------- | ----------------------------------------------------------- |
| Framework      | Next.js 16 (App Router) + React 19                          |
| Language       | TypeScript 5                                                |
| Styling        | Tailwind CSS v4 (Neo-Brutalist Academic Design System)      |
| Database & BaaS| PostgreSQL + Supabase (`@supabase/ssr`, `@supabase/supabase-js`) |
| Auth & Storage | Supabase Auth (SSR cookies + Service Role) & Storage (`payment-proofs`) |
| Math Rendering | KaTeX via `react-markdown`, `remark-math`, `rehype-katex`   |
| UI Components  | Radix UI primitives, Lucide Icons                           |
| Validation     | Zod v4 + React Hook Form                                    |
| Testing & CI   | Vitest + GitHub Actions (`lint`, `tsc --noEmit`, `vitest`, `next build`) |

---

## Fitur Utama

### 1. Mesin CBT (Tryout & Latihan Soal)
- **Tryout Berwaktu**: Sesi ujian dengan timer server-authoritative (`started_at` + `duration`), autosave jawaban + penanda ragu-ragu (`flagged`), pelacakan perpindahan tab (`tab_switch_count`), dan auto-submit saat waktu habis.
- **Mode Latihan Soal (`is_practice = true`)**: Pengerjaan mandiri tanpa batas waktu dengan pembahasan mendalam setelah submit.
- **Keamanan Kunci Jawaban**: Endpoint pengerjaan soal memfilter `correct_answer` dan `explanation` di sisi server; kunci jawaban dan pembahasan hanya dapat diakses setelah status pengerjaan `SUBMITTED` atau `TIMED_OUT`.

### 2. Kurikulum Multi-Track & 10 Mata Kuliah
- **Jalur TPB / Non-Fisika (`NON_PHYSICS`)**: Kalkulus 1, Kalkulus 2, Fisika Dasar 1, Fisika Dasar 2.
- **Jalur Fisika Semester 3 (`PHYSICS_SEM_3`)**: Fisika Matematika 1, Elektronika, Fisika Modern, Mekanika, Metode Numerik, Praktikum Elektronika.
- Pemilihan mata kuliah terintegrasi melalui `SubjectContext` dan difilter di seluruh endpoint materi, tryout, latihan, serta analitik.

### 3. Sistem Paket Langganan (`FREE`, `MONTHLY`, `SEMESTER`)
- Konfigurasi paket terpusat di `src/config/plans.ts`:
  - **FREE (`Rp 0`)**: Aktivasi instan untuk akses modul materi preview dan latihan pengantar.
  - **MONTHLY (`Rp 40.000/bulan`)**: Akses penuh seluruh modul materi, tryout, latihan soal, dan pembahasan pada jalur studi yang dipilih.
  - **SEMESTER (`Rp 100.000/6 bulan`)**: Akses penuh satu semester beserta klinik PR dan sesi persiapan UTS/UAS.
- Verifikasi bukti pembayaran menggunakan private bucket Supabase Storage (`payment-proofs`) dengan Signed URL berbatas waktu untuk admin.

### 4. Panel Admin & Keamanan Data (RLS)
- **Manajemen Akademik & Pengguna**: CRUD penuh untuk Bank Soal, Paket Tryout, Latihan Soal, Modul Materi, Persetujuan Pembayaran, Papan Peringkat, dan Statistik Platform.
- **Row Level Security (RLS)**: Kebijakan RLS berlapis pada `users`, `questions`, `submissions`, `answers`, `materials`, dan `storage.objects` (`supabase/migrations/20260319000000_harden_rls_policies.sql`).

---

## Persiapan & Instalasi Lokal

### Prasyarat
- Node.js 20+
- Proyek Supabase aktif (PostgreSQL, Auth, dan Storage)

### Instalasi
```bash
git clone https://github.com/pranata-dev/bbn-website.git
cd bbn-website
npm install
```

### Variabel Lingkungan (`.env.local`)
Salin `.env.example` menjadi `.env.local` dan lengkapi nilainya:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Menjalankan Server Pengembangan
```bash
npm run dev
```

### Verifikasi Kualitas Kode
```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

---

## Struktur Direktori

```text
src/
  app/
    api/              # Route handlers (auth, register, tryouts, submissions, materials, leaderboard, admin)
    dashboard/        # Halaman mahasiswa (tryouts, latihan, materi, leaderboard, history, profile, beli-paket)
    admin/            # Panel manajemen admin (persetujuan user, soal, tryouts, latihan, materi, statistik)
  components/         # Komponen UI, landing page, form registrasi, dan renderer Markdown/LaTeX
  config/             # Konfigurasi paket langganan (plans.ts) dan bisnis (business.ts)
  contexts/           # State konteks mata kuliah aktif (SubjectContext)
  lib/                # Klien Supabase SSR/Admin, helper otorisasi, storage signed URL, skema Zod
  services/           # Layanan bisnis (tryoutService, DataImporter)
  types/              # Definisi tipe TypeScript & skema database Supabase
supabase/
  migrations/         # Migrasi SQL skema database, trigger sinkronisasi Auth, dan kebijakan RLS
```

---

## Lisensi

Hak cipta dilindungi undang-undang (Proprietary).
