# IMPLEMENTATION STATUS — EDUFlow

Dokumen pelacak progres implementasi, checklist fase, keputusan arsitektur, dan blocker.

---

## 1. Ringkasan Status Proyek
- **Status Saat Ini:** Step D (Phase 2 Assignment & Submission) Selesai — Lolos Verifikasi Gate 2
- **Terakhir Diperbarui:** 19 November 2026
- **Database:** MySQL 8.0.30 (`eduflow`) - 19 Tabel Aktif, Seed Data Siap
- **Runtime:** Node.js v24.14.1, npm v11.11.0 (eksekusi via `npm.cmd`)

---

## 2. Rencana Fase & Checklist

### Step A — Inspect & Plan (Selesai)
- [x] Audit workspace, runtime, package manager, MySQL, dan Git
- [x] Pembacaan mendalam seluruh Source of Truth (`README.md`, `PRD.md`, `DATABASE_SCHEMA.md`, `UI_GUIDELINE.md`, `IMPLEMENTATION_PLAN.md`)
- [x] Inisialisasi database `eduflow` di MySQL lokal
- [x] Pembuatan `IMPLEMENTATION_STATUS.md`
- [x] Persetujuan pengguna untuk memulai Step B (Phase 0: Foundation)

---

### Step B — Phase 0: Foundation & Base System (Selesai — Gate 0 Lolos)
- [x] Inisialisasi Git repository (`git init`)
- [x] Setup Next.js 15 (App Router, TypeScript)
- [x] Setup Tailwind CSS & Lucide Icons sesuai `UI_GUIDELINE.md` (Warna `#2457D6`, Inter/Geist, layout 248px sidebar)
- [x] Setup ORM (Drizzle ORM + `mysql2`) dengan schema 19 tabel lengkap sesuai `DATABASE_SCHEMA.md`
- [x] Setup migrasi database & koneksi pool aman (`npx.cmd drizzle-kit push` berhasil sinkron)
- [x] Setup Session Auth (HTTP-only secure cookie, bcryptjs password hashing, server-side session validator)
- [x] Setup Vitest untuk unit test testing engine
- [x] Setup Layout dasar: Dosen layout (sidebar collapsible 248px + topbar 64px) & Mahasiswa layout (header nav)
- [x] Setup komponen dasar UI: Button, Input, Card, Badge, Modal, Skeleton
- [x] Setup `.env.example`, `.env`, dan `README.md` dokumentasi instalasi
- [x] Setup Seed Script awal (Akun Dosen & 20 Mahasiswa Demo dengan hash password aman)
- [x] Verification Gate 0: Typecheck (0 error), Lint (0 warning), Test (7 passed), Build (sukses), dan DB connection lolos

---

### Step C — Phase 1: Auth, Academic Structure & Enrollment (Selesai — Gate 1 Lolos)
- [x] Server actions & otorisasi ketat: `requireLecturer`, `requireStudent`, `requireUser`
- [x] CRUD Semester / Tahun Akademik (`academic_terms`)
- [x] CRUD Mata Kuliah (`courses`) dengan validasi kode dan nama
- [x] CRUD Kelas (`classes`) dengan inisialisasi otomatis bobot 100% dan skala nilai
- [x] Soft delete / Arsip kelas (`status: 'archived'`) dengan pencatatan `audit_logs`
- [x] Manajemen Mahasiswa (`users` role student, `student_profiles`) & pencarian nama/NIM/email
- [x] Enrollment mahasiswa ke kelas & manajemen peserta kelas
- [x] Portal Mahasiswa: Kelas yang diikuti (`/student/classes`) & Detail materi/tugas kelas (`/student/classes/[id]`)
- [x] Pengujian isolasi multi-user: Mahasiswa non-peserta ditolak (`FORBIDDEN_NOT_ENROLLED`)
- [x] Verification Gate 1: Typecheck (0 error), Lint (0 warning), Test (11 passed), Build (sukses) lolos

---

### Step D — Phase 2: Assignment & Submission Management (Selesai — Gate 2 Lolos)
- [x] CRUD Tugas (`assignments`) dengan mode pengumpulan (File, URL, Both)
- [x] Konfigurasi deadline, batas ukuran file (MB), aturan keterlambatan (`allowLate`), dan keterhubungan otomatis ke Gradebook
- [x] Sistem penyimpanan file submission privat (`./storage/submissions`) dengan streaming via `/api/files/submission/[versionId]`
- [x] Form submission mahasiswa: Unggah file privat, input Google Drive URL, Simpan Draft, dan Kirim Tugas
- [x] Tracking status lengkap: `draft`, `submitted`, `late`, `returned_for_revision`, `resubmitted`, `graded`
- [x] Versioning submission (`submission_versions`) mencatat seluruh riwayat revisi
- [x] Panel penilaian tugas dosen: Review file/link privat, form input skor (0 s/d maxScore), feedback dosen, dan opsi minta revisi
- [x] Sinkronisasi nilai otomatis ke tabel `grades` gradebook
- [x] Unit & integration test untuk siklus hidup tugas, evaluasi deadline, dan penyimpanan file privat
- [x] Verification Gate 2: Typecheck (0 error), Lint (0 warning), Test (15 passed), Build (sukses) lolos

