"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileCheck2,
  Clock,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export interface StudentAssignmentItem {
  id: string;
  title: string;
  dueAt: Date | null;
  maxScore: string;
  submissionMode: "file" | "url" | "both";
  classDisplayName: string;
  courseCode: string;
  submissionId: string | null;
  submissionStatus:
    | "draft"
    | "submitted"
    | "late"
    | "returned_for_revision"
    | "resubmitted"
    | "graded"
    | null;
  score: string | null;
  submittedAt: Date | null;
}

interface StudentAssignmentsListClientProps {
  initialAssignments: StudentAssignmentItem[];
}

export function StudentAssignmentsListClient({
  initialAssignments,
}: StudentAssignmentsListClientProps) {
  const [assignments] = useState(initialAssignments);
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = assignments.filter((a) => {
    const matchesSearch =
      !searchQuery.trim() ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.classDisplayName.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filter === "pending") {
      matchesFilter = !a.submissionStatus || a.submissionStatus === "draft";
    } else if (filter === "submitted") {
      matchesFilter =
        a.submissionStatus === "submitted" ||
        a.submissionStatus === "late" ||
        a.submissionStatus === "resubmitted";
    } else if (filter === "graded") {
      matchesFilter = a.submissionStatus === "graded";
    } else if (filter === "revision") {
      matchesFilter = a.submissionStatus === "returned_for_revision";
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
          Tugas Perkuliahan
        </h1>
        <p className="text-sm text-[#667085] mt-0.5">
          Pantau seluruh tugas, tenggat waktu pengerjaan, dan status penilaian Anda.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#E4E9F2]">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#E4E9F2] pl-8 pr-3 py-1.5 text-xs text-[#172033] focus:outline-none focus:border-[#2457D6]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-[#667085] shrink-0" />
          {[
            { id: "all", label: "Semua" },
            { id: "pending", label: "Belum Dikirim" },
            { id: "submitted", label: "Terkumpul" },
            { id: "revision", label: "Perlu Revisi" },
            { id: "graded", label: "Sudah Dinilai" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                filter === tab.id
                  ? "bg-[#2457D6] text-white"
                  : "text-[#667085] hover:bg-[#F6F8FC]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Assignments Grid */}
      {filtered.length === 0 ? (
        <Card className="py-12 text-center">
          <FileCheck2 className="mx-auto h-12 w-12 text-[#667085]/40 mb-3" />
          <h3 className="text-base font-semibold text-[#172033]">
            Tidak ada tugas ditemukan
          </h3>
          <p className="text-xs text-[#667085] mt-1">
            Tidak ada tugas aktif yang cocok dengan filter yang dipilih.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((asg) => (
            <Card
              key={asg.id}
              className="hover:shadow-md hover:border-[#2457D6]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#EEF3FF] text-[#2457D6] uppercase tracking-wider">
                    {asg.courseCode}
                  </span>
                  {asg.submissionStatus ? (
                    <Badge status={asg.submissionStatus} />
                  ) : (
                    <Badge variant="default">Belum Mengumpulkan</Badge>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#172033] line-clamp-1">
                  {asg.title}
                </h3>
                <p className="text-xs text-[#667085] mt-0.5 line-clamp-1">
                  {asg.classDisplayName}
                </p>

                <div className="mt-3 pt-3 border-t border-[#E4E9F2] space-y-1 text-xs">
                  <p className="text-[#B7791F] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tenggat: {formatDateTime(asg.dueAt)}</span>
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[#667085]">
                      Maks: {asg.maxScore} Poin
                    </span>
                    {asg.score !== null && (
                      <span className="font-bold text-[#16845B]">
                        Nilai: {asg.score}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E9F2]">
                <Link href={`/student/assignments/${asg.id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-between">
                    <span>
                      {asg.submissionStatus === "graded"
                        ? "Lihat Hasil Nilai"
                        : asg.submissionStatus
                        ? "Detail Submisi"
                        : "Kumpulkan Tugas"}
                    </span>
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
