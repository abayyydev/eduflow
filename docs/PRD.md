# Product Requirements Document (PRD)

## 1. Visi
Menyediakan satu ruang kerja digital yang sederhana dan dapat diandalkan agar dosen dapat mengelola aktivitas pembelajaran dan administrasi nilai tanpa bergantung pada banyak spreadsheet, chat, dan folder terpisah.

## 2. Masalah pengguna
- Nilai berasal dari banyak aktivitas dan format.
- Perhitungan nilai akhir rawan salah saat dilakukan manual.
- Tugas masuk melalui file, tautan, atau kanal berbeda.
- Sulit mengetahui siapa yang belum mengumpulkan atau belum dinilai.
- Rekap nilai per kelas membutuhkan waktu.
- Mahasiswa sering menanyakan status tugas dan nilai.

## 3. Sasaran dan indikator keberhasilan
| Sasaran | Indikator |
|---|---|
| Mengurangi rekap manual | Nilai akhir dan rekap kelas dihitung otomatis |
| Memusatkan pengumpulan | Semua submission tercatat di halaman tugas |
| Memudahkan pemantauan | Dosen dapat memfilter belum mengumpulkan/belum dinilai |
| Meningkatkan keterlacakan | Perubahan nilai dan status tercatat |
| Memudahkan pelaporan | Gradebook dapat diekspor |

Target MVP untuk pengujian: 1 dosen, 3 kelas aktif, hingga 150 mahasiswa total, dan 500 submission tanpa penurunan pengalaman yang berarti. Angka ini adalah target uji awal, bukan batas produk permanen.

## 4. Persona
### Dosen pemilik
Membuat kelas, menentukan aturan penilaian, memberi tugas, memeriksa submission, mengisi presensi, memasukkan nilai, dan mengekspor hasil.

### Mahasiswa
Mengakses kelas yang diikuti, membaca materi, mengumpulkan tugas, memeriksa status, serta melihat feedback dan nilai yang telah dipublikasikan.

## 5. Struktur navigasi
### Dosen
- Dashboard
- Mata Kuliah & Kelas
- Mahasiswa
- Tugas
- Materi
- Presensi
- Gradebook
- Laporan
- Pengaturan

### Mahasiswa
- Beranda
- Kelas Saya
- Materi
- Tugas
- Nilai Saya
- Profil

## 6. Kebutuhan fungsional

### FR-01 Autentikasi dan profil
- Login/logout untuk dosen dan mahasiswa.
- Password disimpan dalam bentuk hash kuat.
- Dosen dapat mengubah profil dan password.
- Mahasiswa hanya dapat mengakses kelas tempat ia terdaftar.
- Pembuatan akun mahasiswa dilakukan oleh dosen melalui input manual atau impor CSV pada fase lanjutan.

### FR-02 Semester, mata kuliah, dan kelas
- Dosen dapat membuat semester/tahun akademik.
- Dosen dapat membuat mata kuliah dan kelas.
- Kelas memiliki kode, nama, jadwal opsional, semester, dan status.
- Dosen dapat menambah/menghapus mahasiswa dari kelas.
- Penghapusan kelas menggunakan soft delete/archive agar histori tidak hilang.

### FR-03 Materi pembelajaran
- Dosen dapat membuat materi berdasarkan pertemuan.
- Materi mendukung judul, deskripsi, lampiran file, dan URL eksternal.
- Mahasiswa dapat melihat materi kelas yang diikutinya.
- Materi dapat diarsipkan.

### FR-04 Tugas dan submission
- Dosen dapat membuat tugas dengan judul, instruksi, tanggal buka, tenggat, nilai maksimum, dan aturan keterlambatan.
- Metode submission: file, tautan, atau keduanya.
- Format file dan batas ukuran dapat dikonfigurasi.
- Mahasiswa dapat menyimpan draft sebelum mengirim.
- Status submission: draft, submitted, late, returned_for_revision, resubmitted, graded.
- Sistem menyimpan waktu pengumpulan dan versi submission.
- Dosen dapat memberi skor, feedback, dan meminta revisi.
- Tugas dapat ditutup dan dibuka kembali oleh dosen.
- Tautan eksternal divalidasi sebagai URL dan ditampilkan sebagai tautan aman.

### FR-05 Komponen penilaian
- Dosen dapat membuat komponen per kelas.
- Komponen awal: Tugas, Kuis, UTS, UAS, Presensi, Praktikum, Proyek/Presentasi.
- Bobot tiap komponen dapat diedit.
- Total bobot aktif harus 100% sebelum nilai akhir difinalisasi.
- Dosen dapat menambahkan item penilaian di dalam kategori, misalnya Tugas 1, Tugas 2.
- Setiap item memiliki nilai maksimum dan tanggal opsional.
- Nilai dapat berupa angka desimal sesuai presisi yang ditetapkan.

### FR-06 Gradebook dan kalkulasi
- Gradebook menampilkan mahasiswa sebagai baris dan item penilaian sebagai kolom.
- Filter berdasarkan kelas, kategori, status, dan mahasiswa.
- Nilai kosong ditampilkan sebagai “Belum dinilai”, bukan 0.
- Nilai 0 adalah nilai sah dan berbeda dari null.
- Sistem menghitung rata-rata item dalam kategori sesuai metode yang dipilih.
- Sistem menghitung nilai akhir berdasarkan bobot kategori.
- Dosen dapat mengatur skala huruf dan rentang nilai.
- Sistem menampilkan rincian kalkulasi per mahasiswa.
- Perubahan nilai tercatat dalam audit log.
- Nilai tidak terlihat oleh mahasiswa sebelum dipublikasikan.
- Dosen dapat mengunci nilai final; pembukaan kunci memerlukan konfirmasi dan dicatat.

