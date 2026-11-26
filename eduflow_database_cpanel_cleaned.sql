-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 26, 2026 at 02:02 PM
-- Server version: 11.4.14-MariaDB
-- PHP Version: 8.4.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hsgalfat_eduflow`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_terms`
--

CREATE TABLE `academic_terms` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `semester` enum('ganjil','genap','antara') NOT NULL,
  `starts_on` date NOT NULL,
  `ends_on` date NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `academic_terms`
--

INSERT INTO `academic_terms` (`id`, `name`, `academic_year`, `semester`, `starts_on`, `ends_on`, `is_active`, `created_at`, `updated_at`) VALUES
('e1f09713-1bfc-460f-b91a-74300ea35682', '2026/2027 Ganjil', '2026/2027', 'ganjil', '2026-08-31', '2027-01-30', 1, '2026-11-19 09:52:54', '2026-11-19 09:52:54');

-- --------------------------------------------------------

--
-- Table structure for table `assessment_items`
--

CREATE TABLE `assessment_items` (
  `id` varchar(36) NOT NULL,
  `category_id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `max_score` decimal(7,2) NOT NULL DEFAULT 100.00,
  `assessment_date` date DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assessment_items`
--

INSERT INTO `assessment_items` (`id`, `category_id`, `title`, `max_score`, `assessment_date`, `is_published`, `created_at`, `updated_at`) VALUES

('4dc9b845-0fe9-4363-942f-ba729295e197', '4667e101-9095-4ccb-84b4-f74ae5d86826', 'REST API mini', 100.00, NULL, 1, '2026-11-23 10:56:03', '2026-11-23 10:56:03'),
('5574d6f3-2350-4c85-8e9a-a1e315b1fbea', '04279994-735c-4248-a65a-c50f6f615e38', 'Praktik HTML dan CSS', 100.00, NULL, 1, '2026-11-26 12:36:57', '2026-11-26 12:36:57'),
('6f3a15d1-14d2-4295-a7ad-dfd160ec1f2f', '19c0e5d6-6103-4339-8321-82e0a80e7e68', 'Praktik HTML dan CSS', 100.00, NULL, 1, '2026-11-26 12:33:40', '2026-11-26 12:33:40'),
('af7a725b-164e-484e-84ef-33ef0470e077', '4667e101-9095-4ccb-84b4-f74ae5d86826', 'REST API mini', 100.00, NULL, 1, '2026-11-23 10:14:36', '2026-11-23 10:14:36'),
('b5763235-4896-4c52-a614-7eb5c8c83952', '1ba2069d-b825-483b-ab51-30c27664f612', 'Praktik HTML dan CSS', 100.00, NULL, 1, '2026-11-26 12:34:57', '2026-11-26 12:34:57'),
('b9b3aa3a-6a66-43e4-9b85-581f5b9225e2', '09a45250-2a92-44df-96d0-38275bf39e58', 'UTS Susulan Pemograman web', 100.00, NULL, 1, '2026-11-26 13:26:44', '2026-11-26 13:26:44');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `instructions` text NOT NULL,
  `max_score` decimal(7,2) NOT NULL DEFAULT 100.00,
  `opens_at` datetime DEFAULT NULL,
  `due_at` datetime DEFAULT NULL,
  `allow_late` tinyint(1) NOT NULL DEFAULT 0,
  `submission_mode` enum('file','url','both') NOT NULL DEFAULT 'both',
  `allowed_mime_types` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`allowed_mime_types`)),
  `max_file_size_mb` smallint(6) NOT NULL DEFAULT 10,
  `status` enum('draft','published','closed') NOT NULL DEFAULT 'draft',
  `assessment_item_id` varchar(36) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `class_id`, `title`, `instructions`, `max_score`, `opens_at`, `due_at`, `allow_late`, `submission_mode`, `allowed_mime_types`, `max_file_size_mb`, `status`, `assessment_item_id`, `created_at`, `updated_at`) VALUES
