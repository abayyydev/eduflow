/**
 * Migration script:
 * 1. Add `is_open` column to `attendance_sessions` if not exists.
 * 2. Ensure all classes have full 16 meetings (P1 to P16).
 * 3. Keep meetings closed (`is_open = false`) by default, with P1 open for active demo class.
 * 4. Ensure students are not automatically marked present for future/unheld sessions.
 */

const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function migrate() {
  const conn = await mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "eduflow",
  });

  console.log("Connected to MySQL database.");

  // 1. Check and add `is_open` column in `attendance_sessions`
  const [cols] = await conn.execute("DESCRIBE attendance_sessions");
  const colNames = cols.map((c) => c.Field);

  if (!colNames.includes("is_open")) {
    console.log("Adding is_open column to attendance_sessions...");
    await conn.execute(
      "ALTER TABLE attendance_sessions ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT FALSE"
    );
    console.log("Column is_open added successfully.");
  } else {
    console.log("Column is_open already exists.");
  }

  // 2. Fetch all classes
  const [classes] = await conn.execute(
    "SELECT id, display_name, schedule_day, start_time, end_time, created_at FROM classes"
  );
  console.log(`Found ${classes.length} classes to process.`);

  // Term start base date: 2026-09-07 (Monday)
  const baseDate = new Date("2026-09-07T00:00:00Z");

  for (const cls of classes) {
    console.log(`\nProcessing class: ${cls.display_name} (${cls.id})`);

    // Check existing sessions
    const [existingSessions] = await conn.execute(
      "SELECT id, meeting_number, session_date, is_open FROM attendance_sessions WHERE class_id = ? ORDER BY meeting_number",
      [cls.id]
    );

    const existingMap = new Map();
    for (const sess of existingSessions) {
      existingMap.set(sess.meeting_number, sess);
    }

    // Ensure 16 meetings (1 to 16)
    for (let m = 1; m <= 16; m++) {
      // Calculate date 7 days apart for each meeting
      const meetingDate = new Date(baseDate.getTime() + (m - 1) * 7 * 24 * 60 * 60 * 1000);
      const dateStr = meetingDate.toISOString().split("T")[0];
      const topicStr = `Pertemuan Ke-${m}: ${getTopicName(m)}`;

      if (existingMap.has(m)) {
        // Update meeting if needed
        const current = existingMap.get(m);
        // By default, only P1 is open for first demo class, rest closed
        const isOpen = cls.id === "873cdf5e-d024-4c67-9874-057a0c21279d" && m === 1 ? 1 : 0;
        await conn.execute(
          "UPDATE attendance_sessions SET is_open = ?, topic = COALESCE(topic, ?) WHERE id = ?",
          [isOpen, topicStr, current.id]
        );
      } else {
        // Create new session
        const newSessionId = crypto.randomUUID();
        const isOpen = cls.id === "873cdf5e-d024-4c67-9874-057a0c21279d" && m === 1 ? 1 : 0;

        await conn.execute(
          `INSERT INTO attendance_sessions (id, class_id, meeting_number, session_date, topic, is_open, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [newSessionId, cls.id, m, dateStr, topicStr, isOpen]
        );
      }
    }

    const [finalCount] = await conn.execute(
      "SELECT COUNT(*) as count FROM attendance_sessions WHERE class_id = ?",
      [cls.id]
    );
    console.log(`Class ${cls.display_name} now has ${finalCount[0].count} sessions.`);
  }

  // 3. For any future sessions (meeting_number > 4), clean up any automatically seeded records
  // so that students start as "belum hadir" (unrecorded / null) until scanned or marked!
  console.log("\nEnsuring unscanned future meetings have no pre-filled automatic records...");
  await conn.execute(`
    DELETE ar FROM attendance_records ar
    JOIN attendance_sessions s ON ar.session_id = s.id
    WHERE s.meeting_number > 4
  `);

  console.log("Migration complete!");
  await conn.end();
}

function getTopicName(meetingNumber) {
  const topics = [
    "Pengenalan Silabus & Kontrak Perkuliahan",
    "Dasar-dasar Struktur & Arsitektur Sistem",
    "Komponen Inti & Alur Kerja",
    "State Management & Data Binding",
    "Routing Dinamis & Navigasi Modular",
    "Integrasi API & Backend Services",
    "Validasi Form & Handling Error",
    "Evaluasi Tengah Semester (UTS)",
    "Pola Desain Komponen & Reusability",
    "Database Query Optimization & Relasi",
    "Keamanan Sistem & Otentikasi Lanjutan",
    "File Upload & Storage Management",
    "Pengujian Otomatis & Testing Workflow",
    "Optimasi Performa & Build Caching",
    "Review Proyek & Persiapan Produksi",
    "Evaluasi Akhir Semester (UAS)",
  ];
  return topics[meetingNumber - 1] || `Materi Pertemuan ${meetingNumber}`;
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
