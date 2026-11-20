const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function migrateAttendanceQrCode() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "eduflow",
  });

  console.log("Connected to MySQL for attendance QR Code & Geofencing migration...");

  // 1. Alter classes table to add QR code token, schedule times, and campus coordinates
  const classColsToAdd = [
    { name: "qr_code_token", type: "VARCHAR(100) UNIQUE NULL" },
    { name: "schedule_day", type: "VARCHAR(20) NULL" },
    { name: "start_time", type: "VARCHAR(10) NULL" },
    { name: "end_time", type: "VARCHAR(10) NULL" },
    { name: "campus_latitude", type: "DECIMAL(10,7) DEFAULT -6.9147440" },
    { name: "campus_longitude", type: "DECIMAL(10,7) DEFAULT 107.6098100" },
    { name: "campus_radius_meters", type: "INT DEFAULT 300" },
  ];

  for (const col of classColsToAdd) {
    try {
      await connection.execute(
        `ALTER TABLE classes ADD COLUMN ${col.name} ${col.type}`
      );
      console.log(`Added column ${col.name} to classes.`);
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log(`Column ${col.name} already exists in classes.`);
      } else {
        console.warn(`Warning on ${col.name}:`, e.message);
      }
    }
  }

  // 2. Alter attendance_records to support 'late', GPS coordinates, and scan timestamp
  try {
    await connection.execute(
      `ALTER TABLE attendance_records MODIFY COLUMN status ENUM('present', 'late', 'sick', 'excused', 'absent') DEFAULT 'absent' NOT NULL`
    );
    console.log("Updated attendance_records status ENUM to include 'late'.");
  } catch (e) {
    console.warn("Status enum modification note:", e.message);
  }

  const recordColsToAdd = [
    { name: "latitude", type: "DECIMAL(10,7) NULL" },
    { name: "longitude", type: "DECIMAL(10,7) NULL" },
    { name: "distance_meters", type: "INT NULL" },
    { name: "scanned_at", type: "DATETIME NULL" },
  ];

  for (const col of recordColsToAdd) {
    try {
      await connection.execute(
        `ALTER TABLE attendance_records ADD COLUMN ${col.name} ${col.type}`
      );
      console.log(`Added column ${col.name} to attendance_records.`);
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log(`Column ${col.name} already exists in attendance_records.`);
      } else {
        console.warn(`Warning on ${col.name}:`, e.message);
      }
    }
  }

  // 3. Populate QR Code tokens and schedule times for all existing classes
  const [classList] = await connection.execute("SELECT id, display_name, schedule_text, qr_code_token FROM classes");
  console.log(`Configuring schedule and QR tokens for ${classList.length} classes...`);

  for (const cls of classList) {
    let token = cls.qr_code_token;
    if (!token) {
      token = "EDF-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    }

    // Parse schedule text if possible (e.g. Kamis 09.00 - 10.30 WIB)
    let day = "kamis";
    let start = "09:00";
    let end = "10:30";

    const text = (cls.schedule_text || "").toLowerCase();
    if (text.includes("kamis")) day = "kamis";
    else if (text.includes("jumat") || text.includes("jum'at")) day = "jumat";
    else if (text.includes("senin")) day = "senin";
    else if (text.includes("selasa")) day = "selasa";
    else if (text.includes("rabu")) day = "rabu";
    else if (text.includes("sabtu")) day = "sabtu";

    // Match times like 09.00 - 10.30 or 13.00 - 15.00 or 18.45 - 20.15
    const timeMatch = text.match(/(\d{2})[.:](\d{2})\s*-\s*(\d{2})[.:](\d{2})/);
    if (timeMatch) {
      start = `${timeMatch[1]}:${timeMatch[2]}`;
      end = `${timeMatch[3]}:${timeMatch[4]}`;
    }

    await connection.execute(
      `UPDATE classes SET
        qr_code_token = ?,
        schedule_day = ?,
        start_time = ?,
        end_time = ?,
        campus_latitude = -6.9147440,
        campus_longitude = 107.6098100,
        campus_radius_meters = 500
       WHERE id = ?`,
      [token, day, start, end, cls.id]
    );
  }

  console.log("Migration for QR Code & Geofencing completed successfully!");
  await connection.end();
}

migrateAttendanceQrCode().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
