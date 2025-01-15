-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jan 13, 2025 at 12:14 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `frame_me`
--

-- --------------------------------------------------------

--
-- Table structure for table `aboutPage`
--

CREATE TABLE `aboutPage` (
  `id` int(11) NOT NULL,
  `bioText` text DEFAULT NULL,
  `mainImage` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `aboutPage`
--

INSERT INTO `aboutPage` (`id`, `bioText`, `mainImage`) VALUES
(1, '                   <h1>Enok Da Rocha Medeiros: </h1>\n                   <h1>A Journey Through the Lens</h1>\n<section></br>\n    <p> &nbsp;&nbsp;Enok Da Rocha Medeiros, a visionary photographer born in the vibrant landscapes of Brazil, developed his passion for photography during his formative years amid the rich tapestry of South American culture. His artistic journey began in his hometown, where the interplay of light and shadow in everyday moments first captured his imagination.</p>\n    <p> &nbsp;&nbsp;In his early twenties, Medeiros embarked on a transformative journey to Europe, where he immersed himself in the continent\'s rich photographic tradition. This period marked a pivotal moment in his career as he studied under renowned photographers and mastered the technical aspects of professional photography. His dedication to perfecting his craft led him to invest in sophisticated equipment, including high-end cameras and specialized lenses that would become essential tools in his artistic expression.</p>\n    <p> &nbsp;&nbsp;During his European sojourn, Medeiros developed a distinctive style characterized by his ability to capture the extraordinary in ordinary moments. He honed his technical skills through intensive workshops and practical experience, learning advanced techniques in composition, lighting, and post-processing. His work began to reflect a unique blend of Brazilian warmth and European classical influence.</p>\n</section>\n<section>\n    <p> &nbsp;&nbsp;Medeiros\'s portfolio showcases his versatility across various photographic genres, from intimate portraits to sweeping landscapes. His technical expertise, combined with an innate understanding of visual storytelling, allows him to create images that resonate with viewers on both emotional and aesthetic levels. Through his lens, everyday scenes are transformed into timeless works of art that celebrate the beauty and complexity of life.</p>\n</section><br>\n<section>\n   <p> &nbsp;&nbsp;Today, Enok Da Rocha Medeiros continues to push the boundaries of his craft, experimenting with new techniques while staying true to his artistic vision. His work serves as an inspiration to emerging photographers and stands as a testament to the power of pursuing one\'s passion across continents and cultures.</p>\n</section><br>\n<footer>\n    <h3>&nbsp;&nbsp;Let\'s celebrate life together through the artistry of photography, as Medeiros continues to capture and share the beauty that surrounds us all.</h3>\n</footer>\n</article>', 'uploads/main/1736559670_Main.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customerID` int(11) NOT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `addressID` int(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'customer',
  `orderDetailsID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customerID`, `firstName`, `lastName`, `email`, `password`, `phone`, `dob`, `addressID`, `created_at`, `status`, `type`, `orderDetailsID`) VALUES
(7, 'Max', 'Gabriel', 'maxim.don.mg@gmail.com', '$2y$10$dVMSLXzCUVad4JeYNry2r.6sr9.9jrOQ01HFYZFXBKKO3Kzxn0GCe', '4168560684', '1985-11-04', NULL, '2024-11-23 20:40:35', 'active', 'admin', NULL),
(11, 'Max', 'Gabriel', '123@gmail.com', '$2y$10$dsFsUUipLEsKt/aoVjgih.FaGKTOsaZWc81rdRdAXqAW9mgyUnjcS', '4168560684', '2024-12-03', NULL, '2024-12-08 18:14:08', 'blocked', 'customer', 30),
(12, 'Max', 'Gabriel', '123maxim.don.mg@gmail.com', '$2y$10$LU2jlSrMOUWOMiN7tOODZ./uQdbc.wcM/vvK6yupIs0N0RYgFbIaC', '4168560684', '1979-02-07', NULL, '2024-12-14 03:04:06', 'active', 'customer', 38),
(13, 'Max', 'Gabriel', '1maxim.don.mg@gmail.com', '$2y$10$XVi/ecm5AQ8Zq6CUDl3Fy.lzDEc15.zq2sVqlaNI5GZlFpLZaIkDy', '4168560684', '1991-02-06', NULL, '2024-12-28 17:20:59', 'active', 'customer', NULL),
(14, 'Max', 'Gabriel', '123123maxim.don.mg@gmail.com', '$2y$10$0hO/uEDwpIqx.W013ObWxebriQpLtQRKB2RhKoI0cy0.GRXo8nZ0y', '4168560684', '1982-02-02', NULL, '2025-01-09 01:16:03', 'active', 'customer', NULL),
(15, 'Max', 'Gabriel', 'maxim.don.mg', '$2y$10$JE/goOTevkcYKSSJ4Y.hYecv5JNRFyvXKnlCondrmYRfIMU9kbdgu', '4168560684', '2025-01-03', NULL, '2025-01-13 02:24:48', 'blocked', 'customer', NULL),
(16, 'Max', 'Gabriel', 'maxim.don.mg@gma.qwe', '$2y$10$sCpiQAME9dfS7myJCamlSeznn1rP1.nlU/raa1.HBiNx4hznjZalC', '4168560684', '2025-01-02', NULL, '2025-01-13 02:30:13', 'blocked', 'customer', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `gallery`
--

CREATE TABLE `gallery` (
  `pictureID` int(11) NOT NULL,
  `imageLow` varchar(255) DEFAULT NULL,
  `imageHigh` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `gallery`
--

INSERT INTO `gallery` (`pictureID`, `imageLow`, `imageHigh`, `price`, `status`) VALUES
(103, 'uploads/nature/677f2bd6d696f_natureLow.png', 'uploads/nature/677f2bd6d68d6_natureHigh.png', 12.00, 'downloaded'),
(104, 'uploads/nature/677f2bd728c4d_natureLow.png', 'uploads/nature/677f2bd728bd6_natureHigh.png', 12.00, 'purchased'),
(105, 'uploads/nature/677f2bd76c121_natureLow.png', 'uploads/nature/677f2bd76c0bc_natureHigh.png', 12.00, 'downloaded'),
(106, 'uploads/nature/677f2bd7ad23e_natureLow.png', 'uploads/nature/677f2bd7ad1d5_natureHigh.png', 12.00, 'purchased'),
(107, 'uploads/nature/677f2bd7ed65d_natureLow.png', 'uploads/nature/677f2bd7ed545_natureHigh.png', 12.00, 'active'),
(108, 'uploads/nature/677f2bd83ee23_natureLow.png', 'uploads/nature/677f2bd83ed4d_natureHigh.png', 12.00, 'active'),
(109, 'uploads/nature/677f2bd87d197_natureLow.png', 'uploads/nature/677f2bd87d13d_natureHigh.png', 12.00, 'active'),
(110, 'uploads/nature/677f2bd8bc00a_natureLow.png', 'uploads/nature/677f2bd8bbfac_natureHigh.png', 12.00, 'active'),
(111, 'uploads/nature/677f2bd90648f_natureLow.png', 'uploads/nature/677f2bd906412_natureHigh.png', 12.00, 'active'),
(112, 'uploads/nature/677f2bd944854_natureLow.png', 'uploads/nature/677f2bd9447eb_natureHigh.png', 12.00, 'active'),
(113, 'uploads/architecture/677f31838a159_archLow.png', 'uploads/architecture/677f318389ad5_archHigh.png', 12.00, 'active'),
(114, 'uploads/architecture/677f3183d0425_archLow.png', 'uploads/architecture/677f3183d0358_archHigh.png', 12.00, 'active'),
(115, 'uploads/architecture/677f318420b63_archLow.png', 'uploads/architecture/677f318420b03_archHigh.png', 12.00, 'active'),
(116, 'uploads/architecture/677f318464da6_archLow.png', 'uploads/architecture/677f318464c80_archHigh.png', 12.00, 'active'),
(117, 'uploads/architecture/677f3184a3b03_archLow.png', 'uploads/architecture/677f3184a3a40_archHigh.png', 12.00, 'active'),
(118, 'uploads/architecture/677f3184e05f6_archLow.png', 'uploads/architecture/677f3184e053f_archHigh.png', 12.00, 'active'),
(119, 'uploads/architecture/677f318524ce5_archLow.png', 'uploads/architecture/677f318524c82_archHigh.png', 12.00, 'active'),
(120, 'uploads/architecture/677f31854c292_archLow.png', 'uploads/architecture/677f31854c22b_archHigh.png', 12.00, 'active'),
(121, 'uploads/architecture/677f318589468_archLow.png', 'uploads/architecture/677f318589406_archHigh.png', 12.00, 'active'),
(122, 'uploads/architecture/677f3185d016c_archLow.png', 'uploads/architecture/677f3185d010c_archHigh.png', 12.00, 'active'),
(123, 'uploads/architecture/677f31861b0df_archLow.png', 'uploads/architecture/677f31861b086_archHigh.png', 12.00, 'active'),
(153, 'uploads/staged/6781cd6a6b206_stagedLowColor.png', 'uploads/staged/6781cd6a6b18a_stagedHighColor.png', 12.00, 'active'),
(154, 'uploads/staged/6781cd6ab89ad_stagedLowColor.png', 'uploads/staged/6781cd6ab8941_stagedHighColor.png', 12.00, 'active'),
(155, 'uploads/staged/6781cd6ae4dd7_stagedLowColor.png', 'uploads/staged/6781cd6ae4d7d_stagedHighColor.png', 12.00, 'active'),
(156, 'uploads/staged/6781cd6b3c85c_stagedLowColor.png', 'uploads/staged/6781cd6b3c7ef_stagedHighColor.png', 12.00, 'active'),
(157, 'uploads/staged/6781cd6b8af9f_stagedLowColor.png', 'uploads/staged/6781cd6b8af27_stagedHighColor.png', 12.00, 'active'),
(158, 'uploads/staged/6781cd6bd7865_stagedLowColor.png', 'uploads/staged/6781cd6bd77fd_stagedHighColor.png', 12.00, 'active'),
(159, 'uploads/staged/6781cd6c259b7_stagedLowColor.png', 'uploads/staged/6781cd6c25955_stagedHighColor.png', 12.00, 'active'),
(160, 'uploads/staged/6781cd6c71b3f_stagedLowColor.png', 'uploads/staged/6781cd6c71ad5_stagedHighColor.png', 12.00, 'active'),
(161, 'uploads/staged/6781cd6cba8bc_stagedLowColor.png', 'uploads/staged/6781cd6cba857_stagedHighColor.png', 12.00, 'active'),
(162, 'uploads/staged/6781cd6d15505_stagedLowBlack.png', 'uploads/staged/6781cd6d154ae_stagedHighBlack.png', 12.00, 'active'),
(163, 'uploads/staged/6781cd6d5803a_stagedLowBlack.png', 'uploads/staged/6781cd6d57fb5_stagedHighBlack.png', 12.00, 'active'),
(164, 'uploads/staged/6781cd6d97ccb_stagedLowBlack.png', 'uploads/staged/6781cd6d97c48_stagedHighBlack.png', 12.00, 'active'),
(165, 'uploads/staged/6781cd6db9e30_stagedLowBlack.png', 'uploads/staged/6781cd6db9ddc_stagedHighBlack.png', 12.00, 'active'),
(166, 'uploads/staged/6781cd6df3f32_stagedLowBlack.png', 'uploads/staged/6781cd6df3eb5_stagedHighBlack.png', 12.00, 'active');

-- --------------------------------------------------------

--
-- Table structure for table `main_gallery`
--

CREATE TABLE `main_gallery` (
  `id` int(11) NOT NULL,
  `sText` text NOT NULL,
  `sImageMain` varchar(255) NOT NULL,
  `nText` text NOT NULL,
  `nImageMain` varchar(255) NOT NULL,
  `aText` text NOT NULL,
  `aImageMain` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `main_gallery`
--

INSERT INTO `main_gallery` (`id`, `sText`, `sImageMain`, `nText`, `nImageMain`, `aText`, `aImageMain`) VALUES
(1, '<h3 class=\"text-center\">Enter a world where artistic vision meets human form in carefully composed photographs that celebrate elegance and natural beauty.</h3>', 'uploads/main/1736559876_sFile.png', '<h3 class=\"text-center\">Experience the raw beauty of Earth through timeless captures of landscapes, wildlife, and intimate natural moments that reveal nature\'s endless artistry.</h3>', 'uploads/main/1736559876_nFile.JPG', '   <h3 class=\"text-center\">Discover the poetry in structures where light and shadow dance across steel, glass, and stone, revealing the soul of architectural design.</h3>', 'uploads/main/1736559876_aFile.JPG');

-- --------------------------------------------------------

--
-- Table structure for table `orderDetails`
--

CREATE TABLE `orderDetails` (
  `orderDetailsID` int(11) NOT NULL,
  `orderNumber` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `orderID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderDetails`
--

INSERT INTO `orderDetails` (`orderDetailsID`, `orderNumber`, `date`, `total`, `orderID`) VALUES
(25, 'ORD_6782b921698110.32140810', '2025-01-11', 12.00, 65),
(26, 'ORD_6782ba1251b977.88860720', '2025-01-11', 12.00, 66),
(27, 'ORD_6782bef4418685.71204325', '2025-01-11', 12.00, 67),
(28, 'ORD_6782cddcb93695.08038189', '2025-01-11', 24.00, 68),
(29, 'ORD_6782ce26386299.14000853', '2025-01-11', 24.00, 70),
(30, 'ORD_67831aef1ff3b2.66977320', '2025-01-11', 24.00, 72),
(31, 'ORD_6783d41386d557.35842225', '2025-01-12', 12.00, 74),
(32, 'ORD_6783d565eda067.00615979', '2025-01-12', 12.00, 75),
(33, 'ORD_6783db46bd2508.22234127', '2025-01-12', 12.00, 76),
(34, 'ORD_6783dfa1b75da1.87151787', '2025-01-12', 12.00, 77),
(35, 'ORD_6783e1cb99d758.30534253', '2025-01-12', 12.00, 78),
(36, 'ORD_6783f317e24724.48093328', '2025-01-12', 12.00, 79),
(37, 'ORD_67847adf7e3008.19033601', '2025-01-12', 12.00, 80),
(38, 'ORD_67847b7698d643.26966639', '2025-01-12', 12.00, 81);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `orderID` int(11) NOT NULL,
  `orderNumber` varchar(50) NOT NULL,
  `pictureID` int(11) NOT NULL,
  `customerID` int(11) NOT NULL,
  `status` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`orderID`, `orderNumber`, `pictureID`, `customerID`, `status`) VALUES
(65, 'ORD_6782b921698110.32140810', 103, 12, 'downloaded'),
(66, 'ORD_6782ba1251b977.88860720', 103, 12, 'downloaded'),
(67, 'ORD_6782bef4418685.71204325', 104, 12, 'downloaded'),
(68, 'ORD_6782cddcb93695.08038189', 105, 12, 'downloaded'),
(69, 'ORD_6782cddcb93695.08038189', 106, 12, 'purchased'),
(70, 'ORD_6782ce26386299.14000853', 106, 12, 'purchased'),
(71, 'ORD_6782ce26386299.14000853', 109, 12, 'purchased'),
(72, 'ORD_67831aef1ff3b2.66977320', 116, 11, 'purchased'),
(73, 'ORD_67831aef1ff3b2.66977320', 118, 11, 'purchased'),
(74, 'ORD_6783d41386d557.35842225', 108, 12, 'purchased'),
(75, 'ORD_6783d565eda067.00615979', 110, 12, 'purchased'),
(76, 'ORD_6783db46bd2508.22234127', 107, 12, 'downloaded'),
(77, 'ORD_6783dfa1b75da1.87151787', 115, 12, 'downloaded'),
(78, 'ORD_6783e1cb99d758.30534253', 105, 12, 'downloaded'),
(79, 'ORD_6783f317e24724.48093328', 103, 12, 'downloaded'),
(80, 'ORD_67847adf7e3008.19033601', 104, 12, 'purchased'),
(81, 'ORD_67847b7698d643.26966639', 106, 12, 'purchased');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aboutPage`
--
ALTER TABLE `aboutPage`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customerID`);

--
-- Indexes for table `gallery`
--
ALTER TABLE `gallery`
  ADD PRIMARY KEY (`pictureID`);

--
-- Indexes for table `main_gallery`
--
ALTER TABLE `main_gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orderDetails`
--
ALTER TABLE `orderDetails`
  ADD PRIMARY KEY (`orderDetailsID`),
  ADD KEY `orderDetails_fk_1` (`orderID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderID`),
  ADD KEY `pictureID` (`pictureID`),
  ADD KEY `orders_ibfk_2` (`customerID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aboutPage`
--
ALTER TABLE `aboutPage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `gallery`
--
ALTER TABLE `gallery`
  MODIFY `pictureID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=167;

--
-- AUTO_INCREMENT for table `main_gallery`
--
ALTER TABLE `main_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `orderDetails`
--
ALTER TABLE `orderDetails`
  MODIFY `orderDetailsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orderDetails`
--
ALTER TABLE `orderDetails`
  ADD CONSTRAINT `orderDetails_fk_1` FOREIGN KEY (`orderID`) REFERENCES `orders` (`orderID`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`pictureID`) REFERENCES `gallery` (`pictureID`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customerID`) REFERENCES `customers` (`customerID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
