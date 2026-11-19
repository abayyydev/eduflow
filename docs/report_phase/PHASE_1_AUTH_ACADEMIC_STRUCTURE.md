# Laporan Hasil Implementasi — Phase 1: Auth & Academic Structure

- **Tanggal Eksekusi:** 19 November 2026
- **Status:** Selesai (Passed Gate 1)
- **Komponen Utama:** Manajemen Semester, Mata Kuliah, Kelas, Master Mahasiswa, Enrollment Peserta, dan Isolasi Hak Akses Multi-User.

---

## 1. Pekerjaan yang Selesai

### 1.1 Struktur Akademik Dosen
- **Mata Kuliah (`courses`)**:
  - Dosen dapat menginput kode, nama, deskripsi, dan bobot SKS.
  - Setiap mata kuliah terikat pada dosen pemilik (`ownerUserId`).
- **Kelas (`classes`)**:
  - Dosen dapat membuka kelas per mata kuliah dan semester aktif.
  - Setiap pembuatan kelas baru secara otomatis menginisialisasi 6 kategori penilaian standar dengan total bobot 100% (Presensi 10%, Tugas 20%, Kuis 15%, Praktikum 15%, UTS 20%, UAS 20%) serta 9 skala huruf (A s/d E).
  - Fitur pengarsipan kelas (`status: 'archived'`) yang dicatat pada tabel `audit_logs`.
- **Halaman UI Dosen**:
  - `/classes`: Tampilan grid kartu kelas dengan pencarian instan, filter aktif/arsip, badge status, jumlah mahasiswa, dan modal pembuatan mata kuliah/kelas.
  - `/classes/[id]`: Detail kelas dengan navigasi 7 tab: Ringkasan, Mahasiswa, Materi, Tugas, Presensi, Gradebook, Pengaturan.

### 1.2 Manajemen Mahasiswa & Enrollment
- **Master Mahasiswa**:
  - `/students`: Master data seluruh mahasiswa, pencarian instan berdasarkan Nama, NIM, Email, atau Prodi.
  - Form modal tambah mahasiswa baru (akun otomatis dibuat dengan password default `password123` terenkripsi).
- **Enrollment Kelas**:
  - Dosen dapat memilih mahasiswa dari master list yang belum terdaftar untuk dimasukkan ke kelas.
  - Dosen dapat menonaktifkan/mengeluarkan mahasiswa dari kelas (`status: 'dropped'`).

### 1.3 Portal Mahasiswa (Student Self-Service)
- `/student/classes`: Menampilkan daftar kartu kelas yang **hanya diikuti oleh mahasiswa tersebut** secara aktif.
- `/student/classes/[id]`: Menampilkan detail jadwal kelas, info dosen pengampu, daftar materi per pertemuan, dan tugas perkuliahan.

### 1.4 Keamanan & Multi-User Isolation
- Pembatasan query server-side: Mahasiswa tidak dapat mengakses data kelas mahasiswa lain. Jika mencoba mengakses `/student/classes/[id]` untuk kelas yang tidak terdaftar, server melempar `FORBIDDEN_NOT_ENROLLED` dan menampilkan state *Akses Ditolak*.
- Dosen hanya dapat mengelola dan mengedit kelas miliknya sendiri (`ownerUserId` guard).

---

## 2. Hasil Verifikasi Gate 1
- **TypeScript**: 0 error (`tsc --noEmit`)
- **ESLint**: 0 warning / 0 error
- **Unit & Integration Test**: 11 tests passed (Kalkulasi nilai + Pengujian isolasi multi-user)
- **Production Build**: 12 rute App Router teroptimasi (0 error)
- **Git Commit**: `b6190f7`