---

### Step E — Phase 3: Grading Components & Gradebook Engine
- [ ] CRUD Kategori Penilaian (`grading_categories`) & verifikasi bobot total = 100%
- [ ] CRUD Item Penilaian (`assessment_items`)
- [ ] Input nilai (Manual item dan sinkronisasi dari tugas)
- [ ] Gradebook interactive table (Sticky header, student column, input cell dengan validasi range 0-max_score)
- [ ] Engine kalkulasi nilai:
  - Normalisasi item: `(score / max_score) * 100`
  - Agregasi kategori (average, sum_normalized, manual)
  - Kalkulasi nilai akhir berbobot
  - Aturan presisi: `NULL` = belum dinilai, `0` = nilai nol sah
  - Deteksi kelengkapan komponen
- [ ] Konfigurasi Skala Huruf (`grade_scales`)
- [ ] Audit log logging saat nilai / bobot diubah (`audit_logs`)
- [ ] Unit test comprehensive untuk seluruh edge case formula penilaian
- [ ] Verification Gate 3: Typecheck, Lint, Test, Build lolos

---

### Step F — Phase 4: Attendance & Learning Materials
- [ ] CRUD Pertemuan & Materi Pembelajaran (`learning_materials`)
- [ ] Akses file materi & link eksternal dengan otorisasi enrollment
- [ ] Sesi Presensi (`attendance_sessions`) per pertemuan
- [ ] Input presensi mahasiswa: Hadir, Izin, Sakit, Alpa (`attendance_records`)
- [ ] Kalkulasi persentase presensi mahasiswa
- [ ] Opsi integrasi presensi otomatis ke komponen nilai kelas
- [ ] Verification Gate 4: Typecheck, Lint, Test, Build lolos

---

### Step G — Phase 5: Dashboard, Publication, Export & Final Polish
- [ ] Dashboard Dosen (KPI kelas aktif, tugas aktif, submission perlu dinilai, nilai belum lengkap, quick actions)
- [ ] Dashboard Mahasiswa (Tugas mendatang, deadline terdekat, status pengumpulan, nilai terbit)
- [ ] Sistem Notifikasi in-app (`notifications`)
- [ ] Workflow Finalisasi & Publikasi Nilai (Lock/Publish dengan konfirmasi & checklist komponen lengkap)
- [ ] Ekspor Gradebook & Presensi ke Excel (XLSX via ExcelJS) & CSV
- [ ] UI Polish: Responsive check (Mobile 390px, Tablet 768px, Laptop 1440px), empty/loading/error states
- [ ] Security hardening & authorization audit (IDOR check, file traversal check, CSRF, sanitized inputs)
- [ ] Production build verification & Deployment Guide
- [ ] Verification Gate 5: Semua acceptance criteria lolos

---

## 3. Keputusan Teknis (Decision Log)

| ID | Keputusan | Alasan | Status |
|---|---|---|---|
| DEC-001 | Next.js 15 App Router + TypeScript | Modern, performa tinggi, fullstack API & Server Actions | Disepakati |
| DEC-002 | Drizzle ORM + mysql2 | Type-safe, minim overhead, mapping langsung ke schema MySQL 8, migrasi SQL transparan | Disepakati |
| DEC-003 | Session-based Auth (Encrypted Cookie + Jose / Bcryptjs) | Aman, bebas dari vendor lock-in, tidak ada dependensi eksternal tak stabil di Next.js 15, kontrol penuh atas role guard | Disepakati |
| DEC-004 | Vitest untuk Test Runner | Cepat, native ESM/TS support, ideal untuk unit test kalkulasi nilai | Disepakati |
| DEC-005 | ExcelJS untuk Export XLSX | Fitur lengkap untuk formatting tabel gradebook akademik | Disepakati |
| DEC-006 | Penyimpanan File Dev: Local Private Directory dengan Route Handler Stream | File tidak disimpan di folder `public` statis; disajikan hanya setelah verifikasi session & enrollment | Disepakati |

---

## 4. Blocker & Risiko yang Teridentifikasi

1. **PowerShell Script Execution Policy (`npm.ps1`)**:
   - *Status*: Tertangani.
   - *Solusi*: Menggunakan `npm.cmd` dan `npx.cmd` secara konsisten pada eksekusi command Windows.
2. **Koneksi Database MySQL**:
   - *Status*: Siap. Database `eduflow` sudah dibuat di MySQL 8.0.30 lokal (Laragon, port 3306, user `root`, no password).
3. **Repository Git**:
   - *Status*: Belum diinisialisasi (`git init`). Akan dilakukan pada awal Step B.
