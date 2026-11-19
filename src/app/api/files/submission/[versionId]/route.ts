import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import {
  submissionVersions,
  submissions,
  assignments,
  classes,
  courses,
} from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { readPrivateFile } from "@/server/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { versionId } = await params;

  // Query version and parent submission
  const [version] = await db
    .select({
      id: submissionVersions.id,
      fileObjectKey: submissionVersions.fileObjectKey,
      originalFilename: submissionVersions.originalFilename,
      studentUserId: submissions.studentId,
      ownerUserId: courses.lecturerId,
    })
    .from(submissionVersions)
    .innerJoin(submissions, eq(submissionVersions.submissionId, submissions.id))
    .innerJoin(assignments, eq(submissions.assignmentId, assignments.id))
    .innerJoin(classes, eq(assignments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(submissionVersions.id, versionId))
    .limit(1);

  if (!version || !version.fileObjectKey) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  // Authorization check
  if (user.role === "lecturer") {
    if (version.ownerUserId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else {
    if (version.studentUserId !== user.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const { buffer } = await readPrivateFile(version.fileObjectKey);
    const filename = version.originalFilename || "submission_file.bin";

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (err) {
    console.error("Read private file error:", err);
    return NextResponse.json(
      { error: "Gagal membaca file dari penyimpanan privat" },
      { status: 500 }
    );
  }
}
