"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  className = "",
}) => {
  // If no items, do not render
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border-t border-[#E4E9F2] rounded-b-xl text-xs text-[#667085] ${className}`}
    >
      {/* Information text */}
      <div className="flex items-center gap-1">
        <span>Menampilkan</span>
        <strong className="text-[#172033] font-semibold">{startItem}</strong>
        <span>–</span>
        <strong className="text-[#172033] font-semibold">{endItem}</strong>
        <span>dari</span>
        <strong className="text-[#172033] font-semibold">{totalItems}</strong>
        <span>data</span>
        {totalPages > 1 && (
          <span className="ml-1 text-[11px] text-[#667085]">
            (Halaman {currentPage} dari {totalPages})
          </span>
        )}
      </div>

      {/* Navigation buttons - only show if totalPages > 1 */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* First page button */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E4E9F2] text-[#667085] hover:text-[#172033] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Halaman Pertama"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-[#E4E9F2] text-[#667085] hover:text-[#172033] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-1">
            {getPageNumbers().map((p, idx) => {
              if (p === "...") {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 py-1 text-[#667085] select-none text-xs"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = p as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-7 h-7 px-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? "bg-[#2457D6] text-white shadow-xs border border-[#2457D6]"
                      : "border border-[#E4E9F2] text-[#667085] hover:text-[#172033] hover:bg-[#F6F8FC]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E4E9F2] text-[#667085] hover:text-[#172033] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last page button */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-[#E4E9F2] text-[#667085] hover:text-[#172033] hover:bg-[#F6F8FC] disabled:opacity-40 disabled:pointer-events-none transition-colors"
            title="Halaman Terakhir"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
