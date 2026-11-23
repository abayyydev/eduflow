"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  GraduationCap,
  FileCheck2,
  BookOpen,
  Award,
  User,
  LogOut,
  Bell,
  QrCode,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

interface StudentLayoutProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { label: "Beranda", href: "/student/dashboard", icon: Home },
  { label: "Presensi", href: "/student/attendance", icon: QrCode },
  { label: "Kelas Saya", href: "/student/classes", icon: GraduationCap },
  { label: "Materi", href: "/student/materials", icon: BookOpen },
  { label: "Tugas", href: "/student/assignments", icon: FileCheck2 },
  { label: "Nilai Saya", href: "/student/grades", icon: Award },
  { label: "Profil", href: "/student/profile", icon: User },
];

export const StudentLayout: React.FC<StudentLayoutProps> = ({ user, children }) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-slate-50/60">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (md:flex) */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/80 shadow-xs p-4 justify-between">
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link href="/student/dashboard" className="flex items-center gap-3 px-2 py-1">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-cyan-500/20">
              E
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">
                EDUFlow
              </span>
              <span className="text-[10px] text-cyan-700 font-bold uppercase tracking-wider">
                Portal Mahasiswa
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/student/dashboard" && pathname.startsWith(item.href + "/"));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all",
                    isActive
                      ? "bg-cyan-500 text-white shadow-sm shadow-cyan-500/30"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-500")} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at bottom of sidebar */}
        <div className="space-y-3 pt-4 border-t border-slate-200/70">
          <div className="flex items-center justify-between px-2">
            <ThemeSwitcher />
            <Link
              href="/student/notifications"
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 relative transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500" />
            </Link>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/60 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. WRAPPER FOR MAIN AREA (Offset with md:pl-64 to prevent sidebar overlap) */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-h-screen md:pl-64 w-full min-w-0">
        {/* MOBILE TOP BAR (md:hidden) */}
        <header className="sticky top-0 z-30 md:hidden bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
          <Link href="/student/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              E
            </div>
            <span className="font-extrabold text-sm text-slate-900 tracking-tight">EDUFlow</span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Link
              href="/student/notifications"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500" />
            </Link>
            <div className="h-7 w-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 4. MOBILE BOTTOM NAVIGATION (md:hidden) */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200/80 shadow-lg px-2 py-1.5 flex items-center justify-around safe-area-bottom">
        {[
          { label: "Beranda", href: "/student/dashboard", icon: Home },
          { label: "Presensi", href: "/student/attendance", icon: QrCode },
          { label: "Kelas", href: "/student/classes", icon: GraduationCap },
          { label: "Materi", href: "/student/materials", icon: BookOpen },
          { label: "Tugas", href: "/student/assignments", icon: FileCheck2 },
          { label: "Profil", href: "/student/profile", icon: User },
        ].map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/student/dashboard" && pathname.startsWith(item.href + "/"));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all",
                isActive
                  ? "text-cyan-600 font-extrabold"
                  : "text-slate-500 hover:text-slate-900 font-medium"
              )}
            >
              <div
                className={cn(
                  "p-1 rounded-lg transition-all",
                  isActive ? "bg-cyan-50 text-cyan-600" : ""
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "stroke-[2.5]" : "stroke-[1.8]")} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
