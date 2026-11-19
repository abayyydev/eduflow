"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  GraduationCap,
  FileCheck2,
  Award,
  User,
  LogOut,
  Bell,
  Menu,
  X,
} from "lucide-react";

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
  { label: "Kelas Saya", href: "/student/classes", icon: GraduationCap },
  { label: "Tugas", href: "/student/assignments", icon: FileCheck2 },
  { label: "Nilai Saya", href: "/student/grades", icon: Award },
  { label: "Profil", href: "/student/profile", icon: User },
];

export const StudentLayout: React.FC<StudentLayoutProps> = ({ user, children }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
      {/* Header Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E4E9F2] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/student/dashboard" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-[#2457D6] flex items-center justify-center text-white font-bold text-lg shadow-sm">
                E
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#172033] tracking-tight leading-tight">
                  EDUFlow
                </span>
                <span className="text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                  Portal Mahasiswa
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#EEF3FF] text-[#2457D6] font-semibold"
                        : "text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033]"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/student/notifications"
              className="p-2 rounded-lg text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033] relative transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2457D6]" />
            </Link>

            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-[#E4E9F2]">
              <div className="w-8 h-8 rounded-full bg-[#2457D6]/10 text-[#2457D6] font-semibold flex items-center justify-center text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-[#172033] leading-tight">{user.name}</p>
                <p className="text-[11px] text-[#667085] leading-tight">{user.email}</p>
              </div>
            </div>

            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="p-2 rounded-lg text-[#667085] hover:text-[#C43D4B] hover:bg-[#F6F8FC] transition-colors"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#667085] hover:bg-[#F6F8FC]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#E4E9F2] bg-white px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                    isActive
                      ? "bg-[#EEF3FF] text-[#2457D6] font-semibold"
                      : "text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033]"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
};
