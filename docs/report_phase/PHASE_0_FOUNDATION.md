# Laporan Hasil Implementasi — Phase 0: Foundation & Base System

- **Tanggal Eksekusi:** 19 November 2026
- **Status:** Selesai (Passed Gate 0)
- **Komponen Utama:** Arsitektur Dasar, Database Relasional, Otentikasi Sesi, Design Tokens & Komponen UI Atomik, Engine Kalkulasi Gradebook Awal.

---

## 1. Pekerjaan yang Selesai

### 1.1 Inisialisasi Project & Konfigurasi
- Inisialisasi Git repositori lokal (`git init`).
- Setup Next.js 15 (App Router, TypeScript 5, Tailwind CSS v3) dengan alias path `@/*`.
- Setup Vitest test runner untuk pengujian unit logic kalkulasi dan otorisasi.
- Setup file lingkungan `.env` dan `.env.example`.

### 1.2 Skema Database Relasional (MySQL 8.0)
- 19 tabel relasional InnoDB dibuat sesuai `DATABASE_SCHEMA.md`:
  1. `users`
  2. `lecturer_profiles`
  3. `student_profiles`
  4. `academic_terms`
  5. `courses`
  6. `classes`
  7. `enrollments`
  8. `learning_materials`
  9. `grading_categories`
  10. `assessment_items`
  11. `assignments`
  12. `submissions`
  13. `submission_versions`
  14. `grades`
  15. `grade_scales`
  16. `attendance_sessions`
  17. `attendance_records`
  18. `notifications`
  19. `audit_logs`
- Sinkronisasi Drizzle ORM (`drizzle-kit push`) berhasil menerapkan seluruh indeks dan relasi foreign key pada database `eduflow`.

### 1.3 Sistem Autentikasi & Keamanan Sesi
- Sesi berbasis HTTP-Only Cookie (`eduflow_session`) menggunakan token JWT ditandatangani dengan algoritma `HS256` (`jose`).
- Enkripsi kata sandi menggunakan `bcryptjs` salt rounds 10.
- Server-side guard: `getCurrentUser()`, `requireLecturer()`, `requireStudent()`.
- Halaman login interaktif di `/login` dengan tombol cepat kredensial demo.

### 1.4 Design Tokens & Komponen UI Atomik
- Mengikuti `UI_GUIDELINE.md`:
  - Primary `#2457D6`, Primary Dark `#173B96`
  - Background `#F6F8FC`, Surface `#FFFFFF`
  - Teks `#172033`, Muted `#667085`, Garis `#E4E9F2`
  - Status semantic: Sukses `#16845B`, Peringatan `#B7791F`, Bahaya `#C43D4B`, Info `#2878B8`.
- Komponen: `Button`, `Input`, `Badge`, `Card`, `Modal`, `Skeleton`.
- Shell layout Dosen: Sidebar collapsible 248px/72px + Topbar 64px.
- Shell layout Mahasiswa: Header navigation.

### 1.5 Calculation Engine & Seeder
- Modul kalkulasi nilai di `src/features/gradebook/engine.ts` mematuhi aturan PRD:
  - Normalisasi item: `(score / max_score) * 100`
  - `NULL` dibedakan tegas dari `0` (tidak diam-diam dianggap nol)
  - Validasi bobot aktif 100% untuk finalisasi
- Seeder `src/server/db/seed.ts` mengisi:
  - 1 Dosen (`dosen@eduflow.test`)
  - 20 Mahasiswa (`mhs1@eduflow.test` s/d `mhs20@eduflow.test`)
  - 2 Mata Kuliah, 3 Kelas, 8 Sesi Presensi, Kategori bobot 100%, dan contoh tugas/submisi.

---

## 2. Hasil Verifikasi Gate 0
- **TypeScript**: 0 error (`tsc --noEmit`)
- **ESLint**: 0 warning / 0 error
- **Vitest Unit Test**: 7 tests passed (100%)
- **Production Build**: Next.js build sukses
