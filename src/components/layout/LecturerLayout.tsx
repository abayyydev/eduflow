"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  FileCheck2,
  BookOpen,
  CalendarCheck,
  Calculator,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";

interface LecturerLayoutProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  children: React.ReactNode;
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mata Kuliah & Kelas", href: "/classes", icon: GraduationCap },
  { label: "Mahasiswa", href: "/students", icon: Users },
  { label: "Tugas", href: "/assignments", icon: FileCheck2 },
  { label: "Materi", href: "/materials", icon: BookOpen },
  { label: "Presensi", href: "/attendance", icon: CalendarCheck },
  { label: "Gradebook", href: "/gradebook", icon: Calculator },
  { label: "Laporan", href: "/reports", icon: BarChart3 },
  { label: "Pengaturan", href: "/settings", icon: Settings },
];

export const LecturerLayout: React.FC<LecturerLayoutProps> = ({ user, children }) => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-white border-r border-[#E4E9F2] transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[248px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E4E9F2]">
          <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-9 w-9 rounded-xl bg-[#2457D6] flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
              E
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base text-[#172033] tracking-tight leading-tight">
                  EDUFlow
                </span>
                <span className="text-[10px] text-[#667085] font-medium uppercase tracking-wider">
                  Dosen Workspace
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033] transition-colors"
            title={collapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                  isActive
                    ? "bg-[#EEF3FF] text-[#2457D6] font-semibold"
                    : "text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-[#2457D6]" : "text-[#667085] group-hover:text-[#172033]"
                  )}
                />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Footer & Logout */}
        <div className="p-3 border-t border-[#E4E9F2]">
          <div
            className={cn(
              "flex items-center gap-3 px-2 py-2 rounded-lg bg-[#F6F8FC]",
              collapsed ? "justify-center" : "justify-between"
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#2457D6]/10 text-[#2457D6] font-semibold flex items-center justify-center text-xs shrink-0">
                {user.name.charAt(0)}
              </div>
              {!collapsed && (
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-[#172033] truncate">{user.name}</p>
                  <p className="text-[11px] text-[#667085] truncate">{user.email}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-md text-[#667085] hover:text-[#C43D4B] hover:bg-white transition-colors"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]"
        )}
      >
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-[#E4E9F2] px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033]"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-medium text-[#667085]">
              Semester Aktif: <span className="font-semibold text-[#172033]">2026/2027 Ganjil</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ThemeSwitcher />

            <Link
              href="/notifications"
              className="p-2 rounded-lg text-[#667085] hover:bg-[#F6F8FC] hover:text-[#172033] relative transition-colors"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2457D6]" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
