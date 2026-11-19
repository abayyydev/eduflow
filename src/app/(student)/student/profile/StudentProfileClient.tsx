"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  KeyRound,
  Edit3,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  updateStudentProfile,
  changeStudentPassword,
} from "@/features/students/profile-actions";
import { useRouter } from "next/navigation";

interface EnrolledClass {
  id: string;
  displayName: string;
  classCode: string;
  courseCode: string;
  courseName: string;
  creditUnits: number | null;
}

interface StudentProfileProps {
  student: {
    id: string;
    name: string;
    email: string;
    studentNumber: string;
    studyProgram: string | null;
    cohort: string | null;
    phone: string | null;
  };
  enrolledClasses: EnrolledClass[];
}

export function StudentProfileClient({
  student,
  enrolledClasses,
}: StudentProfileProps) {
  const router = useRouter();

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Profile Form state
  const [profileName, setProfileName] = useState(student.name);
  const [profilePhone, setProfilePhone] = useState(student.phone || "");
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Global Alert
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setIsSubmittingProfile(true);

    try {
      const res = await updateStudentProfile({
        name: profileName,
        phone: profilePhone,
      });

      if (!res.success) {
        setProfileError(res.error || "Gagal memperbarui profil.");
        setIsSubmittingProfile(false);
        return;
      }

      setIsEditProfileOpen(false);
      showNotification("success", res.message || "Profil berhasil diperbarui.");
      router.refresh();
    } catch {
      setProfileError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Kata sandi baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const res = await changeStudentPassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setPasswordError(res.error || "Gagal mengubah kata sandi.");
        setIsSubmittingPassword(false);
        return;
      }

      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showNotification("success", res.message || "Kata sandi berhasil diubah.");
    } catch {
      setPasswordError("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const totalCredits = enrolledClasses.reduce(
    (acc, c) => acc + (c.creditUnits || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#E8F5EF] border-[#16845B]/30 text-[#16845B]"
              : "bg-[#FCECEE] border-[#C43D4B]/30 text-[#C43D4B]"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172033]">
            Profil Mahasiswa
          </h1>
          <p className="text-sm text-[#667085] mt-0.5">
            Informasi biodata akademik, pengelolaan akun, dan kelas perkuliahan aktif.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setProfileName(student.name);
              setProfilePhone(student.phone || "");
              setProfileError(null);
              setIsEditProfileOpen(true);
            }}
          >
            <Edit3 className="w-4 h-4 mr-1.5" />
            Ubah Data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              setPasswordError(null);
              setIsChangePasswordOpen(true);
            }}
          >
            <KeyRound className="w-4 h-4 mr-1.5" />
            Ganti Kata Sandi
          </Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-[#E4E9F2]">
          <User className="w-5 h-5 text-[#2457D6]" />
          <CardTitle>Biodata Pribadi & Akademik</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#2457D6] to-[#1E45AB] text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-md shadow-[#2457D6]/20">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#172033]">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#667085]">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2457D6]" /> {student.email}
                </span>
                {student.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#16845B]" /> {student.phone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1.5">
                <Badge variant="primary">NIM: {student.studentNumber}</Badge>
                <Badge variant="success">Mahasiswa Aktif</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#E4E9F2]">
            <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
              <span className="text-[11px] font-medium text-[#667085] block">Program Studi</span>
              <span className="font-semibold text-xs text-[#172033] mt-0.5 block truncate">
                {student.studyProgram || "Teknik Informatika"}
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
              <span className="text-[11px] font-medium text-[#667085] block">Tahun Angkatan</span>
              <span className="font-semibold text-xs text-[#172033] mt-0.5 block">
                {student.cohort ? `Angkatan ${student.cohort}` : "—"}
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
              <span className="text-[11px] font-medium text-[#667085] block">Kelas Terdaftar</span>
              <span className="font-semibold text-xs text-[#2457D6] mt-0.5 block">
                {enrolledClasses.length} Kelas Perkuliahan
              </span>
            </div>

            <div className="p-3 bg-[#F6F8FC] rounded-xl border border-[#E4E9F2]">
              <span className="text-[11px] font-medium text-[#667085] block">Beban SKS Semester</span>
              <span className="font-semibold text-xs text-[#16845B] mt-0.5 block">
                {totalCredits} SKS Total
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Classes List */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-3 border-b border-[#E4E9F2]">
          <GraduationCap className="w-5 h-5 text-[#16845B]" />
          <CardTitle>Kelas Terdaftar Semester Ini</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {enrolledClasses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-[#667085]/40 mx-auto mb-2" />
              <p className="text-xs text-[#667085]">
                Anda belum terdaftar di kelas perkuliahan aktif manapun.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E4E9F2]">
              {enrolledClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="py-3.5 flex items-center justify-between text-xs hover:bg-[#F8FAFC] px-2 rounded-lg transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-bold text-[#172033] text-sm">{cls.displayName}</p>
                    <p className="text-[#667085]">
                      {cls.courseCode} &bull; {cls.courseName} &bull; Ruang / Kelas {cls.classCode}
                    </p>
                  </div>
                  <Badge variant="outline" className="font-semibold">
                    {cls.creditUnits || 0} SKS
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Edit Profile */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Ubah Data Profil"
        description="Perbarui informasi data diri dan kontak Anda."
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          {profileError && (
            <div className="p-3 bg-[#FCECEE] border border-[#C43D4B]/20 text-[#C43D4B] text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#172033] mb-1">
              Nomor Induk Mahasiswa (NIM)
            </label>
            <input
              type="text"
              value={student.studentNumber}
              disabled
              className="w-full px-3 py-2 text-xs bg-[#F2F4F7] border border-[#E4E9F2] rounded-lg text-[#667085] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#667085] mt-1">
              NIM tidak dapat diubah sendiri. Hubungi dosen/akademik jika terdapat kekeliruan.
            </p>
          </div>

          <Input
            label="Nama Lengkap"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            required
            placeholder="Masukkan nama lengkap Anda"
          />

          <Input
            label="Nomor WhatsApp / HP"
            value={profilePhone}
            onChange={(e) => setProfilePhone(e.target.value)}
            placeholder="Contoh: 08123456789"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E9F2]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
              disabled={isSubmittingProfile}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingProfile}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Change Password */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Ganti Kata Sandi"
        description="Perbarui kata sandi akun untuk menjaga keamanan akses Anda."
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          {passwordError && (
            <div className="p-3 bg-[#FCECEE] border border-[#C43D4B]/20 text-[#C43D4B] text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <Input
            label="Kata Sandi Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="Masukkan kata sandi lama (default: password123)"
          />

          <Input
            label="Kata Sandi Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
          />

          <Input
            label="Konfirmasi Kata Sandi Baru"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Ulangi kata sandi baru"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E9F2]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
              disabled={isSubmittingPassword}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingPassword}
            >
              Ubah Kata Sandi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
