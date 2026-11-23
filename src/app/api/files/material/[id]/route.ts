import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth/session";
import { db } from "@/server/db";
import {
  learningMaterials,
  classes,
  courses,
  lecturers,
  enrollments,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { readPrivateFile } from "@/server/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // 1. Query material details along with class and course
  const [material] = await db
    .select({
      id: learningMaterials.id,
      title: learningMaterials.title,
      materialType: learningMaterials.materialType,
      sectionName: learningMaterials.sectionName,
      meetingNumber: learningMaterials.meetingNumber,
      contentBody: learningMaterials.contentBody,
      externalUrl: learningMaterials.externalUrl,
      fileObjectKey: learningMaterials.fileObjectKey,
      classId: learningMaterials.classId,
      className: classes.displayName,
      courseName: courses.name,
      courseCode: courses.code,
      lecturerId: courses.lecturerId,
      lecturerName: lecturers.name,
    })
    .from(learningMaterials)
    .innerJoin(classes, eq(learningMaterials.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(lecturers, eq(courses.lecturerId, lecturers.id))
    .where(eq(learningMaterials.id, id))
    .limit(1);

  if (!material) {
    return NextResponse.json(
      { error: "Materi pembelajaran tidak ditemukan" },
      { status: 404 }
    );
  }

  // 2. Authorization check
  if (user.role === "student") {
    const [enrollment] = await db
      .select()
      .from(enrollments)
      .where(
        and(
          eq(enrollments.classId, material.classId),
          eq(enrollments.studentId, user.userId),
          eq(enrollments.enrollmentStatus, "active")
        )
      )
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Anda tidak terdaftar sebagai peserta aktif di kelas ini" },
        { status: 403 }
      );
    }
  } else if (user.role === "lecturer") {
    if (material.lecturerId !== user.userId) {
      return NextResponse.json(
        { error: "Akses ditolak: Anda bukan pengampu kelas ini" },
        { status: 403 }
      );
    }
  }

  // Clean filename helper
  const cleanTitle = material.title
    .replace(/[/\\?%*:|"<>]/g, "_")
    .trim() || "Materi_Pembelajaran";

  // 3. CASE A: Uploaded file exists in private storage
  if (material.fileObjectKey) {
    try {
      const { buffer } = await readPrivateFile(material.fileObjectKey);
      const ext = material.fileObjectKey.includes(".")
        ? material.fileObjectKey.split(".").pop()
        : "pdf";
      const downloadFilename = `${cleanTitle}.${ext}`;

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Disposition": `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
          "Content-Type": "application/octet-stream",
        },
      });
    } catch (err) {
      console.error("Gagal membaca file materi:", err);
      // Fallback to other content methods if read fails
    }
  }

  // 4. CASE B: External direct URL (PDF / Slide / Cloud Document)
  if (material.externalUrl) {
    const trimmedUrl = material.externalUrl.trim();
    return NextResponse.redirect(trimmedUrl, { status: 302 });
  }

  // 5. CASE C: Article / Document Text (Generate formatted HTML document for offline reading)
  if (material.contentBody) {
    const offlineHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(material.title)} - EDUFlow</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.7; max-width: 860px; margin: 40px auto; padding: 0 24px; color: #1e293b; background: #ffffff; }
    header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
    h1 { color: #0f172a; margin: 0 0 10px; font-size: 26px; }
    .meta { color: #64748b; font-size: 13px; font-weight: 500; display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 8px; }
    .badge { background: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .content { font-size: 15px; color: #334155; }
    .content h2, .content h3 { color: #0f172a; margin-top: 24px; }
    .content pre { background: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px; }
    .content code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 13px; }
    .content img { max-width: 100%; height: auto; border-radius: 8px; }
    footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <header>
    <div class="meta">
      <span class="badge">Materi Kuliah</span>
      <span>${escapeHtml(material.courseCode)} - ${escapeHtml(material.courseName)}</span>
      <span>${escapeHtml(material.className)}</span>
    </div>
    <h1>${escapeHtml(material.title)}</h1>
    <div class="meta">
      <span>Bab: ${escapeHtml(material.sectionName || "Materi Perkuliahan")}</span>
      <span>Dosen: ${escapeHtml(material.lecturerName)}</span>
    </div>
  </header>
  <main class="content">
    ${material.contentBody}
  </main>
  <footer>
    Dokumen materi pembelajaran resmi diunduh dari Portal Mahasiswa EDUFlow.
  </footer>
</body>
</html>`;

    return new NextResponse(offlineHtml, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(cleanTitle)}.html"`,
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  }

  return NextResponse.json(
    { error: "Materi ini belum memiliki file lampiran atau teks yang dapat diunduh" },
    { status: 404 }
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
