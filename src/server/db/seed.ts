import { db } from "./index";
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

async function main() {
  console.log("🌱 Starting EDUFlow database seed (Separated Lecturers, Students & Users)...");

  // 1. Clean existing data in reverse foreign key order
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

  // 2. Create Superadmin in users table
  const superadminId = randomUUID();
  await db.insert(users).values({
    id: superadminId,
    name: "System Superadmin",
    email: "admin@eduflow.test",
    passwordHash: defaultPasswordHash,
    role: "superadmin",
    isActive: true,
  });
  console.log("✓ Superadmin created in users: admin@eduflow.test (password: password123)");

  // 3. Create Lecturer in lecturers table
  const lecturerId = randomUUID();
  await db.insert(lecturers).values({
    id: lecturerId,
    name: "Dr. Budi Santoso, M.Kom.",
    email: "dosen@eduflow.test",
    passwordHash: defaultPasswordHash,
    nip: "198001012005011001",
    academicTitle: "Doktor Ilmu Komputer",
    institutionName: "Universitas Teknologi Nusantara",
    phone: "081234567890",
    isActive: true,
  });
  console.log("✓ Lecturer created in lecturers: dosen@eduflow.test (password: password123)");

  // 4. Create 20 Students in students table
  const studentIds: string[] = [];
  const studentNames = [
    "Ahmad Fauzi",
    "Bunga Citra",
    "Candra Wijaya",
    "Dewi Lestari",
    "Eko Prasetyo",
    "Fani Rahmawati",
    "Gilang Ramadhan",
    "Hafiz Pratama",
    "Indah Permata",
    "Joko Widodo",
    "Kartika Putri",
    "Lukman Hakim",
    "Mega Utami",
    "Nanda Saputra",
    "Olivia Tan",
    "Pandu Wicaksono",
    "Qori Anggraini",
    "Rizky Hidayat",
    "Siti Nurhaliza",
    "Taufik Hidayat",
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const sId = randomUUID();
    studentIds.push(sId);
    const nim = `2024${String(i + 1).padStart(4, "0")}`;
    const email = `mhs${i + 1}@eduflow.test`;

    await db.insert(students).values({
      id: sId,
      name: studentNames[i],
      email: email,
      passwordHash: defaultPasswordHash,
      studentNumber: nim,
      studyProgram: "Teknik Informatika",
      cohort: "2024",
      phone: `08198765${String(i).padStart(4, "0")}`,
      isActive: true,
    });
  }
  console.log("✓ 20 Students created in students: mhs1@eduflow.test .. mhs20@eduflow.test (password: password123)");

  // 5. Create Academic Term
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

  // 6. Create 2 Courses
  const course1Id = randomUUID();
  const course2Id = randomUUID();

  await db.insert(courses).values([
    {
      id: course1Id,
      code: "IF101",
      name: "Algoritma dan Struktur Data",
      description: "Dasar logika komputasi, struktur data linier dan non-linier.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
    {
      id: course2Id,
      code: "IF202",
      name: "Pemrograman Web Modern",
      description: "Pengembangan aplikasi web fullstack modern dengan arsitektur modular.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
  ]);

  // 7. Create 3 Classes
  const class1Id = randomUUID(); // ASD Kelas A
  const class2Id = randomUUID(); // ASD Kelas B
  const class3Id = randomUUID(); // Web Modern Kelas A

  await db.insert(classes).values([
    {
      id: class1Id,
      courseId: course1Id,
      academicTermId: termId,
      classCode: "A",
      displayName: "Algoritma dan Struktur Data - Kelas A",
      scheduleText: "Senin, 08:00 - 10:30 WIB (Lab 1)",
      status: "active",
    },
    {
      id: class2Id,
      courseId: course1Id,
      academicTermId: termId,
      classCode: "B",
      displayName: "Algoritma dan Struktur Data - Kelas B",
      scheduleText: "Selasa, 13:00 - 15:30 WIB (Lab 2)",
      status: "active",
    },
    {
      id: class3Id,
      courseId: course2Id,
      academicTermId: termId,
      classCode: "A",
      displayName: "Pemrograman Web Modern - Kelas A",
      scheduleText: "Kamis, 09:00 - 11:30 WIB (Lab Komputer 3)",
      status: "active",
    },
  ]);

  console.log("✓ Courses & Classes created");

  // 8. Enroll Students
  for (let i = 0; i < 12; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class1Id,
      studentId: studentIds[i],
      enrollmentStatus: "active",
    });
  }

  for (let i = 12; i < 20; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class2Id,
      studentId: studentIds[i],
      enrollmentStatus: "active",
    });
  }

  for (let i = 0; i < 20; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class3Id,
      studentId: studentIds[i],
      enrollmentStatus: "active",
    });
  }
  console.log("✓ Enrollments seeded");

  // 9. Standard Grade Scales for Class 1, 2, 3
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

  for (const cId of [class1Id, class2Id, class3Id]) {
    for (const sc of standardScales) {
      await db.insert(gradeScales).values({
        id: randomUUID(),
        classId: cId,
        ...sc,
      });
    }
  }

  // 10. Grading Categories (Sum 100%) for Class 1
  const catTugasId = randomUUID();
  const catKuisId = randomUUID();
  const catUTSId = randomUUID();
  const catUASId = randomUUID();
  const catPresensiId = randomUUID();

  await db.insert(gradingCategories).values([
    {
      id: catTugasId,
      classId: class1Id,
      name: "Tugas",
      weightPercent: "20.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 1,
    },
    {
      id: catKuisId,
      classId: class1Id,
      name: "Kuis",
      weightPercent: "15.00",
      aggregationMethod: "average",
      isRequired: false,
      sortOrder: 2,
    },
    {
      id: catUTSId,
      classId: class1Id,
      name: "UTS",
      weightPercent: "25.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 3,
    },
    {
      id: catUASId,
      classId: class1Id,
      name: "UAS",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 4,
    },
    {
      id: catPresensiId,
      classId: class1Id,
      name: "Presensi",
      weightPercent: "10.00",
      aggregationMethod: "average",
      isRequired: false,
      sortOrder: 5,
    },
  ]);

  // 11. Assessment Items
  const itemTugas1Id = randomUUID();
  const itemTugas2Id = randomUUID();
  const itemUTSId = randomUUID();
  const itemPresensiId = randomUUID();

  await db.insert(assessmentItems).values([
    {
      id: itemTugas1Id,
      categoryId: catTugasId,
      title: "Tugas 1 - Algoritma Searching & Sorting",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemTugas2Id,
      categoryId: catTugasId,
      title: "Tugas 2 - Binary Search Tree",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemUTSId,
      categoryId: catUTSId,
      title: "Ujian Tengah Semester ASD",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemPresensiId,
      categoryId: catPresensiId,
      title: "Rekap Presensi Perkuliahan",
      maxScore: "100.00",
      isPublished: true,
    },
  ]);

  // 12. Assignments
  const asg1Id = randomUUID();
  await db.insert(assignments).values({
    id: asg1Id,
    classId: class1Id,
    title: "Tugas 1 - Implementasi Algoritma Sorting",
    instructions: "Implementasikan Bubble Sort, Merge Sort, dan Quick Sort dalam TypeScript atau C++.",
    maxScore: "100.00",
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 days
    submissionMode: "both",
    status: "published",
    assessmentItemId: itemTugas1Id,
  });

  // 13. Submissions for Class 1
  for (let i = 0; i < 5; i++) {
    const subId = randomUUID();
    const verId = randomUUID();
    const isGraded = i < 3;
    const scoreVal = isGraded ? (85 + i * 4).toString() : null;

    await db.insert(submissions).values({
      id: subId,
      assignmentId: asg1Id,
      studentId: studentIds[i],
      status: isGraded ? "graded" : "submitted",
      submittedAt: new Date(),
      currentVersion: 1,
      score: scoreVal,
      feedback: isGraded ? "Kode sangat bersih, analisis kompleksitas tepat." : null,
      gradedBy: isGraded ? lecturerId : null,
      gradedAt: isGraded ? new Date() : null,
    });

    await db.insert(submissionVersions).values({
      id: verId,
      submissionId: subId,
      versionNumber: 1,
      originalFilename: `tugas1_${studentNames[i].toLowerCase().replace(/\s+/g, "_")}.pdf`,
      externalUrl: "https://github.com/example/student-project",
      note: "Pengumpulan tugas 1 versi awal.",
    });

    if (isGraded) {
      await db.insert(grades).values({
        id: randomUUID(),
        assessmentItemId: itemTugas1Id,
        studentId: studentIds[i],
        score: scoreVal,
        feedback: "Tugas 1 dinilai melalui pengumpulan tugas.",
        gradedBy: lecturerId,
        gradedAt: new Date(),
      });
    }
  }

  // 14. 8 Attendance Sessions for Class 1
  const sessionDates = [
    "2026-09-01",
    "2026-09-08",
    "2026-09-15",
    "2026-09-22",
    "2026-09-29",
    "2026-10-06",
    "2026-10-13",
    "2026-10-20",
  ];

  for (let ses = 1; ses <= 8; ses++) {
    const sessionId = randomUUID();
    const sessionDate = sessionDates[ses - 1];

    await db.insert(attendanceSessions).values({
      id: sessionId,
      classId: class1Id,
      meetingNumber: ses,
      sessionDate: sessionDate,
      topic: `Materi Sesi Perkuliahan ${ses}: Logika & Struktur Data`,
    });

    // 12 students attendance records
    for (let i = 0; i < 12; i++) {
      const status = i === 11 && ses > 6 ? "sick" : i === 10 && ses === 8 ? "excused" : "present";
      await db.insert(attendanceRecords).values({
        id: randomUUID(),
        sessionId: sessionId,
        studentId: studentIds[i],
        status: status,
        updatedBy: lecturerId,
      });
    }
  }

  // 15. Learning Materials
  await db.insert(learningMaterials).values([
    {
      id: randomUUID(),
      classId: class1Id,
      meetingNumber: 1,
      title: "Pengenalan Struktur Data & Analisis Algoritma",
      description: "Slide pengantar Big-O notation, array, dan linked list.",
      externalUrl: "https://slides.example.com/asd-materi-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: class1Id,
      meetingNumber: 2,
      title: "Stack & Queue: Konsep dan Penerapan",
      description: "Implementasi stack & queue dalam evaluasi ekspresi aritmatika.",
      externalUrl: "https://drive.example.com/asd-materi-2",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
  ]);

  // 16. In-App Notifications
  await db.insert(notifications).values([
    {
      id: randomUUID(),
      userId: lecturerId,
      title: "Selamat Datang di EDUFlow",
      body: "Kelas Algoritma dan Struktur Data berhasil diinisialisasi.",
      type: "system",
      targetUrl: "/classes",
    },
    {
      id: randomUUID(),
      userId: studentIds[0],
      title: "Tugas Baru Diberikan",
      body: "Tugas 1 - Implementasi Algoritma Sorting telah tersedia.",
      type: "assignment",
      targetUrl: `/student/assignments/${asg1Id}`,
    },
  ]);

  console.log("✅ EDUFlow database successfully seeded!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
