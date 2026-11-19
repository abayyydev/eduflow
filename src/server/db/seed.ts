import { db } from "./index";
import {
  users,
  lecturers,
  students,
  academicTerms,
  courses,
  classes,
  enrollments,
  gradingCategories,
  assessmentItems,
  assignments,
  submissions,
  submissionVersions,
  grades,
  gradeScales,
  attendanceSessions,
  attendanceRecords,
  learningMaterials,
  notifications,
  auditLogs,
} from "./schema";
import { hashPassword } from "../auth/session";
import { randomUUID } from "crypto";

const allStudentsData = [
  {
    "nim": "2611090062",
    "name": "Abdulaziz Gaafar Abdullah",
    "email": "2611090062@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090058",
    "name": "Abu Zikri Agniya Ilman",
    "email": "2611090058@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090057",
    "name": "Ai Lisna",
    "email": "2611090057@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090021",
    "name": "Alif Sofwan Wibowo",
    "email": "2611090021@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090033",
    "name": "Alika Syah Nurfitri",
    "email": "2611090033@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090002",
    "name": "Auriel Sabrina Zahra",
    "email": "2611090002@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090022",
    "name": "Azka Ni'Ma Alifah",
    "email": "2611090022@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090003",
    "name": "Azka Rohmatul Ula",
    "email": "2611090003@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090063",
    "name": "Bilaal Taqiyuddiin Romadloon",
    "email": "2611090063@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090023",
    "name": "Devina Angel Lanita",
    "email": "2611090023@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090030",
    "name": "Dhenia Layli Maulani",
    "email": "2611090030@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090065",
    "name": "Dinar Zulfikar Mumtaz Sugi",
    "email": "2611090065@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090027",
    "name": "Eva Azra Latifa",
    "email": "2611090027@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090055",
    "name": "Fauzi Zahi Ganedi",
    "email": "2611090055@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090043",
    "name": "Galih Nuria Putra",
    "email": "2611090043@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090064",
    "name": "Ismetias Asan Armando",
    "email": "2611090064@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090032",
    "name": "M. Fikri Asy Syafi'i",
    "email": "2611090032@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090006",
    "name": "Miqdad Haris Al jauzy",
    "email": "2611090006@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090049",
    "name": "Muhamad Farel Alfazri",
    "email": "2611090049@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090060",
    "name": "Muhamad Lutfiansyah",
    "email": "2611090060@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090016",
    "name": "Muhammad Adz Dzikra",
    "email": "2611090016@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090054",
    "name": "Muhammad Fathul Khair",
    "email": "2611090054@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090044",
    "name": "Muhammad Galang Al Mahdi Putra Irawan",
    "email": "2611090044@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090011",
    "name": "Muhammad Najiya Adib Afkar",
    "email": "2611090011@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090013",
    "name": "Muhammad Nur Faizin",
    "email": "2611090013@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090048",
    "name": "Muhammmad Fatih Al-Ghazy",
    "email": "2611090048@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090024",
    "name": "Rahma Aisyah Ramadhan Putri",
    "email": "2611090024@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090018",
    "name": "Rainaldi Nadianto",
    "email": "2611090018@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090061",
    "name": "Rashya Hazimulfikri Widyadhana",
    "email": "2611090061@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090012",
    "name": "Riefaldy Alviansyah",
    "email": "2611090012@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090008",
    "name": "Saif Ghiyats Alkhair",
    "email": "2611090008@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090037",
    "name": "Silmi Kamila aulia",
    "email": "2611090037@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090005",
    "name": "Siti Lutfiah",
    "email": "2611090005@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090050",
    "name": "Sunandra B. Ahmadi",
    "email": "2611090050@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090017",
    "name": "Syahrul Mubarok",
    "email": "2611090017@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090045",
    "name": "Syahrul Ramadhan",
    "email": "2611090045@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090042",
    "name": "Umar Hanif Abdullah",
    "email": "2611090042@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090020",
    "name": "Varez Luniansyah Putra",
    "email": "2611090020@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090010",
    "name": "Vino Ramadan",
    "email": "2611090010@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090034",
    "name": "Zain Muna Nafi'ah",
    "email": "2611090034@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P001",
    "name": "Rayhan Syaqib Aqil",
    "email": "261109p001@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P002",
    "name": "Ridwannullah Al Alawi",
    "email": "261109p002@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P003",
    "name": "Erlan Maulana",
    "email": "261109p003@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P004",
    "name": "Aiko muhamad sukma",
    "email": "261109p004@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P005",
    "name": "M.Rangga",
    "email": "261109p005@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P006",
    "name": "Azkia Raisa Ali Ramadani",
    "email": "261109p006@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "261109P007",
    "name": "Muhammad Nuryayi",
    "email": "261109p007@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090059",
    "name": "Al Zahra Haerani",
    "email": "2611090059@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2611090029",
    "name": "Selfa Arya Nena",
    "email": "2611090029@student.eduflow.ac.id",
    "cohort": "2026",
    "studyProgram": "Teknik Informatika (IT 9 & PPMP)"
  },
  {
    "nim": "2511080026",
    "name": "Adrian Hanafi",
    "email": "2511080026@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080088",
    "name": "Aksel Ramadhansyah",
    "email": "2511080088@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080078",
    "name": "Aqilah Maudiya Shofa",
    "email": "2511080078@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080039",
    "name": "Aufa Islamiyah",
    "email": "2511080039@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080091",
    "name": "Ayu Setiana",
    "email": "2511080091@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080081",
    "name": "Azmi Fathurrizqi",
    "email": "2511080081@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080052",
    "name": "Deka Muhamad Akmal",
    "email": "2511080052@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080019",
    "name": "Fajri Rahmattulloh",
    "email": "2511080019@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080004",
    "name": "Farhan Mujib Ghifary",
    "email": "2511080004@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080029",
    "name": "Fazrul Rohman",
    "email": "2511080029@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080013",
    "name": "Fikri Nur Fauzi Al-Ghifari",
    "email": "2511080013@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080046",
    "name": "Haafizhotus Salsabiila",
    "email": "2511080046@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080083",
    "name": "Hafeedz Rizkiy Amrullah",
    "email": "2511080083@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080085",
    "name": "Hameed Rizky Amruddin",
    "email": "2511080085@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080051",
    "name": "Hani Nurma Ayu",
    "email": "2511080051@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080079",
    "name": "Helza Falisha",
    "email": "2511080079@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080034",
    "name": "Iksan Hadi",
    "email": "2511080034@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080042",
    "name": "Inas Samia Ashalina",
    "email": "2511080042@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080058",
    "name": "Linda Suhendar",
    "email": "2511080058@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080100",
    "name": "M Khusilmiani Rizki Julianto",
    "email": "2511080100@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080031",
    "name": "M. Hafidz Abdurrahman Khalid",
    "email": "2511080031@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080014",
    "name": "M.Naufal Rabbani",
    "email": "2511080014@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080095",
    "name": "Maulana Ardhian Ismail",
    "email": "2511080095@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080070",
    "name": "Mauldi Syah Rein",
    "email": "2511080070@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080020",
    "name": "Mohammad Haiqal Fikrullah",
    "email": "2511080020@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080061",
    "name": "Moza Putri Nugraha",
    "email": "2511080061@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080092",
    "name": "Muhamad Abiel Dhiya Ulhaq",
    "email": "2511080092@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080027",
    "name": "Muhamad Sulaeman Alba Bili",
    "email": "2511080027@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080009",
    "name": "Muhammad Aiman Sayyaf",
    "email": "2511080009@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080025",
    "name": "Muhammad Akmal Jamaludin",
    "email": "2511080025@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080018",
    "name": "Muhammad Billal Siddiq",
    "email": "2511080018@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080062",
    "name": "Muhammad Nadhif Bustomi",
    "email": "2511080062@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080038",
    "name": "Muhammad Rama Idznillah Firmansyah",
    "email": "2511080038@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080010",
    "name": "Muzaid Fathur Rahman",
    "email": "2511080010@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080080",
    "name": "Naila Nur Ihwan",
    "email": "2511080080@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080003",
    "name": "Nazhan Fathurrahman",
    "email": "2511080003@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080056",
    "name": "Nurul Syarifa",
    "email": "2511080056@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080015",
    "name": "Rahayu Keysa Surahman",
    "email": "2511080015@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080048",
    "name": "Raihan Raditha Putra",
    "email": "2511080048@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080054",
    "name": "Sakila Putri Ananda",
    "email": "2511080054@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080086",
    "name": "Syifa Zahira",
    "email": "2511080086@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080067",
    "name": "Usamah Tsalatsa",
    "email": "2511080067@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080028",
    "name": "Virgi Alpiansyah",
    "email": "2511080028@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2511080012",
    "name": "Parhan",
    "email": "2511080012@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 8)"
  },
  {
    "nim": "2411070045",
    "name": "Adam Muamar Kadafi",
    "email": "2411070045@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2311060121",
    "name": "Ali Rachman",
    "email": "2311060121@student.eduflow.ac.id",
    "cohort": "2023",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2511080069",
    "name": "Azzam Maulana",
    "email": "2511080069@student.eduflow.ac.id",
    "cohort": "2025",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070037",
    "name": "Dede Surahman",
    "email": "2411070037@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070005",
    "name": "Dhani Alfarizqi",
    "email": "2411070005@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070081",
    "name": "Diki Anwari",
    "email": "2411070081@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070089",
    "name": "Fakhri Miftahul Khairi",
    "email": "2411070089@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070051",
    "name": "Hariri Ahmad Damyani",
    "email": "2411070051@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070113",
    "name": "Hendi",
    "email": "2411070113@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070090",
    "name": "Masduki",
    "email": "2411070090@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070088",
    "name": "Mochammad Mahmal Hawari",
    "email": "2411070088@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2311060028",
    "name": "Muhamad Maulana Rifki",
    "email": "2311060028@student.eduflow.ac.id",
    "cohort": "2023",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070111",
    "name": "Muhamad Rhifa Alfidza",
    "email": "2411070111@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070092",
    "name": "Muhamad Saifullah Ali",
    "email": "2411070092@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2311060056",
    "name": "Muhammad Hilmi Muzhaffar",
    "email": "2311060056@student.eduflow.ac.id",
    "cohort": "2023",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070053",
    "name": "Muhammad Ikhwan Manshur",
    "email": "2411070053@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070075",
    "name": "Muhammad Naufal Bintoro",
    "email": "2411070075@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070096",
    "name": "Muhammad Rizki Firdaus",
    "email": "2411070096@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070064",
    "name": "Muhammad Syafiq Ardiansyah",
    "email": "2411070064@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  },
  {
    "nim": "2411070084",
    "name": "Muhammad Syams Dzulqarnain",
    "email": "2411070084@student.eduflow.ac.id",
    "cohort": "2024",
    "studyProgram": "Teknik Informatika (IT 7)"
  }
];
const groupsData = {
  "teori_pwf1": [
    {
      "nim": "2611090062",
      "name": "Abdulaziz Gaafar Abdullah"
    },
    {
      "nim": "2611090058",
      "name": "Abu Zikri Agniya Ilman"
    },
    {
      "nim": "2611090057",
      "name": "Ai Lisna"
    },
    {
      "nim": "2611090021",
      "name": "Alif Sofwan Wibowo"
    },
    {
      "nim": "2611090033",
      "name": "Alika Syah Nurfitri"
    },
    {
      "nim": "2611090002",
      "name": "Auriel Sabrina Zahra"
    },
    {
      "nim": "2611090022",
      "name": "Azka Ni'Ma Alifah"
    },
    {
      "nim": "2611090003",
      "name": "Azka Rohmatul Ula"
    },
    {
      "nim": "2611090063",
      "name": "Bilaal Taqiyuddiin Romadloon"
    },
    {
      "nim": "2611090023",
      "name": "Devina Angel Lanita"
    },
    {
      "nim": "2611090030",
      "name": "Dhenia Layli Maulani"
    },
    {
      "nim": "2611090065",
      "name": "Dinar Zulfikar Mumtaz Sugi"
    },
    {
      "nim": "2611090027",
      "name": "Eva Azra Latifa"
    },
    {
      "nim": "2611090055",
      "name": "Fauzi Zahi Ganedi"
    },
    {
      "nim": "2611090043",
      "name": "Galih Nuria Putra"
    },
    {
      "nim": "2611090064",
      "name": "Ismetias Asan Armando"
    },
    {
      "nim": "2611090032",
      "name": "M. Fikri Asy Syafi'i"
    },
    {
      "nim": "2611090006",
      "name": "Miqdad Haris Al jauzy"
    },
    {
      "nim": "2611090049",
      "name": "Muhamad Farel Alfazri"
    },
    {
      "nim": "2611090060",
      "name": "Muhamad Lutfiansyah"
    },
    {
      "nim": "2611090016",
      "name": "Muhammad Adz Dzikra"
    },
    {
      "nim": "2611090054",
      "name": "Muhammad Fathul Khair"
    },
    {
      "nim": "2611090044",
      "name": "Muhammad Galang Al Mahdi Putra Irawan"
    },
    {
      "nim": "2611090011",
      "name": "Muhammad Najiya Adib Afkar"
    },
    {
      "nim": "2611090013",
      "name": "Muhammad Nur Faizin"
    },
    {
      "nim": "2611090048",
      "name": "Muhammmad Fatih Al-Ghazy"
    },
    {
      "nim": "2611090024",
      "name": "Rahma Aisyah Ramadhan Putri"
    },
    {
      "nim": "2611090018",
      "name": "Rainaldi Nadianto"
    },
    {
      "nim": "2611090061",
      "name": "Rashya Hazimulfikri Widyadhana"
    },
    {
      "nim": "2611090012",
      "name": "Riefaldy Alviansyah"
    },
    {
      "nim": "2611090008",
      "name": "Saif Ghiyats Alkhair"
    },
    {
      "nim": "2611090037",
      "name": "Silmi Kamila aulia"
    },
    {
      "nim": "2611090005",
      "name": "Siti Lutfiah"
    },
    {
      "nim": "2611090050",
      "name": "Sunandra B. Ahmadi"
    },
    {
      "nim": "2611090017",
      "name": "Syahrul Mubarok"
    },
    {
      "nim": "2611090045",
      "name": "Syahrul Ramadhan"
    },
    {
      "nim": "2611090042",
      "name": "Umar Hanif Abdullah"
    },
    {
      "nim": "2611090020",
      "name": "Varez Luniansyah Putra"
    },
    {
      "nim": "2611090010",
      "name": "Vino Ramadan"
    },
    {
      "nim": "2611090034",
      "name": "Zain Muna Nafi'ah"
    },
    {
      "nim": "261109P001",
      "name": "Rayhan Syaqib Aqil"
    },
    {
      "nim": "261109P002",
      "name": "Ridwannullah Al Alawi"
    },
    {
      "nim": "261109P003",
      "name": "Erlan Maulana"
    },
    {
      "nim": "261109P004",
      "name": "Aiko muhamad sukma"
    },
    {
      "nim": "261109P005",
      "name": "M.Rangga"
    },
    {
      "nim": "261109P006",
      "name": "Azkia Raisa Ali Ramadani"
    },
    {
      "nim": "261109P007",
      "name": "Muhammad Nuryayi"
    }
  ],
  "prak_desain_03": [
    {
      "nim": "2611090062",
      "name": "Abdulaziz Gaafar Abdullah"
    },
    {
      "nim": "2611090021",
      "name": "Alif Sofwan Wibowo"
    },
    {
      "nim": "2611090063",
      "name": "Bilaal Taqiyuddiin Romadloon"
    },
    {
      "nim": "2611090032",
      "name": "M. Fikri Asy Syafi'i"
    },
    {
      "nim": "2611090006",
      "name": "Miqdad Haris Al jauzy"
    },
    {
      "nim": "2611090060",
      "name": "Muhamad Lutfiansyah"
    },
    {
      "nim": "2611090016",
      "name": "Muhammad Adz Dzikra"
    },
    {
      "nim": "2611090011",
      "name": "Muhammad Najiya Adib Afkar"
    },
    {
      "nim": "2611090013",
      "name": "Muhammad Nur Faizin"
    },
    {
      "nim": "2611090018",
      "name": "Rainaldi Nadianto"
    },
    {
      "nim": "2611090061",
      "name": "Rashya Hazimulfikri Widyadhana"
    },
    {
      "nim": "2611090012",
      "name": "Riefaldy Alviansyah"
    },
    {
      "nim": "2611090008",
      "name": "Saif Ghiyats Alkhair"
    },
    {
      "nim": "2611090017",
      "name": "Syahrul Mubarok"
    },
    {
      "nim": "2611090020",
      "name": "Varez Luniansyah Putra"
    },
    {
      "nim": "2611090010",
      "name": "Vino Ramadan"
    }
  ],
  "prak_desain_02": [
    {
      "nim": "2611090058",
      "name": "Abu Zikri Agniya Ilman"
    },
    {
      "nim": "261109P004",
      "name": "Aiko muhamad sukma"
    },
    {
      "nim": "2611090065",
      "name": "Dinar Zulfikar Mumtaz Sugi"
    },
    {
      "nim": "261109P003",
      "name": "Erlan Maulana"
    },
    {
      "nim": "2611090055",
      "name": "Fauzi Zahi Ganedi"
    },
    {
      "nim": "2611090043",
      "name": "Galih Nuria Putra"
    },
    {
      "nim": "2611090064",
      "name": "Ismetias Asan Armando"
    },
    {
      "nim": "261109P005",
      "name": "M.Rangga"
    },
    {
      "nim": "2611090049",
      "name": "Muhamad Farel Alfazri"
    },
    {
      "nim": "2611090054",
      "name": "Muhammad Fathul Khair"
    },
    {
      "nim": "2611090044",
      "name": "Muhammad Galang Al Mahdi Putra Irawan"
    },
    {
      "nim": "2611090048",
      "name": "Muhammmad Fatih Al-Ghazy"
    },
    {
      "nim": "261109P001",
      "name": "Rayhan Syaqib Aqil"
    },
    {
      "nim": "261109P002",
      "name": "Ridwannullah Al Alawi"
    },
    {
      "nim": "2611090050",
      "name": "Sunandra B. Ahmadi"
    },
    {
      "nim": "2611090045",
      "name": "Syahrul Ramadhan"
    },
    {
      "nim": "2611090042",
      "name": "Umar Hanif Abdullah"
    }
  ],
  "prak_desain_01": [
    {
      "nim": "2611090057",
      "name": "Ai Lisna"
    },
    {
      "nim": "2611090059",
      "name": "Al Zahra Haerani"
    },
    {
      "nim": "2611090033",
      "name": "Alika Syah Nurfitri"
    },
    {
      "nim": "2611090002",
      "name": "Auriel Sabrina Zahra"
    },
    {
      "nim": "2611090022",
      "name": "Azka Ni'Ma Alifah"
    },
    {
      "nim": "2611090003",
      "name": "Azka Rohmatul Ula"
    },
    {
      "nim": "261109P006",
      "name": "Azkia Raisa Ali Ramadani"
    },
    {
      "nim": "2611090023",
      "name": "Devina Angel Lanita"
    },
    {
      "nim": "2611090030",
      "name": "Dhenia Layli Maulani"
    },
    {
      "nim": "2611090027",
      "name": "Eva Azra Latifa"
    },
    {
      "nim": "2611090024",
      "name": "Rahma Aisyah Ramadhan Putri"
    },
    {
      "nim": "2611090029",
      "name": "Selfa Arya Nena"
    },
    {
      "nim": "2611090037",
      "name": "Silmi Kamila aulia"
    },
    {
      "nim": "2611090005",
      "name": "Siti Lutfiah"
    },
    {
      "nim": "2611090034",
      "name": "Zain Muna Nafi'ah"
    }
  ],
  "it8_all": [
    {
      "nim": "2511080026",
      "name": "Adrian Hanafi"
    },
    {
      "nim": "2511080088",
      "name": "Aksel Ramadhansyah"
    },
    {
      "nim": "2511080078",
      "name": "Aqilah Maudiya Shofa"
    },
    {
      "nim": "2511080039",
      "name": "Aufa Islamiyah"
    },
    {
      "nim": "2511080091",
      "name": "Ayu Setiana"
    },
    {
      "nim": "2511080081",
      "name": "Azmi Fathurrizqi"
    },
    {
      "nim": "2511080052",
      "name": "Deka Muhamad Akmal"
    },
    {
      "nim": "2511080019",
      "name": "Fajri Rahmattulloh"
    },
    {
      "nim": "2511080004",
      "name": "Farhan Mujib Ghifary"
    },
    {
      "nim": "2511080029",
      "name": "Fazrul Rohman"
    },
    {
      "nim": "2511080013",
      "name": "Fikri Nur Fauzi Al-Ghifari"
    },
    {
      "nim": "2511080046",
      "name": "Haafizhotus Salsabiila"
    },
    {
      "nim": "2511080083",
      "name": "Hafeedz Rizkiy Amrullah"
    },
    {
      "nim": "2511080085",
      "name": "Hameed Rizky Amruddin"
    },
    {
      "nim": "2511080051",
      "name": "Hani Nurma Ayu"
    },
    {
      "nim": "2511080079",
      "name": "Helza Falisha"
    },
    {
      "nim": "2511080034",
      "name": "Iksan Hadi"
    },
    {
      "nim": "2511080042",
      "name": "Inas Samia Ashalina"
    },
    {
      "nim": "2511080058",
      "name": "Linda Suhendar"
    },
    {
      "nim": "2511080100",
      "name": "M Khusilmiani Rizki Julianto"
    },
    {
      "nim": "2511080031",
      "name": "M. Hafidz Abdurrahman Khalid"
    },
    {
      "nim": "2511080014",
      "name": "M.Naufal Rabbani"
    },
    {
      "nim": "2511080095",
      "name": "Maulana Ardhian Ismail"
    },
    {
      "nim": "2511080070",
      "name": "Mauldi Syah Rein"
    },
    {
      "nim": "2511080020",
      "name": "Mohammad Haiqal Fikrullah"
    },
    {
      "nim": "2511080061",
      "name": "Moza Putri Nugraha"
    },
    {
      "nim": "2511080092",
      "name": "Muhamad Abiel Dhiya Ulhaq"
    },
    {
      "nim": "2511080027",
      "name": "Muhamad Sulaeman Alba Bili"
    },
    {
      "nim": "2511080009",
      "name": "Muhammad Aiman Sayyaf"
    },
    {
      "nim": "2511080025",
      "name": "Muhammad Akmal Jamaludin"
    },
    {
      "nim": "2511080018",
      "name": "Muhammad Billal Siddiq"
    },
    {
      "nim": "2511080062",
      "name": "Muhammad Nadhif Bustomi"
    },
    {
      "nim": "2511080038",
      "name": "Muhammad Rama Idznillah Firmansyah"
    },
    {
      "nim": "2511080010",
      "name": "Muzaid Fathur Rahman"
    },
    {
      "nim": "2511080080",
      "name": "Naila Nur Ihwan"
    },
    {
      "nim": "2511080003",
      "name": "Nazhan Fathurrahman"
    },
    {
      "nim": "2511080056",
      "name": "Nurul Syarifa"
    },
    {
      "nim": "2511080015",
      "name": "Rahayu Keysa Surahman"
    },
    {
      "nim": "2511080048",
      "name": "Raihan Raditha Putra"
    },
    {
      "nim": "2511080054",
      "name": "Sakila Putri Ananda"
    },
    {
      "nim": "2511080086",
      "name": "Syifa Zahira"
    },
    {
      "nim": "2511080067",
      "name": "Usamah Tsalatsa"
    },
    {
      "nim": "2511080028",
      "name": "Virgi Alpiansyah"
    },
    {
      "nim": "2511080012",
      "name": "Parhan"
    }
  ],
  "it7_kelompok2": [
    {
      "nim": "2411070045",
      "name": "Adam Muamar Kadafi"
    },
    {
      "nim": "2311060121",
      "name": "Ali Rachman"
    },
    {
      "nim": "2511080069",
      "name": "Azzam Maulana"
    },
    {
      "nim": "2411070037",
      "name": "Dede Surahman"
    },
    {
      "nim": "2411070005",
      "name": "Dhani Alfarizqi"
    },
    {
      "nim": "2411070081",
      "name": "Diki Anwari"
    },
    {
      "nim": "2411070089",
      "name": "Fakhri Miftahul Khairi"
    },
    {
      "nim": "2411070051",
      "name": "Hariri Ahmad Damyani"
    },
    {
      "nim": "2411070113",
      "name": "Hendi"
    },
    {
      "nim": "2411070090",
      "name": "Masduki"
    },
    {
      "nim": "2411070088",
      "name": "Mochammad Mahmal Hawari"
    },
    {
      "nim": "2311060028",
      "name": "Muhamad Maulana Rifki"
    },
    {
      "nim": "2411070111",
      "name": "Muhamad Rhifa Alfidza"
    },
    {
      "nim": "2411070092",
      "name": "Muhamad Saifullah Ali"
    },
    {
      "nim": "2311060056",
      "name": "Muhammad Hilmi Muzhaffar"
    },
    {
      "nim": "2411070053",
      "name": "Muhammad Ikhwan Manshur"
    },
    {
      "nim": "2411070075",
      "name": "Muhammad Naufal Bintoro"
    },
    {
      "nim": "2411070096",
      "name": "Muhammad Rizki Firdaus"
    },
    {
      "nim": "2411070064",
      "name": "Muhammad Syafiq Ardiansyah"
    },
    {
      "nim": "2411070084",
      "name": "Muhammad Syams Dzulqarnain"
    }
  ]
};

async function main() {
  console.log("🌱 Memulai Seed Database EDUFlow dengan Data Riil Mahasiswa & Jadwal...");

  // 1. Bersihkan tabel dalam urutan relasi foreign key
  await db.delete(notifications);
  await db.delete(auditLogs);
  await db.delete(attendanceRecords);
  await db.delete(attendanceSessions);
  await db.delete(grades);
  await db.delete(submissionVersions);
  await db.delete(submissions);
  await db.delete(assignments);
  await db.delete(assessmentItems);
  await db.delete(gradingCategories);
  await db.delete(gradeScales);
  await db.delete(learningMaterials);
  await db.delete(enrollments);
  await db.delete(classes);
  await db.delete(courses);
  await db.delete(academicTerms);
  await db.delete(students);
  await db.delete(lecturers);
  await db.delete(users);

  const defaultPasswordHash = await hashPassword("password123");

  // 2. Superadmin di tabel users
  const superadminId = randomUUID();
  await db.insert(users).values({
    id: superadminId,
    name: "System Superadmin",
    email: "admin@eduflow.test",
    passwordHash: defaultPasswordHash,
    role: "superadmin",
    isActive: true,
  });
  console.log("✓ Superadmin: admin@eduflow.test (password: password123)");

  // 3. Dosen di tabel lecturers
  const lecturerId = randomUUID();
  await db.insert(lecturers).values({
    id: lecturerId,
    name: "Dr. Budi Santoso, M.Kom.",
    email: "dosen@eduflow.test",
    passwordHash: defaultPasswordHash,
    nip: "198001012005011001",
    academicTitle: "Doktor Ilmu Komputer",
    institutionName: "Universitas Teknologi",
    phone: "081234567890",
    isActive: true,
  });
  console.log("✓ Dosen: dosen@eduflow.test (password: password123)");

  // 4. Input 113 Mahasiswa ke tabel students
  const studentIdByNim = new Map<string, string>();

  for (const s of allStudentsData) {
    const sId = randomUUID();
    studentIdByNim.set(s.nim, sId);

    await db.insert(students).values({
      id: sId,
      name: s.name,
      email: s.email,
      passwordHash: defaultPasswordHash,
      studentNumber: s.nim,
      studyProgram: s.studyProgram,
      cohort: s.cohort,
      phone: null,
      isActive: true,
    });
  }
  console.log(`✓ ${allStudentsData.length} Mahasiswa berhasil dibuat (login via NIM / Email, password: password123)`);

  // 5. Semester Aktif
  const termId = randomUUID();
  await db.insert(academicTerms).values({
    id: termId,
    name: "2026/2027 Ganjil",
    academicYear: "2026/2027",
    semester: "ganjil",
    startsOn: "2026-09-01",
    endsOn: "2027-01-31",
    isActive: true,
  });

  // 6. Mata Kuliah (Courses)
  const cPWF1Id = randomUUID();
  const cPWP1Id = randomUUID();
  const cPW2Id = randomUUID();
  const cPV2Id = randomUUID();
  const cPW3Id = randomUUID();

  await db.insert(courses).values([
    {
      id: cPWF1Id,
      code: "PWF101",
      name: "Pemrograman Web Fundamental I",
      description: "Konsep dasar web, arsitektur client-server, protokol HTTP, semantic HTML5, dan modern CSS.",
      creditUnits: 2,
      lecturerId: lecturerId,
    },
    {
      id: cPWP1Id,
      code: "PWP101",
      name: "Praktikum Pemrograman Web Fundamental I",
      description: "Praktikum laboratorium desain antarmuka, layout responsif, dan styling modern.",
      creditUnits: 1,
      lecturerId: lecturerId,
    },
    {
      id: cPW2Id,
      code: "PW201",
      name: "Pemrograman Web II",
      description: "Pengembangan web dinamis, JavaScript modern, manipulasi DOM, AJAX, dan arsitektur RESTful API.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
    {
      id: cPV2Id,
      code: "PV201",
      name: "Pemrograman Visual II",
      description: "Pengembangan aplikasi visual desktop dan GUI modern, event-driven architecture, dan integrasi database.",
      creditUnits: 2,
      lecturerId: lecturerId,
    },
    {
      id: cPW3Id,
      code: "PW301",
      name: "Pemrograman Web III",
      description: "Aplikasi web fullstack tingkat lanjut, React, Next.js, ORM, otentikasi sesi, dan cloud deployment.",
      creditUnits: 3,
      lecturerId: lecturerId,
    },
  ]);
  console.log("✓ 5 Mata Kuliah dibuat");

  // 7. 8 Kelas Perkuliahan sesuai Jadwal
  const clsPwf1Teori = randomUUID();
  const clsPwf1Desain03 = randomUUID();
  const clsPwf1Desain02 = randomUUID();
  const clsPwf1Desain01 = randomUUID();
  const clsPw2TP = randomUUID();
  const clsPv2KelA = randomUUID();
  const clsPv2KelB = randomUUID();
  const clsPw3Kel2 = randomUUID();

  const allClasses = [
    {
      id: clsPwf1Teori,
      courseId: cPWF1Id,
      academicTermId: termId,
      classCode: "REG-PAGI",
      displayName: "Teori Pemrograman Web Fundamental I (IT 9 & PPMP - Reguler Pagi)",
      scheduleText: "Kamis, 09.00 - 10.30 WIB (Ruang R.C2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain03,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.03",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.03)",
      scheduleText: "Kamis, 13.00 - 14.30 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain02,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.02",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.02)",
      scheduleText: "Kamis, 14.30 - 16.00 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPwf1Desain01,
      courseId: cPWP1Id,
      academicTermId: termId,
      classCode: "DESAIN.01",
      displayName: "Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.01)",
      scheduleText: "Kamis, 16.00 - 17.30 WIB (Ruang R.D2)",
      status: "active" as const,
    },
    {
      id: clsPw2TP,
      courseId: cPW2Id,
      academicTermId: termId,
      classCode: "REG-PAGI",
      displayName: "T + P Pemrograman Web II (IT 8 - Reguler Pagi)",
      scheduleText: "Jum'at, 13.00 - 15.00 WIB (Ruang R.B2)",
      status: "active" as const,
    },
    {
      id: clsPv2KelA,
      courseId: cPV2Id,
      academicTermId: termId,
      classCode: "KEL.A",
      displayName: "Pemrograman Visual II (IT 8 - Reguler Malam Kel.A)",
      scheduleText: "Jum'at, 18.45 - 20.15 WIB (Ruang R.B3)",
      status: "active" as const,
    },
    {
      id: clsPv2KelB,
      courseId: cPV2Id,
      academicTermId: termId,
      classCode: "KEL.B",
      displayName: "Pemrograman Visual II (IT 8 - Reguler Malam Kel.B)",
      scheduleText: "Jum'at, 20.15 - 21.45 WIB (Ruang R.B3)",
      status: "active" as const,
    },
    {
      id: clsPw3Kel2,
      courseId: cPW3Id,
      academicTermId: termId,
      classCode: "KEL.2",
      displayName: "Pemrograman Web III (IT 7 - Kelompok 2)",
      scheduleText: "Senin, 18.30 - 20.00 WIB (Ruang R.D2)",
      status: "active" as const,
    },
  ];

  await db.insert(classes).values(allClasses);
  console.log("✓ 8 Kelas Perkuliahan sesuai Jadwal dibuat");

  // 8. Enrollments
  // A. Teori PWF1 (47 mahasiswa teori + 2 desain.01 jika belum ada)
  const it9Set = new Set<string>();
  groupsData.teori_pwf1.forEach((s: { nim: string }) => it9Set.add(s.nim));
  groupsData.prak_desain_01.forEach((s: { nim: string }) => it9Set.add(s.nim));

  for (const nim of Array.from(it9Set)) {
    const sId = studentIdByNim.get(nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Teori,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // B. Prak Desain 03
  for (const s of groupsData.prak_desain_03) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain03,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // C. Prak Desain 02
  for (const s of groupsData.prak_desain_02) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain02,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // D. Prak Desain 01
  for (const s of groupsData.prak_desain_01) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPwf1Desain01,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // E. T + P Pemrograman Web II (44 mahasiswa IT 8)
  for (const s of groupsData.it8_all) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPw2TP,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // F. Pemrograman Visual II Malam Kel A (22 mahasiswa) & Kel B (22 mahasiswa)
  const it8Students = groupsData.it8_all;
  for (let i = 0; i < it8Students.length; i++) {
    const sId = studentIdByNim.get(it8Students[i].nim);
    if (sId) {
      const targetClass = i < 22 ? clsPv2KelA : clsPv2KelB;
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: targetClass,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }

  // G. Pemrograman Web III (20 mahasiswa IT 7)
  for (const s of groupsData.it7_kelompok2) {
    const sId = studentIdByNim.get(s.nim);
    if (sId) {
      await db.insert(enrollments).values({
        id: randomUUID(),
        classId: clsPw3Kel2,
        studentId: sId,
        enrollmentStatus: "active",
      });
    }
  }
  console.log("✓ Seluruh Mahasiswa berhasil di-enroll ke masing-masing kelas");

  // 9. Standard Grade Scales untuk semua 8 kelas
  const standardScales = [
    { letterGrade: "A", minScore: "85.00", maxScore: "100.00", gradePoint: "4.00" },
    { letterGrade: "A-", minScore: "80.00", maxScore: "84.99", gradePoint: "3.70" },
    { letterGrade: "B+", minScore: "75.00", maxScore: "79.99", gradePoint: "3.30" },
    { letterGrade: "B", minScore: "70.00", maxScore: "74.99", gradePoint: "3.00" },
    { letterGrade: "B-", minScore: "65.00", maxScore: "69.99", gradePoint: "2.70" },
    { letterGrade: "C+", minScore: "60.00", maxScore: "64.99", gradePoint: "2.30" },
    { letterGrade: "C", minScore: "55.00", maxScore: "59.99", gradePoint: "2.00" },
    { letterGrade: "D", minScore: "40.00", maxScore: "54.99", gradePoint: "1.00" },
    { letterGrade: "E", minScore: "0.00", maxScore: "39.99", gradePoint: "0.00" },
  ];

  for (const c of allClasses) {
    for (const sc of standardScales) {
      await db.insert(gradeScales).values({
        id: randomUUID(),
        classId: c.id,
        ...sc,
      });
    }
  }

  // 10. Komponen Penilaian (Bobot total 100%) untuk Kelas Teori PWF1
  const catPresensiId = randomUUID();
  const catTugasId = randomUUID();
  const catUTSId = randomUUID();
  const catUASId = randomUUID();

  await db.insert(gradingCategories).values([
    {
      id: catPresensiId,
      classId: clsPwf1Teori,
      name: "Presensi",
      weightPercent: "10.00",
      aggregationMethod: "average",
      isRequired: false,
      sortOrder: 1,
    },
    {
      id: catTugasId,
      classId: clsPwf1Teori,
      name: "Tugas Mandiri",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 2,
    },
    {
      id: catUTSId,
      classId: clsPwf1Teori,
      name: "Ujian Tengah Semester",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 3,
    },
    {
      id: catUASId,
      classId: clsPwf1Teori,
      name: "Ujian Akhir Semester",
      weightPercent: "30.00",
      aggregationMethod: "average",
      isRequired: true,
      sortOrder: 4,
    },
  ]);

  // Assessment Items untuk Teori PWF1
  const itemTugas1Id = randomUUID();
  const itemTugas2Id = randomUUID();
  const itemUTSId = randomUUID();
  const itemPresensiId = randomUUID();

  await db.insert(assessmentItems).values([
    {
      id: itemTugas1Id,
      categoryId: catTugasId,
      title: "Tugas 1 - Struktur HTML Semantik & Semantic Tags",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemTugas2Id,
      categoryId: catTugasId,
      title: "Tugas 2 - Tata Letak Layout CSS Grid & Flexbox",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemUTSId,
      categoryId: catUTSId,
      title: "UTS Teori Pemrograman Web Fundamental",
      maxScore: "100.00",
      isPublished: true,
    },
    {
      id: itemPresensiId,
      categoryId: catPresensiId,
      title: "Rekap Kehadiran Kuliah",
      maxScore: "100.00",
      isPublished: true,
    },
  ]);

  // Assignment Tugas 1
  const asg1Id = randomUUID();
  await db.insert(assignments).values({
    id: asg1Id,
    classId: clsPwf1Teori,
    title: "Tugas 1 - Implementasi Web Semantik HTML5",
    instructions: "Buat halaman web profil pribadi menggunakan tag semantik HTML5 murni tanpa framework, sertakan link repository GitHub dan screenshot hasil tampilan.",
    maxScore: "100.00",
    dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    submissionMode: "both",
    status: "published",
    assessmentItemId: itemTugas1Id,
  });

  // Contoh Submission beberapa mahasiswa
  const sampleStudentNims = ["2611090062", "2611090058", "2611090057", "2611090021"];
  for (let i = 0; i < sampleStudentNims.length; i++) {
    const sId = studentIdByNim.get(sampleStudentNims[i]);
    if (!sId) continue;

    const subId = randomUUID();
    const isGraded = i < 2;
    const scoreVal = isGraded ? (88 + i * 5).toString() : null;

    await db.insert(submissions).values({
      id: subId,
      assignmentId: asg1Id,
      studentId: sId,
      status: isGraded ? "graded" : "submitted",
      submittedAt: new Date(),
      currentVersion: 1,
      score: scoreVal,
      feedback: isGraded ? "Struktur kode semantik sangat baik dan rapi." : null,
      gradedBy: isGraded ? lecturerId : null,
      gradedAt: isGraded ? new Date() : null,
    });

    await db.insert(submissionVersions).values({
      id: randomUUID(),
      submissionId: subId,
      versionNumber: 1,
      originalFilename: `tugas1_${sampleStudentNims[i]}.zip`,
      externalUrl: "https://github.com/example/student-web-profile",
      note: "Pengumpulan tugas tepat waktu.",
    });

    if (isGraded) {
      await db.insert(grades).values({
        id: randomUUID(),
        assessmentItemId: itemTugas1Id,
        studentId: sId,
        score: scoreVal,
        feedback: "Struktur kode semantik sangat baik.",
        gradedBy: lecturerId,
        gradedAt: new Date(),
      });
    }
  }

  // 11. Presensi Perkuliahan (Sesi 1 s/d 4 Kamis untuk Teori PWF1)
  const kamisDates = ["2026-09-03", "2026-09-10", "2026-09-17", "2026-09-24"];
  for (let ses = 1; ses <= kamisDates.length; ses++) {
    const sessId = randomUUID();
    await db.insert(attendanceSessions).values({
      id: sessId,
      classId: clsPwf1Teori,
      meetingNumber: ses,
      sessionDate: kamisDates[ses - 1],
      topic: `Pertemuan ${ses}: Pembahasan Materi Teori Web & Arsitektur Client-Server`,
    });

    let count = 0;
    for (const nim of Array.from(it9Set)) {
      const sId = studentIdByNim.get(nim);
      if (!sId) continue;
      count++;
      const status = count === 10 ? "sick" : count === 15 ? "excused" : "present";
      await db.insert(attendanceRecords).values({
        id: randomUUID(),
        sessionId: sessId,
        studentId: sId,
        status: status,
        updatedBy: lecturerId,
      });
    }
  }

  // 12. Materi Pembelajaran (Learning Materials)
  await db.insert(learningMaterials).values([
    {
      id: randomUUID(),
      classId: clsPwf1Teori,
      meetingNumber: 1,
      title: "Slide Pertemuan 1 - Konsep Web & Protokol HTTP/HTTPS",
      description: "Pengenalan arsitektur website, protokol komunikasi HTTP, status code, dan request-response cycle.",
      externalUrl: "https://slides.eduflow.ac.id/pwf1-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPwf1Teori,
      meetingNumber: 2,
      title: "Slide Pertemuan 2 - HTML5 Semantics & Form Controls",
      description: "Elemen semantik header, nav, main, section, aside, footer, dan form validation murni.",
      externalUrl: "https://slides.eduflow.ac.id/pwf1-pertemuan-2",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPw2TP,
      meetingNumber: 1,
      title: "Pertemuan 1 - Arsitektur Web Modern & REST API",
      description: "Konsep endpoint RESTful API, HTTP verbs, payload JSON, dan fetch data asynchronous.",
      externalUrl: "https://slides.eduflow.ac.id/pw2-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
    {
      id: randomUUID(),
      classId: clsPw3Kel2,
      meetingNumber: 1,
      title: "Pertemuan 1 - Pengenalan Next.js App Router & Server Actions",
      description: "Arsitektur hybrid React Server Components, server actions, dan integrasi database Drizzle MySQL.",
      externalUrl: "https://slides.eduflow.ac.id/pw3-pertemuan-1",
      createdBy: lecturerId,
      publishedAt: new Date(),
    },
  ]);

  // 13. Notifikasi Sistem
  await db.insert(notifications).values([
    {
      id: randomUUID(),
      userId: lecturerId,
      title: "Jadwal Semester Ganjil 2026/2027 Aktif",
      body: "8 Kelas perkuliahan telah terkonfigurasi lengkap dengan 113 mahasiswa terdaftar.",
      type: "system",
      targetUrl: "/classes",
    },
    {
      id: randomUUID(),
      userId: studentIdByNim.get("2611090062") || lecturerId,
      title: "Selamat Datang di EDUFlow",
      body: "Anda telah terdaftar di kelas Teori Pemrograman Web Fundamental I. Silakan periksa materi dan tugas.",
      type: "system",
      targetUrl: "/student/classes",
    },
  ]);

  console.log("✅ Seed database EDUFlow berhasil dengan data riil mahasiswa & jadwal lengkap!");
}

main()
  .catch((e) => {
    console.error("❌ Gagal melakukan seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });
