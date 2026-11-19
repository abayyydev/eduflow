"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal masuk ke sistem.");
        setIsLoading(false);
        return;
      }

      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch {
      setError("Koneksi gagal. Pastikan server aktif.");
      setIsLoading(false);
    }
  };

  const fillCredentials = (type: "lecturer" | "student") => {
    if (type === "lecturer") {
      setIdentifier("dosen@eduflow.test");
      setPassword("password123");
    } else {
      setIdentifier("2611090062"); // Abdulaziz Gaafar Abdullah (NIM Mahasiswa)
      setPassword("password123");
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2457D6] text-white shadow-md shadow-[#2457D6]/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            EDUFlow
          </h1>
          <p className="text-sm text-[#667085]">
            Personal Academic & Learning Management System
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 border-[#E4E9F2] shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#172033]">Masuk ke Akun</h2>
              <p className="text-xs text-[#667085]">
                Mahasiswa dapat masuk menggunakan <strong>NIM</strong> atau Email
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-[#FCECEE] border border-[#C43D4B]/20 p-3 text-xs text-[#C43D4B]">
                {error}
              </div>
            )}

            <Input
              label="NIM atau Alamat Email"
              type="text"
              placeholder="NIM (cth: 2611090062) atau email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              label="Kata Sandi"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-[#E4E9F2] space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-[#667085]">
              <ShieldCheck className="w-4 h-4 text-[#2457D6]" />
              <span>Akses Cepat Akun Demo:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("lecturer")}
                className="px-3 py-2 text-xs font-medium text-[#2457D6] bg-[#EEF3FF] hover:bg-[#DCE7FD] rounded-lg transition-colors text-center border border-[#2457D6]/20"
              >
                Demo Dosen (Email)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("student")}
                className="px-3 py-2 text-xs font-medium text-[#16845B] bg-[#E8F5EF] hover:bg-[#D2EEDF] rounded-lg transition-colors text-center border border-[#16845B]/20"
              >
                Demo Mahasiswa (NIM)
              </button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#667085]">
          EDUFlow &copy; 2026. Aman, transparan, dan terstruktur.
        </p>
      </div>
    </div>
  );
}
