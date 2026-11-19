const fs = require('fs');
const path = require('path');
const seedData = require('../seed_students.json');

const code = `import { db } from "./index";
import {
  users,
  lecturers,
  students,
  academicTerms,
  courses,
  classes,
  enrollments,
  gradingCategories,
  assessmentItems,
  assignments,
  submissions,
  submissionVersions,
  grades,
  gradeScales,
  attendanceSessions,
  attendanceRecords,
  learningMaterials,
  notifications,
  auditLogs,
} from "./schema";
import { hashPassword } from "../auth/session";
import { randomUUID } from "crypto";

const allStudentsData = ${JSON.stringify(seedData.allStudents, null, 2)};
const groupsData = ${JSON.stringify(seedData.groups, null, 2)};

async function main() {
  console.log("🌱 Memulai Seed Database EDUFlow dengan Data Riil Mahasiswa & Jadwal...");

  // 1. Bersihkan tabel dalam urutan relasi foreign key
  await db.delete(notifications);
  await db.delete(auditLogs);
  await db.delete(attendanceRecords);
  await db.delete(attendanceSessions);
  await db.delete(grades);
  await db.delete(submissionVersions);
  await db.delete(submissions);
  await db.delete(assignments);
  await db.delete(assessmentItems);
  await db.delete(gradingCategories);
  await db.delete(gradeScales);
  await db.delete(learningMaterials);
  await db.delete(enrollments);
  await db.delete(classes);
  await db.delete(courses);
  await db.delete(academicTerms);
  await db.delete(students);
  await db.delete(lecturers);
  await db.delete(users);

  const defaultPasswordHash = await hashPassword("password123");

  // 2. Superadmin di tabel users
  const superadminId = randomUUID();
  await db.insert(users).values({
    id: superadminId,
    name: "System Superadmin",
    email: "admin@eduflow.test",
    passwordHash: defaultPasswordHash,
    role: "superadmin",
    isActive: true,
  });
  console.log("✓ Superadmin: admin@eduflow.test (password: password123)");

  // 3. Dosen di tabel lecturers
  const lecturerId = randomUUID();
  await db.insert(lecturers).values({
    id: lecturerId,
    name: "Dr. Budi Santoso, M.Kom.",
    email: "dosen@eduflow.test",
    passwordHash: defaultPasswordHash,
    nip: "198001012005011001",
    academicTitle: "Doktor Ilmu Komputer",
    institutionName: "Universitas Teknologi",
    phone: "081234567890",
    isActive: true,
  });
  console.log("✓ Dosen: dosen@eduflow.test (password: password123)");

  // 4. Input 113 Mahasiswa ke tabel students
  const studentIdByNim = new Map<string, string>();

  for (const s of allStudentsData) {
    const sId = randomUUID();
    studentIdByNim.set(s.nim, sId);

    await db.insert(students).values({
      id: sId,
      name: s.name,
      email: s.email,
      passwordHash: defaultPasswordHash,
      studentNumber: s.nim,
      studyProgram: s.studyProgram,
      cohort: s.cohort,
      phone: null,
      isActive: true,
    });
  }
  console.log(\`✓ \${allStudentsData.length} Mahasiswa berhasil dibuat (login via NIM / Email, password: password123)\`);

  // 5. Semester Aktif
  const termId = randomUUID();
  await db.insert(academicTerms).values({
    id: termId,
    name: "2026/2027 Ganjil",
    academicYear: "2026/2027",
    semester: "ganjil",
    startsOn: "2026-09-01",
    endsOn: "2027-01-31",
    isActive: true,
  });

  // 6. Mata Kuliah (Courses)
  const cPWF1Id = randomUUID();
  const cPWP1Id = randomUUID();
  const cPW2Id = randomUUID();
  const cPV2Id = randomUUID();
  const cPW3Id = randomUUID();

  await db.insert(courses).values([
    {
      id: cPWF1Id,
      code: "PWF101",
      name: "Pemrograman Web Fundamental I",
      description: "Konsep dasar web, arsitektur client-server, protokol HTTP, semantic HTML5, dan modern CSS.",
      creditUnits: 2,
      lecturerId: lecturerId,
    },
    {
      id: cPWP1Id,
      code: "PWP101",
      name: "Praktikum Pemrograman Web Fundamental I",
      description: "Praktikum laboratorium desain antarmuka, layout responsif, dan styling modern.",
      creditUnits: 1,
      lecturerId: lecturerId,
    },
    {
      id: cPW2Id,
      code: "PW201",
      name: "Pemrograman Web II",
      description: "Pengembangan web dinamis, JavaScript modern, manipulasi DOM, AJAX, dan arsitektur RESTful API.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
    {
      id: cPV2Id,
      code: "PV201",
      name: "Pemrograman Visual II",
      description: "Pengembangan aplikasi visual desktop dan GUI modern, event-driven architecture, dan integrasi database.",
      creditUnits: 2,
      lecturerId: lecturerId,
    },
    {
      id: cPW3Id,
      code: "PW301",
      name: "Pemrograman Web III",
      description: "Aplikasi web fullstack tingkat lanjut, React, Next.js, ORM, otentikasi sesi, dan cloud deployment.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
  ]);
  console.log("✓ 5 Mata Kuliah dibuat");

  // 7. 8 Kelas Perkuliahan sesuai Jadwal
  const clsPwf1Teori = randomUUID();
  const clsPwf1Desain03 = randomUUID();
  const clsPwf1Desain02 = randomUUID();
  const clsPwf1Desain01 = randomUUID();
  const clsPw2TP = randomUUID();
  const clsPv2KelA = randomUUID();
  const clsPv2KelB = randomUUID();
  const clsPw3Kel2 = randomUUID();

  const allClasses = [
    {
      id: clsPwf1Teori,
      courseId: cPWF1Id,
      academicTermId: termId,
      classCode: "REG-PAGI",
      displayName: "Teori Pemrograman Web Fundamental I (IT 9 & PPMP - Reguler Pagi)",
      scheduleText: "Kamis, 09.00 - 10.30 WIB (Ruang R.C2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain03,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.03",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.03)",
      scheduleText: "Kamis, 13.00 - 14.30 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain02,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.02",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.02)",
      scheduleText: "Kamis, 14.30 - 16.00 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain01,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.01",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.01)",
      scheduleText: "Kamis, 16.00 - 17.30 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPw2TP,
      courseId: cPW2Id,
      academicTermId: termId,
      classCode: "REG-PAGI",
      displayName: "T + P Pemrograman Web II (IT 8 - Reguler Pagi)",
      scheduleText: "Jum'at, 13.00 - 15.00 WIB (Ruang R.B2)",
      status: "active" as const,
    },
    {
      id: clsPv2KelA,
      courseId: cPV2Id,
      academicTermId: termId,
      classCode: "KEL.A",
      displayName: "Pemrograman Visual II (IT 8 - Reguler Malam Kel.A)",
      scheduleText: "Jum'at, 18.45 - 20.15 WIB (Ruang R.B3)",
      status: "active" as const,
    },
    {
      id: clsPv2KelB,
      courseId: cPV2Id,
      academicTermId: termId,
      classCode: "KEL.B",
      displayName: "Pemrograman Visual II (IT 8 - Reguler Malam Kel.B)",
      scheduleText: "Jum'at, 20.15 - 21.45 WIB (Ruang R.B3)",
      status: "active" as const,
    },
    {
      id: clsPw3Kel2,
      courseId: cPW3Id,
      academicTermId: termId,
      classCode: "KEL.2",
      displayName: "Pemrograman Web III (IT 7 - Kelompok 2)",
      scheduleText: "Senin, 18.30 - 20.00 WIB (Ruang R.D2)",
      status: "active" as const,
    },
  ];

  await db.insert(classes).values(allClasses);
  console.log("✓ 8 Kelas Perkuliahan sesuai Jadwal dibuat");

  // 8. Enrollments
  // A. Teori PWF1 (47 mahasiswa teori + 2 desain.01 jika belum ada)
  const it9Set = new Set<string>();
  groupsData.teori_pwf1.forEach((s: { nim: string }) => it9Set.add(s.nim));
  groupsData.prak_desain_01.forEach((s: { nim: string }) => it9Set.add(s.nim));

  for (const nim of Array.from(it9Set)) {
    const sId = studentIdByNim.get(nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Teori,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // B. Prak Desain 03
  for (const s of groupsData.prak_desain_03) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain03,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // C. Prak Desain 02
  for (const s of groupsData.prak_desain_02) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain02,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // D. Prak Desain 01
  for (const s of groupsData.prak_desain_01) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain01,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // E. T + P Pemrograman Web II (44 mahasiswa IT 8)
  for (const s of groupsData.it8_all) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPw2TP,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // F. Pemrograman Visual II Malam Kel A (22 mahasiswa) & Kel B (22 mahasiswa)
  const it8Students = groupsData.it8_all;
  for (let i = 0; i < it8Students.length; i++) {
    const sId = studentIdByNim.get(it8Students[i].nim);
    if (sId) {
      const targetClass = i < 22 ? clsPv2KelA : clsPv2KelB;
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: targetClass,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // G. Pemrograman Web III (20 mahasiswa IT 7)
  for (const s of groupsData.it7_kelompok2) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPw3Kel2,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }
  console.log("✓ Seluruh Mahasiswa berhasil di-enroll ke masing-masing kelas");

  // 9. Standard Grade Scales untuk semua 8 kelas
  const standardScales = [
    { letterGrade: "A", minScore: "85.00", maxScore: "100.00", gradePoint: "4.00" },
    { letterGrade: "A-", minScore: "80.00", maxScore: "84.99", gradePoint: "3.70" },
    { letterGrade: "B+", minScore: "75.00", maxScore: "79.99", gradePoint: "3.30" },
    { letterGrade: "B", minScore: "70.00", maxScore: "74.99", gradePoint: "3.00" },
    { letterGrade: "B-", minScore: "65.00", maxScore: "69.99", gradePoint: "2.70" },
    { letterGrade: "C+", minScore: "60.00", maxScore: "64.99", gradePoint: "2.30" },
    { letterGrade: "C", minScore: "55.00", maxScore: "59.99", gradePoint: "2.00" },
    { letterGrade: "D", minScore: "40.00", maxScore: "54.99", gradePoint: "1.00" },
    { letterGrade: "E", minScore: "0.00", maxScore: "39.99", gradePoint: "0.00" },
  ];

  for (const c of allClasses) {
    for (const sc of standardScales) {
      await db.insert(gradeScales).values({
        id: randomUUID(),
        classId: c.id,
        ...sc,
      });
    }
  }

  // 10. Komponen Penilaian (Bobot total 100%) untuk Kelas Teori PWF1
  const catPresensiId = randomUUID();
  const catTugasId = randomUUID();
  const catUTSId = randomUUID();
  const catUASId = randomUUID();

  await db.insert(gradingCategories).values([
    {
      id: catPresensiId,
      classId: clsPwf1Teori,
      name: "Presensi",
      weightPercent: "10.00",
      aggregationMethod: "average",
      isRequired: false,
      sortOrder: 1,
    },
    {
      id: catTugasId,
      classId: clsPwf1Teori,
      name: "Tugas Mandiri",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 2,
    },
    {
      id: catUTSId,
      classId: clsPwf1Teori,
      name: "Ujian Tengah Semester",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 3,
    },
    {
      id: catUASId,
      classId: clsPwf1Teori,
      name: "Ujian Akhir Semester",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 4,
    },
  ]);

  // Assessment Items untuk Teori PWF1
  const itemTugas1Id = randomUUID();
  const itemTugas2Id = randomUUID();
  const itemUTSId = randomUUID();
  const itemPresensiId = randomUUID();

  await db.insert(assessmentItems).values([
    {
      id: itemTugas1Id,
      categoryId: catTugasId,
      title: "Tugas 1 - Struktur HTML Semantik & Semantic Tags",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemTugas2Id,
      categoryId: catTugasId,
      title: "Tugas 2 - Tata Letak Layout CSS Grid & Flexbox",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemUTSId,
      categoryId: catUTSId,
      title: "UTS Teori Pemrograman Web Fundamental",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemPresensiId,
      categoryId: catPresensiId,
      title: "Rekap Kehadiran Kuliah",
      maxScore: "100.00",
      isPublished: true,
    },
  ]);

  // Assignment Tugas 1
  const asg1Id = randomUUID();
  await db.insert(assignments).values({
    id: asg1Id,
    classId: clsPwf1Teori,
    title: "Tugas 1 - Implementasi Web Semantik HTML5",
    instructions: "Buat halaman web profil pribadi menggunakan tag semantik HTML5 murni tanpa framework, sertakan link repository GitHub dan screenshot hasil tampilan.",
    maxScore: "100.00",
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    submissionMode: "both",
    status: "published",
    assessmentItemId: itemTugas1Id,
  });

  // Contoh Submission beberapa mahasiswa
  const sampleStudentNims = ["2611090062", "2611090058", "2611090057", "2611090021"];
  for (let i = 0; i < sampleStudentNims.length; i++) {
    const sId = studentIdByNim.get(sampleStudentNims[i]);
    if (!sId) continue;

    const subId = randomUUID();
    const isGraded = i < 2;
    const scoreVal = isGraded ? (88 + i * 5).toString() : null;

    await db.insert(submissions).values({
      id: subId,
      assignmentId: asg1Id,
      studentId: sId,
      status: isGraded ? "graded" : "submitted",
      submittedAt: new Date(),
      currentVersion: 1,
      score: scoreVal,
      feedback: isGraded ? "Struktur kode semantik sangat baik dan rapi." : null,
      gradedBy: isGraded ? lecturerId : null,
      gradedAt: isGraded ? new Date() : null,
    });

    await db.insert(submissionVersions).values({
      id: randomUUID(),
      submissionId: subId,
      versionNumber: 1,
      originalFilename: \`tugas1_\${sampleStudentNims[i]}.zip\`,
      externalUrl: "https://github.com/example/student-web-profile",
      note: "Pengumpulan tugas tepat waktu.",
    });

    if (isGraded) {
      await db.insert(grades).values({
        id: randomUUID(),
        assessmentItemId: itemTugas1Id,
        studentId: sId,
        score: scoreVal,
        feedback: "Struktur kode semantik sangat baik.",
        gradedBy: lecturerId,
        gradedAt: new Date(),
      });
    }
  }

  // 11. Presensi Perkuliahan (Sesi 1 s/d 4 Kamis untuk Teori PWF1)
  const kamisDates = ["2026-09-03", "2026-09-10", "2026-09-17", "2026-09-24"];
  for (let ses = 1; ses <= kamisDates.length; ses++) {
    const sessId = randomUUID();
    await db.insert(attendanceSessions).values({
      id: sessId,
      classId: clsPwf1Teori,
      meetingNumber: ses,
      sessionDate: kamisDates[ses - 1],
      topic: \`Pertemuan \${ses}: Pembahasan Materi Teori Web & Arsitektur Client-Server\`,
    });

    let count = 0;
    for (const nim of Array.from(it9Set)) {
      const sId = studentIdByNim.get(nim);
      if (!sId) continue;
      count++;
      const status = count === 10 ? "sick" : count === 15 ? "excused" : "present";
      await db.insert(attendanceRecords).values({
        id: randomUUID(),
        sessionId: sessId,
        studentId: sId,
        status: status,
        updatedBy: lecturerId,
      });
    }
  }

  // 12. Materi Pembelajaran (Learning Materials)
  await db.insert(learningMaterials).values([
    {
      id: randomUUID(),
      classId: clsPwf1Teori,
      meetingNumber: 1,
      title: "Slide Pertemuan 1 - Konsep Web & Protokol HTTP/HTTPS",
      description: "Pengenalan arsitektur website, protokol komunikasi HTTP, status code, dan request-response cycle.",
      externalUrl: "https://slides.eduflow.ac.id/pwf1-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPwf1Teori,
      meetingNumber: 2,
      title: "Slide Pertemuan 2 - HTML5 Semantics & Form Controls",
      description: "Elemen semantik header, nav, main, section, aside, footer, dan form validation murni.",
      externalUrl: "https://slides.eduflow.ac.id/pwf1-pertemuan-2",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPw2TP,
      meetingNumber: 1,
      title: "Pertemuan 1 - Arsitektur Web Modern & REST API",
      description: "Konsep endpoint RESTful API, HTTP verbs, payload JSON, dan fetch data asynchronous.",
      externalUrl: "https://slides.eduflow.ac.id/pw2-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPw3Kel2,
      meetingNumber: 1,
      title: "Pertemuan 1 - Pengenalan Next.js App Router & Server Actions",
      description: "Arsitektur hybrid React Server Components, server actions, dan integrasi database Drizzle MySQL.",
      externalUrl: "https://slides.eduflow.ac.id/pw3-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
  ]);

  // 13. Notifikasi Sistem
  await db.insert(notifications).values([
    {
      id: randomUUID(),
      userId: lecturerId,
      title: "Jadwal Semester Ganjil 2026/2027 Aktif",
      body: "8 Kelas perkuliahan telah terkonfigurasi lengkap dengan 113 mahasiswa terdaftar.",
      type: "system",
      targetUrl: "/classes",
    },
    {
      id: randomUUID(),
      userId: studentIdByNim.get("2611090062") || lecturerId,
      title: "Selamat Datang di EDUFlow",
      body: "Anda telah terdaftar di kelas Teori Pemrograman Web Fundamental I. Silakan periksa materi dan tugas.",
      type: "system",
      targetUrl: "/student/classes",
    },
  ]);

  console.log("✅ Seed database EDUFlow berhasil dengan data riil mahasiswa & jadwal lengkap!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
`;

fs.writeFileSync(path.join(__dirname, '../src/server/db/seed.ts'), code, 'utf8');
console.log('Successfully generated src/server/db/seed.ts');
