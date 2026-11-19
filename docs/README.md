# EDUFlow — Source of Truth

**Produk:** EDUFlow (nama kerja)  
**Jenis:** Personal Academic & Learning Management System  
**Platform:** Website responsif  
**Status dokumen:** Baseline SOT v1.0  
**Bahasa antarmuka:** Bahasa Indonesia

## 1. Ringkasan
EDUFlow membantu seorang dosen mengelola kegiatan pembelajaran yang diampu: kelas, mahasiswa, materi, tugas, pengumpulan melalui unggah file atau tautan Google Drive, presensi, komponen penilaian, perhitungan nilai akhir, dan ekspor laporan.

Aplikasi berorientasi penggunaan personal oleh satu dosen. Mahasiswa tetap memiliki akun/akses terbatas untuk melihat materi, mengumpulkan tugas, melihat status, dan melihat nilai yang telah dipublikasikan. Tidak ada multi-tenant, billing, marketplace, atau pengelolaan banyak institusi pada MVP.

## 2. Prinsip produk
1. **Single lecturer workspace:** satu pemilik/dosen mengelola ruang kerjanya.
2. **Student self-service:** mahasiswa dapat melakukan aktivitas pembelajaran tanpa mengakses data mahasiswa lain.
3. **Grade calculation is explainable:** setiap nilai akhir dapat ditelusuri ke komponen, bobot, dan nilai sumber.
4. **Configurable, not hard-coded:** bobot, skala huruf, status, tenggat, dan aturan presensi dapat diatur.
5. **Safe by default:** nilai belum lengkap tidak diam-diam dianggap nol; nilai final perlu dipublikasikan/dikunci secara sadar.
6. **Exportable:** data penting dapat diekspor ke CSV/XLSX dan laporan PDF pada fase terkait.
7. **Responsive:** nyaman dipakai di laptop dan HP.

## 3. Batasan lingkup
### Termasuk
- Autentikasi dosen dan mahasiswa.
- Profil dosen dan daftar mahasiswa.
- Semester/tahun akademik, mata kuliah, kelas.
- Enrolment mahasiswa.
- Materi per pertemuan.
- Tugas dengan metode pengumpulan file dan/atau tautan.
- Penilaian tugas, kuis, UTS, UAS, presensi, praktikum, proyek/presentasi.
- Gradebook dan kalkulasi nilai akhir berbobot.
- Presensi manual dosen pada MVP.
- Dashboard, notifikasi dalam aplikasi, ekspor data.

### Tidak termasuk pada MVP
- Integrasi SIAKAD kampus.
- Sinkronisasi Google Classroom/Moodle.
- Pembayaran, absensi biometrik, video conference.
- Aplikasi native Android/iOS.
- Multi-dosen/team teaching dan multi-institusi.
- AI auto-grading atau AI penentu nilai.
- Ujian proctoring.

## 4. Peran dan izin
| Peran | Izin utama |
|---|---|
| Dosen (owner) | Akses penuh ke seluruh kelas dan data yang dibuatnya; konfigurasi nilai; publikasi dan penguncian nilai |
| Mahasiswa | Melihat kelas yang diikuti, materi, tugas; mengirim/memperbarui submission sesuai aturan; melihat feedback dan nilai yang dipublikasikan |

Administrator terpisah tidak diperlukan pada versi personal. Akun dosen pertama dibuat melalui proses bootstrap/seed atau pendaftaran tertutup. Dosen dapat mengundang/menambahkan mahasiswa.

## 5. Keputusan produk yang sudah ditetapkan
- Target: personal.
- Platform: web.
- Komponen penilaian awal: Tugas, Kuis, UTS, UAS, Presensi, Praktikum, Proyek/Presentasi.
- Pengumpulan tugas: unggah file dan tautan eksternal.
- Komponen nilai dan bobot dapat disesuaikan per kelas.
- Satu kelas memiliki daftar mahasiswa dan gradebook sendiri.

## 6. Asumsi teknis awal
- Frontend: Next.js + TypeScript.
- Styling: Tailwind CSS.
- Backend: Next.js Route Handlers/API.
- Database: MySQL.
- Authentication: Auth.js atau session-based authentication yang aman.
- File: object storage kompatibel S3 pada production; local storage hanya untuk development.
- Validasi: Zod.
- Ekspor: ExcelJS untuk XLSX dan library PDF yang sesuai.
- Deployment: frontend dan API pada satu deployment; MySQL pada layanan database terkelola/VPS.

## 7. Aturan perubahan SOT
Dokumen ini menjadi acuan utama. Jika keputusan produk berubah:
1. Perbarui PRD dan schema terlebih dahulu.
2. Perbarui UI Guideline dan Implementation Plan.
3. Perbarui Execution Prompt.
4. Catat keputusan pada bagian Decision Log.

## 8. Decision Log
| ID | Keputusan | Status |
|---|---|---|
| ADR-001 | Produk personal untuk satu dosen pemilik | Disepakati |
| ADR-002 | Mahasiswa mendapat akses terbatas | Disepakati sebagai kebutuhan operasional |
| ADR-003 | Web responsif sebagai platform utama | Disepakati |
| ADR-004 | Pengumpulan tugas mendukung file dan tautan | Disepakati |
| ADR-005 | Bobot dan skala nilai dapat dikonfigurasi | Rekomendasi baseline |
| ADR-006 | Nilai kosong dibedakan dari nilai nol | Rekomendasi wajib |
