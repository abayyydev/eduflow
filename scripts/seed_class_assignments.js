const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function seedClassAssignments() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "eduflow",
  });

  console.log("Connected to MySQL for seeding class assignments...");

  // 1. Get active classes
  const [classesList] = await connection.execute(
    "SELECT id, display_name FROM classes WHERE status = 'active'"
  );

  const sampleAssignments = [
    {
      title: "Tugas 1: Slice Desain Web Responsif (HTML & Modern CSS)",
      instructions:
        "Buatlah satu halaman landing page responsif menggunakan HTML5 semantik dan CSS Grid/Flexbox. Pastikan tampilan optimal pada resolusi mobile, tablet, dan desktop.",
      submissionMode: "both",
      maxScore: "100.00",
      daysFromNow: 3,
    },
    {
      title: "Tugas 2: Manipulasi DOM & Interaktivitas JavaScript",
      instructions:
        "Implementasikan kalkulator interaktif atau form validasi dinamis menggunakan Vanilla JavaScript atau TypeScript. Kumpulkan link repository GitHub dan live demo Vercel.",
      submissionMode: "url",
      maxScore: "100.00",
      daysFromNow: 7,
    },
    {
      title: "Tugas 3: Integrasi REST API & Konversi Web App ke Android",
      instructions:
        "Lakukan fetch data asynchronous dari REST API publik atau Mock API, lalu bungkus aplikasi menggunakan Capacitor. Kirimkan screenshot pengujian dan link live project.",
      submissionMode: "both",
      maxScore: "100.00",
      daysFromNow: 14,
    },
  ];

  for (const cls of classesList) {
    const [existing] = await connection.execute(
      "SELECT count(*) as cnt FROM assignments WHERE class_id = ?",
      [cls.id]
    );

    if (existing[0].cnt >= 2) {
      console.log(`Class ${cls.display_name} already has ${existing[0].cnt} assignments.`);
      continue;
    }

    console.log(`Seeding assignments for class: ${cls.display_name}`);
    for (const item of sampleAssignments) {
      const assignmentId = crypto.randomUUID();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + item.daysFromNow);

      await connection.execute(
        `INSERT INTO assignments (
          id, class_id, title, instructions, max_score, opens_at, due_at,
          allow_late, submission_mode, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, NOW(), ?, 1, ?, 'published', NOW(), NOW())`,
        [
          assignmentId,
          cls.id,
          item.title,
          item.instructions,
          item.maxScore,
          dueDate,
          item.submissionMode,
        ]
      );
    }
  }

  // Seed some sample submissions for students
  const [students] = await connection.execute("SELECT id FROM students LIMIT 5");
  const [allAssignments] = await connection.execute("SELECT id FROM assignments LIMIT 8");

  for (const s of students) {
    for (let i = 0; i < allAssignments.length; i++) {
      const a = allAssignments[i];
      if (i % 2 === 0) {
        // Submitted or graded
        try {
          await connection.execute(
            `INSERT IGNORE INTO submissions (
              id, assignment_id, student_id, status, submitted_at, current_version, score, feedback, created_at, updated_at
            ) VALUES (?, ?, ?, 'graded', NOW(), 1, 95.00, 'Kerja bagus, implementasi responsive sangat rapi!', NOW(), NOW())`,
            [crypto.randomUUID(), a.id, s.id]
          );
        } catch (e) {}
      }
    }
  }

  console.log("Class assignments seeding finished successfully!");
  await connection.end();
}

seedClassAssignments().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
