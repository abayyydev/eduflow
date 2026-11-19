"use client";

import React from "react";
import { useTheme, THEME_OPTIONS } from "./ThemeProvider";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Palette, Check, Sparkles } from "lucide-react";

export function ThemeSettingsCard() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[#E4E9F2]">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#2457D6]" />
          <div>
            <CardTitle>Gaya Desain Antarmuka (UI Theme Presets)</CardTitle>
            <p className="text-xs text-[#667085] mt-0.5">
              Pilih salah satu dari 10 gaya estetika visual untuk merubah nuansa aplikasi secara instan.
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[#16845B] font-semibold bg-[#E8F5EF] px-2.5 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> 10 Pilihan Gaya
        </span>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((t) => {
            const isSelected = theme === t.id;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2.5 relative group ${
                  isSelected
                    ? "border-[#2457D6] bg-[#EEF3FF]/70 shadow-sm ring-2 ring-[#2457D6]/20"
                    : "border-[#E4E9F2] bg-white hover:border-[#2457D6]/40 hover:bg-[#FAFBFD]"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-[#172033]">
                        {t.name}
                      </span>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F2F4F7] text-[#475467]">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-[#2457D6]">
                      {t.subtitle}
                    </p>
                  </div>

                  {isSelected ? (
                    <div className="w-5 h-5 rounded-full bg-[#2457D6] text-white flex items-center justify-center shrink-0 shadow-xs">
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
      </CardContent>
    </Card>
  );
}
