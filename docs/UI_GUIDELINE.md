# UI Guideline — EDUFlow

## 1. Arah visual
Modern academic SaaS: bersih, profesional, ringan, dan fokus pada data. Hindari tampilan seperti spreadsheet yang terlalu padat. Prioritaskan keterbacaan tabel dan kecepatan menyelesaikan pekerjaan dosen.

## 2. Design principles
- Clarity first: status dan tindakan utama mudah dikenali.
- Calm interface: warna aksen digunakan seperlunya.
- Data-dense but readable: tabel padat tetap memiliki jarak dan hierarki.
- Consistent actions: tombol utama berada pada posisi konsisten.
- Responsive: tabel memiliki mode scroll horizontal atau tampilan kartu pada layar kecil.

## 3. Palet warna
| Token | Nilai | Penggunaan |
|---|---|---|
| Primary | `#2457D6` | Aksi utama, link, navigasi aktif |
| Primary dark | `#173B96` | Hover/active |
| Background | `#F6F8FC` | Latar aplikasi |
| Surface | `#FFFFFF` | Card, modal, panel |
| Text | `#172033` | Teks utama |
| Muted | `#667085` | Teks sekunder |
| Border | `#E4E9F2` | Garis pemisah |
| Success | `#16845B` | Berhasil/lunas/terkumpul |
| Warning | `#B7791F` | Tenggat dekat/terlambat |
| Danger | `#C43D4B` | Error/alpa/aksi destruktif |
| Info | `#2878B8` | Informasi |

Gunakan semantic color dengan kontras yang memadai. Jangan mengandalkan warna saja untuk menjelaskan status; sertakan label/icon.

## 4. Tipografi
- Font: Inter atau Geist Sans.
- Page title: 24–28 px, semibold.
- Section title: 16–20 px, semibold.
- Body: 14–16 px.
- Table: 13–14 px.
- Caption/helper: 12–13 px.
- Angka nilai menggunakan tabular numerals.

## 5. Layout
### Desktop
- Sidebar kiri: 248 px, dapat diciutkan menjadi 72 px.
- Topbar: 64 px.
- Konten: max-width 1440 px; padding 24 px.
- Grid dashboard: 12 kolom.
- Jarak antar section: 24 px.

### Mobile
- Sidebar menjadi drawer/bottom navigation sesuai konteks.
- Topbar ringkas.
- Form satu kolom.
- Tabel gradebook menjadi scroll horizontal dengan kolom identitas tetap bila memungkinkan.
- Tombol aksi utama mudah dijangkau.

## 6. Komponen
- Button: primary, secondary, outline, ghost, destructive.
- Input: label selalu terlihat; helper/error di bawah field.
- Select: searchable untuk daftar mahasiswa/mata kuliah.
- Badge: status submission, publikasi, presensi.
- Card: ringkasan dashboard dan panel informasi.
- Data table: sorting, filter, pagination, empty state.
- Modal/drawer: konfirmasi tindakan penting.
- Toast: umpan balik singkat.
- Tabs: Overview, Submissions, Settings, Grades bila relevan.
- Skeleton: saat data sedang dimuat.

## 7. Halaman utama
### Dosen Dashboard
- Greeting dan semester aktif.
- KPI: kelas aktif, mahasiswa, perlu dinilai, tugas aktif.
- Panel “Perlu perhatian”: submission belum dinilai, deadline dekat, komponen nilai belum lengkap.
- Aktivitas terbaru.
- Quick actions: Buat Tugas, Input Nilai, Buat Kelas.

### Kelas Detail
Tabs:
1. Ringkasan
2. Mahasiswa
3. Materi
4. Tugas
5. Presensi
6. Gradebook
7. Pengaturan

Header menampilkan nama mata kuliah, kode kelas, semester, dan status.

### Gradebook
- Toolbar: pilih kelas, cari mahasiswa, filter status, export.
- Tabel: NIM, nama, kolom kategori/item, nilai akhir, nilai huruf, status.
- Sticky header; identitas mahasiswa tetap terlihat jika memungkinkan.
- Sel nilai dapat diedit dengan validasi rentang 0–nilai maksimum.
- Null ditampilkan “—” atau “Belum dinilai”, bukan 0.
- Panel detail kalkulasi menunjukkan kontribusi setiap kategori.
- Finalisasi menampilkan checklist kelengkapan dan preview hasil.

### Tugas
- List tugas dengan status Draft, Published, Closed.
- Detail tugas: instruksi, tenggat, metode pengumpulan, daftar submission.
- Submission list dapat difilter: belum mengumpulkan, terkumpul, terlambat, perlu dinilai.
- Panel penilaian menampilkan file/link, skor, feedback, dan riwayat revisi.

### Mahasiswa
- Beranda menampilkan tugas terdekat dan status.
- Detail tugas memiliki instruksi, deadline, upload file, input URL, tombol simpan draft dan kirim.
- Halaman nilai hanya menampilkan nilai yang dipublikasikan.

## 8. Status dan microcopy
| Status | Label |
|---|---|
| draft | Draft |
| submitted | Terkumpul |
| late | Terlambat |
| returned_for_revision | Perlu revisi |
| resubmitted | Dikirim ulang |
| graded | Sudah dinilai |
| published | Dipublikasikan |
| locked | Dikunci |
| absent | Alpa |
| excused | Izin |
| sick | Sakit |
| present | Hadir |

Gunakan bahasa Indonesia yang lugas: “Belum dinilai”, “Belum mengumpulkan”, “Simpan perubahan”, “Terbitkan nilai”, “Kunci nilai”.

## 9. Empty, loading, error states
- Empty: jelaskan kondisi dan tampilkan CTA yang relevan.
- Loading: skeleton dengan bentuk mendekati konten.
- Error: pesan yang menjelaskan apa yang gagal dan tindakan berikutnya.
- Form error: tampilkan dekat field, pertahankan input pengguna.
- Network error: sediakan tombol coba lagi.

## 10. Interaksi penting
- Hapus kelas/tugas: confirmation dialog.
- Finalisasi nilai: tampilkan ringkasan komponen belum lengkap, total bobot, dan preview nilai.
- Ubah bobot: hitung total secara real-time dan tampilkan peringatan jika bukan 100%.
- Publish grades: konfirmasi jumlah mahasiswa dan komponen yang akan terlihat.
- Unsaved changes: peringatan sebelum meninggalkan form.
- Upload: progress, batas ukuran, tipe file yang didukung.

## 11. Aksesibilitas
- Semua input memiliki label.
- Fokus keyboard terlihat.
- Tombol memiliki nama aksi jelas.
- Kontras teks memadai.
- Status memiliki teks selain warna.
- Modal mengelola fokus dan dapat ditutup dengan keyboard.
