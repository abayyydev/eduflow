# Laporan Hasil Implementasi — Phase 2: Assignment & Submission

- **Tanggal Eksekusi:** 19 November 2026
- **Status:** Selesai (Passed Gate 2)
- **Komponen Utama:** Pengelolaan Tugas (CRUD Tugas), Sistem Pengumpulan File & URL, Validasi Format & Deadline, Versioning Submisi, Panel Penilaian Dosen, dan Penyimpanan File Privat.

---

## 1. Pekerjaan yang Selesai

### 1.1 CRUD Tugas Dosen
- **Server Actions & Validasi**:
  - `createAssignment()` di `src/features/assignments/actions.ts` dengan validasi Zod: judul, instruksi, nilai maksimum, tenggat waktu (*deadline*), aturan keterlambatan (*allowLate*), batas ukuran file (*maxFileSizeMb*), dan mode pengumpulan (*file*, *url*, atau *both*).
  - Opsi keterhubungan otomatis ke komponen gradebook: Jika dicentang, secara otomatis membuat entri `assessment_items` pada kategori "Tugas" kelas terkait.
- **Halaman UI Tugas Dosen**:
  - `/assignments`: Tampilan kartu tugas dengan filter kelas dan status (*published*, *draft*, *closed*), pencarian instan, rekap status submisi (Total, Perlu Dinilai, Sudah Dinilai), dan modal interaktif "Buat Tugas Baru".
  - `/assignments/[id]`: Dasbor review dan penilaian tugas per kelas:
    - Ringkasan KPI: Total Mahasiswa, Sudah Terkumpul, Perlu Dinilai, Selesai Dinilai.
    - Tabel status pengumpulan seluruh mahasiswa kelas terdaftar.
    - Modal interaktif "Beri Nilai" / "Edit Nilai":
      - Pratinjau file yang dikumpulkan dengan tautan unduh privat.
      - Pratinjau tautan URL eksternal (Google Drive / GitHub) yang divalidasi.
      - Catatan yang dikirimkan oleh mahasiswa.
      - Form input skor (0 s/d maxScore) dan feedback dosen.
      - Tombol aksi: "Simpan Nilai" (status `graded`) dan "Minta Revisi" (status `returned_for_revision`).
      - Sinkronisasi otomatis ke tabel `grades` jika tugas terhubung dengan item gradebook.
      - Pengiriman notifikasi in-app kepada mahasiswa.

### 1.2 Alur Pengumpulan Tugas Mahasiswa
- **Halaman UI Mahasiswa**:
  - `/student/assignments`: Daftar seluruh tugas perkuliahan dari kelas yang diikuti secara aktif, lengkap dengan filter status (*Semua*, *Belum Dikirim*, *Terkumpul*, *Perlu Revisi*, *Sudah Dinilai*), tenggat waktu, dan skor hasil penilaian.
  - `/student/assignments/[id]`: Halaman pengerjaan dan pengumpulan tugas:
    - Petunjuk instruksi lengkap, batas deadline, bobot skor maksimum.
    - Banner status submisi (`draft`, `submitted`, `late`, `returned_for_revision`, `resubmitted`, `graded`).
    - Alert peringatan revisi jika dosen mengembalikan tugas dengan catatan perbaikan.
    - Kartu hasil nilai dan feedback dosen saat tugas selesai dinilai.
    - Form pengumpulan: input file dokumen/ZIP, input URL Google Drive/GitHub, dan textarea catatan mahasiswa.
    - Dua tombol aksi: **Simpan Draft** dan **Kirim Tugas**.
    - Tabel riwayat versi pengumpulan (`submission_versions`), mencatat setiap pengiriman ulang secara berurutan lengkap dengan waktu kirim dan tautan file/URL.

### 1.3 Arsitektur Penyimpanan File Privat & Keamanan
- File disimpan di direktori privat server (`./storage/submissions`), bukan di direktori statis publik `public/`.
- Akses unduh file dilindungi melalui authorized Route Handler `/api/files/submission/[versionId]`:
  - Dosen hanya dapat mengunduh jika memiliki kelas terkait (`ownerUserId`).
  - Mahasiswa hanya dapat mengunduh jika file tersebut adalah miliknya (`studentUserId`).
  - Sanitasi path basename untuk mencegah *directory traversal attacks*.
- Validasi deadline di server: Jika pengumpulan dilakukan setelah deadline dan `allowLate: false`, server menolak pengumpulan; jika `allowLate: true`, status pengumpulan ditandai sebagai `late` (Terlambat).

---

## 2. Hasil Verifikasi Gate 2
- **TypeScript**: 0 error (`tsc --noEmit`)
- **ESLint**: 0 warning / 0 error
- **Unit & Integration Test**: 15 tests passed (Kalkulasi nilai + Multi-user isolation + Siklus hidup tugas & penyimpanan file)
- **Production Build**: 14 rute App Router teroptimasi (0 error)
