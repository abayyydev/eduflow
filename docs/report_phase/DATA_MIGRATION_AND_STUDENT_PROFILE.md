# Laporan Migrasi Data Akademik & Fitur Profil Mahasiswa

**Aplikasi:** EDUFlow  
**Tanggal:** 19 November 2026  
**Status:** Sukses & Terverifikasi  

---

## 1. Ringkasan Eksekusi
Berdasarkan permintaan terbaru, telah diselesaikan:
1. **Pemisahan Tabel Pengguna (DEC-007):**
   - Tabel `users`: khusus akun internal `admin` dan `superadmin`.
   - Tabel `lecturers`: khusus dosen pemilik perkuliahan (`nip`, gelar akademik, institusi, dll.).
   - Tabel `students`: khusus mahasiswa (`student_number` / NIM, `study_program`, `cohort`, `phone`, dll.).
2. **Login Fleksibel untuk Mahasiswa (NIM atau Email):**
   - Endpoint `/api/auth/login` menerima identifier berupa **NIM** atau **Email**.
   - Sistem memeriksa tabel `students` terlebih dahulu dengan mencocokkan `student_number` atau `email`.
   - Password default sementara diseragamkan menjadi `password123`.
3. **Pengelolaan Profil Mahasiswa Mandiri (`/student/profile`):**
   - Komponen interaktif `StudentProfileClient` dengan modal edit nama & nomor WhatsApp/HP.
   - Fitur ubah kata sandi dengan verifikasi kata sandi lama dan validasi konfirmasi kata sandi baru.
4. **Migrasi Data Riil Perkuliahan & Mahasiswa:**
   - **113 Mahasiswa Aktif** berhasil dimigrasi dan di-seed ke database MySQL.
   - **5 Mata Kuliah** dan **8 Kelas Perkuliahan** dikonfigurasi lengkap sesuai jadwal hari Kamis, Jum'at, dan Senin.

---

## 2. Struktur Data Akademik & Jadwal Perkuliahan

### A. Hari Kamis
1. **Teori Pemrograman Web Fundamental I (IT 9 & PPMP - Reguler Pagi)**
   - **Kode Matkul:** `PWF101` (2 SKS) | **Kode Kelas:** `REG-PAGI`
   - **Jadwal & Ruang:** Kamis, 09.00 - 10.30 WIB @ Ruang R.C2
   - **Jumlah Mahasiswa:** 49 mahasiswa (47 teori + 2 desain.01)
2. **Prak. Pemrograman Web Fundamental I (Kelompok Desain.03)**
   - **Kode Matkul:** `PWP101` (1 SKS) | **Kode Kelas:** `DESAIN.03`
   - **Jadwal & Ruang:** Kamis, 13.00 - 14.30 WIB @ Ruang R.D2
   - **Jumlah Mahasiswa:** 16 mahasiswa
3. **Prak. Pemrograman Web Fundamental I (Kelompok Desain.02)**
   - **Kode Matkul:** `PWP101` (1 SKS) | **Kode Kelas:** `DESAIN.02`
   - **Jadwal & Ruang:** Kamis, 14.30 - 16.00 WIB @ Ruang R.D2
   - **Jumlah Mahasiswa:** 17 mahasiswa
4. **Prak. Pemrograman Web Fundamental I (Kelompok Desain.01)**
   - **Kode Matkul:** `PWP101` (1 SKS) | **Kode Kelas:** `DESAIN.01`
   - **Jadwal & Ruang:** Kamis, 16.00 - 17.30 WIB @ Ruang R.D2
   - **Jumlah Mahasiswa:** 15 mahasiswa

### B. Hari Jum'at
5. **T + P Pemrograman Web II (IT 8 - Reguler Pagi)**
   - **Kode Matkul:** `PW201` (3 SKS) | **Kode Kelas:** `REG-PAGI`
   - **Jadwal & Ruang:** Jum'at, 13.00 - 15.00 WIB @ Ruang R.B2
   - **Jumlah Mahasiswa:** 44 mahasiswa (Angkatan IT 8)
6. **Pemrograman Visual II (IT 8 - Reguler Malam Kel.A)**
   - **Kode Matkul:** `PV201` (2 SKS) | **Kode Kelas:** `KEL.A`
   - **Jadwal & Ruang:** Jum'at, 18.45 - 20.15 WIB @ Ruang R.B3
   - **Jumlah Mahasiswa:** 22 mahasiswa (Kelompok A)
7. **Pemrograman Visual II (IT 8 - Reguler Malam Kel.B)**
   - **Kode Matkul:** `PV201` (2 SKS) | **Kode Kelas:** `KEL.B`
   - **Jadwal & Ruang:** Jum'at, 20.15 - 21.45 WIB @ Ruang R.B3
   - **Jumlah Mahasiswa:** 22 mahasiswa (Kelompok B)

### C. Hari Senin
8. **Pemrograman Web III (IT 7 - Kelompok 2)**
   - **Kode Matkul:** `PW301` (3 SKS) | **Kode Kelas:** `KEL.2`
   - **Jadwal & Ruang:** Senin, 18.30 - 20.00 WIB @ Ruang R.D2
   - **Jumlah Mahasiswa:** 20 mahasiswa (Angkatan IT 7)

---

## 3. Akun Akses Pengujian

| Peran | Identifier Login | Kata Sandi | Halaman Utama |
|---|---|---|---|
| **Dosen** | `dosen@eduflow.test` | `password123` | `/dashboard` |
| **Superadmin** | `admin@eduflow.test` | `password123` | `/dashboard` |
| **Mahasiswa (Contoh 1 - IT 9)** | `2611090062` *(Abdulaziz Gaafar Abdullah)* | `password123` | `/student/dashboard` |
| **Mahasiswa (Contoh 2 - IT 8)** | `2511080026` *(Adrian Hanafi)* | `password123` | `/student/dashboard` |
| **Mahasiswa (Contoh 3 - IT 7)** | `2411070045` *(Adam Muamar Kadafi)* | `password123` | `/student/dashboard` |

> Mahasiswa juga dapat login menggunakan email resmi yang di-generate: `<nim>@student.eduflow.ac.id`.

---

## 4. Hasil Verifikasi Sistem
- **Database MySQL Local:** Sinkronisasi skema selesai, 113 data mahasiswa dan relasi kelas ter-seed sempurna.
- **Unit & Integration Tests (Vitest):** 27 dari 27 pengujian lolos (100% PASS).
- **TypeScript (`tsc --noEmit`):** 0 error.
- **ESLint (`next lint`):** 0 warning, 0 error.
- **Next.js Dev Server:** Aktif berjalan di `http://localhost:3001`.
