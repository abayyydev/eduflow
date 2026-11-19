const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function seedGradebookForAllClasses() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "eduflow",
  });

  console.log("Connected to MySQL for seeding gradebooks...");

  // 1. Get all active classes
  const [classesList] = await connection.execute(
    "SELECT id, display_name FROM classes WHERE status = 'active'"
  );

  console.log(`Found ${classesList.length} active classes.`);

  // Standard Categories (Total 100%)
  const standardCategories = [
    { name: "Tugas & Praktikum", weight: "20.00", sortOrder: 1 },
    { name: "Presensi & Keaktifan", weight: "10.00", sortOrder: 2 },
    { name: "Kuis & Tugas Mandiri", weight: "15.00", sortOrder: 3 },
    { name: "Ujian Tengah Semester (UTS)", weight: "25.00", sortOrder: 4 },
    { name: "Ujian Akhir Semester (UAS)", weight: "30.00", sortOrder: 5 },
  ];

  // Standard Grade Scales
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

  // Get a lecturer ID for gradedBy
  const [lecturers] = await connection.execute("SELECT id FROM lecturers LIMIT 1");
  const lecturerId = lecturers[0]?.id;

  for (const cls of classesList) {
    console.log(`Checking gradebook for: ${cls.display_name}`);

    // Check existing categories
    const [existingCats] = await connection.execute(
      "SELECT id FROM grading_categories WHERE class_id = ?",
      [cls.id]
    );

    let catIdMap = {};

    if (existingCats.length === 0) {
      console.log(`Seeding categories for: ${cls.display_name}`);
      for (const cat of standardCategories) {
        const catId = crypto.randomUUID();
        await connection.execute(
          `INSERT INTO grading_categories (id, class_id, name, weight_percent, aggregation_method, is_required, sort_order, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'average', 0, ?, NOW(), NOW())`,
          [catId, cls.id, cat.name, cat.weight, cat.sortOrder]
        );
        catIdMap[cat.name] = catId;
      }
    } else {
      const [allCats] = await connection.execute(
        "SELECT id, name FROM grading_categories WHERE class_id = ?",
        [cls.id]
      );
      for (const c of allCats) {
        catIdMap[c.name] = c.id;
      }
    }

    // Check existing grade scales
    const [existingScales] = await connection.execute(
      "SELECT id FROM grade_scales WHERE class_id = ?",
      [cls.id]
    );

    if (existingScales.length === 0) {
      console.log(`Seeding grade scales for: ${cls.display_name}`);
      for (const scale of standardScales) {
        await connection.execute(
          `INSERT INTO grade_scales (id, class_id, letter_grade, min_score, max_score, grade_point, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            crypto.randomUUID(),
            cls.id,
            scale.letterGrade,
            scale.minScore,
            scale.maxScore,
            scale.gradePoint,
          ]
        );
      }
    }

    // Check existing assessment items
    const [existingItems] = await connection.execute(
      `SELECT ai.id FROM assessment_items ai
       JOIN grading_categories gc ON ai.category_id = gc.id
       WHERE gc.class_id = ?`,
      [cls.id]
    );

    let itemIds = [];

    if (existingItems.length === 0) {
      console.log(`Seeding assessment items for: ${cls.display_name}`);
      const starterItems = [
        {
          catName: "Tugas & Praktikum",
          title: "Tugas 1: Fundamental & Sintaks",
          maxScore: "100.00",
        },
        {
          catName: "Tugas & Praktikum",
          title: "Tugas 2: Desain Web Responsif",
          maxScore: "100.00",
        },
        {
          catName: "Presensi & Keaktifan",
          title: "Rekapitulasi Kehadiran & Partisipasi",
          maxScore: "100.00",
        },
        {
          catName: "Kuis & Tugas Mandiri",
          title: "Kuis 1: Teori & Pemahaman Konsep",
          maxScore: "100.00",
        },
        {
          catName: "Ujian Tengah Semester (UTS)",
          title: "Ujian Tengah Semester (UTS)",
          maxScore: "100.00",
        },
        {
          catName: "Ujian Akhir Semester (UAS)",
          title: "Ujian Akhir Semester (Proyek Aplikasi)",
          maxScore: "100.00",
        },
      ];

      for (const item of starterItems) {
        const catId = catIdMap[item.catName] || Object.values(catIdMap)[0];
        if (!catId) continue;
        const itemId = crypto.randomUUID();
        await connection.execute(
          `INSERT INTO assessment_items (id, category_id, title, max_score, is_published, created_at, updated_at)
           VALUES (?, ?, ?, ?, 1, NOW(), NOW())`,
          [itemId, catId, item.title, item.maxScore]
        );
        itemIds.push(itemId);
      }
    } else {
      itemIds = existingItems.map((i) => i.id);
    }

    // Seed sample grades for enrolled students
    const [enrolledStudents] = await connection.execute(
      `SELECT student_id FROM enrollments WHERE class_id = ? AND enrollment_status = 'active'`,
      [cls.id]
    );

    console.log(`Found ${enrolledStudents.length} students in ${cls.display_name}. Checking grades...`);

    for (let sIdx = 0; sIdx < enrolledStudents.length; sIdx++) {
      const studentId = enrolledStudents[sIdx].student_id;
      // Generate realistic scores between 70 and 98
      for (let iIdx = 0; iIdx < itemIds.length; iIdx++) {
        const itemId = itemIds[iIdx];
        const [existingGrade] = await connection.execute(
          `SELECT id FROM grades WHERE assessment_item_id = ? AND student_id = ?`,
          [itemId, studentId]
        );

        if (existingGrade.length === 0) {
          // Semi-random deterministic score
          const base = 75 + ((sIdx * 7 + iIdx * 11) % 24);
          const score = Math.min(100, Math.max(65, base));
          await connection.execute(
            `INSERT INTO grades (id, assessment_item_id, student_id, score, graded_by, graded_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
            [crypto.randomUUID(), itemId, studentId, score.toFixed(2), lecturerId]
          );
        }
      }
    }
  }

  console.log("Gradebook seeding across all classes completed successfully!");
  await connection.end();
}

seedGradebookForAllClasses().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
