# Database Schema — EDUFlow (MySQL)

Baseline relasional. Gunakan InnoDB, `utf8mb4`, foreign key, timestamp, dan indeks sesuai query. Semua tabel menggunakan `created_at` dan `updated_at` kecuali tabel log/relasi yang membutuhkan struktur berbeda.

## 1. Entitas dan relasi
- Satu dosen owner memiliki banyak course/classes.
- Satu course dapat memiliki banyak class offerings.
- Satu class memiliki banyak student melalui enrollments.
- Satu class memiliki komponen nilai, item nilai, submission, sesi presensi, materi.
- Satu assignment memiliki banyak submission.
- Satu submission dapat memiliki beberapa versi.
- Nilai mahasiswa tersimpan per assessment item.
- Audit log mencatat perubahan sensitif.

## 2. Tabel

### users
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | UUID |
| name | VARCHAR(150) | Nama |
| email | VARCHAR(190) UNIQUE | Login |
| password_hash | VARCHAR(255) | Hash |
| role | ENUM('lecturer','student') | Peran |
| is_active | BOOLEAN | Default true |
| last_login_at | DATETIME NULL | |
| created_at / updated_at | DATETIME | |

### lecturer_profiles
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| user_id | CHAR(36) FK UNIQUE | users |
| lecturer_number | VARCHAR(50) NULL | NIDN/NIDK opsional |
| institution_name | VARCHAR(180) NULL | |
| phone | VARCHAR(30) NULL | |

### student_profiles
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| user_id | CHAR(36) FK UNIQUE | users |
| student_number | VARCHAR(50) | NIM |
| study_program | VARCHAR(150) NULL | |
| cohort | VARCHAR(30) NULL | |
| phone | VARCHAR(30) NULL | |

### academic_terms
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| name | VARCHAR(100) | Contoh 2026/2027 Ganjil |
| academic_year | VARCHAR(20) | |
| semester | ENUM('ganjil','genap','antara') | |
| starts_on / ends_on | DATE | |
| is_active | BOOLEAN | |

### courses
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| code | VARCHAR(30) | |
| name | VARCHAR(180) | |
| description | TEXT NULL | |
| credit_units | TINYINT NULL | |
| owner_user_id | CHAR(36) FK | users |
| archived_at | DATETIME NULL | |

### classes
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| course_id | CHAR(36) FK | courses |
| academic_term_id | CHAR(36) FK | academic_terms |
| class_code | VARCHAR(30) | Contoh A |
| display_name | VARCHAR(180) | |
| schedule_text | VARCHAR(180) NULL | |
| status | ENUM('active','archived') | |
| grading_locked_at | DATETIME NULL | |
| grades_published_at | DATETIME NULL | |

Unique: `(course_id, academic_term_id, class_code)`.

### enrollments
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | classes |
| student_user_id | CHAR(36) FK | users |
| enrollment_status | ENUM('active','dropped','completed') | |
| enrolled_at | DATETIME | |

Unique: `(class_id, student_user_id)`.

### learning_materials
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | |
| meeting_number | SMALLINT NULL | |
| title | VARCHAR(180) | |
| description | TEXT NULL | |
| external_url | TEXT NULL | |
| file_object_key | VARCHAR(500) NULL | |
| published_at | DATETIME NULL | |
| created_by | CHAR(36) FK | users |

### assignments
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | |
| title | VARCHAR(180) | |
| instructions | TEXT | |
| max_score | DECIMAL(7,2) | Default 100 |
| opens_at / due_at | DATETIME NULL | |
| allow_late | BOOLEAN | |
| submission_mode | ENUM('file','url','both') | |
| allowed_mime_types | JSON NULL | |
| max_file_size_mb | SMALLINT | |
| status | ENUM('draft','published','closed') | |
| assessment_item_id | CHAR(36) NULL FK | Item nilai terkait |

### submissions
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| assignment_id | CHAR(36) FK | |
| student_user_id | CHAR(36) FK | |
| status | ENUM('draft','submitted','late','returned_for_revision','resubmitted','graded') | |
| submitted_at | DATETIME NULL | |
| current_version | INT | |
| score | DECIMAL(7,2) NULL | |
| feedback | TEXT NULL | |
| graded_by | CHAR(36) NULL FK | users |
| graded_at | DATETIME NULL | |

Unique: `(assignment_id, student_user_id)`.

