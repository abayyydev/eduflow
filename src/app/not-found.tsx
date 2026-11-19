import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl border border-[#E4E9F2] shadow-sm space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-[#EEF3FF] text-[#2457D6] flex items-center justify-center mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#172033]">Halaman Tidak Ditemukan</h2>
        <p className="text-xs text-[#667085]">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button variant="primary" size="sm">
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
