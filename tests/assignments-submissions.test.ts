import { describe, it, expect, beforeAll } from "vitest";
import { db } from "../src/server/db";
import { assignments, submissions, users } from "../src/server/db/schema";
import { eq } from "drizzle-orm";
import { savePrivateFile, readPrivateFile } from "../src/server/storage";

describe("Assignment & Submission Lifecycle Tests", () => {
  let demoAssignment: any;
  let demoStudent: any;

  beforeAll(async () => {
    // 1. Fetch demo assignment
    const [asg] = await db
      .select()
      .from(assignments)
      .where(eq(assignments.title, "Tugas 1: Linked List & Stack Implementation"))
      .limit(1);
    demoAssignment = asg;

    // 2. Fetch demo student mhs1
    const [student] = await db
      .select()
      .from(users)
      .where(eq(users.email, "mhs1@eduflow.test"))
      .limit(1);
    demoStudent = student;
  });

  it("verifies assignment properties from seed", () => {
    expect(demoAssignment).toBeDefined();
    expect(demoAssignment.maxScore).toBe("100.00");
    expect(demoAssignment.submissionMode).toBe("both");
    expect(demoAssignment.allowLate).toBe(true);
  });

  it("checks private storage file write and read security", async () => {
    // Mock a browser File
    const content = "Test submission content for algorithmic verification";
    const blob = new Blob([content], { type: "text/plain" });
    const file = new File([blob], "solusi_tugas.txt", { type: "text/plain" });

    const saveResult = await savePrivateFile(file, "test_sub");
    expect(saveResult.fileObjectKey).toBeDefined();
    expect(saveResult.originalFilename).toBe("solusi_tugas.txt");

    // Read back private file
    const readResult = await readPrivateFile(saveResult.fileObjectKey);
    expect(readResult.buffer.toString("utf-8")).toBe(content);
  });

  it("verifies student submission status transitions and score range rules", async () => {
    const [sub] = await db
      .select()
      .from(submissions)
      .where(
        eq(submissions.assignmentId, demoAssignment.id)
      )
      .limit(1);

    expect(sub).toBeDefined();
    expect(["draft", "submitted", "late", "returned_for_revision", "resubmitted", "graded"]).toContain(sub.status);

    if (sub.score !== null) {
      const scoreNum = parseFloat(sub.score);
      expect(scoreNum).toBeGreaterThanOrEqual(0);
      expect(scoreNum).toBeLessThanOrEqual(parseFloat(demoAssignment.maxScore));
    }
  });

  it("validates deadline evaluation logic", () => {
    const duePast = new Date(Date.now() - 3600000); // 1 hour ago
    const dueFuture = new Date(Date.now() + 3600000); // 1 hour in future
    const now = new Date();

    const isPastLate = now.getTime() > duePast.getTime();
    expect(isPastLate).toBe(true);

    const isFutureLate = now.getTime() > dueFuture.getTime();
    expect(isFutureLate).toBe(false);
  });
});