('23e1158f-d960-4d58-989a-b66bbf7b9030', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'REST API mini', 'Tambahkan route PUT dan DELETE pada /mahasiswa, lalu uji dengan Postman.', 100.00, '2026-11-23 03:56:03', '2026-11-23 09:59:00', 1, 'url', NULL, 10, 'published', '4dc9b845-0fe9-4363-942f-ba729295e197', '2026-11-23 10:56:03', '2026-11-23 10:56:03'),
('33f0ff23-b97e-4a1f-af26-48c2ee88c45c', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Praktik HTML dan CSS', 'Buka file panduan yang dosen pengampu kasih', 100.00, '2026-11-26 05:34:57', '2026-11-26 16:00:00', 1, 'both', NULL, 10, 'published', 'b5763235-4896-4c52-a614-7eb5c8c83952', '2026-11-26 12:34:57', '2026-11-26 06:41:41'),
('8185daca-228c-4ca4-9c88-d0c50e75195c', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Praktik HTML dan CSS', 'Buka file panduan yang dosen pengampu kasih', 100.00, '2026-11-26 05:36:57', '2026-11-26 16:00:00', 1, 'both', NULL, 10, 'published', '5574d6f3-2350-4c85-8e9a-a1e315b1fbea', '2026-11-26 12:36:57', '2026-11-26 12:36:57'),
('86a46606-7c9f-4b90-a436-5434ccc4c880', 'fd782892-5581-41d9-acf7-47640702387b', 'UTS Susulan Pemograman web', 'Buka file panduan yang dosen pengampu kasih', 100.00, '2026-11-26 06:26:44', '2026-11-27 22:00:00', 1, 'both', NULL, 10, 'published', 'b9b3aa3a-6a66-43e4-9b85-581f5b9225e2', '2026-11-26 13:26:44', '2026-11-26 13:26:44'),
('bc7369cb-7c2c-4ccd-adb5-ae4c7a148810', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Praktik HTML dan CSS', 'Buka file panduan yang dosen pengampu kasih', 100.00, '2026-11-26 05:33:40', '2026-11-26 14:30:00', 1, 'both', NULL, 10, 'published', '6f3a15d1-14d2-4295-a7ad-dfd160ec1f2f', '2026-11-26 12:33:41', '2026-11-26 12:33:41');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` varchar(36) NOT NULL,
  `session_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `status` enum('present','late','sick','excused','absent') NOT NULL DEFAULT 'absent',
  `note` varchar(255) DEFAULT NULL,
  `updated_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `distance_meters` int(11) DEFAULT NULL,
  `scanned_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance_records`
--

INSERT INTO `attendance_records` (`id`, `session_id`, `student_id`, `status`, `note`, `updated_by`, `created_at`, `updated_at`, `latitude`, `longitude`, `distance_meters`, `scanned_at`) VALUES
('000c2733-e2cf-4ff9-9e4d-534953e5cf85', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('02fec061-750e-4037-be10-930ff1c223f9', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('03522e79-c8b0-41be-a589-c9dfbfcc389e', '5deee1cc-3e05-4c96-9b06-da850feca970', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('037e1c1a-3c26-4dcc-916f-e5ccd633feee', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('048f306c-9ae1-4ca1-bd14-e394b4ffea60', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('04bb5f68-6ead-40fd-b077-9b5eb6a743d5', '5deee1cc-3e05-4c96-9b06-da850feca970', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0505cd10-2259-47df-927d-2fcaa291533a', '5a3733de-07e9-4395-8b35-00af476dcdcd', '72d614af-4b17-4ecf-837c-1217d55cecaa', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('05f169fe-44eb-4c0e-8e88-ced336b4bd8a', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('065950dd-c6d8-4703-8ef9-8404239b04a3', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '8079f98f-620f-4ddb-aff0-b83204676542', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('06e3a1c6-e9c3-4713-9191-ad901a16f2c5', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('09eb5c34-7fb2-4e09-971c-483cec21223f', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0ae33698-ca21-4725-86b9-c3253a98aaba', '5deee1cc-3e05-4c96-9b06-da850feca970', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0b41ae19-11c2-4869-944e-722f3f9701de', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0c35838c-8b5d-4df8-bf6c-0f15034b03bb', '5deee1cc-3e05-4c96-9b06-da850feca970', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0d750cd6-0473-4033-a380-b603426eb063', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0e1f9c48-f4d8-41e1-960e-8a76d9cf5222', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0e5cf2f8-6c2c-4223-b908-ee5527d3eb67', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('0f44279d-7d4b-41da-bbd6-58ff4f8f9c89', '5deee1cc-3e05-4c96-9b06-da850feca970', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('101b4609-cdc0-480a-b0be-4e3778ad927d', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('10f3d4b7-2c5f-4446-b009-4bce5fc4d12a', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('12c68725-31bc-4faf-adc7-ba5c5bd83fe7', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '2a599842-8cf2-4ce0-8a2d-93bba6013a87', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('132a32b2-4c75-4abe-baa4-4302a3a304dd', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('14c1e23e-e223-4b9b-b1ed-8583b152fe6a', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('17052c20-cb0b-4bcd-b341-1c845f77192a', '5deee1cc-3e05-4c96-9b06-da850feca970', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('1749107d-8e73-40b9-9c27-fb43534595ee', '5deee1cc-3e05-4c96-9b06-da850feca970', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('18e86561-4a4e-4d5d-9079-c386a32c83f3', '5deee1cc-3e05-4c96-9b06-da850feca970', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('1d3a2ad2-5f55-4618-ba31-db094190cf0c', '5deee1cc-3e05-4c96-9b06-da850feca970', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'sick', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('1e1f3432-7e18-4cef-99cf-6f231ca9973f', '5deee1cc-3e05-4c96-9b06-da850feca970', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('20e03380-9eac-4d90-b560-5b409eead4d9', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('22d0d22f-c207-4fad-bc3e-a225e374dd9c', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('230dc11b-0df7-4707-9f7b-20c39810cd57', '5deee1cc-3e05-4c96-9b06-da850feca970', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('23d2e796-2402-40a1-bcaf-2e0a598ba014', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('243d6d18-29f8-45e2-b72e-ef1888fc1170', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('27f0363b-4e49-4812-acc5-ec35d8ec82f9', '5a3733de-07e9-4395-8b35-00af476dcdcd', '94f4890c-9b62-461a-a701-7c66c1fe60a3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('28008453-99a0-46a7-8bdb-1c9999c26d49', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('288db4ed-7db0-4a7c-91ba-26c38df6b0a3', '5deee1cc-3e05-4c96-9b06-da850feca970', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('2a14d444-46df-4e3b-8654-9cd23da2dc7f', '5a3733de-07e9-4395-8b35-00af476dcdcd', '6e18106e-6719-4148-beb0-24fd291aacd5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('2bcd0213-edf7-4873-9be7-0894ebbafbc7', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('2c1be2c4-acd0-4180-a728-5ae89ede75a2', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('2c2f4b0e-bcf5-4c58-8a4b-ed81e98b9537', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('2f6b654c-3ed9-4ee1-9445-34448bafa8f9', '5deee1cc-3e05-4c96-9b06-da850feca970', '75981500-77fc-439d-968f-21f1819140f3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('2f87e0b3-42e0-4f4d-9677-e371fd0b65b5', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('302ccb96-4752-4a59-8aab-6dc29e8664b9', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('31fdf2af-9d22-4782-b074-1612d7cfe34d', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('32ec604f-b13b-47ac-bbc1-b55dd0910780', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('346c3e3d-29b8-4958-bc7c-ef63038e0f1d', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'e0eab939-728d-440a-a118-f40ca2eb37bc', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('34a78fe1-f2db-486b-99de-5b7a1ef3e942', '5deee1cc-3e05-4c96-9b06-da850feca970', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('391101b6-b947-47f0-baac-0e1635a438a8', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'c30a6062-c0ce-4f28-9b20-0e5987ac1542', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('3963695b-3edf-422d-b35d-b42629a3d5cb', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('3ab289a4-9fa4-4175-9078-7b3689895bc2', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('3d9beb80-d928-4e7a-a931-8431a8fb3a36', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('3db1f6be-da19-425e-bed3-181a4c579f67', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('3fd60055-30ae-4cbf-976f-bc595851ac92', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('401629ec-730c-4f09-b19e-840658c5a738', '5deee1cc-3e05-4c96-9b06-da850feca970', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('40be747a-c12d-4e0a-be5e-eac2f6b5e0bc', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('40e58f21-f132-4a35-a851-36d1fdadc7d1', '5deee1cc-3e05-4c96-9b06-da850feca970', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('412af8a0-b1a3-43be-8a1f-174d75bf7510', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('42f31078-0748-47eb-bae8-128d4f158982', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '84fe4d25-5c1b-47cc-8676-71f90e15bcb4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('433ed0fa-1424-4eb6-812d-244b1b1e8d19', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'excused', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('436e5dc4-52ce-42c5-af09-75b92e790c23', '5deee1cc-3e05-4c96-9b06-da850feca970', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('45d743a1-bc6e-4d06-9c2f-53fb4fede1e6', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('46a2de7a-33d0-4412-ba6c-df6909ea4e15', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '614f867d-cfc5-4868-8631-3fed5be1fa0b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('4908a47f-7f4d-4b4e-89a7-f1aec803cab3', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4b217b96-e8b1-437d-abf1-f4d77c3edec0', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4d03403c-d40d-4735-83e7-dddea4bfdefe', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4e20bba9-f343-4ff6-98a8-37f21d082a77', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '7e561f91-d9f2-4678-a2c2-9db8c564b544', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('4e766c2c-abe9-4b8e-b01e-23263b108d37', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4ecb0e8b-d409-4a73-87c1-07301da94f0a', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4f47e732-c94b-4c8c-9104-ac0f5ac833c5', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('4f80374a-e97e-4fdc-a93a-91bd7f58c5a6', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5164f216-fe60-417c-9bfc-be34b248fc31', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '94f4890c-9b62-461a-a701-7c66c1fe60a3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('52e14a7f-77af-431a-9f1b-b77d09da3fc6', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('554b5771-2484-4adf-bd05-f82aead59e03', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('560e2ff3-ceae-45c2-aa1e-c76b48103432', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'sick', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('576b223a-33cd-4323-8685-d3eec4380fb4', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5ad773c9-64d9-4e33-afa4-91659e7ee7e8', '5deee1cc-3e05-4c96-9b06-da850feca970', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5b1251b2-bd1f-47ad-956c-8ef011e85d85', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5b554963-ea39-4088-9e95-da60d041ee2d', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5c74c1e1-20c8-49b7-a444-352558e631eb', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5ccf5185-f911-4e18-80a7-ea49a92440d0', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5dd185d3-e2d4-4c09-8bf6-92526b3b9cae', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5de04a23-6c26-476b-b734-cef3adfa1bbc', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5f1adbb9-000e-4d39-b82d-778acf63fd6b', '5deee1cc-3e05-4c96-9b06-da850feca970', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('5f538f36-9877-4570-b332-25860f707d98', '5a3733de-07e9-4395-8b35-00af476dcdcd', '6b17738f-0786-443f-b73e-018f1e066de6', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('62346b45-4b45-4ded-81e8-9c103fb837d6', '5deee1cc-3e05-4c96-9b06-da850feca970', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('624a7def-d4b6-4589-af6d-fbba13f261e7', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('627be6a6-3ca1-44c9-bac7-b73d9fde4297', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'e5452107-ca6b-4275-9be8-ddd87398ed3d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('650f31a7-ba82-4984-882f-64a3e2d9b75c', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '1a6a65b7-fedd-48ff-8945-08d267f891da', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('652cc01c-ac8f-41f8-9b74-aee4b51383fd', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('657ab48d-f305-4dff-8794-9505f73b9a4a', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('66f24d57-308c-4488-a3d7-8c25573a2852', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'cf4c2fe8-5daa-4d5a-a9bf-1ee765490951', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('676c7aba-89f7-46d6-ac60-99eb5e7660f0', '5deee1cc-3e05-4c96-9b06-da850feca970', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('67bff813-c263-48ea-a250-a6172783741e', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('68f15d5c-99bd-442a-bb34-cfb9de7edc29', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('6b9a8cde-54f5-41ed-8c03-75b1035e9eb3', '5deee1cc-3e05-4c96-9b06-da850feca970', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('6c91bb66-a4c5-4ef2-aeb5-2aab2aa571bf', '5deee1cc-3e05-4c96-9b06-da850feca970', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('6ca28059-ece9-4948-bce7-9496c9a91755', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('6da76418-692a-4a33-8ba3-1ea1678e4bb0', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('6db2c98b-6ee3-483f-9aa3-209f174dd644', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7090af68-6e0a-44c7-b754-04c7d0ce7b4c', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('70bee0a9-b0b6-497c-a09a-f80878a8630b', '5deee1cc-3e05-4c96-9b06-da850feca970', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('71068d65-4ce5-44c8-8453-5455853b4f57', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '1a6a65b7-fedd-48ff-8945-08d267f891da', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7126c0db-2f70-4d82-a4e5-2ce8c4dc8c7f', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('718e2381-3fbc-44f7-bde3-c6945966a110', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('71a0af18-83a6-4839-88e9-e24197f782a5', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('732ecfc5-09dd-47c2-b16c-df5616f6fa96', '5a3733de-07e9-4395-8b35-00af476dcdcd', '7e561f91-d9f2-4678-a2c2-9db8c564b544', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('765456f0-ae93-4f71-b0eb-3148f95dfe33', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7893407c-7816-4265-8711-4aefcf6e8e9d', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '72d614af-4b17-4ecf-837c-1217d55cecaa', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('78f8e5cb-d79b-44a5-b9bf-29c79d5e5b2d', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'cf4c2fe8-5daa-4d5a-a9bf-1ee765490951', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('79044588-2155-4928-a217-3c98df043fbc', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7970ba09-bd48-4314-a0a6-0b028a60678c', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7a19a69c-0219-453c-9e5f-e39b6fe0cd1c', '5deee1cc-3e05-4c96-9b06-da850feca970', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7a411b7c-1f44-4f0c-98b6-4cec423f5ad0', '5a3733de-07e9-4395-8b35-00af476dcdcd', '635855cb-4881-4760-9d11-1de9bfea69a0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('7c65d111-0d87-4ace-a23d-382808f77e06', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7c84fdca-24f0-4be0-af43-ee676759d131', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7d78c881-ea40-41eb-8293-c61430f5b0bd', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'sick', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7f154e07-38a6-409f-a954-92f54014d6ba', '5deee1cc-3e05-4c96-9b06-da850feca970', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7f3c0e4c-7e89-48fb-b5fe-40ea1111878b', '5deee1cc-3e05-4c96-9b06-da850feca970', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('7f467e49-d8ca-4c90-b549-6a0470ddbab0', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('80e44c74-f35c-4e0c-88d8-037939e4f113', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'sick', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-20 15:57:07', NULL, NULL, NULL, NULL),
('810ae489-ccaa-4bfb-9e87-6c27924264a8', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('813f5bd6-b356-414e-8193-d6808756c3ac', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'e02aa250-f3bc-489a-a8b6-fe7e91b33e4b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('81dfe9bd-7dac-45d0-bb1d-b1b81ff4d878', '5deee1cc-3e05-4c96-9b06-da850feca970', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('831008a2-ef3e-4acd-90cc-2bf94ace3cf1', '5deee1cc-3e05-4c96-9b06-da850feca970', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('834edfc8-3b21-4cca-a226-9aefb30a197c', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '1a6a65b7-fedd-48ff-8945-08d267f891da', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('836f4126-669e-4501-a2cc-80016ca115e0', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('84834bfe-fbbc-45d1-8664-6670dac1deda', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('84c2a729-0013-437d-a381-f8cf2cecfa9d', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('85d71219-63e9-4dac-a7bd-a5bf831ef1fc', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('86d1dead-bf43-4f3c-a799-677f5905c5a2', '5deee1cc-3e05-4c96-9b06-da850feca970', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('88814938-23e7-4e71-989b-389cfd697ba8', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '635855cb-4881-4760-9d11-1de9bfea69a0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('8b503007-8f93-4173-928a-1af5ebc60d13', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '6e18106e-6719-4148-beb0-24fd291aacd5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('8c20f4b9-4b9c-4739-b284-32599755786e', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('8d179246-bd09-4dde-9fb2-ff78d98ca596', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('8d95d823-3583-451e-a883-c76677c00dc7', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('8ea50ace-71a6-4f4e-9473-530ddc6dda3d', '5deee1cc-3e05-4c96-9b06-da850feca970', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('8ea8fd9a-7656-41a7-9f07-46ba0bd03f49', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '2881ec09-f070-44f1-b7a0-86d218b11211', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('8fd7858e-2e64-4040-b108-6291ddd9a40d', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('92ba0d84-3429-4dea-a17d-509570fdc685', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('93b2ea63-08a0-4c20-9662-2889344a5373', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('93d94ca0-b1d0-4208-9be5-e58214bf1b95', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '2ab039a9-e2a7-4388-bda7-c0e678e33d8c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('944f981d-fdea-41cf-be95-558be700abc4', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('979a7f28-37e2-45b8-99ac-9812157a9fe3', '5deee1cc-3e05-4c96-9b06-da850feca970', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('993bc1c0-6663-4ab4-aa15-ac0fae32751a', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'f3385427-0657-487d-a794-acaf5e0baf86', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('9a4a80fc-31f4-4c7c-8c7e-d5d46db5f622', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('9ab20714-dde6-42ee-b219-a6deff0d4d6b', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('9b3ea146-bbe6-4d17-8364-11d544e452cb', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('9be2e813-3e58-49be-88b9-2fd30d56c115', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('9e5b85c2-9a6b-48df-b3ce-2ea66760abf8', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a1388fcd-8fee-48c8-b784-e412152baaf0', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a24a2536-7ee0-4386-8678-1e247470bee5', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a296750b-d0f6-4471-94b5-0abc1451a1fa', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a6dfcd40-6844-4dd3-8cd4-f5986fef43af', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a842a4e5-9123-4d8b-8b81-e57502bb309e', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a8945d2c-73cf-4c3a-95da-985228f8555e', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('a939cd93-fe4a-4cdf-91a9-d6addadf7232', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '75981500-77fc-439d-968f-21f1819140f3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('aa0b4500-337d-498a-8a68-1f51d576d7bb', '5a3733de-07e9-4395-8b35-00af476dcdcd', '2a599842-8cf2-4ce0-8a2d-93bba6013a87', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('aa0f06bb-02f9-45d4-8ba1-89963d629068', '5deee1cc-3e05-4c96-9b06-da850feca970', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('aa10d135-497d-40ee-b9eb-21395482991a', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('aa7c2daf-a6a5-4732-bc71-fa8e13e039f5', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'f3385427-0657-487d-a794-acaf5e0baf86', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('aaf00827-1b83-4421-b4b7-dc5e74b3b4a7', '5deee1cc-3e05-4c96-9b06-da850feca970', '2881ec09-f070-44f1-b7a0-86d218b11211', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('abcd6780-79ea-4a9c-bece-c20ddb5bb7d7', '5deee1cc-3e05-4c96-9b06-da850feca970', '4ea64847-a051-4cab-a498-b7e578ac9748', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ad61cf43-f297-4be1-9c9c-8cba54f32c82', '5deee1cc-3e05-4c96-9b06-da850feca970', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ad8bae30-29dc-4a3a-80fa-7179edcd3a37', '5deee1cc-3e05-4c96-9b06-da850feca970', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ade952c1-f989-423e-b4ad-e332c48e15ac', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ae007144-2265-47da-b677-e8c588fb81e1', '5deee1cc-3e05-4c96-9b06-da850feca970', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ae4b1c17-1e57-409c-8f03-0abb63459cdd', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('aeb820a1-446b-45cf-89fc-60e531d24add', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '4ea64847-a051-4cab-a498-b7e578ac9748', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('b1acfede-1cd6-464f-aa61-236c8bb2ce31', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('b3e01f88-7dd9-44bb-b9bd-373c04ea51e9', '5deee1cc-3e05-4c96-9b06-da850feca970', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('b45ab225-d768-4c49-9241-7b5f4ebccc26', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'e02aa250-f3bc-489a-a8b6-fe7e91b33e4b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('b51518a9-0a2a-4b0b-acd7-afe559796327', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'b7b7b2db-f802-4544-ae07-fc2dd99ba7b0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('b5543a8d-c523-4d0d-aa86-c2ad5c24bab4', '5a3733de-07e9-4395-8b35-00af476dcdcd', '614f867d-cfc5-4868-8631-3fed5be1fa0b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('b58f87b7-468a-4a19-8919-7543464fdb0f', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '2881ec09-f070-44f1-b7a0-86d218b11211', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('b5e2a027-53a5-4ec5-807c-84d34ab0dc69', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('b66fb2ec-a0e5-40dd-9a35-729ec55f4b9a', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('bc4ed430-89f8-4999-913e-3333cc3c4569', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('bc7da209-c6db-4901-bc09-9d16d792634d', '5a3733de-07e9-4395-8b35-00af476dcdcd', '84fe4d25-5c1b-47cc-8676-71f90e15bcb4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('bfd0db3e-546c-4ff9-9381-ea2fd095dd7e', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c14f2993-6860-4200-a1c1-9cce7137800d', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c2c2c189-2141-4531-86fe-197878dd2f08', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c3db96f1-ae37-49dc-8ae3-262bdd239a38', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c3e29a9f-9b24-41a7-8924-f426e58025be', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c7392304-a459-40be-b97f-4de41ef7b021', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('c946e1ff-c576-4302-8a2d-8ee4dddfd456', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cbbd585b-5b8a-4080-8d27-52ae0796725f', '5deee1cc-3e05-4c96-9b06-da850feca970', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cc7589bd-bec3-4d5e-ad26-7fa702035016', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'sick', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cce3c033-7484-4bd3-b8a6-e238c06a15f2', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ce5b5967-10b6-4def-a990-0ff7da2d9e34', '5deee1cc-3e05-4c96-9b06-da850feca970', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cfa05a1c-9718-4b5c-aede-b7190b1501da', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cfc1e483-4142-496f-935e-add16defb373', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '4ea64847-a051-4cab-a498-b7e578ac9748', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('cfcab885-14de-4223-b56e-7fbe9b5a774e', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('d04d8ab4-454e-44d4-87b9-608bd00d7c1f', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('d07ad836-3ef9-4024-af87-b3d2a160c220', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('d1868fd1-28d2-462c-af46-8c9b3054c93b', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('d3469c4d-78b4-4d20-8a85-46bc845c2a51', '5a3733de-07e9-4395-8b35-00af476dcdcd', '2ab039a9-e2a7-4388-bda7-c0e678e33d8c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('d408ba0a-1489-4233-9d26-9297a8c52a96', '5a3733de-07e9-4395-8b35-00af476dcdcd', '8079f98f-620f-4ddb-aff0-b83204676542', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('d7b75b14-ff85-4e0d-903e-9bf54494c40f', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('d9102d9f-f954-4838-9d63-ef7a4280b227', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('dc0a7513-9968-4070-90bc-ceee069d937e', '5deee1cc-3e05-4c96-9b06-da850feca970', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('dc5ee83f-1fa0-44ca-8f9e-8f9aaff9cf36', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL);
INSERT INTO `attendance_records` (`id`, `session_id`, `student_id`, `status`, `note`, `updated_by`, `created_at`, `updated_at`, `latitude`, `longitude`, `distance_meters`, `scanned_at`) VALUES
('dcdc32ce-6478-4ac4-92d1-9ac90e815a74', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '0b0ebdef-2215-4877-a95d-e22e29f7fd6d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('dd82a574-1d9c-450a-9afb-db6852990e6e', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'excused', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ddb0811e-e5ce-43af-9f94-c815c30c568f', '5deee1cc-3e05-4c96-9b06-da850feca970', '1a6a65b7-fedd-48ff-8945-08d267f891da', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('de2061e0-dcf3-472c-8c15-76c4b4b7d7ba', '5deee1cc-3e05-4c96-9b06-da850feca970', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e0b09444-f309-46f2-b4e2-f81fa38a7cc1', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'excused', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e2342eb2-426f-4f56-b51b-ba2a214a50e3', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e2c8c65d-28ed-43c7-afa3-f979d8161572', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e2d873c7-d2de-4511-af93-d66366c87526', '4f4df259-44f1-4700-b257-cd677e7cc0fc', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e4246238-aabf-43d1-bf42-17cca9e6badb', '5deee1cc-3e05-4c96-9b06-da850feca970', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e4a09cdf-b55b-4d76-92da-c70e058015f0', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e52581ea-e938-48ff-bb33-416cb3cd3f7c', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '75981500-77fc-439d-968f-21f1819140f3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e7243f75-5b29-4b17-9227-b5b250829149', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e7d218e4-6823-43ff-bfe1-7348945f67fc', '5deee1cc-3e05-4c96-9b06-da850feca970', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('e8d29a66-e378-403c-b908-60fdffeb27f7', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '4ea64847-a051-4cab-a498-b7e578ac9748', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ea105eef-1a76-4565-9f6c-43989700d287', 'a9480fb6-44a4-4385-bf24-f9704fee3250', '37a419f4-447f-42c8-9f7c-de857d23af04', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('ead9b5ee-fa36-42e3-a326-3cdd52d8c3ea', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'e0eab939-728d-440a-a118-f40ca2eb37bc', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('eb236c88-df14-4c7b-bb03-e033d7bc5126', '5a3733de-07e9-4395-8b35-00af476dcdcd', '37a419f4-447f-42c8-9f7c-de857d23af04', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('eb54d56b-d261-4f05-ab87-74c8cd7ec122', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ec459c67-d8a1-47fe-82f7-89359d443a31', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('eca9b723-fb90-42e5-bbfd-e6eced6581d3', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ed27c584-c52b-492b-9907-b620376ffb35', '2abe5993-982f-4479-b9d9-faf689b0cf6a', '75981500-77fc-439d-968f-21f1819140f3', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ee0bc6c4-f2a1-4f6a-a573-c592422afec4', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ee231e72-4717-4dad-854f-6a82b9f4bb93', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'c30a6062-c0ce-4f28-9b20-0e5987ac1542', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 15:39:51', '2026-11-20 15:39:51', NULL, NULL, NULL, NULL),
('ef816857-4aa9-4dca-a25e-bb289ee23526', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'c8f87d0f-0259-47d3-94ba-95b1703b601e', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('f0b7b7f3-3335-4150-bc06-a80349b4272b', '5a3733de-07e9-4395-8b35-00af476dcdcd', '0b0ebdef-2215-4877-a95d-e22e29f7fd6d', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL),
('f43a35c3-4aa7-4487-8086-37ab58c14139', '5deee1cc-3e05-4c96-9b06-da850feca970', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('f452da2b-3a3c-4dd2-b453-1e878dabaf0b', '2abe5993-982f-4479-b9d9-faf689b0cf6a', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('f5ac0936-5146-451a-af11-0bd14b3a3b6d', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('f72aad64-5097-4848-ab48-f024e7cfbf50', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('fa6c4886-7cc6-40e0-9430-ff943c5acadb', 'b5a0519a-c655-4795-af0f-3e84f3b922e6', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('fb130177-fded-42be-854b-bf0e53814253', '4f4df259-44f1-4700-b257-cd677e7cc0fc', '2881ec09-f070-44f1-b7a0-86d218b11211', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('fc200c2b-1c26-4000-ba63-dc6a2130db4d', '5deee1cc-3e05-4c96-9b06-da850feca970', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'excused', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('fc312684-b2ff-4ecb-885f-0319cd489adf', '5deee1cc-3e05-4c96-9b06-da850feca970', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-19 09:52:55', '2026-11-19 09:52:55', NULL, NULL, NULL, NULL),
('ff9200db-ba98-4101-916d-2e5ba31a6a5b', '5a3733de-07e9-4395-8b35-00af476dcdcd', '85a97b78-b722-4f87-8fb5-33a5affce350', 'present', NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-20 14:56:59', '2026-11-20 14:56:59', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `attendance_sessions`
--

CREATE TABLE `attendance_sessions` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `meeting_number` smallint(6) NOT NULL,
  `session_date` date NOT NULL,
  `topic` varchar(180) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_open` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `attendance_sessions`
--

INSERT INTO `attendance_sessions` (`id`, `class_id`, `meeting_number`, `session_date`, `topic`, `created_at`, `updated_at`, `is_open`) VALUES
('01c2abb8-9154-4ee3-96f8-75c1e330bb03', '23266dbf-87fb-4587-8b3f-530f9558f006', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('04208814-2272-49df-a0cf-0769d5409970', '873cdf5e-d024-4c67-9874-057a0c21279d', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('08868aa3-fe07-4ef7-a9f3-37c45d51bea1', '23266dbf-87fb-4587-8b3f-530f9558f006', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('0a8b2533-b280-4c91-90c9-39b2bc180e9e', '244f1762-66a8-4957-b086-14a85de81efd', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('0c288f13-ef99-49ef-87b5-a4f951c8fa84', '23266dbf-87fb-4587-8b3f-530f9558f006', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('0c5eb907-a823-4ba2-a67f-c4a24ae5c870', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('0d469d3e-e4df-44e0-bc05-9da98dfa2342', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('10f7ac19-97b6-4ed2-a926-023bdf999ec4', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('125ffcef-82e4-48ed-bed7-aea0ce0ec621', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('14de3d45-299a-4a79-8c05-12f8d04158b7', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('15465dda-5fb4-478d-be88-f9d9dcd70e66', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('161ac4a2-2f0e-4533-9e6c-52b92c1137aa', 'fd782892-5581-41d9-acf7-47640702387b', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('17e06230-d359-4346-b77b-d3c4c1f8b3de', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('1c9cfe96-4c11-4138-a3c0-d4900022da43', '244f1762-66a8-4957-b086-14a85de81efd', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('1d731813-07d7-47aa-83db-030e3bffc92a', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('214277c5-9f2e-46ff-8ace-de993fc47c3c', '23266dbf-87fb-4587-8b3f-530f9558f006', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('219e357f-961d-4c19-abe1-550b9580036a', '244f1762-66a8-4957-b086-14a85de81efd', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('24b28c6f-199d-4b9e-9bc0-db742a68e5f0', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('25613374-27f5-4507-ac37-ccdbcdb045eb', '873cdf5e-d024-4c67-9874-057a0c21279d', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('272728be-2585-447a-948f-9d3651b035ba', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('27642b70-9b84-4172-9f63-377c744274b5', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('29032b1a-f54d-47e9-85b5-7a3d3a9cf016', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('29d568e5-4382-4cc0-a02f-10032225ce5e', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('2abe5993-982f-4479-b9d9-faf689b0cf6a', '873cdf5e-d024-4c67-9874-057a0c21279d', 4, '2026-09-23', 'Pertemuan 4: Pembahasan Materi Teori Web & Arsitektur Client-Server', '2026-11-19 09:52:55', '2026-11-19 09:52:55', 0),
('2d348121-3899-44f8-83f4-6d5e3b54b058', '23266dbf-87fb-4587-8b3f-530f9558f006', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('3135eaa0-3faa-46f4-93a1-2246e672509d', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('3262f2ac-a1a0-48a1-b1a0-3d1a0c2bed17', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('337eccf6-678f-40f8-a8fe-4a326720f027', '244f1762-66a8-4957-b086-14a85de81efd', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('38b9e44e-4813-402f-a83d-2a7b5b2c4dae', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('3cffa87a-d518-4908-b099-0c49c28fbdc9', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('3d8acfd0-a2d9-4e9b-8d1d-5edc546dbb4d', 'fd782892-5581-41d9-acf7-47640702387b', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('3fc8730c-cdb0-4f82-9bf2-868a3947963f', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('40798c1f-8b62-4e5d-b87d-4c73749b066a', 'fd782892-5581-41d9-acf7-47640702387b', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('41569599-9122-4048-b0c2-11bfc0380785', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('4249a6dd-4710-44db-922b-30700c54bc6a', '244f1762-66a8-4957-b086-14a85de81efd', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('42d40d3a-750d-4b1d-b796-195f4e3dd1ef', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('446d87f8-f00a-4fcb-9a0f-e31d0d6c74de', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('4746cf04-c52c-4197-9b64-89b83f0fd80e', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('495af1cb-cff3-4b1e-ad2d-8c3331f68f13', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('49fba11a-be3b-4db5-a23e-ac324f0a3b77', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('4d5a616b-ff7d-4cef-a767-551f33dfcecd', '244f1762-66a8-4957-b086-14a85de81efd', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('4e8e7ff0-9b3a-42bc-97de-d13eae118c06', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('4f4df259-44f1-4700-b257-cd677e7cc0fc', '873cdf5e-d024-4c67-9874-057a0c21279d', 2, '2026-09-09', 'Pertemuan 2: Pembahasan Materi Teori Web & Arsitektur Client-Server', '2026-11-19 09:52:55', '2026-11-19 09:52:55', 0),
('52c27907-8a5f-4962-8643-2718fe93a8dd', '244f1762-66a8-4957-b086-14a85de81efd', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('57c90434-5fbe-4ff2-8f3a-d1686114c194', '873cdf5e-d024-4c67-9874-057a0c21279d', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('5a3733de-07e9-4395-8b35-00af476dcdcd', '244f1762-66a8-4957-b086-14a85de81efd', 1, '2026-11-20', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 14:56:59', '2026-11-20 17:09:39', 1),
('5a4f0a38-8f29-4e7c-bdd3-df726b6b264b', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('5ac7796c-dbda-4855-ac11-821c279954c3', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('5c4caa75-7716-4fdf-ac87-faedba1970a5', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('5d4b2237-a541-4e6d-8e94-5e20aaf5f677', '244f1762-66a8-4957-b086-14a85de81efd', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('5deee1cc-3e05-4c96-9b06-da850feca970', '873cdf5e-d024-4c67-9874-057a0c21279d', 3, '2026-09-16', 'Pertemuan 3: Pembahasan Materi Teori Web & Arsitektur Client-Server', '2026-11-19 09:52:55', '2026-11-19 09:52:55', 0),
('6248a669-ca54-4c51-85ca-88e2af8b7273', '873cdf5e-d024-4c67-9874-057a0c21279d', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('6c6dd689-6ac2-44b7-b9ed-6d17aeaa213c', '23266dbf-87fb-4587-8b3f-530f9558f006', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('6d8069d8-9581-483c-bc66-3dac3ac7dda8', '873cdf5e-d024-4c67-9874-057a0c21279d', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('70134ed6-f3cc-4f9a-a7c0-d4ee0af10fd8', '23266dbf-87fb-4587-8b3f-530f9558f006', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('72d0a3af-05cf-48db-b77d-68841caacd4e', '23266dbf-87fb-4587-8b3f-530f9558f006', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('73341274-f084-448d-ba3e-8939b73b738d', '23266dbf-87fb-4587-8b3f-530f9558f006', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('76970280-ea46-42ca-aaa7-272577cb4533', '23266dbf-87fb-4587-8b3f-530f9558f006', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('778f4511-9035-4b4a-94c4-56b5dc7b31e4', '244f1762-66a8-4957-b086-14a85de81efd', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('78c7493a-21c5-4d12-85c1-8d0100220a78', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('7ac7c514-cc21-444e-9221-fabb8087d799', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('80ad745a-5acd-4831-80e0-a2ef6db8b771', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('822d8a75-a5de-465f-8877-ebd4e73af63f', '23266dbf-87fb-4587-8b3f-530f9558f006', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('82f31be5-b618-437b-9cf9-12842603ec86', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('8419247d-afdd-434f-91c8-4992f655d93f', '873cdf5e-d024-4c67-9874-057a0c21279d', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('85b47315-88ae-4d26-8cea-ab66b17f95a8', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('8b03c378-c0e0-467c-9acd-af914512d1a3', 'fd782892-5581-41d9-acf7-47640702387b', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('8f4503f4-b72b-45d3-8209-c1abcdad1c88', '873cdf5e-d024-4c67-9874-057a0c21279d', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('90474f1a-733b-4d28-ad9e-72f1c86ab22a', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('90a6410d-0138-4629-b7ac-82d6712dce67', '873cdf5e-d024-4c67-9874-057a0c21279d', 11, '2026-11-15', 'Pertemuan Ke-11: Keamanan Sistem & Otentikasi Lanjutan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('91e60432-7785-45e3-8827-9f6a8c052552', '23266dbf-87fb-4587-8b3f-530f9558f006', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('928e1ac3-2abc-4ac7-9b3d-6c10644ed9dc', '873cdf5e-d024-4c67-9874-057a0c21279d', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('95c88679-8834-4001-a088-ae965a78bc61', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('985b42c4-b329-418d-b19f-05a27e0d5bb9', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('98ca2214-52c5-4367-822b-618744cc724b', '873cdf5e-d024-4c67-9874-057a0c21279d', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('9a9dee88-0478-459e-a547-d0bfa1289c29', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a20bdc18-4562-4296-9455-4db04b4c022e', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a3020579-1055-44ad-ae7c-c5239fa5a542', '244f1762-66a8-4957-b086-14a85de81efd', 14, '2026-12-06', 'Pertemuan Ke-14: Optimasi Performa & Build Caching', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a6839ff6-39c0-467a-bce7-236678d1ea3b', '23266dbf-87fb-4587-8b3f-530f9558f006', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a78dadf4-7f61-4430-bde5-b45be3509de4', '244f1762-66a8-4957-b086-14a85de81efd', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a7a5d92e-132d-45c4-9d2a-27296b7f0710', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('a857973f-efa8-45ae-8003-be66517f1d2b', '23266dbf-87fb-4587-8b3f-530f9558f006', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('a9480fb6-44a4-4385-bf24-f9704fee3250', '244f1762-66a8-4957-b086-14a85de81efd', 2, '2026-11-19', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 15:39:51', '2026-11-20 16:12:54', 0),
('ab3b17d8-8ba0-4799-a999-9cc3399f4825', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('ace619ee-bc37-455c-b171-1ca3aa647b29', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('af885186-7866-4aef-bb72-9c6d546e8151', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('b5a0519a-c655-4795-af0f-3e84f3b922e6', '873cdf5e-d024-4c67-9874-057a0c21279d', 1, '2026-09-02', 'Pertemuan 1: Pembahasan Materi Teori Web & Arsitektur Client-Server', '2026-11-19 09:52:55', '2026-11-20 16:12:54', 1),
('b6497a7d-89e1-4d44-90f5-5458472ef399', '23266dbf-87fb-4587-8b3f-530f9558f006', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('b8012cf1-1a4d-4757-ab87-5179e23842b3', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('b819c040-bb84-49c4-90e0-4ca8c76ecaed', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('bbffdf7f-e132-4f32-930d-8ab0b1dd91ab', 'fd782892-5581-41d9-acf7-47640702387b', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('bc55656a-3f84-4fa8-8b86-3655c703108b', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('bfe260d9-7b8f-447d-9121-9389684ed928', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('c2e172cb-98db-490c-bf21-b641bf7d419f', 'fd782892-5581-41d9-acf7-47640702387b', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('c3a0db39-5909-4c55-b32d-05c42936ed60', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('c691284c-4856-4c0c-97e6-19c115e6b881', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('ca780e49-ecce-4604-beb5-c347f3ef2e85', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('cca12818-8ff0-46a6-aaaf-e51a1b5f47a5', 'fd782892-5581-41d9-acf7-47640702387b', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('ce607727-3e06-48f2-a988-e94e72b1ef4b', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('cea3836b-e848-4095-976f-696b6a50c499', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('cf630ef0-34c9-4ff9-a6af-2c604a510b60', 'fd782892-5581-41d9-acf7-47640702387b', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('cf6f5da3-2e9d-4542-9b59-b5b9b4519ceb', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('cf7459f0-0a40-47bc-b462-0e42dae10b99', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('d14cbf81-802f-4a58-861d-f15d9eaeb1f3', '873cdf5e-d024-4c67-9874-057a0c21279d', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('d17bfa11-0174-41c1-81d6-c75f7bf60e6c', '23266dbf-87fb-4587-8b3f-530f9558f006', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('d6fa6dc2-5dda-4f8c-a5cb-973cde6579b0', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('d87b30de-bfb1-4e28-ba8d-aa6b580cd063', '244f1762-66a8-4957-b086-14a85de81efd', 5, '2026-10-04', 'Pertemuan Ke-5: Routing Dinamis & Navigasi Modular', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('db0a382c-560a-4fa7-bfa3-28776b7bdb94', 'fd782892-5581-41d9-acf7-47640702387b', 2, '2026-09-13', 'Pertemuan Ke-2: Dasar-dasar Struktur & Arsitektur Sistem', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('dc408579-b2dd-43cf-a50d-3ea6a1a7dc8a', 'fd782892-5581-41d9-acf7-47640702387b', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('dd19d7dc-5e5a-4019-8022-095010dde8bb', 'fd782892-5581-41d9-acf7-47640702387b', 7, '2026-10-18', 'Pertemuan Ke-7: Validasi Form & Handling Error', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('ddb33cc3-d16d-4c2b-a9f4-de1b2933516d', 'fd782892-5581-41d9-acf7-47640702387b', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('ddd5d56e-2b26-45cc-a7de-50b079523e70', 'fd782892-5581-41d9-acf7-47640702387b', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('de1bbd96-4d02-4490-aec3-70c78b1b7fdb', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('e03faf14-31b2-4556-a1dc-194684a4a3a4', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('e114fa70-ec99-4a16-a52a-0671385adfa8', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('e18591bc-0f3a-467f-8dd4-7c6ef5da1866', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 6, '2026-10-11', 'Pertemuan Ke-6: Integrasi API & Backend Services', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('e1b466f7-cd6d-4b3d-b323-b7a8ee9af78d', '244f1762-66a8-4957-b086-14a85de81efd', 3, '2026-09-20', 'Pertemuan Ke-3: Komponen Inti & Alur Kerja', '2026-11-20 16:12:54', '2026-11-20 16:48:12', 0),
('e52758fd-6518-449c-8041-fca3e134463e', '873cdf5e-d024-4c67-9874-057a0c21279d', 8, '2026-10-25', 'Pertemuan Ke-8: Evaluasi Tengah Semester (UTS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('e713323e-63dc-49ea-8460-9460c708db5b', 'fd782892-5581-41d9-acf7-47640702387b', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('e9c60178-447e-4a94-9efa-7de058f3b730', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 10, '2026-11-08', 'Pertemuan Ke-10: Database Query Optimization & Relasi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('eab9608d-bd43-4d86-8d64-6069d1b494aa', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 1, '2026-09-06', 'Pertemuan Ke-1: Pengenalan Silabus & Kontrak Perkuliahan', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('ec24d69a-5e54-48b3-a1b6-7de81d2152b6', 'fd782892-5581-41d9-acf7-47640702387b', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('ececb780-60bb-4bc7-b183-08b272441cf9', 'fd782892-5581-41d9-acf7-47640702387b', 12, '2026-11-22', 'Pertemuan Ke-12: File Upload & Storage Management', '2026-11-20 16:12:55', '2026-11-20 16:12:55', 0),
('f562770c-b514-4114-bf70-d73eeaa4c994', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 15, '2026-12-13', 'Pertemuan Ke-15: Review Proyek & Persiapan Produksi', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('f5d17359-c6ac-4388-bd3f-f3f2e5e3b4d3', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 4, '2026-09-27', 'Pertemuan Ke-4: State Management & Data Binding', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('fce2224d-b734-4901-9862-c49732de2a9b', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 16, '2026-12-20', 'Pertemuan Ke-16: Evaluasi Akhir Semester (UAS)', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('fd5da01b-9e2c-46b1-99c6-dd91bc833164', '244f1762-66a8-4957-b086-14a85de81efd', 9, '2026-11-01', 'Pertemuan Ke-9: Pola Desain Komponen & Reusability', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0),
('ff1bc13c-8d1e-429e-912e-11e87e6dbeed', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 13, '2026-11-29', 'Pertemuan Ke-13: Pengujian Otomatis & Testing Workflow', '2026-11-20 16:12:54', '2026-11-20 16:12:54', 0);

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `actor_user_id` varchar(36) NOT NULL,
  `actor_type` enum('admin','lecturer','student') NOT NULL DEFAULT 'lecturer',
  `entity_type` varchar(80) NOT NULL,
  `entity_id` varchar(36) NOT NULL,
  `action` varchar(80) NOT NULL,
  `before_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`before_data`)),
  `after_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`after_data`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `actor_user_id`, `actor_type`, `entity_type`, `entity_id`, `action`, `before_data`, `after_data`, `created_at`) VALUES
('10a8a30d-14b0-47cc-af99-8f0d7ade0a5e', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'attendance_sessions', '5a3733de-07e9-4395-8b35-00af476dcdcd', 'create_attendance_session', NULL, '{\"topic\":\"\",\"sessionDate\":\"2026-11-21\",\"meetingNumber\":1}', '2026-11-20 14:56:59'),
('2b00ae56-f604-442b-97b1-7694a93bc0e2', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '451f6e3e-f29e-4c1e-84b2-f4338f91144e', 'create_assignment', NULL, '{\"dueAt\":\"2026-11-23T23:59\",\"title\":\"REST API mini\",\"classId\":\"3d6244b2-a201-4d51-8d0d-3c7926daf289\",\"maxScore\":100,\"submissionMode\":\"url\"}', '2026-11-23 10:14:36'),
('43bbe2c4-eaca-4c99-b0c6-0a9f253d0252', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '86a46606-7c9f-4b90-a436-5434ccc4c880', 'create_assignment', NULL, '{\"title\":\"UTS Susulan Pemograman web\",\"maxScore\":100,\"dueAt\":\"2026-11-27T22:00\",\"submissionMode\":\"both\",\"classId\":\"fd782892-5581-41d9-acf7-47640702387b\"}', '2026-11-26 13:26:45'),
('5284c989-08cd-4656-bc41-eac214e9f58d', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '8185daca-228c-4ca4-9c88-d0c50e75195c', 'create_assignment', NULL, '{\"title\":\"Praktik HTML dan CSS\",\"maxScore\":100,\"dueAt\":\"2026-11-26T16:00\",\"submissionMode\":\"both\",\"classId\":\"f9ec1b8e-ce00-433c-a8b5-feb579e25901\"}', '2026-11-26 12:36:57'),
('5a959104-dde2-4e1d-b958-8c53b4a6d525', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '23e1158f-d960-4d58-989a-b66bbf7b9030', 'create_assignment', NULL, '{\"dueAt\":\"2026-11-23T23:59\",\"title\":\"REST API mini\",\"classId\":\"3d6244b2-a201-4d51-8d0d-3c7926daf289\",\"maxScore\":100,\"submissionMode\":\"url\"}', '2026-11-23 10:56:03'),
('775a713c-6744-4198-9491-7338d44ebfc8', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', 'bc7369cb-7c2c-4ccd-adb5-ae4c7a148810', 'create_assignment', NULL, '{\"title\":\"Praktik HTML dan CSS\",\"maxScore\":100,\"dueAt\":\"2026-11-26T14:30\",\"submissionMode\":\"both\",\"classId\":\"e3e77db4-c2dd-4031-a943-580c2d9e24a0\"}', '2026-11-26 12:33:41'),
('8b5161d6-cb06-4584-81fd-0741356328c2', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'attendance_sessions', 'a9480fb6-44a4-4385-bf24-f9704fee3250', 'create_attendance_session', NULL, '{\"topic\":\"\",\"sessionDate\":\"2026-11-20\",\"meetingNumber\":2}', '2026-11-20 15:39:51'),
('8c3ed814-97ab-48e5-8ab7-0778e79ea985', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'submissions', '0917dfd7-83b3-4413-9ff8-458ac7f7229a', 'grade_submission', '{\"score\":null}', '{\"score\":\"100.00\",\"status\":\"graded\",\"feedback\":\"\"}', '2026-11-26 10:16:34'),
('a4734840-f731-496d-b2a0-ededcb7a436e', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '33f0ff23-b97e-4a1f-af26-48c2ee88c45c', 'update_assignment', NULL, '{\"title\":\"Praktik HTML dan CSS\",\"maxScore\":100,\"dueAt\":\"2026-11-26T16:00\",\"submissionMode\":\"both\",\"status\":\"published\"}', '2026-11-26 13:41:41'),
('cddd50e1-0528-4e9f-8430-25e16ca1a6fe', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'attendance_sessions', '02f3f62f-743a-40f3-b42b-f12fb034ef8a', 'create_attendance_session', NULL, '{\"topic\":\"\",\"sessionDate\":\"2026-11-20\",\"meetingNumber\":2}', '2026-11-20 15:39:58'),
('f1cfbe44-0433-4c51-a751-dde755926256', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'lecturer', 'assignments', '33f0ff23-b97e-4a1f-af26-48c2ee88c45c', 'create_assignment', NULL, '{\"title\":\"Praktik HTML dan CSS\",\"maxScore\":100,\"dueAt\":\"2026-11-26T14:30\",\"submissionMode\":\"both\",\"classId\":\"13c12a0c-4d91-4025-8993-cade9eb7ed6b\"}', '2026-11-26 12:34:58');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` varchar(36) NOT NULL,
  `course_id` varchar(36) NOT NULL,
  `academic_term_id` varchar(36) NOT NULL,
  `class_code` varchar(30) NOT NULL,
  `display_name` varchar(180) NOT NULL,
  `schedule_text` varchar(180) DEFAULT NULL,
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `grading_locked_at` datetime DEFAULT NULL,
  `grades_published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `qr_code_token` varchar(100) DEFAULT NULL,
  `schedule_day` varchar(20) DEFAULT NULL,
  `start_time` varchar(10) DEFAULT NULL,
  `end_time` varchar(10) DEFAULT NULL,
  `campus_latitude` decimal(10,7) DEFAULT -6.9147440,
  `campus_longitude` decimal(10,7) DEFAULT 107.6098100,
  `campus_radius_meters` int(11) DEFAULT 300
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `course_id`, `academic_term_id`, `class_code`, `display_name`, `schedule_text`, `status`, `grading_locked_at`, `grades_published_at`, `created_at`, `updated_at`, `qr_code_token`, `schedule_day`, `start_time`, `end_time`, `campus_latitude`, `campus_longitude`, `campus_radius_meters`) VALUES
('13c12a0c-4d91-4025-8993-cade9eb7ed6b', '109ee5a0-5002-4e17-8602-4207bdac145c', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'DESAIN.02', 'Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.02)', 'Kamis, 14.30 - 16.00 WIB (Ruang R.D2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-DF6F5065', 'kamis', '14:30', '16:00', -6.9147440, 107.6098100, 500),
('23266dbf-87fb-4587-8b3f-530f9558f006', '858b36f1-085c-4788-ae52-7cb2ed3cf613', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'KEL.B', 'Pemrograman Visual II (IT 8 - Reguler Malam Kel.B)', 'Jum\'at, 20.15 - 21.45 WIB (Ruang R.B3)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-DDD63CBB', 'jumat', '20:15', '21:45', -6.9147440, 107.6098100, 500),
('244f1762-66a8-4957-b086-14a85de81efd', '858b36f1-085c-4788-ae52-7cb2ed3cf613', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'KEL.A', 'Pemrograman Visual II (IT 8 - Reguler Malam Kel.A)', 'Jum\'at, 18.45 - 20.15 WIB (Ruang R.B3)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-97000793', 'jumat', '18:45', '20:15', -6.9147440, 107.6098100, 500),
('3d6244b2-a201-4d51-8d0d-3c7926daf289', 'd512c944-a628-4ce3-a3fc-97c6da5acaf5', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'KEL.2', 'Pemrograman Web III (IT 7 - Kelompok 2)', 'Senin, 18.30 - 20.00 WIB (Ruang R.D2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-6E6D4E48', 'senin', '18:30', '20:00', -6.9147440, 107.6098100, 500),
('873cdf5e-d024-4c67-9874-057a0c21279d', 'b6df63a0-e077-4545-98bd-844258496a2e', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'REG-PAGI', 'Teori Pemrograman Web Fundamental I (IT 9 & PPMP - Reguler Pagi)', 'Kamis, 09.00 - 10.30 WIB (Ruang R.C2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-8142A981', 'kamis', '09:00', '10:30', -6.9147440, 107.6098100, 500),
('e3e77db4-c2dd-4031-a943-580c2d9e24a0', '109ee5a0-5002-4e17-8602-4207bdac145c', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'DESAIN.03', 'Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.03)', 'Kamis, 13.00 - 14.30 WIB (Ruang R.D2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-8DD37670', 'kamis', '13:00', '14:30', -6.9147440, 107.6098100, 500),
('f9ec1b8e-ce00-433c-a8b5-feb579e25901', '109ee5a0-5002-4e17-8602-4207bdac145c', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'DESAIN.01', 'Prak. Pemrograman Web Fundamental I (IT 9 & PPMP - Desain.01)', 'Kamis, 16.00 - 17.30 WIB (Ruang R.D2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-56C365F2', 'kamis', '16:00', '17:30', -6.9147440, 107.6098100, 500),
('fd782892-5581-41d9-acf7-47640702387b', 'dc1cddc3-bb4e-4a0a-9834-efe69a3ac054', 'e1f09713-1bfc-460f-b91a-74300ea35682', 'REG-PAGI', 'T + P Pemrograman Web II (IT 8 - Reguler Pagi)', 'Jum\'at, 13.00 - 15.00 WIB (Ruang R.B2)', 'active', NULL, NULL, '2026-11-19 09:52:54', '2026-11-20 14:55:28', 'EDF-B5E7B172', 'jumat', '13:00', '15:00', -6.9147440, 107.6098100, 500);

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` varchar(36) NOT NULL,
  `code` varchar(30) NOT NULL,
  `name` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `credit_units` tinyint(4) DEFAULT NULL,
  `lecturer_id` varchar(36) NOT NULL,
  `archived_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `code`, `name`, `description`, `credit_units`, `lecturer_id`, `archived_at`, `created_at`, `updated_at`) VALUES
('109ee5a0-5002-4e17-8602-4207bdac145c', 'PWP101', 'Praktikum Pemrograman Web Fundamental I', 'Praktikum laboratorium desain antarmuka, layout responsif, dan styling modern.', 1, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('858b36f1-085c-4788-ae52-7cb2ed3cf613', 'PV201', 'Pemrograman Visual II', 'Pengembangan aplikasi visual desktop dan GUI modern, event-driven architecture, dan integrasi database.', 2, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b6df63a0-e077-4545-98bd-844258496a2e', 'PWF101', 'Pemrograman Web Fundamental I', 'Konsep dasar web, arsitektur client-server, protokol HTTP, semantic HTML5, dan modern CSS.', 2, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d512c944-a628-4ce3-a3fc-97c6da5acaf5', 'PW301', 'Pemrograman Web III', 'Aplikasi web fullstack tingkat lanjut, React, Next.js, ORM, otentikasi sesi, dan cloud deployment.', 3, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('dc1cddc3-bb4e-4a0a-9834-efe69a3ac054', 'PW201', 'Pemrograman Web II', 'Pengembangan web dinamis, JavaScript modern, manipulasi DOM, AJAX, dan arsitektur RESTful API.', 3, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54');

-- --------------------------------------------------------

--
-- Table structure for table `enrollments`
--

CREATE TABLE `enrollments` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `enrollment_status` enum('active','dropped','completed') NOT NULL DEFAULT 'active',
  `enrolled_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `enrollments`
--

INSERT INTO `enrollments` (`id`, `class_id`, `student_id`, `enrollment_status`, `enrolled_at`, `created_at`, `updated_at`) VALUES
('00f6f40a-ac6a-4462-9a39-427d3f71abdf', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0178c198-468a-4e58-840d-e2ad44a705eb', 'fd782892-5581-41d9-acf7-47640702387b', '2a599842-8cf2-4ce0-8a2d-93bba6013a87', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('03c1f087-e7f2-4a4d-ae4d-a80a70fbd631', '23266dbf-87fb-4587-8b3f-530f9558f006', 'ec86d52a-fd48-439a-a11e-47f4328f5f3c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('03cbeaef-60b0-4023-9cbb-d5039d5dab7c', '873cdf5e-d024-4c67-9874-057a0c21279d', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0480eb0a-da53-4b36-a404-b3b8f5a6b2f2', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('05304a78-94e8-4a22-ae12-e83e3e8e0ca2', '873cdf5e-d024-4c67-9874-057a0c21279d', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('053727e4-3c86-4fe3-be39-884458896161', '873cdf5e-d024-4c67-9874-057a0c21279d', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('06ecc146-b612-4c8c-a1bb-501da28aaad9', 'fd782892-5581-41d9-acf7-47640702387b', '04032782-a9d4-465f-8b87-a1ad5d869bba', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('07fe2e0e-cdb9-4d3a-8fae-6ae4ec487d79', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('09224213-fce3-431a-92dc-687f0f402d5e', '244f1762-66a8-4957-b086-14a85de81efd', '2ab039a9-e2a7-4388-bda7-c0e678e33d8c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0a4c8b63-9596-41aa-9469-aa428a7f5def', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0b6cea40-4858-4c02-994e-9e9539ee826b', 'fd782892-5581-41d9-acf7-47640702387b', '6b17738f-0786-443f-b73e-018f1e066de6', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0b7c7aa8-1443-4d58-aa52-d96264bac2dd', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0c54e221-e298-4e4a-93d2-b9cce943908b', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0dda8771-e6c1-422e-9349-670d039c9e99', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'cbd6e730-7951-46c4-91ce-d603b48fc900', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0e5b9a71-e4c9-47a7-8255-7d7deda9bfab', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '4ea64847-a051-4cab-a498-b7e578ac9748', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0f6f2423-29b2-4a31-989b-b82fa263f8fb', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'e78b7acf-4f8f-454e-8736-b65700105737', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('12dc8db9-bed5-4b61-9f55-dac2871cfd64', 'fd782892-5581-41d9-acf7-47640702387b', '08acd1c8-2612-42e6-aabb-9fd446d2d1b7', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('167984e2-1d3b-4833-9d61-35e75def1a7e', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('16b117dc-b98c-45bc-ab75-41f7268f24f2', '244f1762-66a8-4957-b086-14a85de81efd', '635855cb-4881-4760-9d11-1de9bfea69a0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('171b5ea2-98cf-45b0-ba52-9cfad84ff5c3', '244f1762-66a8-4957-b086-14a85de81efd', '8079f98f-620f-4ddb-aff0-b83204676542', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('183ef811-419f-47e0-9c65-5db7a2fb3c06', '873cdf5e-d024-4c67-9874-057a0c21279d', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('18e42130-09e9-4c83-8918-192c9580616e', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'ab956136-0b15-4902-8611-7e47f9150865', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1c401eea-e0f5-489b-a60c-a99d2f72727a', '873cdf5e-d024-4c67-9874-057a0c21279d', '1a6a65b7-fedd-48ff-8945-08d267f891da', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1d6c6d35-b73b-440e-959c-309eb37755f5', '873cdf5e-d024-4c67-9874-057a0c21279d', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2016db29-1c63-4f71-8fe2-365bc57cb6c1', 'fd782892-5581-41d9-acf7-47640702387b', 'bc6072b1-9074-4f1c-a732-8f0cba723740', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('205d0c45-8de0-4d7d-b846-96d38959172c', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'a0f2a7ff-a2c7-4ff2-b7f7-6dad0c787b3a', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('24a04053-3938-4c87-9125-44fd9c9021cb', 'fd782892-5581-41d9-acf7-47640702387b', '6e369715-1671-4196-9db5-b7328f137027', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('24fdde23-ea52-4cec-a9f3-8f1040974983', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'f8f06e87-721c-47c2-a8ad-ddb866924082', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('25b3ac52-8a7d-4e7a-a119-4bc7e91ee925', '873cdf5e-d024-4c67-9874-057a0c21279d', '75981500-77fc-439d-968f-21f1819140f3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('26b2649f-8f97-432c-8c6b-559fcdcd913c', '873cdf5e-d024-4c67-9874-057a0c21279d', '00cf9565-3839-4a0a-b161-715a4fc681b3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('288592eb-ed7d-4c36-9c26-e221ce8ae043', 'fd782892-5581-41d9-acf7-47640702387b', '2d098fbc-50f2-4e45-969b-b12aa9dfe258', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('29a316d5-aed3-4148-957b-5c7e74eaed7c', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('29bc7ae2-5ab3-4719-acbe-da880f7f55cc', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2ad24209-6421-4af3-b687-bb153994f459', '23266dbf-87fb-4587-8b3f-530f9558f006', '1b3e9f67-af1f-450b-9ef0-66170b9ec57b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2b20f89a-edb5-4e2f-9399-f30419c7e847', '873cdf5e-d024-4c67-9874-057a0c21279d', '588983b2-daed-476b-b4dc-1b73fad3e1f4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2b7ee5b2-0c1e-4870-abe7-05aa83581b7e', '873cdf5e-d024-4c67-9874-057a0c21279d', '112406ec-4f1e-454e-a777-0042f2fe30f8', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2d151fe4-0c1d-4a8d-a722-96daef93ef3e', 'fd782892-5581-41d9-acf7-47640702387b', '95707901-dd6e-460d-bb6f-7cc0b8364eef', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2e176fc6-7ea1-4b9b-980c-083a46127d4a', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2ee3f16e-5232-49b9-8438-c6f86cee6343', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2f704fcd-dff1-4114-80ce-22da763711fe', '244f1762-66a8-4957-b086-14a85de81efd', '0b0ebdef-2215-4877-a95d-e22e29f7fd6d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2fba579e-ae24-4fe5-9be4-82c2ee3c8a3b', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '9aacd5a5-a450-4737-a4d7-79da0971a9a3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('31c49525-63eb-4c16-8f39-053878603158', '873cdf5e-d024-4c67-9874-057a0c21279d', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('32f9e8be-5986-4ff8-b63e-6c20ee500a93', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'aec2e6f9-5057-4d65-8ea9-44a9485429f0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('353c9598-9dbc-4812-8132-daa8b8921e15', '23266dbf-87fb-4587-8b3f-530f9558f006', '04032782-a9d4-465f-8b87-a1ad5d869bba', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('366a7da7-2d4e-48e0-9527-c11c527983fb', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('36c08168-6760-4b9e-8fce-ce96259cec0a', '873cdf5e-d024-4c67-9874-057a0c21279d', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('377b1c68-b748-431a-9bb2-a601a9003d3e', '873cdf5e-d024-4c67-9874-057a0c21279d', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('39b84211-1e74-416f-8265-5dba4c119f97', '244f1762-66a8-4957-b086-14a85de81efd', 'cf4c2fe8-5daa-4d5a-a9bf-1ee765490951', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('39e8312b-68e4-4330-b83d-5677c5396f45', 'fd782892-5581-41d9-acf7-47640702387b', '63da2cc9-7ddc-4e6a-a0b1-b34802e06024', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('3b4fcce9-12e2-44e8-aa6f-c93821c17f28', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('3bc7ea66-bfa8-4024-81fe-0ffac31ef306', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('3c89a80b-58f4-467b-8d72-6c80b110285a', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('3f3ca768-5e9b-41b9-8246-e8723c1a03d8', 'fd782892-5581-41d9-acf7-47640702387b', '6e18106e-6719-4148-beb0-24fd291aacd5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('4114155f-235e-44f6-84a6-ab503dd09555', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('418388d8-0885-450f-86cd-677b94fbcbaa', '244f1762-66a8-4957-b086-14a85de81efd', 'b7b7b2db-f802-4544-ae07-fc2dd99ba7b0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('4442530c-03db-4e85-a699-f48cc65489e8', 'fd782892-5581-41d9-acf7-47640702387b', '48e4ad8f-382b-4095-8b04-2a42825e39fb', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('47aeb47c-59a6-4318-a301-1a9c86f7efec', '244f1762-66a8-4957-b086-14a85de81efd', 'c30a6062-c0ce-4f28-9b20-0e5987ac1542', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('48955bd5-4114-4334-9e28-adff918e0094', '244f1762-66a8-4957-b086-14a85de81efd', 'e02aa250-f3bc-489a-a8b6-fe7e91b33e4b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('49418af1-de2a-4eb0-83f4-f4afe6f18b7b', '873cdf5e-d024-4c67-9874-057a0c21279d', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('4ebb9b55-4be8-4a87-88e5-eac0fb51f51c', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '7e889ee9-19b1-4548-961e-778f3a0b4bd4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('51be44a1-c9fe-4efb-95ad-0c8f14af0170', 'fd782892-5581-41d9-acf7-47640702387b', 'b7b7b2db-f802-4544-ae07-fc2dd99ba7b0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('523dc054-e50b-409a-a48c-b82a3e8ea5f2', '873cdf5e-d024-4c67-9874-057a0c21279d', 'aaba7626-81ee-4247-a769-e5095e6eb54d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('52bb0210-c68b-4aec-b4d3-27afaf62837e', '873cdf5e-d024-4c67-9874-057a0c21279d', '67b0338b-fd31-4fa4-acb4-2af7247b028a', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5326b3fa-7504-49b6-8fd2-c8c9588c8bfc', '873cdf5e-d024-4c67-9874-057a0c21279d', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('54800ee3-16c6-43a9-be74-4d5def2c42b9', '244f1762-66a8-4957-b086-14a85de81efd', '84fe4d25-5c1b-47cc-8676-71f90e15bcb4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('55599bda-4853-4738-bc0d-f6727e8254cd', '873cdf5e-d024-4c67-9874-057a0c21279d', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('594b70da-d0f8-4377-9185-5cfb55acca8c', '244f1762-66a8-4957-b086-14a85de81efd', '614f867d-cfc5-4868-8631-3fed5be1fa0b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('59671c63-a4ac-49fe-bf42-1f1edac89355', '873cdf5e-d024-4c67-9874-057a0c21279d', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('597fc634-958c-442b-bd39-26d7c1c6f01f', '23266dbf-87fb-4587-8b3f-530f9558f006', '1e8ad6d0-6d8e-41ce-b6df-06146e7f09d2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5b8bc8d6-92fc-4230-b80e-e9e162fa50e2', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'c509cfc2-b24e-4b1e-8b92-b6204076742d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5c76d992-2641-459d-b7a5-44345e64bb2b', '23266dbf-87fb-4587-8b3f-530f9558f006', '39cdf28f-5522-4bec-bc0e-9a854ceec381', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5d5a928e-2428-4513-9163-24664d7dee13', 'fd782892-5581-41d9-acf7-47640702387b', 'c30a6062-c0ce-4f28-9b20-0e5987ac1542', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5dd8ddd2-0694-406f-b815-d22f06fb257f', '244f1762-66a8-4957-b086-14a85de81efd', '7e561f91-d9f2-4678-a2c2-9db8c564b544', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5ea25909-f7da-4076-b275-8efa36272bc3', '873cdf5e-d024-4c67-9874-057a0c21279d', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5fd66455-9cc1-45db-b5ee-cb34ceee3020', '23266dbf-87fb-4587-8b3f-530f9558f006', '2d098fbc-50f2-4e45-969b-b12aa9dfe258', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('60787598-945a-4b64-96c9-7579771e7128', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '373fb9ab-eb9b-403c-92e1-df30c304b89e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('60867fda-aade-40c6-ae13-ee41e4a7ce11', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '923ba882-3faf-4c4d-99e5-9e64524eef60', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('609f9c34-76eb-45d5-b4c4-173ba9def104', '23266dbf-87fb-4587-8b3f-530f9558f006', '071c7c12-6011-4f37-bdeb-acfac0b4ff84', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('61174cef-ee02-4bb3-b3ee-ecc3980f9b6a', 'fd782892-5581-41d9-acf7-47640702387b', 'e5452107-ca6b-4275-9be8-ddd87398ed3d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('63b40d52-5a18-4336-8823-f4159706d5ee', '873cdf5e-d024-4c67-9874-057a0c21279d', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('64082d81-1bba-40e0-917c-516f3608ffe9', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '44af38ab-47de-4f95-bf60-c84aa7b200fc', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('64f97904-a4fa-4750-beac-1d20a3372080', '873cdf5e-d024-4c67-9874-057a0c21279d', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('64fe45e3-d414-456c-85d4-fb4505c6ed17', '873cdf5e-d024-4c67-9874-057a0c21279d', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6642f538-85a5-4c1d-8606-fcd9dd8770c2', 'fd782892-5581-41d9-acf7-47640702387b', '0b0ebdef-2215-4877-a95d-e22e29f7fd6d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('66c2c00a-69bd-4a84-9056-1eb85282523f', '23266dbf-87fb-4587-8b3f-530f9558f006', '08acd1c8-2612-42e6-aabb-9fd446d2d1b7', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6771eea6-c3ff-485d-8a99-836fe595b585', '873cdf5e-d024-4c67-9874-057a0c21279d', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6793a508-397e-49bf-9683-9320b661a2c9', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'd918d1b5-8ce0-4566-a30d-c467ee882b59', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('67dfda8f-d2f7-4345-8d7d-4326371582c6', '23266dbf-87fb-4587-8b3f-530f9558f006', '26b94cfa-1340-433b-8379-ca1b3204a491', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6920f106-b428-4d8a-8e25-5b6fb235b6a9', '873cdf5e-d024-4c67-9874-057a0c21279d', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('697c82e9-335e-4fc9-b0fd-1b52e4b8b8ef', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6bffa0c2-069c-4213-aff5-88dfe810d511', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '75981500-77fc-439d-968f-21f1819140f3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6cd78b4a-a1aa-4592-b666-0def1fbcd2b8', '873cdf5e-d024-4c67-9874-057a0c21279d', '70f4e367-a29f-4aa7-9dc7-d941955972b4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6d0497dd-a998-4f94-8cd2-a49a7e0a0ccb', '873cdf5e-d024-4c67-9874-057a0c21279d', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6e963bdd-f394-47ba-b1f3-620cf4ef7c21', 'fd782892-5581-41d9-acf7-47640702387b', '993cee57-427b-4fa4-9f18-1b138a23bc73', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6f206159-e4da-4df7-8571-106aba680e42', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6f7c84de-f194-4bfa-b323-41e9a378fcd9', 'fd782892-5581-41d9-acf7-47640702387b', '85a97b78-b722-4f87-8fb5-33a5affce350', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('728328aa-380d-4e11-a574-bbe8409481ae', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'd1cec31b-d4fb-41e8-90f7-92461978a09c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('744d8318-367b-406a-92fd-b44f3be6cdbd', '23266dbf-87fb-4587-8b3f-530f9558f006', '994408ad-38da-4fc4-bbe8-c23489fcf5e7', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('750e37aa-5e5d-410b-839c-148599ddd192', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('75b5b3bc-04c2-4264-aaf1-d290d8250b98', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'b99547b0-61d5-47ea-a606-0c66d9406c2d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('75d7594b-1fc2-4aba-a6b6-6fa62cfee394', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('76e3e8e3-1a00-4bfe-95f4-809952027920', '23266dbf-87fb-4587-8b3f-530f9558f006', 'b7067fb2-4d11-4069-b4ae-89c761007a88', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('779460e4-18ab-42fc-ad06-4061f01d5adc', '873cdf5e-d024-4c67-9874-057a0c21279d', 'c0032977-3bf1-4d47-8603-1191cd864f49', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('79f9806b-390a-4f54-aa4c-5e35d129e1d5', 'fd782892-5581-41d9-acf7-47640702387b', 'cf4c2fe8-5daa-4d5a-a9bf-1ee765490951', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7b9f4146-aa67-4f7d-a04b-03e9019a0a6e', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7cb8a96a-9794-4382-a186-beeb3162395a', '873cdf5e-d024-4c67-9874-057a0c21279d', '2881ec09-f070-44f1-b7a0-86d218b11211', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7ec47e80-236a-4951-a000-aa6d149b0212', 'fd782892-5581-41d9-acf7-47640702387b', '994408ad-38da-4fc4-bbe8-c23489fcf5e7', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7f50ba88-a87d-413e-bf8d-5b24c505f963', '244f1762-66a8-4957-b086-14a85de81efd', 'f3385427-0657-487d-a794-acaf5e0baf86', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7f845cee-56c2-434e-a47f-dd9bb83994e6', '244f1762-66a8-4957-b086-14a85de81efd', '37a419f4-447f-42c8-9f7c-de857d23af04', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7f93799b-5820-4a5d-b166-09cba204fb50', 'fd782892-5581-41d9-acf7-47640702387b', '39cdf28f-5522-4bec-bc0e-9a854ceec381', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7fb15730-5e82-4862-86e2-a83942938669', '244f1762-66a8-4957-b086-14a85de81efd', '94f4890c-9b62-461a-a701-7c66c1fe60a3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('804fc00a-9f67-4880-b429-c40e2b8e2a63', '23266dbf-87fb-4587-8b3f-530f9558f006', '929ebf14-21b3-4d90-8137-810fb831f558', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('80fed9b0-8acc-402d-8431-c4a8a562e1b1', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8117f730-137e-4cb4-882b-50d2f8fb6e48', '873cdf5e-d024-4c67-9874-057a0c21279d', '4ea64847-a051-4cab-a498-b7e578ac9748', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('839fbe58-4b6f-4c0e-a24a-bb3491489f0e', '244f1762-66a8-4957-b086-14a85de81efd', '6e18106e-6719-4148-beb0-24fd291aacd5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('83c55fed-f158-4ec9-a3d2-27b4767661fe', '873cdf5e-d024-4c67-9874-057a0c21279d', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('857bf390-2910-4569-b961-19c898ce2add', '23266dbf-87fb-4587-8b3f-530f9558f006', 'e98576cb-66a7-4dd4-9bf7-baeeb3969222', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('86237c25-a68e-48ab-947d-87f8b5295a16', 'fd782892-5581-41d9-acf7-47640702387b', 'b7067fb2-4d11-4069-b4ae-89c761007a88', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8685dda5-9688-4ac6-b348-93ef11d4bf27', 'fd782892-5581-41d9-acf7-47640702387b', '1e8ad6d0-6d8e-41ce-b6df-06146e7f09d2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8687e1aa-0320-4bb4-9332-249f9023eea6', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('889f62f7-3ecb-45d0-bbce-70ff2d47a3ca', '244f1762-66a8-4957-b086-14a85de81efd', '72d614af-4b17-4ecf-837c-1217d55cecaa', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('89a0341e-a0e6-420d-8c84-5bf68fa8ac06', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '5c301087-a2bf-42e1-b3ec-36ff8edff025', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8bb582f8-96a9-42cb-84bb-ff847a33de1a', 'fd782892-5581-41d9-acf7-47640702387b', '7e561f91-d9f2-4678-a2c2-9db8c564b544', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8c5e975f-2fd8-404a-a32e-b68c269735ea', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8d67bf4d-93ce-496a-9ced-970a35caeab7', '873cdf5e-d024-4c67-9874-057a0c21279d', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8edbafc1-dbd7-41e3-bcfd-dbe4ecaac0e9', 'fd782892-5581-41d9-acf7-47640702387b', '37a419f4-447f-42c8-9f7c-de857d23af04', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('91006be9-47a8-4731-ab81-05052c3f45ee', 'fd782892-5581-41d9-acf7-47640702387b', 'ec86d52a-fd48-439a-a11e-47f4328f5f3c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('93444856-e9be-4a69-8d30-ab3ca6a4b65f', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '92dd0aa0-0553-42fe-b311-f6d4b1b8093e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('96c27706-af6f-4ea1-a4c5-516c1736459e', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9940342b-6799-49d2-bc66-e0e65340308e', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('99e953ae-5239-4e18-bf6f-8c2a7cd909b8', '23266dbf-87fb-4587-8b3f-530f9558f006', '63da2cc9-7ddc-4e6a-a0b1-b34802e06024', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('99f75c55-9014-48c0-828e-995beffc4d2e', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9a1cb101-df13-4244-ab15-37991d72c520', '23266dbf-87fb-4587-8b3f-530f9558f006', 'bc6072b1-9074-4f1c-a732-8f0cba723740', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9a8138cc-3ba8-4879-b210-955ff79f58fd', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '1446e915-eb6b-4ebf-8a12-611148a9aa10', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9d2cd2cc-ec9d-45cf-a406-d71771ba2ee4', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'd8852d34-544e-4b83-8f58-dc3107390a13', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('a409c3b3-d4a4-4e8e-a1c0-2449b3aa67ef', 'fd782892-5581-41d9-acf7-47640702387b', '3292e0c7-bc39-43e2-8b3b-faaba890f25d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('a54f9ea2-870c-4588-92ed-cf18b35cb6f7', 'fd782892-5581-41d9-acf7-47640702387b', 'f3385427-0657-487d-a794-acaf5e0baf86', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('a6cbeb00-948a-406f-969d-085fbee88bcb', 'fd782892-5581-41d9-acf7-47640702387b', '614f867d-cfc5-4868-8631-3fed5be1fa0b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('a76058de-c53a-4dda-9d95-9ce7a02e502d', '23266dbf-87fb-4587-8b3f-530f9558f006', '6e369715-1671-4196-9db5-b7328f137027', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('a8d1962f-1a91-49c4-befd-5022bd9de16b', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('abd1e0e3-5e6d-424f-b91c-7090de47b045', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '5a8ec07f-3901-4933-8a17-b83f78775516', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('aed34215-774e-48ec-bec2-33e31f89c118', '244f1762-66a8-4957-b086-14a85de81efd', '85a97b78-b722-4f87-8fb5-33a5affce350', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('af8f936e-96dd-4d3c-b9ef-8a638dc71557', '244f1762-66a8-4957-b086-14a85de81efd', 'c8f87d0f-0259-47d3-94ba-95b1703b601e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('afcd5df5-7837-41ea-8353-f4055a2852c8', '23266dbf-87fb-4587-8b3f-530f9558f006', '993cee57-427b-4fa4-9f18-1b138a23bc73', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b42f72c5-eea1-4804-a1bf-a6462610947d', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b4707696-7253-4493-8881-e5b939fb6767', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b59dba31-4714-4d4e-b876-011f993b6140', 'fd782892-5581-41d9-acf7-47640702387b', '84fe4d25-5c1b-47cc-8676-71f90e15bcb4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b7c87dc3-d9a7-4dd7-a5dc-1226baa0a9e2', '873cdf5e-d024-4c67-9874-057a0c21279d', '5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ba6bb2fb-297a-4640-ae9d-87f8ba8e6c94', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '89915561-af6b-407c-b973-86bed6fee444', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bac4919f-4b2d-452a-afff-6e4d961d3d92', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'c397456c-5e1c-4051-9ea6-1d968f899eea', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bacccf4e-2816-45d8-821d-d671b49f1279', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bafa0d8a-a744-472c-852b-b7181f87ea11', '23266dbf-87fb-4587-8b3f-530f9558f006', '48e4ad8f-382b-4095-8b04-2a42825e39fb', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bc89a89a-9611-43fa-8549-c4a114e3af19', 'fd782892-5581-41d9-acf7-47640702387b', '94f4890c-9b62-461a-a701-7c66c1fe60a3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bdbee397-e2c3-4ba2-9f54-ce9162b470dd', 'fd782892-5581-41d9-acf7-47640702387b', 'e0eab939-728d-440a-a118-f40ca2eb37bc', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c08604f4-3d2b-4019-90ee-a7ea37dfcc78', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'ceeda36c-db98-47f8-872d-3aeebce50515', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c09cb2cb-d0a7-4356-9834-0806538038ed', 'fd782892-5581-41d9-acf7-47640702387b', '8079f98f-620f-4ddb-aff0-b83204676542', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c0fc29c3-61e2-46bc-9982-bd3ecfe4f1e5', '244f1762-66a8-4957-b086-14a85de81efd', 'e5452107-ca6b-4275-9be8-ddd87398ed3d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c1d80acb-5a10-4482-b4c0-890a70a15a1a', '873cdf5e-d024-4c67-9874-057a0c21279d', '151d2dbe-7ba2-489c-98c1-51f53facc154', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c29dab28-2d3c-4380-9a1e-d38196fb19c5', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '79e1414b-30f0-42dd-b466-13397e37c2d3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c34fa858-9a91-4afa-adb5-a2b87b6000a5', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', '0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c43659d8-a690-49ee-a2a6-972cd356d092', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'fa72432b-f405-49ef-a924-27f06f2bceb4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c4504a73-fc83-4134-a796-dc54e7363344', '873cdf5e-d024-4c67-9874-057a0c21279d', 'a733f98d-bf2b-4a99-a4f9-af820f02031c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c4e1837d-1d48-4d0b-b414-5a6f69aba03f', '873cdf5e-d024-4c67-9874-057a0c21279d', 'dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c8a23d24-2403-4272-ba0c-87c4699844b2', '23266dbf-87fb-4587-8b3f-530f9558f006', '95707901-dd6e-460d-bb6f-7cc0b8364eef', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c8ac1e65-d9cc-4123-96e7-870221a0c4cb', 'fd782892-5581-41d9-acf7-47640702387b', '929ebf14-21b3-4d90-8137-810fb831f558', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cba09f94-4e42-420d-94d0-37015b87a2f3', 'fd782892-5581-41d9-acf7-47640702387b', 'e98576cb-66a7-4dd4-9bf7-baeeb3969222', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cd106a4c-aee6-4878-82f7-713477993c4c', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '9634a3e5-328f-457b-9907-90455248bb11', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d0d9f126-55d1-42cb-95e2-55800cb9e4ba', '23266dbf-87fb-4587-8b3f-530f9558f006', '3292e0c7-bc39-43e2-8b3b-faaba890f25d', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d196069f-d8fc-4e1c-987d-5e37f63dcc84', '873cdf5e-d024-4c67-9874-057a0c21279d', '9ada69cc-9153-4bfb-b181-9a826d194ddd', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d4c99247-ffa3-46f4-92bd-ab1d779448ba', 'fd782892-5581-41d9-acf7-47640702387b', '635855cb-4881-4760-9d11-1de9bfea69a0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d7d7e9b8-dac0-42f4-9479-06bbe324e463', '23266dbf-87fb-4587-8b3f-530f9558f006', 'e0d9f240-5d11-43a8-93d7-87739d7c39c1', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d8112cee-34d0-4410-b2fb-c5ce155889a7', '244f1762-66a8-4957-b086-14a85de81efd', 'e0eab939-728d-440a-a118-f40ca2eb37bc', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d8299344-ba0e-48cc-8cdb-8c0f95a65149', '873cdf5e-d024-4c67-9874-057a0c21279d', '9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d82fae19-8782-491c-8f25-652e5b50a7da', '244f1762-66a8-4957-b086-14a85de81efd', '2a599842-8cf2-4ce0-8a2d-93bba6013a87', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('de9d1870-f5fd-46c0-a3d8-8ca487773c97', 'fd782892-5581-41d9-acf7-47640702387b', '72d614af-4b17-4ecf-837c-1217d55cecaa', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e15e49c3-3d73-4460-9f30-b48d71280699', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '25b44608-77bb-43ce-91bc-a8000229cbd4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e1a8e8a3-8f77-4403-8ce2-38146f9ab1ec', '873cdf5e-d024-4c67-9874-057a0c21279d', '7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e2d88fb9-3e13-44b1-808e-f57592413b7c', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e508a9cb-d05f-4c96-832b-ad84f60cea33', '873cdf5e-d024-4c67-9874-057a0c21279d', '6fb893a3-2a6b-4cc5-9719-af972b00126f', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e56bb668-1678-4890-b735-9d2683b2bf76', 'fd782892-5581-41d9-acf7-47640702387b', '1b3e9f67-af1f-450b-9ef0-66170b9ec57b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e6fafe6b-5154-44c1-97db-01fbb7853d8a', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '69f13f83-fad9-4443-9bbd-7c62da77e0e4', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e6febaa2-2f52-422d-8e7a-f8d70bef763e', '23266dbf-87fb-4587-8b3f-530f9558f006', '9963684d-6824-480b-bca3-21008ab33e9c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e9bcc944-5855-432a-8581-8558e988a9b5', 'fd782892-5581-41d9-acf7-47640702387b', 'c8f87d0f-0259-47d3-94ba-95b1703b601e', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ee89ec12-7966-49c2-8717-ff649bcd1a23', '873cdf5e-d024-4c67-9874-057a0c21279d', '4cc24ab7-fad6-4c87-8df4-0c3551824787', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('eef056ea-bc0b-4b2b-b6b5-9f7c8c722651', 'fd782892-5581-41d9-acf7-47640702387b', 'e02aa250-f3bc-489a-a8b6-fe7e91b33e4b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f08e0c1f-d608-40cf-8a35-da52f6caa518', 'fd782892-5581-41d9-acf7-47640702387b', '26b94cfa-1340-433b-8379-ca1b3204a491', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f2b79f39-ef8f-4a20-8f1c-580b93ab34a9', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '4d869de1-131a-4ee2-afdf-b18f6ee32afe', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f39c81e0-dca3-4bf3-8f10-8ece9128e51d', '873cdf5e-d024-4c67-9874-057a0c21279d', '35c23926-2ac7-4392-90e7-1815914bb5b3', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f452d080-1f5b-42b9-b9e3-6dc55c5e15e1', '873cdf5e-d024-4c67-9874-057a0c21279d', 'fe40de65-4798-4c4a-8db8-144774ce1369', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f4810af8-cd7a-4a70-be14-79023c1a6252', '873cdf5e-d024-4c67-9874-057a0c21279d', 'ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f4e2ad7f-362c-446d-b2ff-5e7478339b96', '873cdf5e-d024-4c67-9874-057a0c21279d', '9b24d0d4-0e8e-480c-9912-615c7748159c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f70e65c8-00be-4c4b-b427-e5aa927fd329', 'fd782892-5581-41d9-acf7-47640702387b', '071c7c12-6011-4f37-bdeb-acfac0b4ff84', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f793cc99-99e8-4624-af61-48d5a1596154', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'fcc96061-2092-48bf-9d26-96d268a027df', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f8f01fa1-b980-481c-93e2-83c74f00840a', '873cdf5e-d024-4c67-9874-057a0c21279d', '0415ffa8-b679-4b93-a41f-9ed45352b209', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f93ac0d1-105a-4d53-8ae5-6f0ab6a91f98', '873cdf5e-d024-4c67-9874-057a0c21279d', '7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f97ec3b4-dd3b-4c7a-b85c-f0d8ecbd13ba', 'fd782892-5581-41d9-acf7-47640702387b', '2ab039a9-e2a7-4388-bda7-c0e678e33d8c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fadb7a06-bdcb-45c0-b36d-2a54651cad4f', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', '7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fb64fa58-e3be-4fca-bf3b-509636f2ac5b', '244f1762-66a8-4957-b086-14a85de81efd', '6b17738f-0786-443f-b73e-018f1e066de6', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fb75712d-eceb-4e0c-99ae-706ed01e8901', '3d6244b2-a201-4d51-8d0d-3c7926daf289', '442ace84-9772-4616-8824-1efcd12906be', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fb86909d-d802-48ba-b061-61798153d638', 'fd782892-5581-41d9-acf7-47640702387b', 'e0d9f240-5d11-43a8-93d7-87739d7c39c1', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fc6660ee-7ed1-41d3-b887-0aff18c2c359', 'fd782892-5581-41d9-acf7-47640702387b', '9963684d-6824-480b-bca3-21008ab33e9c', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fc705c94-e7c5-4e3c-9ddb-9277602795f5', '873cdf5e-d024-4c67-9874-057a0c21279d', 'c3d240d7-0548-4cf3-94e6-eb81ed793350', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fe142076-c421-4525-849e-558d76683dc4', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', '2881ec09-f070-44f1-b7a0-86d218b11211', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fff05b21-d347-4689-9b03-7ab33e40d77c', '873cdf5e-d024-4c67-9874-057a0c21279d', '57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'active', '2026-11-19 09:52:54', '2026-11-19 09:52:54', '2026-11-19 09:52:54');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` varchar(36) NOT NULL,
  `assessment_item_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `score` decimal(7,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` varchar(36) NOT NULL,
  `graded_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `assessment_item_id`, `student_id`, `score`, `feedback`, `graded_by`, `graded_at`, `created_at`, `updated_at`) VALUES
('3d48d614-eedc-401b-9a6f-86ac4a8fa68c', '4dc9b845-0fe9-4363-942f-ba729295e197', '9634a3e5-328f-457b-9907-90455248bb11', 100.00, NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 03:16:33', '2026-11-26 10:16:33', '2026-11-26 10:16:33');

-- --------------------------------------------------------

--
-- Table structure for table `grade_scales`
--

CREATE TABLE `grade_scales` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `letter_grade` varchar(5) NOT NULL,
  `min_score` decimal(5,2) NOT NULL,
  `max_score` decimal(5,2) NOT NULL,
  `grade_point` decimal(4,2) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `grade_scales`
--

INSERT INTO `grade_scales` (`id`, `class_id`, `letter_grade`, `min_score`, `max_score`, `grade_point`, `created_at`, `updated_at`) VALUES
('022b8830-69c6-451a-b453-1100fab80e3e', '873cdf5e-d024-4c67-9874-057a0c21279d', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('02d054be-4de4-4b5f-9fb4-5fe341339da1', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('02e35817-ce50-4984-9b03-fd8ae64ec03e', 'fd782892-5581-41d9-acf7-47640702387b', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('030b888a-5015-4a47-9481-993220cb938b', '23266dbf-87fb-4587-8b3f-530f9558f006', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('031aa8d8-80f7-42d7-80de-67d8ab71654d', '244f1762-66a8-4957-b086-14a85de81efd', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('0344de18-bca3-41d6-872f-6f629c5d1b1b', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('04d7cef1-223d-451c-944f-8ee89765f6e5', '873cdf5e-d024-4c67-9874-057a0c21279d', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('07996063-27f4-40f5-bf21-6a0c06cc9179', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('08ccfc55-7980-44d9-bf8e-d6869f5d1724', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1453a0bc-c4ba-41bb-a078-0ff4a91e1e60', 'fd782892-5581-41d9-acf7-47640702387b', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('160de8fb-4227-468a-ad86-40b91c5135ff', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('17a99952-ba95-4ac2-83f5-13731cc8403f', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1b48e0f2-8d76-4a6f-8c1d-0c79b22f25a6', '244f1762-66a8-4957-b086-14a85de81efd', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('1dacc23e-2586-4ebe-8055-e6c291f72c15', '23266dbf-87fb-4587-8b3f-530f9558f006', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('249886d8-a8b6-4a10-9c21-b892a46e6ff6', '23266dbf-87fb-4587-8b3f-530f9558f006', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('2aceed7b-c31f-4955-afbf-c4ec81051a95', '873cdf5e-d024-4c67-9874-057a0c21279d', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2d05b4b4-a4d6-403b-b398-9b07fe125b8e', 'fd782892-5581-41d9-acf7-47640702387b', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('39087a93-7296-4258-ad8f-3f33b35cafef', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('3aff45f3-a325-4287-b7cb-2c89f32a30b8', '244f1762-66a8-4957-b086-14a85de81efd', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('3c8e3e97-26c8-48c0-b35e-4af45a12b26a', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('40b98d72-3dc9-4fc1-a431-901ba98208ec', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('40fb5437-ebea-4c7b-bcbb-8f045a78338c', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('412226cc-fd3b-4314-b239-3365806693cd', 'fd782892-5581-41d9-acf7-47640702387b', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('450a8fdf-17c5-45eb-8570-47029e7fba3c', 'fd782892-5581-41d9-acf7-47640702387b', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('45204596-0b25-4c5f-81c2-c585230a69f2', '23266dbf-87fb-4587-8b3f-530f9558f006', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('4e38a09e-ce18-48c4-8925-57badcc2f798', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('4ee4e644-36c8-4123-8c4e-21b369370498', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5a6f1b84-cce4-4a48-89b7-e81ed6c1518a', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5ba2fa56-5971-476c-939c-ec8e898f87c4', '23266dbf-87fb-4587-8b3f-530f9558f006', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('5f172ce6-c956-418f-b663-cb8f32501a40', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6aedade4-5607-4563-b592-52f6ba096330', '23266dbf-87fb-4587-8b3f-530f9558f006', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('79c4df43-ef84-42bb-8679-0b531d41b40d', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'E', 0.00, 39.99, 0.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7ab4f029-ef33-4e00-950c-636aff526c81', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7c1150c9-6cc4-4258-8fde-3d478fea8cea', 'fd782892-5581-41d9-acf7-47640702387b', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('7fa0cbb4-d48f-40f0-a62c-5966f8f25c6e', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('80ce5364-eda6-4f92-be0d-33f2d926e4a5', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('81b4490a-aec4-47bf-820d-d56c80363528', '873cdf5e-d024-4c67-9874-057a0c21279d', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('8670bd7e-2f72-461e-ac6c-af4dd66e74ad', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('90162210-4a56-4b7e-aa48-02f15b1912c8', '244f1762-66a8-4957-b086-14a85de81efd', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('91892ddf-0332-481f-b633-8f2dbe08e716', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9884de30-ac23-4c2a-896e-3771be58650f', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('997690ed-8ac2-4538-9d1d-61764a46f9cf', '23266dbf-87fb-4587-8b3f-530f9558f006', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('a4a1e294-8c16-49a6-8cfd-c3954aba64f5', '244f1762-66a8-4957-b086-14a85de81efd', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('a686623d-7836-4549-9bfc-6c685cf363f8', '244f1762-66a8-4957-b086-14a85de81efd', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b0f23823-7b7d-409e-b47b-bd8a01e4d9cb', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b2fea0aa-09ed-41b2-a7b7-7e532702015b', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b3a07adb-9458-48b5-90d0-5e9a0e5daa39', '244f1762-66a8-4957-b086-14a85de81efd', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b79dd8ca-8c13-4ac9-b2ce-2b6c35864e4d', 'fd782892-5581-41d9-acf7-47640702387b', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b850bf92-a29d-4030-a5a2-4fd75627ef69', 'fd782892-5581-41d9-acf7-47640702387b', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b9658049-9ff9-4cd7-9e96-5912f7a8c0c5', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('b9e49a50-86b2-4930-b8a0-38c1c9118535', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ba53031e-506e-4396-8b0f-5ce1253642cb', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('bdbc1520-3522-40b8-8448-c0987ac0f507', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('c56636e7-61be-40a1-82bb-34c8afa5d128', '873cdf5e-d024-4c67-9874-057a0c21279d', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c6744b11-2617-44af-bbfb-38c32a3ee249', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ca4ef96d-fa49-4fa4-9088-30084782ad3b', '873cdf5e-d024-4c67-9874-057a0c21279d', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cbc9fe40-6bd7-4b32-bda9-8a41dd44f75a', 'fd782892-5581-41d9-acf7-47640702387b', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('cd50f5d2-8834-4f84-9884-882dc7310fdc', '244f1762-66a8-4957-b086-14a85de81efd', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('ce5e0303-a8fb-4867-8622-5f42ec2a27a3', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d50cabc3-1b93-4d42-9163-aa53bc390ed9', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d52d279c-40ba-4665-b91e-90152c404228', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'C', 55.00, 59.99, 2.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d833e146-ee4e-48fa-b4e0-183f5c04e147', '873cdf5e-d024-4c67-9874-057a0c21279d', 'A-', 80.00, 84.99, 3.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('da532203-8798-438c-92fd-2c5da0dd7abf', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'B', 70.00, 74.99, 3.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('e0bc4969-f738-4072-96b4-48adcd1ef771', '23266dbf-87fb-4587-8b3f-530f9558f006', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('e3d453ce-6c83-41c5-a554-25b3e559b080', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'D', 40.00, 54.99, 1.00, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e4122eed-5c7e-4832-b80e-cc0ed4c20b68', '23266dbf-87fb-4587-8b3f-530f9558f006', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('e74274d3-736b-4e45-b743-1e430520f411', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('ea5171d6-638f-4e1a-9b3c-a48f2939fc4f', '873cdf5e-d024-4c67-9874-057a0c21279d', 'B+', 75.00, 79.99, 3.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('edc8ab9b-6379-46cf-8d6c-775ea90b6ccc', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('f007c951-57f8-4baf-b27e-5e0adf312b59', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'B-', 65.00, 69.99, 2.70, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f614c18f-5cc2-4fa2-9bf7-ac26cb597548', '873cdf5e-d024-4c67-9874-057a0c21279d', 'C+', 60.00, 64.99, 2.30, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('fd47fc5e-275d-46d1-af01-c72e0fd339a9', '244f1762-66a8-4957-b086-14a85de81efd', 'A', 85.00, 100.00, 4.00, '2026-11-19 09:52:55', '2026-11-19 09:52:55');

-- --------------------------------------------------------

--
-- Table structure for table `grading_categories`
--

CREATE TABLE `grading_categories` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `weight_percent` decimal(5,2) NOT NULL,
  `aggregation_method` enum('average','sum_normalized','manual') NOT NULL DEFAULT 'average',
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` smallint(6) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `grading_categories`
--

INSERT INTO `grading_categories` (`id`, `class_id`, `name`, `weight_percent`, `aggregation_method`, `is_required`, `sort_order`, `created_at`, `updated_at`) VALUES
('04279994-735c-4248-a65a-c50f6f615e38', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('09a45250-2a92-44df-96d0-38275bf39e58', 'fd782892-5581-41d9-acf7-47640702387b', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('0b16b747-f6c4-4fcb-b6b0-4c6f4f2d6544', 'fd782892-5581-41d9-acf7-47640702387b', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('0e2d14f0-5120-4c6b-88f2-7a58b099fa68', '23266dbf-87fb-4587-8b3f-530f9558f006', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:49', '2026-11-19 15:10:49'),
('19c0e5d6-6103-4339-8321-82e0a80e7e68', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:51', '2026-11-19 15:10:51'),
('1ba2069d-b825-483b-ab51-30c27664f612', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:48', '2026-11-19 15:10:48'),
('235527d7-33fc-4843-b4e2-5b52b3e00a72', '244f1762-66a8-4957-b086-14a85de81efd', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('30deb01f-fdc1-4403-856d-8e360409cd5d', 'fd782892-5581-41d9-acf7-47640702387b', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('3d14a7fa-54c6-498a-b1e5-e6a8acfa14e5', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:51', '2026-11-19 15:10:51'),
('4667e101-9095-4ccb-84b4-f74ae5d86826', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('48a03108-e8d2-4f79-83ae-aa15cb92d7b7', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('4f0b01e3-1082-42b8-a865-ac8a1bf1757e', '873cdf5e-d024-4c67-9874-057a0c21279d', 'Ujian Tengah Semester', 30.00, 'average', 1, 3, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('57668c33-c1e6-4024-bbc9-8ba09c4870e0', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('58ba14bb-4346-4bd6-a9b1-16fdc2c20c6e', '873cdf5e-d024-4c67-9874-057a0c21279d', 'Presensi', 10.00, 'average', 0, 1, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('5be539e6-a502-45cd-86d0-06b581c38236', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('66e88d76-3029-4880-9e3d-ca5e54ccbd72', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('76ea13c5-7312-470a-a657-e125d2c90f01', '23266dbf-87fb-4587-8b3f-530f9558f006', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:49', '2026-11-19 15:10:49'),
('848d71d9-3cf9-47b7-9dd6-e48738b85fe3', '23266dbf-87fb-4587-8b3f-530f9558f006', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:49', '2026-11-19 15:10:49'),
('84bc23b1-e282-4314-beaa-7e9267ad7ab9', '873cdf5e-d024-4c67-9874-057a0c21279d', 'Ujian Akhir Semester', 30.00, 'average', 1, 4, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('86764db7-ec76-4833-bb2a-deb8933fdc6a', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('8ce50c78-4582-45ee-9742-83e28ba187ab', '244f1762-66a8-4957-b086-14a85de81efd', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('9027e80d-3162-4423-aa51-263dc747aac4', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:51', '2026-11-19 15:10:51'),
('92c2c1ec-ff1d-4717-9772-98ca2534d165', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('97b2be20-6be1-4595-84a0-87afcbc8ee74', '873cdf5e-d024-4c67-9874-057a0c21279d', 'Tugas Mandiri', 30.00, 'average', 1, 2, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('9c169be5-f02d-4a3d-be60-f3a823fc7f6b', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:48', '2026-11-19 15:10:48'),
('a4e85ada-6385-4c13-a08f-e3492118142c', '23266dbf-87fb-4587-8b3f-530f9558f006', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:49', '2026-11-19 15:10:49'),
('af3fc3ee-4f20-4eee-975f-b22c8d0b4deb', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Kuis & Tugas Mandiri', 15.00, 'average', 0, 3, '2026-11-19 15:10:48', '2026-11-19 15:10:48'),
('b45f7170-2e0c-4572-b259-81995662c1c8', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:48', '2026-11-19 15:10:48'),
('b633e4d7-d45a-4ea6-9cec-f612bd78b1c6', 'fd782892-5581-41d9-acf7-47640702387b', 'Ujian Akhir Semester (UAS)', 30.00, 'average', 0, 5, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('bc974e55-3189-4208-9e81-d40e50c95dca', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('be9c0d44-a7fe-4a75-9725-c4c9fb92e597', 'fd782892-5581-41d9-acf7-47640702387b', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('c0886553-a7c8-4a6a-8522-6550b20e3ee4', '23266dbf-87fb-4587-8b3f-530f9558f006', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:49', '2026-11-19 15:10:49'),
('cc25fb70-9a96-49ed-8df0-ebfd1217c6d3', '244f1762-66a8-4957-b086-14a85de81efd', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('de5931b8-f663-4d45-8e67-313eaee2e164', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:51', '2026-11-19 15:10:51'),
('edad760c-896e-4f52-b416-aaa6a53db3c3', '244f1762-66a8-4957-b086-14a85de81efd', 'Tugas & Praktikum', 20.00, 'average', 0, 1, '2026-11-19 15:10:50', '2026-11-19 15:10:50'),
('f239f6a8-4c75-474c-b472-f1f061adc6f1', 'e3e77db4-c2dd-4031-a943-580c2d9e24a0', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:51', '2026-11-19 15:10:51'),
('f485df7d-8b3a-4501-8b7c-ecb9a1228a9f', '13c12a0c-4d91-4025-8993-cade9eb7ed6b', 'Ujian Tengah Semester (UTS)', 25.00, 'average', 0, 4, '2026-11-19 15:10:48', '2026-11-19 15:10:48'),
('f81dc74c-5b95-4bca-8661-b19b2f7d5e1f', 'f9ec1b8e-ce00-433c-a8b5-feb579e25901', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:52', '2026-11-19 15:10:52'),
('fa41eb16-9a51-447c-9d5f-92dd6e5af0ff', '244f1762-66a8-4957-b086-14a85de81efd', 'Presensi & Keaktifan', 10.00, 'average', 0, 2, '2026-11-19 15:10:50', '2026-11-19 15:10:50');

-- --------------------------------------------------------

--
-- Table structure for table `learning_materials`
--

CREATE TABLE `learning_materials` (
  `id` varchar(36) NOT NULL,
  `class_id` varchar(36) NOT NULL,
  `meeting_number` smallint(6) DEFAULT NULL,
  `title` varchar(180) NOT NULL,
  `description` text DEFAULT NULL,
  `external_url` text DEFAULT NULL,
  `file_object_key` varchar(500) DEFAULT NULL,
  `published_at` datetime DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `material_type` varchar(30) NOT NULL DEFAULT 'article',
  `section_name` varchar(180) DEFAULT NULL,
  `content_body` longtext DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `duration_minutes` int(11) NOT NULL DEFAULT 2
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `learning_materials`
--

INSERT INTO `learning_materials` (`id`, `class_id`, `meeting_number`, `title`, `description`, `external_url`, `file_object_key`, `published_at`, `created_by`, `created_at`, `updated_at`, `material_type`, `section_name`, `content_body`, `sort_order`, `duration_minutes`) VALUES
('1b34e586-e55b-4da6-8ebc-e16e8ab2c35f', 'fd782892-5581-41d9-acf7-47640702387b', 1, 'Javascript Dasar 4-5', NULL, 'https://docs.google.com/presentation/d/1zHbJM2xfCLSN6mwO1ItwE0-NQD0Mugzw/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:21:35', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:21:35', '2026-11-26 09:21:35', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 4, 2),
('2121a79f-e236-43f6-9529-2224f84ebb50', '873cdf5e-d024-4c67-9874-057a0c21279d', 1, 'Javascript Dasar 1', NULL, 'https://docs.google.com/presentation/d/1QkPB_834yOjSTsBxNs6UE-cmL-9-u7iC/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:25:48', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:25:48', '2026-11-26 09:25:48', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 1, 2),
('4392c374-82ba-4f12-a64a-314b5c0bff8a', '873cdf5e-d024-4c67-9874-057a0c21279d', 1, 'Javascript Dasar 3', NULL, 'https://docs.google.com/presentation/d/1AK3h3qEccYCu5RUZIAiKNLv8PrhZoOGg/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:26:53', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:26:53', '2026-11-26 09:26:53', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 3, 2),
('5f275e97-6b1f-40a0-97c6-1b3ff8d276ca', 'fd782892-5581-41d9-acf7-47640702387b', 1, 'Javascript Dasar 1', NULL, 'https://docs.google.com/presentation/d/1QkPB_834yOjSTsBxNs6UE-cmL-9-u7iC/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:16:41', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:16:41', '2026-11-26 02:22:45', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 1, 2),
('88cfba65-2925-4f14-bdad-f1911fccd88e', 'fd782892-5581-41d9-acf7-47640702387b', 1, 'Javascript Dasar 3', NULL, 'https://docs.google.com/presentation/d/1AK3h3qEccYCu5RUZIAiKNLv8PrhZoOGg/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:18:16', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:18:16', '2026-11-26 02:20:50', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 3, 2),
('c6d75e20-184d-4de0-9e42-51bd7c64e2d4', '3d6244b2-a201-4d51-8d0d-3c7926daf289', 1, 'Slide Panduan Baru', NULL, 'https://docs.google.com/presentation/d/1ERf_Ca4Jn77EvPdjoWlWSWzHdvSLe_sf/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-23 13:10:49', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-23 20:10:49', '2026-11-23 20:10:49', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 1, 2),
('d1aff7e8-e68a-4a48-a858-96ec45d74a4e', 'fd782892-5581-41d9-acf7-47640702387b', 1, 'Javascript Dasar 2', NULL, 'https://docs.google.com/presentation/d/1XWgtpEzLgKZeJkBxn8Gz1y532Yb10_he/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:17:41', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:17:41', '2026-11-26 02:19:29', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 2, 2),
('e7337c1a-996b-437b-af59-122e00fd4735', '873cdf5e-d024-4c67-9874-057a0c21279d', 1, 'Javascript Dasar 2', NULL, 'https://docs.google.com/presentation/d/1XWgtpEzLgKZeJkBxn8Gz1y532Yb10_he/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:26:21', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:26:21', '2026-11-26 09:26:21', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 2, 2),
('efb0f753-3fba-4d10-8385-580fbc706e65', '873cdf5e-d024-4c67-9874-057a0c21279d', 1, 'Javasript Dasar 4-5', NULL, 'https://docs.google.com/presentation/d/1zHbJM2xfCLSN6mwO1ItwE0-NQD0Mugzw/embed?start=false&loop=false&delayms=3000', NULL, '2026-11-26 02:27:21', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 09:27:21', '2026-11-26 09:27:21', 'pdf', 'MATERI 1: PERSIAPAN & PENDAHULUAN', '', 4, 2);

-- --------------------------------------------------------

--
-- Table structure for table `lecturers`
--

CREATE TABLE `lecturers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nip` varchar(50) DEFAULT NULL,
  `academic_title` varchar(100) DEFAULT NULL,
  `institution_name` varchar(180) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lecturers`
--

INSERT INTO `lecturers` (`id`, `name`, `email`, `password_hash`, `nip`, `academic_title`, `institution_name`, `phone`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
('9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'Muhammad Akbar Firdaus, S.Kom', 'dosen@eduflow.test', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '198001012005011001', 'Sarjana Informatika', 'STIKOM El Rahma', '081234567890', 1, '2026-11-23 11:48:36', '2026-11-19 09:52:54', '2026-11-23 18:48:36');

-- --------------------------------------------------------

--
-- Table structure for table `material_progress`
--

CREATE TABLE `material_progress` (
  `id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `material_id` varchar(36) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 1,
  `completed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `material_progress`
--

INSERT INTO `material_progress` (`id`, `student_id`, `material_id`, `is_completed`, `completed_at`) VALUES
('c22f44e5-501b-4e2b-9461-4e6676707c36', '4d869de1-131a-4ee2-afdf-b18f6ee32afe', 'c6d75e20-184d-4de0-9e42-51bd7c64e2d4', 1, '2026-11-24 10:53:01');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `body` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `target_url` varchar(500) DEFAULT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `body`, `type`, `target_url`, `read_at`, `created_at`, `updated_at`) VALUES
('1cf175de-d4d3-4cba-9dbf-081c6480589c', '9634a3e5-328f-457b-9907-90455248bb11', 'Tugas Telah Dinilai: REST API mini', 'Nilai Anda untuk \'REST API mini\' adalah 100.00/100.', 'assignment_graded', '/student/assignments/23e1158f-d960-4d58-989a-b66bbf7b9030', NULL, '2026-11-26 10:16:33', '2026-11-26 10:16:33'),
('a616d1b7-d174-4cd6-8f03-9ccaabb33f82', '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', 'Jadwal Semester Ganjil 2026/2027 Aktif', '8 Kelas perkuliahan telah terkonfigurasi lengkap dengan 113 mahasiswa terdaftar.', 'system', '/classes', NULL, '2026-11-19 09:52:55', '2026-11-19 09:52:55'),
('ad4bedd8-b99b-4cd9-9c54-b6e427bd90f0', '52b2b49a-dcce-4912-a382-8033322d9bc3', 'Selamat Datang di EDUFlow', 'Anda telah terdaftar di kelas Teori Pemrograman Web Fundamental I. Silakan periksa materi dan tugas.', 'system', '/student/classes', NULL, '2026-11-19 09:52:55', '2026-11-19 09:52:55');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `student_number` varchar(50) NOT NULL,
  `study_program` varchar(150) DEFAULT NULL,
  `cohort` varchar(30) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `email`, `password_hash`, `student_number`, `study_program`, `cohort`, `phone`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
('00cf9565-3839-4a0a-b161-715a4fc681b3', 'Muhammad Nur Faizin', '2611090013@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090013', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('04032782-a9d4-465f-8b87-a1ad5d869bba', 'Muhamad Abiel Dhiya Ulhaq', '2511080092@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080092', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0415ffa8-b679-4b93-a41f-9ed45352b209', 'Aiko muhamad sukma', '261109p004@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P004', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:42', '2026-11-19 09:52:54', '2026-11-26 09:23:43'),
('071c7c12-6011-4f37-bdeb-acfac0b4ff84', 'Parhan', '2511080012@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080012', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('08acd1c8-2612-42e6-aabb-9fd446d2d1b7', 'Virgi Alpiansyah', '2511080028@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080028', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0b0ebdef-2215-4877-a95d-e22e29f7fd6d', 'Ayu Setiana', '2511080091@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080091', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('0b4a88f9-2f33-4bf2-86c3-ce3dbf57c5a5', 'Azkia Raisa Ali Ramadani', '261109p006@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P006', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:48', '2026-11-19 09:52:54', '2026-11-26 09:24:48'),
('112406ec-4f1e-454e-a777-0042f2fe30f8', 'Alika Syah Nurfitri', '2611090033@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090033', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:55', '2026-11-19 09:52:54', '2026-11-26 09:23:55'),
('1446e915-eb6b-4ebf-8a12-611148a9aa10', 'Al Zahra Haerani', '2611090059@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090059', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('151d2dbe-7ba2-489c-98c1-51f53facc154', 'Bilaal Taqiyuddiin Romadloon', '2611090063@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090063', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:08', '2026-11-19 09:52:54', '2026-11-26 09:23:08'),
('1a6a65b7-fedd-48ff-8945-08d267f891da', 'Muhammad Nuryayi', '261109p007@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P007', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1b3e9f67-af1f-450b-9ef0-66170b9ec57b', 'Muhammad Rama Idznillah Firmansyah', '2511080038@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080038', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('1e8ad6d0-6d8e-41ce-b6df-06146e7f09d2', 'Muhamad Sulaeman Alba Bili', '2511080027@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080027', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('25b44608-77bb-43ce-91bc-a8000229cbd4', 'Rainaldi Nadianto', '2611090018@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090018', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:31', '2026-11-19 09:52:54', '2026-11-26 09:24:31'),
('26b94cfa-1340-433b-8379-ca1b3204a491', 'Muhammad Aiman Sayyaf', '2511080009@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080009', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2881ec09-f070-44f1-b7a0-86d218b11211', 'Sunandra B. Ahmadi', '2611090050@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090050', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2a599842-8cf2-4ce0-8a2d-93bba6013a87', 'Aqilah Maudiya Shofa', '2511080078@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080078', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2ab039a9-e2a7-4388-bda7-c0e678e33d8c', 'Haafizhotus Salsabiila', '2511080046@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080046', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('2d098fbc-50f2-4e45-969b-b12aa9dfe258', 'Mohammad Haiqal Fikrullah', '2511080020@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080020', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('3292e0c7-bc39-43e2-8b3b-faaba890f25d', 'Muhammad Akmal Jamaludin', '2511080025@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080025', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('34c6d36a-56a3-4910-a5bc-bab8f1c61996', 'Alif Sofwan Wibowo', '2611090021@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090021', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 03:16:38', '2026-11-19 09:52:54', '2026-11-26 10:16:38'),
('35c23926-2ac7-4392-90e7-1815914bb5b3', 'Varez Luniansyah Putra', '2611090020@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090020', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('373fb9ab-eb9b-403c-92e1-df30c304b89e', 'Muhammad Rizki Firdaus', '2411070096@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070096', 'Teknik Informatika (IT 7)', '2024', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('37a419f4-447f-42c8-9f7c-de857d23af04', 'Aksel Ramadhansyah', '2511080088@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080088', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('39cdf28f-5522-4bec-bc0e-9a854ceec381', 'Naila Nur Ihwan', '2511080080@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080080', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('40e38efa-90a8-4d76-9b35-77c97cbc4ce6', 'Silmi Kamila aulia', '2611090037@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090037', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:57', '2026-11-19 09:52:54', '2026-11-26 09:24:57'),
('442ace84-9772-4616-8824-1efcd12906be', 'Muhamad Rhifa Alfidza', '2411070111@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070111', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:09:39', '2026-11-19 09:52:54', '2026-11-23 20:09:39'),
('44af38ab-47de-4f95-bf60-c84aa7b200fc', 'Hariri Ahmad Damyani', '2411070051@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070051', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:11:38', '2026-11-19 09:52:54', '2026-11-23 20:11:39'),
('47bc06c5-a602-4581-a92e-d7afa4e9cb3c', 'Umar Hanif Abdullah', '2611090042@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090042', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('48e4ad8f-382b-4095-8b04-2a42825e39fb', 'Maulana Ardhian Ismail', '2511080095@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080095', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('4cc24ab7-fad6-4c87-8df4-0c3551824787', 'M. Fikri Asy Syafi\'i', '2611090032@student.eduflow.ac.id', '$2a$10$LmaTrB.4.7mYU3gS3koLj.b8JyZI97noX.VafmgwGawzTgiN3Yg2a', '2611090032', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:22:49', '2026-11-19 09:52:54', '2026-11-26 02:28:56'),
('4d869de1-131a-4ee2-afdf-b18f6ee32afe', 'Diki Anwari', '2411070081@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070081', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-24 10:51:18', '2026-11-19 09:52:54', '2026-11-24 17:51:18'),
('4ea64847-a051-4cab-a498-b7e578ac9748', 'M.Rangga', '261109p005@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P005', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:22:54', '2026-11-19 09:52:54', '2026-11-26 09:22:54'),
('52b2b49a-dcce-4912-a382-8033322d9bc3', 'Abdulaziz Gaafar Abdullah', '2611090062@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090062', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:30:04', '2026-11-19 09:52:54', '2026-11-26 09:30:05'),
('57370f1f-5b66-4fe9-9648-f5675a95dd2b', 'Siti Lutfiah', '2611090005@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090005', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:26:04', '2026-11-19 09:52:54', '2026-11-26 09:26:04'),
('588983b2-daed-476b-b4dc-1b73fad3e1f4', 'Muhammad Galang Al Mahdi Putra Irawan', '2611090044@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090044', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:10', '2026-11-19 09:52:54', '2026-11-26 09:24:10'),
('5a8ec07f-3901-4933-8a17-b83f78775516', 'Muhammad Hilmi Muzhaffar', '2311060056@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2311060056', 'Teknik Informatika (IT 7)', '2023', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('5c301087-a2bf-42e1-b3ec-36ff8edff025', 'Azka Rohmatul Ula', '2611090003@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090003', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:59', '2026-11-19 09:52:54', '2026-11-26 09:23:59'),
('5e7eaabd-f9fa-4320-860e-0e973f9bf9ec', 'Ismetias Asan Armando', '2611090064@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090064', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:26:12', '2026-11-19 09:52:54', '2026-11-26 09:26:12'),
('614f867d-cfc5-4868-8631-3fed5be1fa0b', 'Azmi Fathurrizqi', '2511080081@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080081', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('635855cb-4881-4760-9d11-1de9bfea69a0', 'M. Hafidz Abdurrahman Khalid', '2511080031@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080031', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('63da2cc9-7ddc-4e6a-a0b1-b34802e06024', 'Nazhan Fathurrahman', '2511080003@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080003', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('67b0338b-fd31-4fa4-acb4-2af7247b028a', 'Devina Angel Lanita', '2611090023@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090023', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:22:44', '2026-11-19 09:52:54', '2026-11-26 09:22:44'),
('69f13f83-fad9-4443-9bbd-7c62da77e0e4', 'Muhamad Saifullah Ali', '2411070092@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070092', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:07:55', '2026-11-19 09:52:54', '2026-11-23 20:07:56'),
('6b17738f-0786-443f-b73e-018f1e066de6', 'Fikri Nur Fauzi Al-Ghifari', '2511080013@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080013', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6e18106e-6719-4148-beb0-24fd291aacd5', 'Linda Suhendar', '2511080058@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080058', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6e369715-1671-4196-9db5-b7328f137027', 'Nurul Syarifa', '2511080056@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080056', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('6fb893a3-2a6b-4cc5-9719-af972b00126f', 'Azka Ni\'ma Alifah', '2611090022@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090022', 'Teknik Informatika (IT 9 & PPMP)', '2026', '082121442533', 1, '2026-11-26 02:24:53', '2026-11-19 09:52:54', '2026-11-26 02:26:13'),
('70f4e367-a29f-4aa7-9dc7-d941955972b4', 'Muhamad Lutfiansyah', '2611090060@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090060', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:26:16', '2026-11-19 09:52:54', '2026-11-26 09:26:16'),
('72d614af-4b17-4ecf-837c-1217d55cecaa', 'Fazrul Rohman', '2511080029@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080029', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7507fa5e-c124-4ad2-ae5f-04e54276d9c2', 'Muhammad Adz Dzikra', '2611090016@student.eduflow.ac.id', '$2a$10$y/1QEwhBt0aMtt8obmbKUuIpLsX0WlRsIN9euWTrEBwEprFCuOkZm', '2611090016', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 06:12:00', '2026-11-19 09:52:54', '2026-11-26 13:12:00'),
('75981500-77fc-439d-968f-21f1819140f3', 'Dhenia Layli Maulani', '2611090030@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090030', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:11', '2026-11-19 09:52:54', '2026-11-26 09:23:11'),
('79e1414b-30f0-42dd-b466-13397e37c2d3', 'Rahma Aisyah Ramadhan Putri', '2611090024@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090024', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:57', '2026-11-19 09:52:54', '2026-11-26 09:24:57'),
('7a5a98d7-44ad-4f7f-9b75-23830165d3d0', 'Zain Muna Nafi\'ah', '2611090034@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090034', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:25:51', '2026-11-19 09:52:54', '2026-11-26 09:25:51'),
('7e561f91-d9f2-4678-a2c2-9db8c564b544', 'Hameed Rizky Amruddin', '2511080085@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080085', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7e889ee9-19b1-4548-961e-778f3a0b4bd4', 'Muhammad Naufal Bintoro', '2411070075@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070075', 'Teknik Informatika (IT 7)', '2024', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('7fcc4a0b-68a1-43fd-9850-dfa9c51515f0', 'Eva Azra Latifa', '2611090027@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090027', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:27:05', '2026-11-19 09:52:54', '2026-11-26 09:27:05'),
('8079f98f-620f-4ddb-aff0-b83204676542', 'Helza Falisha', '2511080079@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080079', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('81e4e6c5-862d-4bd8-9f2b-97d5b6f902f2', 'Selfa Arya Nena', '2611090029@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090029', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('84fe4d25-5c1b-47cc-8676-71f90e15bcb4', 'Hani Nurma Ayu', '2511080051@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080051', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('85a97b78-b722-4f87-8fb5-33a5affce350', 'Farhan Mujib Ghifary', '2511080004@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080004', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('89915561-af6b-407c-b973-86bed6fee444', 'Mochammad Mahmal Hawari', '2411070088@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070088', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:08:27', '2026-11-19 09:52:54', '2026-11-23 20:08:27'),
('923ba882-3faf-4c4d-99e5-9e64524eef60', 'Rayhan Syaqib Aqil', '261109p001@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P001', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:22:45', '2026-11-19 09:52:54', '2026-11-26 09:22:45'),
('929ebf14-21b3-4d90-8137-810fb831f558', 'Mauldi Syah Rein', '2511080070@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080070', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('92dd0aa0-0553-42fe-b311-f6d4b1b8093e', 'Muhamad Maulana Rifki', '2311060028@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2311060028', 'Teknik Informatika (IT 7)', '2023', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('94f4890c-9b62-461a-a701-7c66c1fe60a3', 'Iksan Hadi', '2511080034@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080034', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('95707901-dd6e-460d-bb6f-7cc0b8364eef', 'Sakila Putri Ananda', '2511080054@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080054', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9634a3e5-328f-457b-9907-90455248bb11', 'Muhammad Syams Dzulqarnain', '2411070084@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070084', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:06:07', '2026-11-19 09:52:54', '2026-11-23 20:06:07'),
('993cee57-427b-4fa4-9f18-1b138a23bc73', 'Muzaid Fathur Rahman', '2511080010@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080010', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('994408ad-38da-4fc4-bbe8-c23489fcf5e7', 'Muhammad Nadhif Bustomi', '2511080062@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080062', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9963684d-6824-480b-bca3-21008ab33e9c', 'Raihan Raditha Putra', '2511080048@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080048', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9aacd5a5-a450-4737-a4d7-79da0971a9a3', 'Masduki', '2411070090@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070090', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:06:03', '2026-11-19 09:52:54', '2026-11-23 20:06:03'),
('9ada69cc-9153-4bfb-b181-9a826d194ddd', 'Galih Nuria Putra', '2611090043@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090043', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('9b24d0d4-0e8e-480c-9912-615c7748159c', 'Riefaldy Alviansyah', '2611090012@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090012', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:22:52', '2026-11-19 09:52:54', '2026-11-26 09:22:53'),
('9b9ead65-e6d8-4746-97d4-f2ca33cfe15e', 'Saif Ghiyats Alkhair', '2611090008@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090008', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:42', '2026-11-19 09:52:54', '2026-11-26 09:23:42'),
('a0f2a7ff-a2c7-4ff2-b7f7-6dad0c787b3a', 'Azzam Maulana', '2511080069@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080069', 'Teknik Informatika (IT 7)', '2025', NULL, 1, '2026-11-23 20:19:02', '2026-11-19 09:52:54', '2026-11-24 03:19:03'),
('a733f98d-bf2b-4a99-a4f9-af820f02031c', 'Muhammad Fathul Khair', '2611090054@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090054', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('aaba7626-81ee-4247-a769-e5095e6eb54d', 'Syahrul Mubarok', '2611090017@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090017', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ab0f03c9-9fd3-4db0-964e-2aa0608e1613', 'Auriel Sabrina Zahra', '2611090002@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090002', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:26:02', '2026-11-19 09:52:54', '2026-11-26 09:26:02'),
('ab956136-0b15-4902-8611-7e47f9150865', 'Dede Surahman', '2411070037@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070037', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-25 05:49:20', '2026-11-19 09:52:54', '2026-11-25 12:49:20'),
('ad7f212d-dfe6-41ac-9b6a-f581148fc54f', 'Miqdad Haris Al jauzy', '2611090006@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090006', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('aec2e6f9-5057-4d65-8ea9-44a9485429f0', 'Fakhri Miftahul Khairi', '2411070089@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070089', 'Teknik Informatika (IT 7)', '2024', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b7067fb2-4d11-4069-b4ae-89c761007a88', 'Syifa Zahira', '2511080086@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080086', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b7b7b2db-f802-4544-ae07-fc2dd99ba7b0', 'Fajri Rahmattulloh', '2511080019@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080019', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('b99547b0-61d5-47ea-a606-0c66d9406c2d', 'Erlan Maulana', '261109p003@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P003', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:27:14', '2026-11-19 09:52:54', '2026-11-26 09:27:14'),
('bc6072b1-9074-4f1c-a732-8f0cba723740', 'Usamah Tsalatsa', '2511080067@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080067', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c0032977-3bf1-4d47-8603-1191cd864f49', 'Rashya Hazimulfikri Widyadhana', '2611090061@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090061', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c30a6062-c0ce-4f28-9b20-0e5987ac1542', 'Deka Muhamad Akmal', '2511080052@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080052', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c397456c-5e1c-4051-9ea6-1d968f899eea', 'Dinar Zulfikar Mumtaz Sugi', '2611090065@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090065', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:26:43', '2026-11-19 09:52:54', '2026-11-26 09:26:43'),
('c3d240d7-0548-4cf3-94e6-eb81ed793350', 'Muhamad Farel Alfazri', '2611090049@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090049', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('c509cfc2-b24e-4b1e-8b92-b6204076742d', 'Adam Muamar Kadafi', '2411070045@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070045', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:07:24', '2026-11-19 09:52:54', '2026-11-23 20:07:24'),
('c8f87d0f-0259-47d3-94ba-95b1703b601e', 'M.Naufal Rabbani', '2511080014@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080014', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cbd6e730-7951-46c4-91ce-d603b48fc900', 'Muhammad Ikhwan Manshur', '2411070053@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070053', 'Teknik Informatika (IT 7)', '2024', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ceeda36c-db98-47f8-872d-3aeebce50515', 'Ridwannullah Al Alawi', '261109p002@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '261109P002', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cf4c2fe8-5daa-4d5a-a9bf-1ee765490951', 'Inas Samia Ashalina', '2511080042@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080042', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('cfde8a0c-20e1-4693-bcd6-a48ac564bb61', 'Syahrul Ramadhan', '2611090045@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090045', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:36', '2026-11-19 09:52:54', '2026-11-26 09:23:36'),
('d1cec31b-d4fb-41e8-90f7-92461978a09c', 'Ai Lisna', '2611090057@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090057', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:27:52', '2026-11-19 09:52:54', '2026-11-26 09:27:52'),
('d8852d34-544e-4b83-8f58-dc3107390a13', 'Muhammad Syafiq Ardiansyah', '2411070064@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070064', 'Teknik Informatika (IT 7)', '2024', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('d918d1b5-8ce0-4566-a30d-c467ee882b59', 'Fauzi Zahi Ganedi', '2611090055@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090055', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:22', '2026-11-19 09:52:54', '2026-11-26 09:23:22'),
('dc427878-ea0d-494c-9e34-da39cf9e4ca5', 'Muhammad Najiya Adib Afkar', '2611090011@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090011', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:11', '2026-11-19 09:52:54', '2026-11-26 09:24:11'),
('dd0d13c6-cb92-4da8-bde4-c6b4023c4faf', 'Abu Zikri Agniya Ilman', '2611090058@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090058', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:29:20', '2026-11-19 09:52:54', '2026-11-26 09:29:20'),
('e02aa250-f3bc-489a-a8b6-fe7e91b33e4b', 'Hafeedz Rizkiy Amrullah', '2511080083@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080083', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e0d9f240-5d11-43a8-93d7-87739d7c39c1', 'Moza Putri Nugraha', '2511080061@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080061', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e0eab939-728d-440a-a118-f40ca2eb37bc', 'M Khusilmiani Rizki Julianto', '2511080100@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080100', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e5452107-ca6b-4275-9be8-ddd87398ed3d', 'Adrian Hanafi', '2511080026@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080026', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e78b7acf-4f8f-454e-8736-b65700105737', 'Ali Rachman', '2311060121@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2311060121', 'Teknik Informatika (IT 7)', '2023', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('e98576cb-66a7-4dd4-9bf7-baeeb3969222', 'Rahayu Keysa Surahman', '2511080015@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080015', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('ec86d52a-fd48-439a-a11e-47f4328f5f3c', 'Muhammad Billal Siddiq', '2511080018@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080018', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f3385427-0657-487d-a794-acaf5e0baf86', 'Aufa Islamiyah', '2511080039@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2511080039', 'Teknik Informatika (IT 8)', '2025', NULL, 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54'),
('f8f06e87-721c-47c2-a8ad-ddb866924082', 'Vino Ramadan', '2611090010@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090010', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:24:09', '2026-11-19 09:52:54', '2026-11-26 09:24:09'),
('fa72432b-f405-49ef-a924-27f06f2bceb4', 'Dhani Alfarizqi', '2411070005@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070005', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:05:26', '2026-11-19 09:52:54', '2026-11-23 20:05:26'),
('fcc96061-2092-48bf-9d26-96d268a027df', 'Hendi', '2411070113@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2411070113', 'Teknik Informatika (IT 7)', '2024', NULL, 1, '2026-11-23 13:08:35', '2026-11-19 09:52:54', '2026-11-23 20:08:35'),
('fe40de65-4798-4c4a-8db8-144774ce1369', 'Muhammmad Fatih Al-Ghazy', '2611090048@student.eduflow.ac.id', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', '2611090048', 'Teknik Informatika (IT 9 & PPMP)', '2026', NULL, 1, '2026-11-26 02:23:16', '2026-11-19 09:52:54', '2026-11-26 09:23:16');

-- --------------------------------------------------------

--
-- Table structure for table `submissions`
--

CREATE TABLE `submissions` (
  `id` varchar(36) NOT NULL,
  `assignment_id` varchar(36) NOT NULL,
  `student_id` varchar(36) NOT NULL,
  `status` enum('draft','submitted','late','returned_for_revision','resubmitted','graded') NOT NULL DEFAULT 'draft',
  `submitted_at` datetime DEFAULT NULL,
  `current_version` int(11) NOT NULL DEFAULT 1,
  `score` decimal(7,2) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` varchar(36) DEFAULT NULL,
  `graded_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `submissions`
--

INSERT INTO `submissions` (`id`, `assignment_id`, `student_id`, `status`, `submitted_at`, `current_version`, `score`, `feedback`, `graded_by`, `graded_at`, `created_at`, `updated_at`) VALUES
('0917dfd7-83b3-4413-9ff8-458ac7f7229a', '23e1158f-d960-4d58-989a-b66bbf7b9030', '9634a3e5-328f-457b-9907-90455248bb11', 'graded', '2026-11-24 06:51:49', 1, 100.00, NULL, '9257ff06-6613-4d4d-a4e6-c3bdf34b89df', '2026-11-26 03:16:32', '2026-11-24 13:51:49', '2026-11-26 10:16:33');

-- --------------------------------------------------------

--
-- Table structure for table `submission_versions`
--

CREATE TABLE `submission_versions` (
  `id` varchar(36) NOT NULL,
  `submission_id` varchar(36) NOT NULL,
  `version_number` int(11) NOT NULL,
  `file_object_key` varchar(500) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `external_url` text DEFAULT NULL,
  `note` text DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- --------------------------------------------------------

--
-- Table structure for table `submission_files`
--

CREATE TABLE IF NOT EXISTS `submission_files` (
  `id` varchar(36) NOT NULL,
  `version_id` varchar(36) NOT NULL,
  `file_object_key` varchar(500) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL DEFAULT 0,
  `mime_type` varchar(120) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sub_files_version` (`version_id`),
  CONSTRAINT `fk_sub_files_version` FOREIGN KEY (`version_id`) REFERENCES `submission_versions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `submission_versions`
--

INSERT INTO `submission_versions` (`id`, `submission_id`, `version_number`, `file_object_key`, `original_filename`, `external_url`, `note`, `submitted_at`) VALUES
('78b5fb0d-ec54-4835-8866-e8b3d72b5c67', '0917dfd7-83b3-4413-9ff8-458ac7f7229a', 1, NULL, NULL, 'https://github.com/seemsproject-pro/belajar-express', NULL, '2026-11-24 06:51:49');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(190) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','superadmin') NOT NULL DEFAULT 'admin',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
('f39811d6-0acc-4b91-a4bf-9c3020ab328e', 'System Superadmin', 'admin@eduflow.test', '$2a$10$bGGlem4aLaOJy5twvkkcg.lfKsElxg.Mh/AjJbuh0sKhoCBnFllI.', 'superadmin', 1, NULL, '2026-11-19 09:52:54', '2026-11-19 09:52:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_terms`
--
ALTER TABLE `academic_terms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `assessment_items`
--
ALTER TABLE `assessment_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assessment_items_category_id_grading_categories_id_fk` (`category_id`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignments_assessment_item_id_assessment_items_id_fk` (`assessment_item_id`),
  ADD KEY `idx_assignments_class_status_due` (`class_id`,`status`,`due_at`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_attendance_session_student` (`session_id`,`student_id`),
  ADD KEY `attendance_records_student_id_students_id_fk` (`student_id`),
  ADD KEY `attendance_records_updated_by_lecturers_id_fk` (`updated_by`);

--
-- Indexes for table `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attendance_sessions_class_date` (`class_id`,`session_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_audit_logs_entity_created` (`entity_type`,`entity_id`,`created_at`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_class_course_term_code` (`course_id`,`academic_term_id`,`class_code`),
  ADD UNIQUE KEY `qr_code_token` (`qr_code_token`),
  ADD KEY `idx_classes_term_status` (`academic_term_id`,`status`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `courses_lecturer_id_lecturers_id_fk` (`lecturer_id`);

--
-- Indexes for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_enrollment_class_student` (`class_id`,`student_id`),
  ADD KEY `enrollments_student_id_students_id_fk` (`student_id`),
  ADD KEY `idx_enrollments_class_status` (`class_id`,`enrollment_status`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_grade_item_student` (`assessment_item_id`,`student_id`),
  ADD KEY `grades_student_id_students_id_fk` (`student_id`),
  ADD KEY `grades_graded_by_lecturers_id_fk` (`graded_by`);

--
-- Indexes for table `grade_scales`
--
ALTER TABLE `grade_scales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grade_scales_class_id_classes_id_fk` (`class_id`);

--
-- Indexes for table `grading_categories`
--
ALTER TABLE `grading_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grading_categories_class_id_classes_id_fk` (`class_id`);

--
-- Indexes for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `learning_materials_class_id_classes_id_fk` (`class_id`),
  ADD KEY `learning_materials_created_by_lecturers_id_fk` (`created_by`);

--
-- Indexes for table `lecturers`
--
ALTER TABLE `lecturers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_lecturers_email` (`email`),
  ADD UNIQUE KEY `idx_lecturers_nip` (`nip`);

--
-- Indexes for table `material_progress`
--
ALTER TABLE `material_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_student_material` (`student_id`,`material_id`),
  ADD KEY `material_id` (`material_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_read` (`user_id`,`read_at`,`created_at`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_students_email` (`email`),
  ADD UNIQUE KEY `idx_students_nim` (`student_number`);

--
-- Indexes for table `submissions`
--
ALTER TABLE `submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_submission_assignment_student` (`assignment_id`,`student_id`),
  ADD KEY `submissions_student_id_students_id_fk` (`student_id`),
  ADD KEY `submissions_graded_by_lecturers_id_fk` (`graded_by`),
  ADD KEY `idx_submissions_status_date` (`status`,`submitted_at`);

--
-- Indexes for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_versions_submission_id_submissions_id_fk` (`submission_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_users_email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `assessment_items`
--
ALTER TABLE `assessment_items`
  ADD CONSTRAINT `assessment_items_category_id_grading_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `grading_categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_assessment_item_id_assessment_items_id_fk` FOREIGN KEY (`assessment_item_id`) REFERENCES `assessment_items` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assignments_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_session_id_attendance_sessions_id_fk` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendance_records_updated_by_lecturers_id_fk` FOREIGN KEY (`updated_by`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendance_sessions`
--
ALTER TABLE `attendance_sessions`
  ADD CONSTRAINT `attendance_sessions_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_academic_term_id_academic_terms_id_fk` FOREIGN KEY (`academic_term_id`) REFERENCES `academic_terms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classes_course_id_courses_id_fk` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_lecturer_id_lecturers_id_fk` FOREIGN KEY (`lecturer_id`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `enrollments`
--
ALTER TABLE `enrollments`
  ADD CONSTRAINT `enrollments_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `enrollments_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_assessment_item_id_assessment_items_id_fk` FOREIGN KEY (`assessment_item_id`) REFERENCES `assessment_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_graded_by_lecturers_id_fk` FOREIGN KEY (`graded_by`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `grades_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grade_scales`
--
ALTER TABLE `grade_scales`
  ADD CONSTRAINT `grade_scales_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `grading_categories`
--
ALTER TABLE `grading_categories`
  ADD CONSTRAINT `grading_categories_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `learning_materials`
--
ALTER TABLE `learning_materials`
  ADD CONSTRAINT `learning_materials_class_id_classes_id_fk` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `learning_materials_created_by_lecturers_id_fk` FOREIGN KEY (`created_by`) REFERENCES `lecturers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `material_progress`
--
ALTER TABLE `material_progress`
  ADD CONSTRAINT `material_progress_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `material_progress_ibfk_2` FOREIGN KEY (`material_id`) REFERENCES `learning_materials` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submissions`
--
ALTER TABLE `submissions`
  ADD CONSTRAINT `submissions_assignment_id_assignments_id_fk` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `submissions_graded_by_lecturers_id_fk` FOREIGN KEY (`graded_by`) REFERENCES `lecturers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `submissions_student_id_students_id_fk` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `submission_versions`
--
ALTER TABLE `submission_versions`
  ADD CONSTRAINT `submission_versions_submission_id_submissions_id_fk` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