**Formula baseline**
1. Nilai item dinormalisasi ke skala 0–100: `(score / max_score) × 100`.
2. Nilai kategori dihitung dari rata-rata item yang telah dinilai, atau metode agregasi yang dipilih.
3. Nilai akhir: `Σ(nilai_kategori × bobot_kategori) / Σ(bobot_kategori yang dihitung)`.
4. Untuk finalisasi, semua kategori berbobot wajib memiliki data lengkap atau dosen harus memilih kebijakan eksplisit untuk komponen yang kosong.
5. Bobot yang dipakai untuk nilai final harus berjumlah 100%.

**Kebijakan data kosong**
- Default: kategori dengan item belum dinilai ditandai belum lengkap dan tidak dianggap nol.
- Dosen dapat memilih “anggap kosong sebagai 0” hanya melalui pengaturan eksplisit per kelas/finalisasi.
- UI harus memperlihatkan jumlah komponen belum dinilai sebelum finalisasi.

**Presensi**
- Nilai presensi dapat dihitung dari persentase hadir: `hadir / total_pertemuan × 100`.
- Status izin/sakit/alpa dapat memiliki bobot/aturan berbeda jika dosen mengaktifkannya.
- Aturan presensi tidak boleh diasumsikan sama untuk semua kampus; dapat diatur.

### FR-07 Presensi
- Dosen membuat sesi/pertemuan.
- Dosen menandai hadir, izin, sakit, atau alpa.
- Dosen dapat mengubah presensi dengan alasan opsional.
- Sistem merekap persentase kehadiran.
- QR attendance bukan bagian MVP.

### FR-08 Laporan dan ekspor
- Rekap gradebook per kelas.
- Rekap status submission.
- Rekap presensi.
- Ekspor CSV/XLSX.
- PDF laporan nilai pada fase lanjutan.
- Ekspor mengikuti filter aktif dan menampilkan waktu ekspor.

### FR-09 Dashboard dan notifikasi
- Dosen melihat jumlah kelas aktif, submission perlu dinilai, tugas mendekati tenggat, dan nilai belum lengkap.
- Mahasiswa melihat tugas aktif, tenggat terdekat, status submission, dan nilai yang dipublikasikan.
- Notifikasi dalam aplikasi untuk tugas baru, perubahan deadline, feedback, dan publikasi nilai.
- Email/WhatsApp tidak termasuk MVP.

## 7. Kebutuhan nonfungsional
- Responsif pada desktop, tablet, dan mobile.
- Otorisasi dilakukan di server untuk setiap resource.
- Password tidak pernah disimpan plaintext.
- File upload dibatasi tipe, ukuran, dan pemeriksaan MIME.
- File privat tidak boleh diakses hanya dengan menebak URL.
- Validasi input dilakukan di client dan server.
- Audit log untuk perubahan nilai, bobot, publikasi, dan penguncian.
- Backup database terjadwal pada production.
- Gunakan pagination/filter untuk daftar besar.
- Target aksesibilitas: navigasi keyboard, label form, kontras memadai.
- Waktu respons target untuk operasi daftar umum: p95 di bawah 2 detik pada lingkungan uji yang wajar.

## 8. Acceptance criteria MVP
1. Dosen dapat membuat kelas dan mendaftarkan mahasiswa.
2. Mahasiswa hanya dapat melihat kelas yang diikutinya.
3. Dosen dapat membuat tugas yang menerima file dan/atau URL.
4. Mahasiswa dapat mengirim submission dan melihat statusnya.
5. Dosen dapat menilai submission dan memberi feedback.
6. Dosen dapat membuat kategori dan item nilai dengan bobot total 100%.
7. Gradebook menghitung nilai kategori dan akhir sesuai formula.
8. Nilai null tidak diperlakukan sebagai nol secara diam-diam.
9. Dosen dapat mencatat presensi dan melihat persentasenya.
10. Dosen dapat mengekspor rekap nilai.
11. Nilai hanya dapat dilihat mahasiswa setelah dipublikasikan.
12. Akses lintas kelas/akun ditolak oleh server.

## 9. Risiko dan mitigasi
| Risiko | Mitigasi |
|---|---|
| Formula nilai berbeda antar mata kuliah | Konfigurasi per kelas dan tampilkan preview |
| Nilai kosong dianggap nol | Pisahkan null dan 0; validasi finalisasi |
| File besar/berbahaya | Batas ukuran, MIME check, private storage |
| Mahasiswa melihat nilai sebelum waktunya | Publication state dan server-side authorization |
| Perubahan nilai tidak terlacak | Audit log |
| Data hilang | Backup dan soft delete |
| Import mahasiswa salah format | Template CSV dan preview sebelum commit |

## 10. Prioritas
- P0: Auth, kelas, mahasiswa, tugas, submission, komponen nilai, gradebook, kalkulasi, presensi dasar, ekspor CSV.
- P1: Materi, impor CSV, ekspor XLSX, notifikasi dalam aplikasi, audit log UI.
- P2: PDF report, kuis online, QR presensi, analitik lanjutan, integrasi eksternal.
