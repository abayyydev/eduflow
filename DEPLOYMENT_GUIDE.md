# Panduan Persiapan & Deployment EDUFlow

Dokumen ini memandu langkah demi langkah persiapan pengunggahan (*deployment*) sistem **EDUFlow** untuk keperluan *user testing* mahasiswa & dosen.

---

## Arsitektur Deployment

- **Frontend & App Logic:** Next.js 15 (App Router, Server Actions, Tailwind CSS, API Routes) $\rightarrow$ **Vercel** via **GitHub**.
- **Database Backend:** MySQL 8.x / MariaDB $\rightarrow$ **cPanel Hosting** (melalui phpMyAdmin & Remote MySQL).

---

## Langkah 1: Persiapan Database di cPanel

1. **Login ke cPanel Hosting** Anda.
2. **Buat Database MySQL Baru:**
   - Cari menu **MySQL Database Wizard** atau **MySQL Databases**.
   - Buat nama database baru, misalnya: `namapengguna_eduflow`.
   - Buat user baru, misalnya: `namapengguna_dbuser` dengan kata sandi yang aman.
   - Hubungkan user ke database dan centang **ALL PRIVILEGES** (Semua Hak Akses).
3. **Import Skema & Data Awal:**
   - Buka menu **phpMyAdmin** di cPanel.
   - Pilih database `namapengguna_eduflow` yang baru saja dibuat di sisi kiri.
   - Klik tab **Import** di bagian atas.
   - Klik **Choose File** / Telusuri, pilih file:
     ```
     eduflow_database_cpanel.sql
     ```
     *(File ini sudah digenerate otomatis di root proyek Anda, berukuran ~490 KB berisi struktur tabel lengkap dan data master).*
   - Gulir ke bawah dan klik tombol **Go / Kirim**. Tunggu hingga muncul pesan hijau sukses.
4. **Buka Akses Remote MySQL (SANGAT PENTING):**
   - Kembali ke Beranda cPanel, cari menu **Remote MySQL** (*MySQL Jarak Jauh*).
   - Pada input **Host (% wildcard is allowed)**, ketik simbol persen:
     ```text
     %
     ```
   - Klik tombol **Add Host**.
   - *Catatan:* Langkah ini wajib agar serverless functions Vercel diizinkan terhubung ke database MySQL cPanel Anda.

---

## Langkah 2: Push Source Code ke GitHub

1. Pastikan seluruh perubahan kode telah ter-commit.
2. Jika belum menghubungkan remote GitHub, buat repository baru di GitHub (Private atau Public).
3. Jalankan perintah berikut di terminal:
   ```bash
   git remote add origin https://github.com/username-anda/eduflow.git
   git branch -M main
   git push -u origin main
   ```

---

## Langkah 3: Deployment ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik tombol **Add New...** $\rightarrow$ pilih **Project**.
3. Cari repository `eduflow` yang baru saja Anda push, lalu klik **Import**.
4. Pada form konfigurasi proyek:
   - **Framework Preset:** Next.js (otomatis terdeteksi).
   - **Root Directory:** `./`
5. Buka bagian **Environment Variables** dan tambahkan variabel berikut:

| Nama Variabel | Contoh Nilai | Keterangan |
| :--- | :--- | :--- |
| `DATABASE_URL` | `mysql://user_eduflow:PasswordDb123!@domainanda.com:3306/user_eduflow` | URL koneksi ke MySQL cPanel Anda |
| `AUTH_SECRET` | `kunci-rahasia-acak-minimal-32-karakter-yang-sangat-kuat` | Kunci enkripsi token sesi login JWT |
| `APP_URL` | `https://eduflow-anda.vercel.app` | Domain Vercel yang diberikan |
| `STORAGE_TYPE` | `local` | Tipe penyimpanan file |
| `STORAGE_LOCAL_DIR` | `/tmp/submissions` | Direktori file upload di serverless Vercel |

6. Klik tombol **Deploy**.
7. Tunggu proses build selesai (~1-2 menit). Vercel akan memberikan domain publik aktif (misal `https://eduflow-anda.vercel.app`).

---

## Langkah 4: Kredensial Akun untuk User Testing

Karena tombol demo pada halaman login `/login` telah dihapus demi keamanan pengujian pengguna, gunakan kredensial berikut untuk menguji sistem:

### 1. Akun Dosen
- **Identifier (Email):** `dosen@eduflow.test`
- **Kata Sandi:** `password123`
- **Akses:** Manajemen kelas, silabus, pembuatan tugas, kanvas materi (WYSIWYG), absensi QR 16 pertemuan, dan gradebook kalkulasi nilai.

### 2. Akun Mahasiswa
- **Mahasiswa 1 (Muhammad Nur Faizin):**
  - **NIM:** `2611090013`
  - **Kata Sandi:** `password123`
- **Mahasiswa 2 (Abdulaziz Gaafar Abdullah):**
  - **NIM:** `2611090062`
  - **Kata Sandi:** `password123`
- **Akses:** Dashboard mahasiswa, presensi barcode GPS, melihat silabus, unduh materi, dan pengiriman tugas (*file upload* / URL).

### 3. Akun Superadmin
- **Identifier (Email):** `admin@eduflow.local`
- **Kata Sandi:** `password123`
- **Akses:** Akses penuh seluruh workspace.

---

## Pemecahan Masalah (Troubleshooting)

- **Error: `ETIMEDOUT` atau `Access denied for user` pada Vercel Logs:**
  - Pastikan IP server / domain cPanel di `DATABASE_URL` benar dan port `3306` terbuka.
  - Periksa kembali menu **Remote MySQL** di cPanel dan pastikan `%` sudah terdaftar.
  - Jika hosting Anda memblokir koneksi luar ke port 3306, Anda dapat menggunakan serverless database gratis seperti **PlanetScale**, **Aiven MySQL**, atau **Supabase/Neon** sebagai alternatif cloud database.