### submission_versions
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| submission_id | CHAR(36) FK | |
| version_number | INT | |
| file_object_key | VARCHAR(500) NULL | |
| original_filename | VARCHAR(255) NULL | |
| external_url | TEXT NULL | |
| note | TEXT NULL | |
| submitted_at | DATETIME | |

### grading_categories
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | |
| name | VARCHAR(100) | Tugas, Kuis, UTS, UAS, Presensi, Praktikum, Proyek |
| weight_percent | DECIMAL(5,2) | |
| aggregation_method | ENUM('average','sum_normalized','manual') | |
| is_required | BOOLEAN | |
| sort_order | SMALLINT | |

### assessment_items
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| category_id | CHAR(36) FK | |
| title | VARCHAR(180) | Tugas 1, Kuis 1, UTS |
| max_score | DECIMAL(7,2) | |
| assessment_date | DATE NULL | |
| is_published | BOOLEAN | |
| created_at / updated_at | DATETIME | |

### grades
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| assessment_item_id | CHAR(36) FK | |
| student_user_id | CHAR(36) FK | |
| score | DECIMAL(7,2) NULL | NULL = belum dinilai |
| feedback | TEXT NULL | |
| graded_by | CHAR(36) FK | users |
| graded_at | DATETIME NULL | |
| updated_at | DATETIME | |

Unique: `(assessment_item_id, student_user_id)`.

### grade_scales
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | |
| letter_grade | VARCHAR(5) | A, AB, B, dst |
| min_score | DECIMAL(5,2) | |
| max_score | DECIMAL(5,2) | |
| grade_point | DECIMAL(4,2) NULL | Opsional |

### attendance_sessions
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| class_id | CHAR(36) FK | |
| meeting_number | SMALLINT | |
| session_date | DATE | |
| topic | VARCHAR(180) NULL | |

### attendance_records
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| session_id | CHAR(36) FK | |
| student_user_id | CHAR(36) FK | |
| status | ENUM('present','sick','excused','absent') | |
| note | VARCHAR(255) NULL | |
| updated_by | CHAR(36) FK | users |

Unique: `(session_id, student_user_id)`.

### notifications
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| user_id | CHAR(36) FK | |
| title | VARCHAR(180) | |
| body | TEXT | |
| type | VARCHAR(50) | |
| target_url | VARCHAR(500) NULL | |
| read_at | DATETIME NULL | |

### audit_logs
| Kolom | Tipe | Catatan |
|---|---|---|
| id | CHAR(36) PK | |
| actor_user_id | CHAR(36) FK | |
| entity_type | VARCHAR(80) | |
| entity_id | CHAR(36) | |
| action | VARCHAR(80) | |
| before_data | JSON NULL | |
| after_data | JSON NULL | |
| created_at | DATETIME | |

## 3. Indeks yang disarankan
- `users(email)` unique.
- `student_profiles(student_number)` unique jika NIM wajib unik.
- `classes(academic_term_id, status)`.
- `enrollments(class_id, enrollment_status)`.
- `assignments(class_id, status, due_at)`.
- `submissions(assignment_id, status, submitted_at)`.
- `grades(assessment_item_id, student_user_id)` unique.
- `attendance_sessions(class_id, session_date)`.
- `notifications(user_id, read_at, created_at)`.
- `audit_logs(entity_type, entity_id, created_at)`.

## 4. Catatan implementasi penting
1. Gunakan UUID sebagai primary key untuk memudahkan impor/ekspor dan mengurangi enumerasi ID.
2. Semua akses data mahasiswa harus memeriksa enrollment di server.
3. File simpan object key, bukan path filesystem publik.
4. Gunakan transaksi saat finalisasi nilai atau perubahan bobot.
5. Validasi total bobot kategori aktif = 100% sebelum publikasi nilai akhir.
6. Skor harus berada pada rentang 0 sampai `max_score`.
7. `NULL` pada `grades.score` berarti belum dinilai; angka 0 berarti nilai nol.
8. Nilai akhir dapat dihitung dari query/service, atau disimpan sebagai snapshot final dengan versi kalkulasi. Jangan menyimpan hasil turunan tanpa jejak versi formula.
9. Perubahan konfigurasi bobot setelah nilai dipublikasikan harus memerlukan pembukaan kunci dan konfirmasi.
10. Terapkan cascade/restrict secara hati-hati; gunakan archive/soft delete untuk data akademik.
