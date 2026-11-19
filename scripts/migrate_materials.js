const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL || 'mysql://root:@localhost:3306/eduflow');
  
  // 1. Add columns to learning_materials if they don't exist
  const [cols] = await conn.query('DESCRIBE learning_materials');
  const existing = cols.map(c => c.Field);
  
  if (!existing.includes('material_type')) {
    await conn.query("ALTER TABLE learning_materials ADD COLUMN material_type VARCHAR(30) DEFAULT 'article' NOT NULL");
    console.log('Added material_type column');
  }
  if (!existing.includes('section_name')) {
    await conn.query("ALTER TABLE learning_materials ADD COLUMN section_name VARCHAR(180) NULL");
    console.log('Added section_name column');
  }
  if (!existing.includes('content_body')) {
    await conn.query("ALTER TABLE learning_materials ADD COLUMN content_body LONGTEXT NULL");
    console.log('Added content_body column');
  }
  if (!existing.includes('sort_order')) {
    await conn.query("ALTER TABLE learning_materials ADD COLUMN sort_order INT DEFAULT 0 NOT NULL");
    console.log('Added sort_order column');
  }
  if (!existing.includes('duration_minutes')) {
    await conn.query("ALTER TABLE learning_materials ADD COLUMN duration_minutes INT DEFAULT 2 NOT NULL");
    console.log('Added duration_minutes column');
  }

  // 2. Create material_progress table if not exists
  await conn.query(`
    CREATE TABLE IF NOT EXISTS material_progress (
      id VARCHAR(36) PRIMARY KEY,
      student_id VARCHAR(36) NOT NULL,
      material_id VARCHAR(36) NOT NULL,
      is_completed BOOLEAN DEFAULT TRUE NOT NULL,
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
      UNIQUE KEY idx_student_material (student_id, material_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (material_id) REFERENCES learning_materials(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);
  console.log('material_progress table ready');

  await conn.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
