# Implementation Plan — EDUFlow

## 1. Strategi
Bangun secara vertikal dan bertahap. Gunakan data dummy/seed untuk memvalidasi UI lebih awal, tetapi setiap fase harus berakhir dengan integrasi database dan pengujian. Jangan membangun semua halaman sekaligus tanpa alur yang berfungsi.

## 2. Struktur repo yang disarankan
```text
eduflow/
├── docs/
│   ├── README.md
│   ├── PRD.md
│   ├── UI_GUIDELINE.md
│   ├── DATABASE_SCHEMA.md
│   ├── IMPLEMENTATION_PLAN.md
│   └── EXECUTION_PROMPT.md
├── public/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (lecturer)/
│   │   ├── (student)/
│   │   └── api/
│   ├── components/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── classes/
│   │   ├── assignments/
│   │   ├── submissions/
│   │   ├── gradebook/
│   │   ├── attendance/
│   │   └── materials/
│   ├── lib/
│   ├── server/
│   └── types/
├── tests/
└── README.md
```

## 3. Fase dan approval gates

### Phase 0 — Foundation & SOT
**Pekerjaan**
- Buat repo dan Next.js TypeScript.
- Pasang Tailwind, MySQL, Zod, auth.
- Buat design tokens, layout, sidebar, topbar.
- Siapkan env example, lint, format, test runner.
- Buat seed data.

**Output**
- Aplikasi dapat dijalankan lokal.
- Login demo sesuai role.
- Layout responsif.
- Dokumentasi setup.

**Gate 0**
Jangan lanjut sebelum instalasi, lint, build, dan koneksi database berhasil.

### Phase 1 — Auth, profil, semester, kelas, mahasiswa
**Pekerjaan**
- Auth dan authorization server-side.
- CRUD semester, course, class.
- CRUD/undang mahasiswa.
- Enrollment.
- Impor CSV sederhana dapat ditunda ke P1.

**Gate 1**
Dosen dapat membuat kelas dan mahasiswa hanya melihat kelas yang diikuti. Uji akses lintas akun.

### Phase 2 — Tugas, file/link submission
**Pekerjaan**
- CRUD tugas.
- Mode file/url/both.
- Upload privat dengan validasi MIME/size.
- Draft, submit, late, revision, resubmit.
- Daftar submission dan filter.

**Gate 2**
Mahasiswa dapat mengumpulkan file dan URL; dosen dapat membuka submission sesuai izin; deadline dan status teruji.

### Phase 3 — Komponen nilai dan gradebook
**Pekerjaan**
- Kategori nilai dan bobot.
- Assessment items.
- Input nilai manual dan nilai dari tugas.
- Gradebook table.
- Kalkulasi kategori dan nilai akhir.
- Grade scale.
- Audit log perubahan nilai.

**Gate 3**
Uji unit formula: nilai normalisasi, bobot, nilai kosong, nilai 0, total bobot bukan 100%, pembulatan. Cocokkan hasil manual.

### Phase 4 — Presensi dan materi
**Pekerjaan**
- Materi per pertemuan.
- Sesi presensi.
- Rekap kehadiran.
- Integrasi persentase presensi sebagai komponen nilai bila dikonfigurasi.

**Gate 4**
Mahasiswa hanya melihat materi kelasnya; rekap presensi konsisten dengan sesi dan status.

### Phase 5 — Dashboard, publikasi, ekspor, hardening
**Pekerjaan**
- Dashboard dosen/mahasiswa.
- Publish/lock grades.
- Ekspor CSV/XLSX.
- Notifikasi in-app.
- Empty/loading/error states.
- Audit UI dan keamanan.
- Backup/deployment.

**Gate 5**
Acceptance criteria MVP seluruhnya lolos; tidak ada akses data lintas kelas; build production berhasil.

## 4. Pengujian minimum
- Unit: kalkulasi nilai dan konversi skala huruf.
- Unit: aturan deadline dan status submission.
- Integration: create class, enroll student, create assignment, submit, grade.
- Authorization: mahasiswa A tidak dapat membaca kelas/submission/nilai mahasiswa B.
- Validation: skor negatif/lebih dari maksimum ditolak.
- Upload: file terlalu besar/tipe tidak diizinkan ditolak.
- Regression: nilai null tidak berubah menjadi nol.
- Export: jumlah baris dan nilai sama dengan gradebook.
- Responsive: 1440px, 1024px, 768px, 390px.

## 5. Definition of Done
- Fitur memenuhi acceptance criteria.
- Loading, empty, success, dan error states tersedia.
- Validasi server-side tersedia.
- Authorization diuji.
- Tidak ada secret di source control.
- Tidak ada error TypeScript/lint/build.
- Dokumentasi setup dan env diperbarui.
- Perubahan schema memiliki migration.
- Demo dapat diuji menggunakan seed data.

## 6. Environment variables (contoh)
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/eduflow"
AUTH_SECRET="replace-with-long-random-secret"
APP_URL="http://localhost:3000"
STORAGE_ENDPOINT=""
STORAGE_BUCKET=""
STORAGE_ACCESS_KEY=""
STORAGE_SECRET_KEY=""
```

Jangan commit file `.env`. Sediakan `.env.example` tanpa credential nyata.

## 7. Rekomendasi seed demo
- 1 akun dosen.
- 2 mata kuliah.
- 3 kelas.
- 20 mahasiswa.
- 7 kategori nilai per kelas dengan total bobot 100%.
- 5 tugas, 2 kuis, 1 UTS, 1 UAS.
- Submission campuran file/link.
- 8 sesi presensi.
- Sebagian nilai kosong untuk menguji status “Belum dinilai”.
