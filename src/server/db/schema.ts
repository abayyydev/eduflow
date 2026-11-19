import {
  mysqlTable,
  varchar,
  text,
  tinyint,
  smallint,
  int,
  decimal,
  boolean,
  date,
  datetime,
  mysqlEnum,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// 1. Users (Superadmin & Admin)
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: mysqlEnum("role", ["admin", "superadmin"]).default("admin").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: datetime("last_login_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [uniqueIndex("idx_users_email").on(table.email)]
);

// 2. Lecturers (Dosen)
export const lecturers = mysqlTable(
  "lecturers",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    nip: varchar("nip", { length: 50 }),
    academicTitle: varchar("academic_title", { length: 100 }),
    institutionName: varchar("institution_name", { length: 180 }),
    phone: varchar("phone", { length: 30 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: datetime("last_login_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_lecturers_email").on(table.email),
    uniqueIndex("idx_lecturers_nip").on(table.nip),
  ]
);

// 3. Students (Mahasiswa)
export const students = mysqlTable(
  "students",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    studentNumber: varchar("student_number", { length: 50 }).notNull(), // NIM
    studyProgram: varchar("study_program", { length: 150 }),
    cohort: varchar("cohort", { length: 30 }),
    phone: varchar("phone", { length: 30 }),
    isActive: boolean("is_active").default(true).notNull(),
    lastLoginAt: datetime("last_login_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_students_email").on(table.email),
    uniqueIndex("idx_students_nim").on(table.studentNumber),
  ]
);

// 4. Academic Terms
export const academicTerms = mysqlTable("academic_terms", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  semester: mysqlEnum("semester", ["ganjil", "genap", "antara"]).notNull(),
  startsOn: date("starts_on", { mode: "string" }).notNull(),
  endsOn: date("ends_on", { mode: "string" }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 5. Courses
export const courses = mysqlTable("courses", {
  id: varchar("id", { length: 36 }).primaryKey(),
  code: varchar("code", { length: 30 }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  description: text("description"),
  creditUnits: tinyint("credit_units"),
  lecturerId: varchar("lecturer_id", { length: 36 })
    .notNull()
    .references(() => lecturers.id, { onDelete: "cascade" }),
  archivedAt: datetime("archived_at"),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 6. Classes
export const classes = mysqlTable(
  "classes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    courseId: varchar("course_id", { length: 36 })
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    academicTermId: varchar("academic_term_id", { length: 36 })
      .notNull()
      .references(() => academicTerms.id, { onDelete: "cascade" }),
    classCode: varchar("class_code", { length: 30 }).notNull(),
    displayName: varchar("display_name", { length: 180 }).notNull(),
    scheduleText: varchar("schedule_text", { length: 180 }),
    status: mysqlEnum("status", ["active", "archived"])
      .default("active")
      .notNull(),
    gradingLockedAt: datetime("grading_locked_at"),
    gradesPublishedAt: datetime("grades_published_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_class_course_term_code").on(
      table.courseId,
      table.academicTermId,
      table.classCode
    ),
    index("idx_classes_term_status").on(table.academicTermId, table.status),
  ]
);

// 7. Enrollments
export const enrollments = mysqlTable(
  "enrollments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    classId: varchar("class_id", { length: 36 })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    enrollmentStatus: mysqlEnum("enrollment_status", [
      "active",
      "dropped",
      "completed",
    ])
      .default("active")
      .notNull(),
    enrolledAt: datetime("enrolled_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_enrollment_class_student").on(
      table.classId,
      table.studentId
    ),
    index("idx_enrollments_class_status").on(
      table.classId,
      table.enrollmentStatus
    ),
  ]
);

// 8. Learning Materials
export const learningMaterials = mysqlTable("learning_materials", {
  id: varchar("id", { length: 36 }).primaryKey(),
  classId: varchar("class_id", { length: 36 })
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  meetingNumber: smallint("meeting_number"),
  title: varchar("title", { length: 180 }).notNull(),
  description: text("description"),
  externalUrl: text("external_url"),
  fileObjectKey: varchar("file_object_key", { length: 500 }),
  publishedAt: datetime("published_at"),
  createdBy: varchar("created_by", { length: 36 })
    .notNull()
    .references(() => lecturers.id, { onDelete: "cascade" }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 9. Grading Categories
export const gradingCategories = mysqlTable("grading_categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  classId: varchar("class_id", { length: 36 })
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  weightPercent: decimal("weight_percent", { precision: 5, scale: 2 }).notNull(),
  aggregationMethod: mysqlEnum("aggregation_method", [
    "average",
    "sum_normalized",
    "manual",
  ])
    .default("average")
    .notNull(),
  isRequired: boolean("is_required").default(false).notNull(),
  sortOrder: smallint("sort_order").default(0).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 10. Assessment Items
export const assessmentItems = mysqlTable("assessment_items", {
  id: varchar("id", { length: 36 }).primaryKey(),
  categoryId: varchar("category_id", { length: 36 })
    .notNull()
    .references(() => gradingCategories.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 180 }).notNull(),
  maxScore: decimal("max_score", { precision: 7, scale: 2 })
    .default("100.00")
    .notNull(),
  assessmentDate: date("assessment_date", { mode: "string" }),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 11. Assignments
export const assignments = mysqlTable(
  "assignments",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    classId: varchar("class_id", { length: 36 })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 180 }).notNull(),
    instructions: text("instructions").notNull(),
    maxScore: decimal("max_score", { precision: 7, scale: 2 })
      .default("100.00")
      .notNull(),
    opensAt: datetime("opens_at"),
    dueAt: datetime("due_at"),
    allowLate: boolean("allow_late").default(false).notNull(),
    submissionMode: mysqlEnum("submission_mode", ["file", "url", "both"])
      .default("both")
      .notNull(),
    allowedMimeTypes: json("allowed_mime_types"),
    maxFileSizeMb: smallint("max_file_size_mb").default(10).notNull(),
    status: mysqlEnum("status", ["draft", "published", "closed"])
      .default("draft")
      .notNull(),
    assessmentItemId: varchar("assessment_item_id", { length: 36 }).references(
      () => assessmentItems.id,
      { onDelete: "set null" }
    ),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_assignments_class_status_due").on(
      table.classId,
      table.status,
      table.dueAt
    ),
  ]
);

// 12. Submissions
export const submissions = mysqlTable(
  "submissions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assignmentId: varchar("assignment_id", { length: 36 })
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", [
      "draft",
      "submitted",
      "late",
      "returned_for_revision",
      "resubmitted",
      "graded",
    ])
      .default("draft")
      .notNull(),
    submittedAt: datetime("submitted_at"),
    currentVersion: int("current_version").default(1).notNull(),
    score: decimal("score", { precision: 7, scale: 2 }),
    feedback: text("feedback"),
    gradedBy: varchar("graded_by", { length: 36 }).references(
      () => lecturers.id,
      { onDelete: "set null" }
    ),
    gradedAt: datetime("graded_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_submission_assignment_student").on(
      table.assignmentId,
      table.studentId
    ),
    index("idx_submissions_status_date").on(table.status, table.submittedAt),
  ]
);

