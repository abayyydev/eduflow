# Laporan Hasil Implementasi — Phase 3: Grading Components & Gradebook

- **Tanggal Eksekusi:** 19 November 2026
- **Status:** Selesai (Passed Gate 3)
- **Komponen Utama:** Pengelolaan Kategori Penilaian (`grading_categories`), Item Penilaian (`assessment_items`), Skala Mutu Huruf (`grade_scales`), Tabel Gradebook Interaktif Dosen, Engine Kalkulasi Otomatis Berbobot, Penguncian/Publikasi Nilai, Audit Log, dan Portal Nilai Mahasiswa.

---

## 1. Pekerjaan yang Selesai

### 1.1 CRUD Kategori Penilaian & Skala Nilai
- **Konfigurasi Bobot Per Kelas**:
  - Setiap kelas memiliki 6 kategori penilaian awal: Presensi (10%), Tugas (20%), Kuis (15%), Praktikum (15%), UTS (20%), UAS (20%) dengan total tepat 100%.
  - Modal "Atur Bobot Kategori" dengan validasi real-time: total bobot harus tepat 100% untuk dapat disimpan.
  - Metode agregasi: rata-rata (*average*) dan jumlah ternormalisasi (*sum_normalized*).
  - Skala nilai mutu huruf standar (A: 85–100 [4.0], A-: 80–84.99 [3.7], B+: 75–79.99 [3.3], B: 70–74.99 [3.0], B-: 65–69.99 [2.7], C+: 60–64.99 [2.3], C: 55–59.99 [2.0], D: 40–54.99 [1.0], E: 0–39.99 [0.0]).

### 1.2 Item Penilaian & Input Nilai Cepat
- **Item Penilaian Dinamis**:
  - Dosen dapat menambahkan kolom item penilaian baru pada kategori apa pun (misal: Tugas 2, Kuis 2) melalui modal "Tambah Item Nilai".
- **Input Nilai Cepat pada Tabel Gradebook**:
  - Sel nilai dapat langsung diedit di baris mahasiswa.
  - Auto-save saat `onBlur` atau penekanan tombol `Enter` dengan penanganan asynchronous tanpa me-reload halaman.
  - Penegasan aturan SOT:
    - Nilai kosong ditampilkan sebagai `—` (*Belum Dinilai* / `NULL`) dan **tidak** diam-diam dianggap 0.
    - Angka `0` adalah nilai sah (misal mahasiswa tidak mengerjakan atau mendapat skor nol).
    - Nilai dibatasi pada rentang 0 sampai `maxScore`.

### 1.3 Tabel Gradebook Interaktif Dosen (`/gradebook`)
- **Tampilan Sesuai UI Guideline**:
  - Header kolom bertingkat: Kategori Penilaian (dengan badge persentase bobot) dan Item Penilaian di bawahnya.
  - Kolom identitas mahasiswa (NIM & Nama Mahasiswa) bersifat *sticky* di sebelah kiri saat tabel di-scroll secara horizontal.
  - Ringkasan statistik kelas di bagian atas: Rata-rata Kelas, Nilai Tertinggi, Kelulusan (≥ 55), dan Total Bobot Aktif.
  - Tombol aksi "Rincian": Modal detail kalkulasi yang memperlihatkan kontribusi per kategori, jumlah item dinilai, dan poin bobot yang dihasilkan.

### 1.4 Penguncian & Publikasi Nilai
- **Kunci Nilai (`gradingLockedAt`)**:
  - Mencegah perubahan nilai secara tidak disengaja. Sel nilai otomatis menjadi *read-only*.
  - Memerlukan aksi sadar dosen untuk membuka kunci (*unlock*).
- **Publikasi Nilai (`gradesPublishedAt`)**:
  - Nilai akhir mahasiswa tidak dapat dilihat oleh mahasiswa sebelum dosen melakukan publikasi secara sadar.
  - Saat dipublikasikan, sistem secara otomatis mengirimkan notifikasi in-app kepada seluruh mahasiswa terdaftar.
  - Dosen dapat menarik kembali publikasi jika diperlukan.

### 1.5 Audit Log
- Setiap kali nilai diubah, bobot disesuaikan, item nilai ditambahkan, atau status kunci/publikasi diubah, sistem mencatat riwayat perubahan data (*before_data* dan *after_data*) ke dalam tabel `audit_logs`.

### 1.6 Portal Nilai Mahasiswa (`/student/grades`)
- Mahasiswa dapat melihat daftar seluruh kelas yang diikutinya:
  - Jika nilai akhir telah dipublikasikan: menampilkan nilai akhir berbobot, huruf mutu (A s/d E), distribusi per komponen, dan rincian skor per item beserta feedback dosen.
  - Jika belum dipublikasikan: menampilkan banner ramah "Belum Dipublikasikan oleh Dosen" dan hanya menampilkan skor tugas individual yang telah diperiksa dosen.
  - Mahasiswa **tidak dapat** melihat nilai atau data mahasiswa lain.

---

## 2. Hasil Verifikasi Gate 3
- **TypeScript**: 0 error (`tsc --noEmit`)
- **ESLint**: 0 warning / 0 error
- **Unit & Integration Test**: 18 tests passed (Semua benchmark manual SOT, agregasi sum_normalized, pemisahan nilai 0 vs null, dan bobot 100% lolos)
- **Production Build**: 16 rute App Router teroptimasi (0 error)
