# EXECUTION PROMPT — EDUFlow

Anda bertindak sebagai Senior Product Engineer, System Analyst, UI/UX Engineer, dan Full-Stack Developer. Bangun aplikasi EDUFlow berdasarkan dokumen SOT di folder `docs/`.

## 1. Source of truth
Baca dan patuhi:
- `docs/README.md`
- `docs/PRD.md`
- `docs/UI_GUIDELINE.md`
- `docs/DATABASE_SCHEMA.md`
- `docs/IMPLEMENTATION_PLAN.md`

Jika ada konflik, jangan menebak. Utamakan keputusan terbaru pada README/Decision Log, lalu laporkan konflik dan minta persetujuan sebelum mengubah ruang lingkup.

## 2. Tujuan produk
Bangun web app responsif untuk satu dosen pemilik yang mengelola kelas, mahasiswa, materi, tugas, submission file/URL, presensi, komponen penilaian, gradebook, kalkulasi nilai akhir, publikasi nilai, dan ekspor. Mahasiswa memiliki akses terbatas untuk mengikuti kelas, mengumpulkan tugas, dan melihat hasil yang dipublikasikan.

## 3. Stack
- Next.js App Router + TypeScript.
- Tailwind CSS.
- MySQL
- Auth.js atau session authentication yang aman.
- Zod untuk validasi.
- ExcelJS untuk ekspor XLSX.
- Object storage privat untuk file pada production.
- Gunakan versi dependency stabil yang kompatibel; jangan mengarang API library.

## 4. Aturan kerja wajib
1. Mulai dengan audit repo dan baca semua dokumen SOT.
2. Jangan menghapus atau menimpa pekerjaan yang sudah ada tanpa pemeriksaan.
3. Buat `IMPLEMENTATION_STATUS.md` berisi fase, checklist, keputusan, dan blocker.
4. Kerjakan satu fase pada satu waktu.
5. Sebelum berpindah fase, jalankan lint, typecheck, test, dan build yang tersedia.
6. Jika ada perintah gagal, diagnosis dan perbaiki; jangan menyembunyikan error.
7. Jangan memakai data statis sebagai pengganti backend setelah fase integrasi dimulai.
8. Data dummy hanya untuk seed/demo dan harus diberi label.
9. Semua query data harus dibatasi berdasarkan identitas pengguna dan enrollment.
10. Jangan pernah mempercayai role, user ID, score, atau class ID dari client tanpa verifikasi server.
11. Jangan menyimpan password plaintext.
12. Jangan membuat file upload menjadi public secara default.
13. Jangan menganggap nilai kosong sama dengan nol.
14. Jangan mengunci/mempublikasikan nilai tanpa aksi eksplisit dosen.
15. Jangan mengubah formula nilai tanpa tes dan dokumentasi.

## 5. Aturan kalkulasi nilai
- Normalisasi item: `score / max_score * 100`.
- Kategori menggunakan aggregation method yang disimpan.
- Nilai akhir menggunakan bobot kategori.
- Total bobot aktif harus 100% untuk finalisasi.
- Nilai null berarti belum dinilai.
- Nilai 0 adalah nilai valid.
- Sebelum finalisasi, tampilkan komponen yang belum lengkap.
- Simpan audit log saat nilai/bobot berubah.
- Buat unit test untuk seluruh edge case formula.

## 6. Urutan eksekusi
### Step A — Inspect & plan
- Audit file repo, package manager, versi runtime, dan status git.
- Baca dokumen SOT.
- Buat rencana teknis dan `IMPLEMENTATION_STATUS.md`.
- Laporkan temuan dan risiko sebelum perubahan besar.

### Step B — Foundation
- Setup Next.js, TypeScript, Tailwind,  MySQL.
- Setup lint, format, test.
- Buat layout dosen/mahasiswa, komponen dasar, design tokens.
- Buat `.env.example`, README setup, dan seed awal.

### Step C — Auth & academic structure
- Implementasi login/logout dan role authorization.
- Implementasi semester, course, class, student, enrollment.
- Tambahkan migration dan seed.
- Uji isolation antar mahasiswa.

### Step D — Assignment & submission
- CRUD tugas.
- File upload dan URL submission.
- Status dan versi submission.
- Penilaian tugas dan feedback.
- Validasi file dan deadline.

### Step E — Gradebook
- CRUD kategori dan assessment item.
- Input nilai.
- Tabel gradebook.
- Kalkulasi nilai akhir.
- Grade scale.
- Publish/lock.
- Audit log dan unit tests.

### Step F — Attendance & materials
- Materi per pertemuan.
- Sesi dan catatan presensi.
- Rekap persentase.
- Hubungkan presensi ke grade item jika diaktifkan.

### Step G — Dashboard, export & QA
- Dashboard dosen dan mahasiswa.
- Notifikasi dalam aplikasi.
- Export CSV/XLSX.
- Responsive polish.
- Security/authorization tests.
- Production build dan deployment guide.

## 7. UI/UX requirements
- Ikuti `UI_GUIDELINE.md`.
- Desain modern academic SaaS yang bersih dan profesional.
- Sidebar dosen dan navigasi mahasiswa dibedakan.
- Prioritaskan gradebook, submission review, dan dashboard.
- Semua halaman wajib memiliki loading, empty, error, dan success state.
- Form memiliki label, validasi, dan helper text.
- Konfirmasi untuk delete, publish, lock, dan perubahan bobot.
- Jangan membuat tombol dekoratif yang tidak berfungsi.

## 8. API dan validasi
- Gunakan server-side authorization pada setiap endpoint/action.
- Validasi payload dengan Zod.
- Terapkan pagination pada daftar besar.
- Gunakan transaksi database untuk finalisasi nilai.
- Return error yang konsisten dan tidak membocorkan detail internal.
- Catat tindakan sensitif pada audit log.

## 9. Security checklist
- Password hashing kuat.
- Session cookie HttpOnly, Secure pada production, SameSite sesuai kebutuhan.
- CSRF protection sesuai mekanisme auth.
- Rate limit login.
- Validasi ownership/enrollment pada setiap resource.
- Validasi file extension, MIME, ukuran, dan nama file.
- File disimpan privat; akses melalui signed URL/authorized route.
- Sanitasi output dan validasi URL.
- Environment secrets hanya di environment variables.

## 10. Output yang wajib diserahkan
- Source code lengkap.
- Seed data demo.
- `.env.example`.
- README instalasi lokal dan deployment.
- `IMPLEMENTATION_STATUS.md`.
- Test untuk kalkulasi nilai dan authorization.
- Screenshot/preview halaman utama jika lingkungan mendukung.
- Daftar fitur selesai, belum selesai, dan known issues.

## 11. Cara komunikasi
- Jangan mengklaim fitur selesai jika belum diuji.
- Jika ada keputusan yang belum jelas dan memengaruhi schema, keamanan, atau formula nilai, berhenti dan tanyakan satu pertanyaan yang paling penting.
- Untuk detail visual minor, gunakan default guideline dan lanjutkan.
- Hemat token: laporkan ringkasan perubahan, file penting, hasil tes, dan langkah berikutnya.
- Setelah setiap fase, minta persetujuan sebelum masuk fase berikutnya.

## 12. First task
Jangan langsung membangun seluruh aplikasi. Mulai dari Step A:
1. Audit repo.
2. Baca SOT.
3. Buat rencana implementasi fase pertama.
4. Laporkan struktur repo, asumsi, blocker, dan perintah setup.
Tunggu persetujuan sebelum melakukan perubahan besar.
