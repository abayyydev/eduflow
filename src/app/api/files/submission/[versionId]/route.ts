import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import {
  submissionVersions,
  submissionFiles,
  submissions,
  assignments,
  classes,
  courses,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
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

  if (!version) {
    return NextResponse.json({ error: "Submisi tidak ditemukan" }, { status: 404 });
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

  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get("fileId");

  let targetKey = version.fileObjectKey;
  let targetFilename = version.originalFilename || "submission_file.bin";

  // If a specific fileId is requested, lookup from submission_files
  if (fileId) {
    try {
      const [subFile] = await db
        .select({
          fileObjectKey: submissionFiles.fileObjectKey,
          originalFilename: submissionFiles.originalFilename,
        })
        .from(submissionFiles)
        .where(
          and(
            eq(submissionFiles.id, fileId),
            eq(submissionFiles.versionId, versionId)
          )
        )
        .limit(1);

      if (subFile) {
        targetKey = subFile.fileObjectKey;
        targetFilename = subFile.originalFilename;
      }
    } catch {
      // Fallback to primary version file
    }
  }

  if (!targetKey) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 404 });
  }

  try {
    const { buffer } = await readPrivateFile(targetKey);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(targetFilename)}"`,
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
