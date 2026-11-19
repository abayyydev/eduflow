import { db } from "./index";
import {
  users,
  lecturerProfiles,
  studentProfiles,
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
} from "./schema";
import { hashPassword } from "../auth/session";
import { randomUUID } from "crypto";

async function main() {
  console.log("🌱 Starting EDUFlow database seed...");

  // 1. Clean existing data in reverse foreign key order
  await db.delete(notifications);
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
  await db.delete(studentProfiles);
  await db.delete(lecturerProfiles);
  await db.delete(users);

  const defaultPasswordHash = await hashPassword("password123");

  // 2. Create Lecturer Owner
  const lecturerUserId = randomUUID();
  await db.insert(users).values({
    id: lecturerUserId,
    name: "Dr. Budi Santoso, M.Kom.",
    email: "dosen@eduflow.test",
    passwordHash: defaultPasswordHash,
    role: "lecturer",
    isActive: true,
  });

  await db.insert(lecturerProfiles).values({
    id: randomUUID(),
    userId: lecturerUserId,
    lecturerNumber: "0012058001",
    institutionName: "Universitas Teknologi Nusantara",
    phone: "081234567890",
  });

  console.log("✓ Lecturer created: dosen@eduflow.test (password: password123)");

  // 3. Create 20 Students
  const studentUserIds: string[] = [];
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
    studentUserIds.push(sId);
    const nim = `2024${String(i + 1).padStart(4, "0")}`;
    const email = `mhs${i + 1}@eduflow.test`;

    await db.insert(users).values({
      id: sId,
      name: studentNames[i],
      email: email,
      passwordHash: defaultPasswordHash,
      role: "student",
      isActive: true,
    });

    await db.insert(studentProfiles).values({
      id: randomUUID(),
      userId: sId,
      studentNumber: nim,
      studyProgram: "Teknik Informatika",
      cohort: "2024",
      phone: `08198765${String(i).padStart(4, "0")}`,
    });
  }

  console.log("✓ 20 Students created: mhs1@eduflow.test .. mhs20@eduflow.test (password: password123)");

  // 4. Create Academic Term
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

  // 5. Create 2 Courses
  const course1Id = randomUUID();
  const course2Id = randomUUID();

  await db.insert(courses).values([
    {
      id: course1Id,
      code: "IF101",
      name: "Algoritma dan Struktur Data",
      description: "Dasar logika komputasi, struktur data linier dan non-linier.",
      creditUnits: 3,
      ownerUserId: lecturerUserId,
    },
    {
      id: course2Id,
      code: "IF202",
      name: "Pemrograman Web Modern",
      description: "Pengembangan aplikasi web fullstack modern dengan arsitektur modular.",
      creditUnits: 3,
      ownerUserId: lecturerUserId,
    },
  ]);

  // 6. Create 3 Classes
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

  // 7. Enroll Students
  // Class 1: First 12 students
  // Class 2: Next 8 students
  // Class 3: All 20 students
  for (let i = 0; i < 12; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class1Id,
      studentUserId: studentUserIds[i],
      enrollmentStatus: "active",
    });
  }
  for (let i = 12; i < 20; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class2Id,
      studentUserId: studentUserIds[i],
      enrollmentStatus: "active",
    });
  }
  for (let i = 0; i < 20; i++) {
    await db.insert(enrollments).values({
      id: randomUUID(),
      classId: class3Id,
      studentUserId: studentUserIds[i],
      enrollmentStatus: "active",
    });
  }

  console.log("✓ Student enrollments created");

  // 8. Setup Grading Categories & Scale for all 3 classes
  // Default categories total 100%:
  // Presensi: 10%, Tugas: 20%, Kuis: 15%, Praktikum: 15%, UTS: 20%, UAS: 20% = 100%
  const classList = [class1Id, class2Id, class3Id];

  for (const cId of classList) {
    // Grade scales
    await db.insert(gradeScales).values([
      { id: randomUUID(), classId: cId, letterGrade: "A", minScore: "85.00", maxScore: "100.00", gradePoint: "4.00" },
      { id: randomUUID(), classId: cId, letterGrade: "A-", minScore: "80.00", maxScore: "84.99", gradePoint: "3.70" },
      { id: randomUUID(), classId: cId, letterGrade: "B+", minScore: "75.00", maxScore: "79.99", gradePoint: "3.30" },
      { id: randomUUID(), classId: cId, letterGrade: "B", minScore: "70.00", maxScore: "74.99", gradePoint: "3.00" },
      { id: randomUUID(), classId: cId, letterGrade: "B-", minScore: "65.00", maxScore: "69.99", gradePoint: "2.70" },
      { id: randomUUID(), classId: cId, letterGrade: "C+", minScore: "60.00", maxScore: "64.99", gradePoint: "2.30" },
      { id: randomUUID(), classId: cId, letterGrade: "C", minScore: "55.00", maxScore: "59.99", gradePoint: "2.00" },
      { id: randomUUID(), classId: cId, letterGrade: "D", minScore: "40.00", maxScore: "54.99", gradePoint: "1.00" },
      { id: randomUUID(), classId: cId, letterGrade: "E", minScore: "0.00", maxScore: "39.99", gradePoint: "0.00" },
    ]);

    // Categories
    const catAttendance = randomUUID();
    const catAssignment = randomUUID();
    const catQuiz = randomUUID();
    const catPracticum = randomUUID();
    const catMidterm = randomUUID();
    const catFinal = randomUUID();

    await db.insert(gradingCategories).values([
      { id: catAttendance, classId: cId, name: "Presensi", weightPercent: "10.00", aggregationMethod: "average", isRequired: true, sortOrder: 1 },
      { id: catAssignment, classId: cId, name: "Tugas", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 2 },
      { id: catQuiz, classId: cId, name: "Kuis", weightPercent: "15.00", aggregationMethod: "average", isRequired: false, sortOrder: 3 },
      { id: catPracticum, classId: cId, name: "Praktikum", weightPercent: "15.00", aggregationMethod: "average", isRequired: false, sortOrder: 4 },
      { id: catMidterm, classId: cId, name: "UTS", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 5 },
      { id: catFinal, classId: cId, name: "UAS", weightPercent: "20.00", aggregationMethod: "average", isRequired: true, sortOrder: 6 },
    ]);

    // Assessment Items for Class 1 (as primary demo)
    if (cId === class1Id) {
      const itemTugas1 = randomUUID();
      const itemTugas2 = randomUUID();
      const itemKuis1 = randomUUID();
      const itemUTS = randomUUID();
      const itemUAS = randomUUID();

      await db.insert(assessmentItems).values([
        { id: itemTugas1, categoryId: catAssignment, title: "Tugas 1: Linked List & Stack", maxScore: "100.00", isPublished: true },
        { id: itemTugas2, categoryId: catAssignment, title: "Tugas 2: Binary Search Tree", maxScore: "100.00", isPublished: false },
        { id: itemKuis1, categoryId: catQuiz, title: "Kuis 1: Kompleksitas Algoritma", maxScore: "100.00", isPublished: true },
        { id: itemUTS, categoryId: catMidterm, title: "Ujian Tengah Semester", maxScore: "100.00", isPublished: true },
        { id: itemUAS, categoryId: catFinal, title: "Ujian Akhir Semester", maxScore: "100.00", isPublished: false }, // Not graded yet (null)
      ]);

      // Create Assignment 1 linked to itemTugas1
      const assign1Id = randomUUID();
      await db.insert(assignments).values({
        id: assign1Id,
        classId: class1Id,
        title: "Tugas 1: Linked List & Stack Implementation",
        instructions: "Implementasikan struktur data Double Linked List dan evaluasi stack expression. Kumpulkan kode sumber atau link repo GitHub.",
        maxScore: "100.00",
        opensAt: new Date(Date.now() - 7 * 86400000),
        dueAt: new Date(Date.now() + 7 * 86400000),
        allowLate: true,
        submissionMode: "both",
        maxFileSizeMb: 15,
        status: "published",
        assessmentItemId: itemTugas1,
      });

      // Seed submissions & grades for students in Class 1 (first 12 students)
      for (let s = 0; s < 12; s++) {
        const studentId = studentUserIds[s];

        // Assignment 1 submission
        const subId = randomUUID();
        const scoreVal = s === 0 ? "95.00" : s === 1 ? "88.00" : s === 2 ? "0.00" : s === 3 ? "75.00" : null;

        await db.insert(submissions).values({
          id: subId,
          assignmentId: assign1Id,
          studentUserId: studentId,
          status: scoreVal !== null ? "graded" : s < 8 ? "submitted" : "draft",
          submittedAt: new Date(Date.now() - 2 * 86400000),
          currentVersion: 1,
          score: scoreVal,
          feedback: scoreVal !== null ? "Pengerjaan rapi dan logika pointer tepat." : null,
          gradedBy: scoreVal !== null ? lecturerUserId : null,
          gradedAt: scoreVal !== null ? new Date() : null,
        });

        await db.insert(submissionVersions).values({
          id: randomUUID(),
          submissionId: subId,
          versionNumber: 1,
          externalUrl: "https://github.com/mahasiswa/linked-list-stack",
          originalFilename: "tugas1_linked_list.zip",
          fileObjectKey: "demo/tugas1_linked_list.zip",
          note: "Pengumpulan versi 1",
          submittedAt: new Date(Date.now() - 2 * 86400000),
        });

        // Insert grade for Tugas 1
        await db.insert(grades).values({
          id: randomUUID(),
          assessmentItemId: itemTugas1,
          studentUserId: studentId,
          score: scoreVal, // NULL testing & 0 testing
          feedback: scoreVal !== null ? "Pengerjaan baik" : null,
          gradedBy: lecturerUserId,
          gradedAt: scoreVal !== null ? new Date() : null,
        });

        // Insert grade for Kuis 1 (some graded, some null)
        const quizScore = s < 10 ? String(70 + (s * 3) % 25) + ".00" : null;
        await db.insert(grades).values({
          id: randomUUID(),
          assessmentItemId: itemKuis1,
          studentUserId: studentId,
          score: quizScore,
          gradedBy: lecturerUserId,
          gradedAt: quizScore ? new Date() : null,
        });

        // Insert grade for UTS
        const utsScore = s < 8 ? String(75 + (s * 2) % 20) + ".00" : null;
        await db.insert(grades).values({
          id: randomUUID(),
          assessmentItemId: itemUTS,
          studentUserId: studentId,
          score: utsScore,
          gradedBy: lecturerUserId,
          gradedAt: utsScore ? new Date() : null,
        });
      }

      // Create 8 Attendance Sessions
      for (let m = 1; m <= 8; m++) {
        const sessId = randomUUID();
        const sessDate = `2026-09-${String(m * 3).padStart(2, "0")}`;
        await db.insert(attendanceSessions).values({
          id: sessId,
          classId: class1Id,
          meetingNumber: m,
          sessionDate: sessDate,
          topic: `Pertemuan ${m}: Pendalaman Materi Algoritma Bab ${m}`,
        });

        // Insert attendance records for 12 students
        for (let s = 0; s < 12; s++) {
          const status = (s + m) % 11 === 0 ? "sick" : (s + m) % 7 === 0 ? "excused" : (s + m) % 5 === 0 ? "absent" : "present";
          await db.insert(attendanceRecords).values({
            id: randomUUID(),
            sessionId: sessId,
            studentUserId: studentUserIds[s],
            status: status,
            note: status !== "present" ? `Keterangan status ${status}` : null,
            updatedBy: lecturerUserId,
          });
        }
      }

      // Add 2 Learning Materials
      await db.insert(learningMaterials).values([
        {
          id: randomUUID(),
          classId: class1Id,
          meetingNumber: 1,
          title: "Pengantar Algoritma dan Notasi Big-O",
          description: "Slide pengenalan analisa efisiensi waktu dan ruang algoritma komputasi.",
          externalUrl: "https://drive.google.com/file/d/demo-big-o-slides/view",
          createdBy: lecturerUserId,
          publishedAt: new Date(),
        },
        {
          id: randomUUID(),
          classId: class1Id,
          meetingNumber: 2,
          title: "Struktur Data Linier: Singly & Doubly Linked List",
          description: "Modul praktikum dan contoh kode C++/Java pointer memory.",
          externalUrl: "https://github.com/kuliah-algoritma/modul-linked-list",
          createdBy: lecturerUserId,
          publishedAt: new Date(),
        },
      ]);
    }
  }

  // 9. Initial Notifications
  await db.insert(notifications).values([
    {
      id: randomUUID(),
      userId: lecturerUserId,
      title: "Selamat datang di EDUFlow",
      body: "Workspace akademik personal Anda telah siap digunakan.",
      type: "system",
      targetUrl: "/classes",
    },
    {
      id: randomUUID(),
      userId: studentUserIds[0],
      title: "Tugas Baru Dipublikasikan",
      body: "Dosen telah mempublikasikan Tugas 1: Linked List & Stack Implementation.",
      type: "assignment",
      targetUrl: "/student/assignments",
    },
  ]);

  console.log("✅ Seed completed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
