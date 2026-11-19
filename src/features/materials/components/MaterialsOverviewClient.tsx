"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  Users,
  Search,
  ArrowRight,
  GraduationCap,
  Layers,
} from "lucide-react";

export interface LecturerClassItem {
  id: string;
  classCode: string;
  displayName: string;
  scheduleText: string | null;
  status: "active" | "archived";
  courseId: string;
  courseCode: string;
  courseName: string;
  creditUnits: number | null;
  termName: string;
  studentCount: number;
  materialsCount: number;
}

interface MaterialsOverviewClientProps {
  classesList: LecturerClassItem[];
}

export function MaterialsOverviewClient({
  classesList,
}: MaterialsOverviewClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClasses = classesList.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.displayName.toLowerCase().includes(q) ||
      c.courseName.toLowerCase().includes(q) ||
      c.courseCode.toLowerCase().includes(q) ||
      (c.scheduleText && c.scheduleText.toLowerCase().includes(q))
    );
  });

  const totalMaterials = classesList.reduce(
    (acc, c) => acc + Number(c.materialsCount || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Materi Pembelajaran
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Pilih kelas perkuliahan di bawah ini untuk melihat, mengunggah, atau mengelola materi dan modul ajar.
          </p>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#EEF3FF] border border-[#2457D6]/20 rounded-xl text-xs font-semibold text-[#2457D6]">
            <BookOpen className="w-4 h-4" />
            <span>Total {totalMaterials} Materi Tersebar di {classesList.length} Kelas</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#667085] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kelas atau mata kuliah..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E4E9F2] bg-white text-[#172033] focus:outline-none focus:border-[#2457D6] shadow-sm transition-all"
          />
        </div>
        <span className="text-xs text-[#667085] self-end sm:self-center">
          Menampilkan {filteredClasses.length} dari {classesList.length} kelas aktif
        </span>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <Card className="py-12 text-center border-dashed">
          <BookOpen className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Tidak ada kelas yang sesuai pencarian
          </h3>
          <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
            Coba kata kunci pencarian lain atau pastikan kelas telah terdaftar di sistem.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((cls) => {
            const matCount = Number(cls.materialsCount || 0);

            return (
              <Card
                key={cls.id}
                className="flex flex-col justify-between hover:shadow-md hover:border-[#2457D6]/40 transition-all border-[#E4E9F2] group rounded-2xl overflow-hidden"
              >
                <div>
                  {/* Top Bar Badges */}
                  <div className="p-5 pb-3 flex items-center justify-between gap-2 border-b border-[#F2F4F8] bg-[#FAFBFD]">
                    <div className="flex items-center gap-1.5">
                      <Badge variant="primary" className="font-semibold text-[11px]">
                        {cls.courseCode}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {cls.creditUnits || 0} SKS
                      </Badge>
                    </div>
                    <span className="text-[11px] font-medium text-[#667085] truncate">
                      {cls.termName}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-[#172033] group-hover:text-[#2457D6] transition-colors line-clamp-2">
                        {cls.displayName}
                      </h3>
                      <p className="text-xs text-[#667085] mt-1 flex items-center gap-1 font-medium">
                        <GraduationCap className="w-3.5 h-3.5 text-[#2457D6] shrink-0" />
                        <span className="truncate">{cls.courseName}</span>
                      </p>
                    </div>

                    {cls.scheduleText && (
                      <div className="p-2.5 rounded-lg bg-[#F6F8FC] border border-[#E4E9F2]/70 text-[11px] text-[#475467] flex items-start gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#2457D6] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{cls.scheduleText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Stats & Button */}
                <div className="p-5 pt-3 border-t border-[#E4E9F2] space-y-3 bg-[#FAFBFD]/50">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-[#667085]">
                      <Users className="w-3.5 h-3.5 text-[#16845B]" />
                      <span><strong>{cls.studentCount}</strong> Mhs</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#667085] justify-end">
                      <Layers className="w-3.5 h-3.5 text-[#2457D6]" />
                      <span className={matCount > 0 ? "text-[#2457D6] font-semibold" : ""}>
                        <strong>{matCount}</strong> Materi
                      </span>
                    </div>
                  </div>

                  <Link href={`/materials?classId=${cls.id}`} className="block w-full">
                    <Button
                      variant={matCount > 0 ? "primary" : "secondary"}
                      size="sm"
                      className="w-full justify-center group-hover:shadow-sm"
                    >
                      <span>Buka Materi Kelas</span>
                      <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
