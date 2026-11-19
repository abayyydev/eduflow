import { requireStudent } from "@/server/auth/session";
import { db } from "@/server/db";
import { studentProfiles, enrollments, classes, courses } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, Mail } from "lucide-react";

export default async function StudentProfilePage() {
  const user = await requireStudent();

  const [profile] = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, user.userId))
    .limit(1);

  const enrolledClasses = await db
    .select({
      id: classes.id,
      displayName: classes.displayName,
      classCode: classes.classCode,
      courseCode: courses.code,
      courseName: courses.name,
      creditUnits: courses.creditUnits,
    })
    .from(enrollments)
    .innerJoin(classes, eq(enrollments.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(
      and(
        eq(enrollments.studentUserId, user.userId),
        eq(enrollments.enrollmentStatus, "active")
      )
    );

  const totalCredits = enrolledClasses.reduce(
    (acc, c) => acc + (c.creditUnits || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Profil Mahasiswa
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Informasi biodata akademik dan kelas perkuliahan aktif yang Anda ikuti.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <User className="w-5 h-5 text-[#2457D6]" />
          <CardTitle>Biodata Mahasiswa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-[#2457D6]/10 text-[#2457D6] font-bold text-xl flex items-center justify-center shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033]">{user.name}</h3>
              <p className="text-[#667085] flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" /> {user.email}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="primary">
                  NIM: {profile?.studentNumber || "—"}
                </Badge>
                <Badge variant="success">
                  Mahasiswa Aktif
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E4E9F2]">
            <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2]">
              <span className="text-[#667085] block">Program Studi</span>
              <span className="font-bold text-[#172033] mt-0.5 block">
                {profile?.studyProgram || "Teknik Informatika"}
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2]">
              <span className="text-[#667085] block">Tahun Angkatan</span>
              <span className="font-bold text-[#172033] mt-0.5 block">
                {profile?.cohort ? `Angkatan ${profile.cohort}` : "—"}
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2]">
              <span className="text-[#667085] block">Total Kelas Aktif</span>
              <span className="font-bold text-[#2457D6] mt-0.5 block">
                {enrolledClasses.length} Kelas
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-lg border border-[#E4E9F2]">
              <span className="text-[#667085] block">Total Beban SKS</span>
              <span className="font-bold text-[#16845B] mt-0.5 block">
                {totalCredits} SKS
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Classes List */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3">
          <GraduationCap className="w-5 h-5 text-[#16845B]" />
          <CardTitle>Kelas Terdaftar Semester Ini</CardTitle>
        </CardHeader>
        <CardContent>
          {enrolledClasses.length === 0 ? (
            <p className="text-xs text-[#667085] py-4 text-center">
              Anda belum terdaftar di kelas manapun.
            </p>
          ) : (
            <div className="divide-y divide-[#E4E9F2]">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#172033]">{cls.displayName}</p>
                    <p className="text-[#667085]">
                      {cls.courseCode} &bull; Kelas {cls.classCode}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {cls.creditUnits} SKS
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
