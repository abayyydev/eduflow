const mysql = require("mysql2/promise");
const crypto = require("crypto");

async function seedRichMaterials() {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "eduflow",
  });

  console.log("Connected to MySQL for seeding rich materials...");

  // 1. Get classes
  const [classesList] = await connection.execute(
    "SELECT id, display_name FROM classes WHERE status = 'active'"
  );

  console.log(`Found ${classesList.length} active classes.`);

  // 2. Get a lecturer to set createdBy
  const [lecturers] = await connection.execute(
    "SELECT id FROM lecturers LIMIT 1"
  );
  const lecturerId = lecturers[0]?.id || "system";

  // Sample materials matching the user screenshots exactly
  const sampleSections = [
    {
      sectionName: "MATERI 1: PERSIAPAN DEVELOPMENT TOOLS",
      items: [
        {
          title: "Instalasi Vs Code / Antigravity IDE",
          materialType: "article",
          contentBody: `VS Code & Antigravity IDE Setup

VS Code adalah singkatan dari Visual Studio Code, yaitu editor kode sumber (source code editor) yang dikembangkan oleh Microsoft untuk membantu membuat, mengedit, dan mengelola program komputer.

Panduan Instalasi:
1. Kunjungi situs resmi Visual Studio Code atau Antigravity IDE.
2. Unduh installer sesuai sistem operasi Anda (Windows, macOS, atau Linux).
3. Jalankan berkas installer dan ikuti instruksi pada layar (disarankan mencentang opsi "Add to PATH").
4. Setelah selesai, buka aplikasi dan pastikan integrasi terminal berjalan lancar.`,
          durationMinutes: 2,
        },
        {
          title: "Instalasi Git",
          materialType: "article",
          contentBody: `Panduan Instalasi Git Version Control

Git adalah sistem kendali versi terdistribusi (Distributed Version Control System) untuk melacak perubahan kode program selama proses pengembangan perangkat lunak.

Langkah Instalasi:
1. Kunjungi git-scm.com dan unduh versi terbaru.
2. Pilih pengaturan default, terutama integrasi Git Bash.
3. Buka terminal lalu verifikasi dengan perintah:
   \`git --version\`
4. Lakukan konfigurasi identitas global:
   \`git config --global user.name "Nama Anda"\`
   \`git config --global user.email "email@anda.com"\``,
          durationMinutes: 3,
        },
        {
          title: "Membuat Akun Github dan Personal Access Token",
          materialType: "article",
          contentBody: `Konfigurasi Akun GitHub & SSH / Access Token

Untuk mempublikasikan repositori lokal ke cloud repository, kita memerlukan akun GitHub.
Langkah-langkah:
1. Registrasi di https://github.com
2. Masuk ke Settings -> Developer Settings -> Personal access tokens (classic).
3. Buat token baru dengan scope 'repo' dan 'workflow'.
4. Simpan token di tempat yang aman karena token ini menggantikan kata sandi saat push kode melalui terminal.`,
          durationMinutes: 2,
        },
        {
          title: "Instalasi Node.js & NPM",
          materialType: "article",
          contentBody: `Instalasi Node.js LTS

Node.js adalah JavaScript runtime environment berbasis V8 JavaScript engine Chrome.
1. Unduh versi LTS (Long Term Support) dari https://nodejs.org
2. Jalankan installer hingga selesai.
3. Verifikasi instalasi:
   \`node -v\`
   \`npm -v\``,
          durationMinutes: 2,
        },
      ],
    },
    {
      sectionName: "MATERI 2: GENERATE PROJECT",
      items: [
        {
          title: "Tutorial Pembuatan Project & push ke github/vercel",
          materialType: "video",
          externalUrl: "https://drive.google.com/file/d/1kFVVeDWggS__fHX2BSoR3AwsLjb48eX_/preview",
          contentBody: "Video tutorial pembuatan project Next.js dan cara integrasi continuous deployment ke GitHub dan Vercel.",
          durationMinutes: 15,
        },
      ],
    },
    {
      sectionName: "MATERI 3: SLIDE PANDUAN LENGKAP & MASTER PROMPT AI CAPACITOR",
      items: [
        {
          title: "Membungkus Aplikasi Next.js dengan Capacitor",
          materialType: "article",
          contentBody: `Membungkus Aplikasi Next.js dengan Capacitor

Capacitor adalah cross-platform native runtime open source dari Ionic yang memungkinkan Anda membangun aplikasi web modern dan menjalankannya di iOS, Android, Electron, dan Web dengan basis kode tunggal.

Kelebihan Integrasi:
- Menggunakan standar web modern (HTML, CSS, TypeScript).
- Akses ke native API seperti Kamera, Notifikasi, Geolocation, dan Biometrik.
- Mendukung pembaruan live melalui Server URL Mode tanpa submit ulang ke Play Store.`,
          durationMinutes: 4,
        },
        {
          title: "Slide Panduan Lengkap",
          materialType: "pdf",
          externalUrl: "https://drive.google.com/file/d/1aA_3i1FpF8kPsCiVC0u2ljkYjAhlyESr/preview",
          contentBody: "Slide presentasi panduan lengkap Convert Web App ke Android dengan Capacitor dan AI Coding Agent.",
          durationMinutes: 10,
        },
        {
          title: "Tutorial Convert With AI",
          materialType: "video",
          externalUrl: "https://drive.google.com/file/d/1kFVVeDWggS__fHX2BSoR3AwsLjb48eX_/preview",
          contentBody: "Langkah otomatisasi pembuatan APK Android menggunakan AI Agent Antigravity.",
          durationMinutes: 12,
        },
        {
          title: "Installasi di Handphone",
          materialType: "article",
          contentBody: `Langkah Instalasi APK pada Perangkat Android

1. Transfer berkas .apk hasil build ke smartphone Anda.
2. Buka berkas APK melalui File Manager.
3. Izinkan 'Install from unknown sources' jika diminta.
4. Buka aplikasi dan pastikan konektivitas server Vercel berfungsi dengan baik.`,
          durationMinutes: 3,
        },
      ],
    },
    {
      sectionName: "MATERI 4: KONSEP PENTING - CARA UPDATE TANPA INSTALL ULANG",
      items: [
        {
          title: "Memahami Server URL Mode: Update Tanpa Perlu Install Ulang",
          materialType: "article",
          contentBody: `Memahami Server URL Mode: Update Tanpa Perlu Install Ulang

Salah satu keputusan konfigurasi terpenting dalam Master Prompt adalah penggunaan Server URL Mode — yaitu mengarahkan aplikasi Android untuk memuat tampilannya langsung dari \`https://cashflow-alpha-ten.vercel.app/\`.

Dengan pendekatan ini, aplikasi Android yang terpasang di perangkat pengguna sebenarnya bertindak sebagai jendela menuju website Anda yang sudah live di Vercel, bukan menyimpan salinan statis dari tampilan aplikasi.

Keuntungan: Update Otomatis Tanpa Re-install
Karena tampilan dimuat langsung dari server, proses update menjadi sangat sederhana:
1. Anda mengubah tampilan, memperbaiki bug, atau menambahkan menu baru pada kode Next.js.
2. Push commit ke repository GitHub Anda.
3. Vercel akan otomatis melakukan build dan deploy versi terbaru secara instan.
4. Saat pengguna membuka aplikasi Android, mereka langsung melihat versi website terbaru tanpa perlu mengunduh APK baru atau melakukan update melalui Google Play Store.`,
          durationMinutes: 3,
        },
      ],
    },
  ];

  for (const cls of classesList) {
    // Check if class already has rich sections
    const [existing] = await connection.execute(
      "SELECT count(*) as cnt FROM learning_materials WHERE class_id = ? AND section_name IS NOT NULL",
      [cls.id]
    );

    if (existing[0].cnt > 0) {
      console.log(`Class ${cls.display_name} already has materials.`);
      continue;
    }

    console.log(`Seeding curriculum into class: ${cls.display_name}`);
    let sort = 1;

    for (const sec of sampleSections) {
      for (const item of sec.items) {
        const matId = crypto.randomUUID();
        await connection.execute(
          `INSERT INTO learning_materials (
            id, class_id, meeting_number, title, material_type, section_name,
            content_body, external_url, sort_order, duration_minutes, created_by, published_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            matId,
            cls.id,
            1,
            item.title,
            item.materialType,
            sec.sectionName,
            item.contentBody,
            item.externalUrl || null,
            sort++,
            item.durationMinutes,
            lecturerId,
          ]
        );
      }
    }
  }

  // Seed sample progress for students so progress bar shows ~81% (matching Image 4)
  const [students] = await connection.execute("SELECT id FROM students LIMIT 5");
  const [allMaterials] = await connection.execute(
    "SELECT id, class_id FROM learning_materials ORDER BY sort_order ASC"
  );

  for (const s of students) {
    // Complete first 7 out of 10 items for each class (~70%-80%)
    const studentMaterials = allMaterials.slice(0, 8);
    for (const m of studentMaterials) {
      try {
        await connection.execute(
          `INSERT IGNORE INTO material_progress (id, student_id, material_id, is_completed, completed_at)
           VALUES (?, ?, ?, 1, NOW())`,
          [crypto.randomUUID(), s.id, m.id]
        );
      } catch (e) {
        // Ignored
      }
    }
  }

  console.log("Rich materials seeding completed successfully!");
  await connection.end();
}

seedRichMaterials().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
