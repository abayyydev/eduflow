"use client";

import React, { useState } from "react";
import { useTheme, THEME_OPTIONS } from "./ThemeProvider";
import { Modal } from "@/components/ui/modal";
import { Palette, Check, Sparkles } from "lucide-react";

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentThemeObj =
    THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E9F2] bg-white hover:bg-[#F6F8FC] text-xs font-medium text-[#172033] shadow-xs transition-all ${className}`}
        title="Ganti Tema UI"
      >
        <Palette className="w-3.5 h-3.5 text-[#2457D6]" />
        <span className="hidden sm:inline">Tema:</span>
        <span className="font-bold text-[#2457D6]">{currentThemeObj.name}</span>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Pilih Gaya Desain Antarmuka (UI Theme)"
        description="Eksplorasi 10 estetika visual yang berbeda untuk tampilan EDUFlow secara instan."
        maxWidth="xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 max-h-[70vh] overflow-y-auto pr-1">
          {THEME_OPTIONS.map((t) => {
            const isSelected = theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2.5 relative group ${
                  isSelected
                    ? "border-[#2457D6] bg-[#EEF3FF]/60 shadow-sm ring-2 ring-[#2457D6]/20"
                    : "border-[#E4E9F2] bg-white hover:border-[#2457D6]/40 hover:bg-[#FAFBFD]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#172033]">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F2F4F7] text-[#475467]">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#2457D6]">
                      {t.subtitle}
                    </p>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#2457D6] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-[#D0D5DD] group-hover:border-[#2457D6] shrink-0" />
                  )}
                </div>

                <p className="text-[11px] text-[#667085] leading-relaxed">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-[#E4E9F2] flex items-center justify-between text-xs text-[#667085]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2457D6]" /> Pilihan tema otomatis tersimpan di peramban Anda.
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-3 py-1.5 text-xs font-semibold text-[#172033] hover:bg-[#F2F4F7] rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </Modal>
    </>
  );
}
