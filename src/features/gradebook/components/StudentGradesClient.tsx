"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { type StudentClassGradeSummary } from "../student-actions";

interface StudentGradesClientProps {
  classesGrades: StudentClassGradeSummary[];
}

export function StudentGradesClient({ classesGrades }: StudentGradesClientProps) {
  const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>(
    classesGrades.reduce((acc, curr) => ({ ...acc, [curr.classId]: true }), {})
  );

  const toggleExpand = (classId: string) => {
    setExpandedClasses((prev) => ({ ...prev, [classId]: !prev[classId] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Nilai Akademik Saya
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Rekapitulasi capaian nilai akhir, huruf mutu, dan rincian komponen penilaian perkuliahan.
        </p>
      </div>

      {classesGrades.length === 0 ? (
        <Card className="py-12 text-center">
          <Award className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Belum ada nilai yang tersedia
          </h3>
          <p className="text-xs text-[#667085] mt-1">
            Anda belum terdaftar pada kelas aktif dengan data penilaian.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {classesGrades.map((cls) => {
            const isExpanded = expandedClasses[cls.classId];
            const isPub = cls.isPublished && cls.calculation !== null;

            return (
              <Card key={cls.classId} className="overflow-hidden">
                {/* Class Card Header */}
                <div
                  className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpand(cls.classId)}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                        {cls.courseCode}
                      </span>
                      <span className="text-xs text-[#667085]">
                        {cls.creditUnits} SKS &bull; {cls.termName}
                      </span>
                      <Badge
                        variant={isPub ? "success" : "default"}
                      >
                        {isPub ? "Nilai Akhir Terbit" : "Belum Dipublikasikan"}
                      </Badge>
                    </div>

                    <h3 className="text-base font-bold text-[#172033]">
                      {cls.className}
                    </h3>
                    <p className="text-xs text-[#667085]">
                      Dosen: {cls.lecturerName}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Final Grade Preview Box */}
                    {isPub && cls.calculation?.finalScore !== null ? (
                      <div className="flex items-center gap-3 bg-[#E8F5EF] px-4 py-2 rounded-xl border border-[#16845B]/20">
                        <div className="text-right">
                          <span className="text-[10px] text-[#667085] uppercase tracking-wider font-semibold block">
                            Nilai Akhir
                          </span>
                          <span className="text-2xl font-black text-[#16845B] tabular-nums">
                            {cls.calculation?.finalScore}
                          </span>
                        </div>
                        <div className="pl-3 border-l border-[#16845B]/20 text-center">
                          <span className="text-[10px] text-[#667085] uppercase tracking-wider font-semibold block">
                            Huruf
                          </span>
                          <span className="text-2xl font-black text-[#16845B]">
                            {cls.calculation?.letterGrade}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-[#667085] italic">
                        Menunggu publikasi dosen
                      </div>
                    )}

                    <button
                      type="button"
                      className="p-1 rounded-lg text-[#667085] hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-[#E4E9F2] p-5 space-y-5 bg-[#F6F8FC]/30">
                    {!isPub && (
                      <div className="p-3 rounded-xl bg-[#FDF5E6] border border-[#B7791F]/20 text-xs text-[#B7791F] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>
                          Dosen belum mempublikasikan nilai akhir untuk kelas ini. Rincian di bawah hanya menampilkan tugas yang telah dinilai secara individual.
                        </span>
                      </div>
                    )}

                    {/* Category Breakdown (if published) */}
                    {isPub && cls.calculation && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                          Distribusi Nilai Per Komponen
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {cls.calculation.categories.map((cat) => (
                            <div
                              key={cat.categoryId}
                              className="bg-white p-3 rounded-xl border border-[#E4E9F2] text-center"
                            >
                              <span className="text-xs font-bold text-[#172033] block truncate">
                                {cat.name}
                              </span>
                              <span className="text-[10px] text-[#667085] block">
                                Bobot {cat.weightPercent}%
                              </span>
                              <span className="text-lg font-extrabold text-[#2457D6] mt-1 block tabular-nums">
                                {cat.scoreNormalized !== null
                                  ? cat.scoreNormalized
                                  : "—"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Individual Items Table */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-[#172033] uppercase tracking-wider">
                        Rincian Item Penilaian &amp; Feedback
                      </h4>
                      <div className="bg-white rounded-xl border border-[#E4E9F2] overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-[#F6F8FC] border-b border-[#E4E9F2] text-[#667085]">
                            <tr>
                              <th className="py-2.5 px-4 font-semibold">Item Penilaian</th>
                              <th className="py-2.5 px-4 font-semibold">Kategori</th>
                              <th className="py-2.5 px-4 font-semibold text-center">Nilai Maks</th>
                              <th className="py-2.5 px-4 font-semibold text-center">Skor Diperoleh</th>
                              <th className="py-2.5 px-4 font-semibold">Catatan Dosen</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E4E9F2]">
                            {cls.items.map((it) => (
                              <tr key={it.itemId} className="hover:bg-gray-50/50">
                                <td className="py-2.5 px-4 font-semibold text-[#172033]">
                                  {it.itemTitle}
                                </td>
                                <td className="py-2.5 px-4 text-[#667085]">
                                  {it.categoryName}
                                </td>
                                <td className="py-2.5 px-4 text-center tabular-nums text-[#667085]">
                                  {it.maxScore}
                                </td>
                                <td className="py-2.5 px-4 text-center font-bold tabular-nums">
                                  {it.score !== null ? (
                                    <span className="text-[#16845B]">
                                      {it.score}
                                    </span>
                                  ) : (
                                    <span className="text-[#667085] font-normal">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4 text-[#667085] italic">
                                  {it.feedback || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
