const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function main() {
  const conn = await mysql.createConnection("mysql://root:@127.0.0.1:3306/eduflow");
  console.log("Connected to MySQL database eduflow.");

  try {
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0;");

    console.log("Truncating submission_versions...");
    await conn.execute("TRUNCATE TABLE submission_versions;");

    console.log("Truncating submissions...");
    await conn.execute("TRUNCATE TABLE submissions;");

    console.log("Truncating assignments...");
    await conn.execute("TRUNCATE TABLE assignments;");

    console.log("Truncating material_progress...");
    await conn.execute("TRUNCATE TABLE material_progress;");

    console.log("Truncating learning_materials...");
    await conn.execute("TRUNCATE TABLE learning_materials;");

    await conn.execute("SET FOREIGN_KEY_CHECKS = 1;");
    console.log("Database tables truncated successfully.");

    // Clean up uploaded files in storage/submissions
    const storageDir = path.resolve(__dirname, "../storage/submissions");
    if (fs.existsSync(storageDir)) {
      const files = fs.readdirSync(storageDir);
      let deletedCount = 0;
      for (const file of files) {
        if (file !== ".gitkeep") {
          fs.unlinkSync(path.join(storageDir, file));
          deletedCount++;
        }
      }
      console.log(`Cleaned up ${deletedCount} uploaded files from ${storageDir}.`);
    }

    // Verify row counts
    const tables = [
      "assignments",
      "submissions",
      "submission_versions",
      "learning_materials",
      "material_progress",
    ];

    console.log("\n--- Verification of row counts ---");
    for (const t of tables) {
      const [rows] = await conn.execute(`SELECT COUNT(*) as count FROM ${t}`);
      console.log(`Table ${t}: ${rows[0].count} rows`);
    }

  } catch (err) {
    console.error("Error during truncate:", err);
  } finally {
    await conn.end();
  }
}

main();
