"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { type MaterialItem } from "./MaterialsClient";

interface StudentMaterialsClientProps {
  initialMaterials: MaterialItem[];
  currentClass: {
    id: string;
    displayName: string;
    courseCode: string;
    classCode: string;
    termName: string;
    lecturerName: string;
  };
  enrolledClasses: Array<{ id: string; displayName: string }>;
}

export function StudentMaterialsClient({
  initialMaterials,
  currentClass,
  enrolledClasses,
}: StudentMaterialsClientProps) {
  const router = useRouter();
  const [materials] = useState<MaterialItem[]>(initialMaterials);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
              {currentClass.courseCode} &bull; Kelas {currentClass.classCode}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Materi Pembelajaran
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {currentClass.displayName} &bull; Dosen: {currentClass.lecturerName}
          </p>
        </div>

        <div>
          <select
            value={currentClass.id}
            onChange={(e) =>
              router.push(`/student/materials?classId=${e.target.value}`)
            }
            className="rounded-lg border border-[#E4E9F2] bg-white px-3 py-2 text-xs font-medium text-[#172033] focus:outline-none focus:border-[#2457D6]"
          >
            {enrolledClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {materials.length === 0 ? (
        <Card className="py-12 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Belum ada materi dipublikasikan
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Dosen belum mengunggah materi pembelajaran untuk kelas ini.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {materials.map((mat) => (
            <Card
              key={mat.id}
              className="hover:border-[#2457D6]/30 transition-all flex flex-col justify-between p-5"
            >
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E8F5EF] text-[#16845B] inline-block mb-2">
                  Pertemuan {mat.meetingNumber || "—"}
                </span>

                <h3 className="text-base font-bold text-[#172033]">
                  {mat.title}
                </h3>

                {mat.description && (
                  <p className="text-xs text-[#667085] mt-1.5 leading-relaxed">
                    {mat.description}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E9F2] flex items-center justify-between text-xs">
                {mat.externalUrl ? (
                  <a
                    href={mat.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#2457D6] hover:underline"
                  >
                    <span>Akses Slide / Modul</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-[#667085] italic">Tersedia saat tatap muka</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
