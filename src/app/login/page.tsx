"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { GraduationCap } from "lucide-react";

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
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#667085]">
          EDUFlow &copy; 2026. Aman, transparan, dan terstruktur.
        </p>
      </div>
    </div>
  );
}
