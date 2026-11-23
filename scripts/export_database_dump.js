const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function exportDump() {
  const conn = await mysql.createConnection("mysql://root:@127.0.0.1:3306/eduflow");
  console.log("Connected to MySQL for database export...");

  let sqlDump = `-- ============================================================
-- EDUFlow LMS & Academic Management System
-- Full Database Export for cPanel / Production Deployment
-- Generated: ${new Date().toISOString()}
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

`;

  const [tables] = await conn.execute("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
  const tableNames = tables.map((row) => Object.values(row)[0]);

  for (const tableName of tableNames) {
    console.log(`Exporting table: ${tableName}...`);

    // 1. Drop and Create Table
    const [createTableResult] = await conn.execute(`SHOW CREATE TABLE \`${tableName}\``);
    const createTableSql = createTableResult[0]["Create Table"];

    sqlDump += `\n-- ------------------------------------------------------------\n`;
    sqlDump += `-- Table structure for table \`${tableName}\`\n`;
    sqlDump += `-- ------------------------------------------------------------\n`;
    sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
    sqlDump += `${createTableSql};\n\n`;

    // 2. Dump data
    const [rows] = await conn.execute(`SELECT * FROM \`${tableName}\``);
    if (rows.length > 0) {
      sqlDump += `-- Dumping data for table \`${tableName}\` (${rows.length} rows)\n`;

      const columns = Object.keys(rows[0]).map((c) => `\`${c}\``).join(", ");
      const valueLines = [];

      for (const row of rows) {
        const values = Object.values(row).map((val) => {
          if (val === null || val === undefined) return "NULL";
          if (typeof val === "number" || typeof val === "bigint") return val;
          if (typeof val === "boolean") return val ? 1 : 0;
          if (val instanceof Date) {
            return `'${val.toISOString().slice(0, 19).replace("T", " ")}'`;
          }
          if (typeof val === "object") {
            return conn.escape(JSON.stringify(val));
          }
          return conn.escape(String(val));
        });
        valueLines.push(`(${values.join(", ")})`);
      }

      // Batch insert in chunks of 50 to keep statements reasonable
      const chunkSize = 50;
      for (let i = 0; i < valueLines.length; i += chunkSize) {
        const chunk = valueLines.slice(i, i + chunkSize);
        sqlDump += `INSERT INTO \`${tableName}\` (${columns}) VALUES\n${chunk.join(",\n")};\n`;
      }
      sqlDump += `\n`;
    } else {
      sqlDump += `-- No data to dump for table \`${tableName}\`\n\n`;
    }
  }

  sqlDump += `SET FOREIGN_KEY_CHECKS = 1;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
`;

  const outputPath = path.resolve(__dirname, "../eduflow_database_cpanel.sql");
  fs.writeFileSync(outputPath, sqlDump, "utf8");
  console.log(`\nExport complete! File saved to: ${outputPath} (${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB)`);

  await conn.end();
}

exportDump().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