// 13. Submission Versions
export const submissionVersions = mysqlTable("submission_versions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  submissionId: varchar("submission_id", { length: 36 })
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  versionNumber: int("version_number").notNull(),
  fileObjectKey: varchar("file_object_key", { length: 500 }),
  originalFilename: varchar("original_filename", { length: 255 }),
  externalUrl: text("external_url"),
  note: text("note"),
  submittedAt: datetime("submitted_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

// 14. Grades
export const grades = mysqlTable(
  "grades",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    assessmentItemId: varchar("assessment_item_id", { length: 36 })
      .notNull()
      .references(() => assessmentItems.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    score: decimal("score", { precision: 7, scale: 2 }), // NULL = not graded yet, 0 = valid zero
    feedback: text("feedback"),
    gradedBy: varchar("graded_by", { length: 36 })
      .notNull()
      .references(() => lecturers.id, { onDelete: "cascade" }),
    gradedAt: datetime("graded_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_grade_item_student").on(
      table.assessmentItemId,
      table.studentId
    ),
  ]
);

// 15. Grade Scales
export const gradeScales = mysqlTable("grade_scales", {
  id: varchar("id", { length: 36 }).primaryKey(),
  classId: varchar("class_id", { length: 36 })
    .notNull()
    .references(() => classes.id, { onDelete: "cascade" }),
  letterGrade: varchar("letter_grade", { length: 5 }).notNull(),
  minScore: decimal("min_score", { precision: 5, scale: 2 }).notNull(),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }).notNull(),
  gradePoint: decimal("grade_point", { precision: 4, scale: 2 }),
  createdAt: datetime("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: datetime("updated_at")
    .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
    .notNull(),
});

// 16. Attendance Sessions
export const attendanceSessions = mysqlTable(
  "attendance_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    classId: varchar("class_id", { length: 36 })
      .notNull()
      .references(() => classes.id, { onDelete: "cascade" }),
    meetingNumber: smallint("meeting_number").notNull(),
    sessionDate: date("session_date", { mode: "string" }).notNull(),
    topic: varchar("topic", { length: 180 }),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_attendance_sessions_class_date").on(
      table.classId,
      table.sessionDate
    ),
  ]
);

// 17. Attendance Records
export const attendanceRecords = mysqlTable(
  "attendance_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 })
      .notNull()
      .references(() => attendanceSessions.id, { onDelete: "cascade" }),
    studentId: varchar("student_id", { length: 36 })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["present", "sick", "excused", "absent"])
      .default("absent")
      .notNull(),
    note: varchar("note", { length: 255 }),
    updatedBy: varchar("updated_by", { length: 36 })
      .notNull()
      .references(() => lecturers.id, { onDelete: "cascade" }),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_attendance_session_student").on(
      table.sessionId,
      table.studentId
    ),
  ]
);

// 18. Notifications
export const notifications = mysqlTable(
  "notifications",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: varchar("user_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    targetUrl: varchar("target_url", { length: 500 }),
    readAt: datetime("read_at"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: datetime("updated_at")
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_notifications_user_read").on(
      table.userId,
      table.readAt,
      table.createdAt
    ),
  ]
);

// 19. Audit Logs
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    actorUserId: varchar("actor_user_id", { length: 36 }).notNull(),
    actorType: mysqlEnum("actor_type", ["admin", "lecturer", "student"])
      .default("lecturer")
      .notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }).notNull(),
    action: varchar("action", { length: 80 }).notNull(),
    beforeData: json("before_data"),
    afterData: json("after_data"),
    createdAt: datetime("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    index("idx_audit_logs_entity_created").on(
      table.entityType,
      table.entityId,
      table.createdAt
    ),
  ]
);
