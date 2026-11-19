import Link from "next/link";
import { getStudentEnrolledClasses } from "@/features/student-classes/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Calendar, ArrowRight, UserCheck } from "lucide-react";

export default async function StudentClassesPage() {
  const classesList = await getStudentEnrolledClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Kelas Saya
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Daftar mata kuliah dan kelas aktif yang Anda ikuti pada semester ini.
        </p>
      </div>

      {classesList.length === 0 ? (
        <Card className="py-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Belum Terdaftar di Kelas Apapun
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Anda belum didaftarkan ke dalam kelas perkuliahan. Hubungi dosen pengampu untuk enrollment.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classesList.map((cls) => (
            <Card
              key={cls.classId}
              className="hover:shadow-md hover:border-[#2457D6]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                    {cls.courseCode} &bull; Kelas {cls.classCode}
                  </span>
                  <span className="text-xs text-[#667085] font-medium">
                    {cls.creditUnits} SKS
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                  {cls.displayName}
                </h3>

                <p className="text-xs text-[#667085] mt-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2457D6]" />
                  <span>Dosen: {cls.lecturerName}</span>
                </p>

                <p className="text-xs text-[#667085] mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{cls.scheduleText || "Jadwal belum ditentukan"}</span>
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#E4E9F2]">
                <Link href={`/student/classes/${cls.classId}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>Masuk Kelas</span>
                    <ArrowRight className="w-4 h-4 text-[#2457D6]" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
