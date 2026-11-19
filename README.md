# EDUFlow — Personal Academic & Learning Management System

EDUFlow adalah aplikasi web responsif modern yang dirancang untuk seorang dosen pemilik dalam mengelola perkuliahan: kelas, mahasiswa, materi pertemuan, tugas (pengumpulan file dan link), presensi, komponen penilaian, gradebook interaktif, kalkulasi nilai akhir berbobot, publikasi nilai, dan ekspor data akademik.

---

## 1. Stack Teknologi
- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v3 (Design Tokens Academic Modern)
- **Database**: MySQL 8.0 (InnoDB, `utf8mb4_unicode_ci`)
- **ORM**: Drizzle ORM + `mysql2`
- **Authentication**: Secure Session (HTTP-only cookie, `jose` JWT, `bcryptjs` password hashing)
- **Validation**: Zod
- **Ekspor Data**: ExcelJS (XLSX)
- **Testing**: Vitest

---

## 2. Prasyarat Sistem
- Node.js `v20.x` atau lebih baru (`v24.x` didukung).
- MySQL 8.0 (misalnya via Laragon, XAMPP, atau MySQL Community Server).
- Windows, macOS, atau Linux.

---

## 3. Instalasi & Setup Lokal

### Langkah 1: Klon & Buka Direktori
```bash
git clone <repository-url>
cd EDUFlow_SOT
```

### Langkah 2: Konfigurasi Environment
Salin file `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Sesuaikan `DATABASE_URL` jika kredensial MySQL berbeda (default Laragon: `mysql://root:@localhost:3306/eduflow`).

### Langkah 3: Install Dependensi
```bash
# Windows
npm.cmd install

# Linux / macOS
npm install
```

### Langkah 4: Sinkronisasi Database
Pastikan database `eduflow` telah dibuat di MySQL, lalu jalankan sinkronisasi schema:
```bash
# Windows
npx.cmd drizzle-kit push

# Linux / macOS
npx drizzle-kit push
```

### Langkah 5: Jalankan Database Seeder
Isi data awal (1 Dosen, 2 Mata Kuliah, 3 Kelas, 20 Mahasiswa, Kategori Bobot 100%, Tugas, Submisi, Sesi Presensi):
```bash
# Windows
npm.cmd run db:seed

# Linux / macOS
npm run db:seed
```

### Langkah 6: Jalankan Server Development
```bash
# Windows
npm.cmd run dev

# Linux / macOS
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## 4. Akun Demo Bawaan

| Peran | Email | Kata Sandi | Keterangan |
|---|---|---|---|
| **Dosen (Owner)** | `dosen@eduflow.test` | `password123` | Akses penuh ke seluruh kelas, manajemen nilai, publikasi & penguncian |
| **Mahasiswa** | `mhs1@eduflow.test` s/d `mhs20@eduflow.test` | `password123` | Akses mandiri untuk melihat materi, upload tugas, cek status, dan nilai terbit |

---

## 5. Pengujian & Quality Assurance

```bash
# Jalankan unit test engine penilaian
npm.cmd run test

# Jalankan pengecekan TypeScript
npm.cmd run typecheck

# Jalankan linter
npm.cmd run lint

# Jalankan build production
npm.cmd run build
```

---

## 6. Aturan Inti Kalkulasi Gradebook
1. **Normalisasi Item**: `(score / max_score) * 100`.
2. **Kategori**: Rata-rata atau metode agregasi tersimpan dari item yang telah dinilai.
3. **Nilai Akhir**: `Σ(nilai_kategori × bobot_kategori) / Σ(bobot_kategori yang dihitung)`.
4. **Perlakuan Data Kosong**:
   - `NULL` berarti belum dinilai (tidak boleh diasumsikan sebagai 0 secara diam-diam).
   - Angka `0` adalah nilai sah.
5. **Syarat Finalisasi**: Total bobot aktif harus tepat 100% dan seluruh komponen wajib terisi.
