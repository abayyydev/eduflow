import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EDUFlow — Personal Academic & Learning Management",
  description:
    "Ruang kerja digital dosen untuk pengelolaan kelas, materi, tugas, presensi, dan gradebook akademik.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F6F8FC] text-[#172033] antialiased">
        {children}
      </body>
    </html>
  );
}
