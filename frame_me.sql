-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 09, 2024 at 02:37 AM
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
(1, '<h1>Enok Da Rocha Medeiros: The Poet with a Lens</h1>\n<p>Enok Da Rocha Medeiros, a dedicated photographer from Brazil...</p>\n<p>His work is a celebration of life’s simple pleasures...</p>\n<h3>let\'s celebrate life together!!!</h3>\n<h1>i love pekenito muchissimo</h1>\nHello world', 'uploads/main/1733534424_Main.png');

-- --------------------------------------------------------

--
-- Table structure for table `architecture_gallery`
--

CREATE TABLE `architecture_gallery` (
  `pictureID` int(11) NOT NULL,
  `archLow` varchar(255) NOT NULL,
  `archHigh` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `architecture_gallery`
--

INSERT INTO `architecture_gallery` (`pictureID`, `archLow`, `archHigh`, `price`) VALUES
(12, 'uploads/architecture/1733534498_archLow.png', 'uploads/architecture/1733534498_archHigh.png', 123.12),
(32, 'uploads/architecture/1733585538_archLow.jpg', 'uploads/architecture/1733585538_archHigh.jpg', 213.00),
(33, 'uploads/architecture/1733585545_archLow.jpg', 'uploads/architecture/1733585545_archHigh.jpg', 12.00),
(34, 'uploads/architecture/1733585551_archLow.jpg', 'uploads/architecture/1733585551_archHigh.jpg', 123.00),
(35, 'uploads/architecture/1733585565_archLow.jpeg', 'uploads/architecture/1733585565_archHigh.jpeg', 123.00),
(36, 'uploads/architecture/1733585570_archLow.jpg', 'uploads/architecture/1733585570_archHigh.jpg', 123.00),
(37, 'uploads/architecture/1733585575_archLow.jpg', 'uploads/architecture/1733585575_archHigh.jpg', 123.00),
(38, 'uploads/architecture/1733585584_archLow.jpeg', 'uploads/architecture/1733585584_archHigh.jpeg', 123.00),
(39, 'uploads/architecture/1733585598_archLow.jpeg', 'uploads/architecture/1733585598_archHigh.jpeg', 123.00),
(40, 'uploads/architecture/1733585608_archLow.jpeg', 'uploads/architecture/1733585608_archHigh.jpeg', 123.00),
(43, 'uploads/architecture/1733707117_archLow.png', 'uploads/architecture/1733707117_archHigh.png', 123.00),
(44, 'uploads/architecture/1733707122_archLow.png', 'uploads/architecture/1733707122_archHigh.png', 123.00),
(45, 'uploads/architecture/1733707129_archLow.png', 'uploads/architecture/1733707129_archHigh.png', 123.00);

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customerID` int(11) NOT NULL,
  `orderDetailsID` int(11) DEFAULT NULL,
  `firstName` varchar(255) DEFAULT NULL,
  `lastName` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `addressID` int(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) DEFAULT NULL,
  `type` varchar(20) NOT NULL DEFAULT 'customer'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customerID`, `orderDetailsID`, `firstName`, `lastName`, `email`, `password`, `phone`, `dob`, `addressID`, `created_at`, `status`, `type`) VALUES
(7, 0, 'Max', 'Gabriel', 'maxim.don.mg@gmail.com', '$2y$10$dVMSLXzCUVad4JeYNry2r.6sr9.9jrOQ01HFYZFXBKKO3Kzxn0GCe', '4168560684', '1985-11-04', NULL, '2024-11-23 20:40:35', 'active', 'admin'),
(11, NULL, 'Max', 'Gabriel', '123@gmail.com', '$2y$10$dsFsUUipLEsKt/aoVjgih.FaGKTOsaZWc81rdRdAXqAW9mgyUnjcS', '4168560684', '2024-12-03', NULL, '2024-12-08 18:14:08', 'blocked', 'customer');

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
(1, '<h3> Pekeno loves gooasfasfafsafafafasfasfad looking guys muchissimo</h3>', 'uploads/main/1733534473_sFile.png', '<h3> Pekeno loves nature muchissimo</h3>', 'uploads/main/1733534473_nFile.png', '<h3> Pekeno loves city lines muchissimo too!</h3>', 'uploads/main/1733534473_aFile.png');

-- --------------------------------------------------------

--
-- Table structure for table `nature_gallery`
--

CREATE TABLE `nature_gallery` (
  `pictureID` int(11) NOT NULL,
  `natureHigh` varchar(255) DEFAULT NULL,
  `natureLow` varchar(255) DEFAULT NULL,
  `price` decimal(11,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `nature_gallery`
--

INSERT INTO `nature_gallery` (`pictureID`, `natureHigh`, `natureLow`, `price`) VALUES
(61, 'uploads/nature/1733706825_natureHigh.png', 'uploads/nature/1733706825_natureLow.png', 123.00),
(67, 'uploads/nature/1733706991_natureHigh.png', 'uploads/nature/1733706991_natureLow.png', 123.00),
(68, 'uploads/nature/1733706996_natureHigh.png', 'uploads/nature/1733706996_natureLow.png', 123.00),
(69, 'uploads/nature/1733706999_natureHigh.png', 'uploads/nature/1733706999_natureLow.png', 123.00),
(70, 'uploads/nature/1733707063_natureHigh.png', 'uploads/nature/1733707063_natureLow.png', 123.00),
(71, 'uploads/nature/1733707098_natureHigh.png', 'uploads/nature/1733707098_natureLow.png', 123.00),
(72, 'uploads/nature/1733707104_natureHigh.png', 'uploads/nature/1733707104_natureLow.png', 123.00);

-- --------------------------------------------------------

--
-- Table structure for table `orderDetails`
--

CREATE TABLE `orderDetails` (
  `orderDetailsID` int(11) NOT NULL,
  `orderID` int(20) NOT NULL,
  `date` date NOT NULL,
  `total` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `orderID` int(11) NOT NULL,
  `pictureID` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staged_gallery`
--

CREATE TABLE `staged_gallery` (
  `pictureID` int(11) NOT NULL,
  `stagedLow` varchar(255) NOT NULL,
  `stagedHigh` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staged_gallery`
--

INSERT INTO `staged_gallery` (`pictureID`, `stagedLow`, `stagedHigh`, `type`, `price`) VALUES
(53, 'uploads/staged/1733707457_stagedLowColor.jpg', 'uploads/staged/1733707457_stagedHighColor.jpg', 'color', 123.00),
(54, 'uploads/staged/1733707458_stagedLowBlack.jpg', 'uploads/staged/1733707458_stagedHighBlack.jpg', 'black', 123.00),
(55, 'uploads/staged/1733707490_stagedLowColor.jpg', 'uploads/staged/1733707490_stagedHighColor.jpg', 'color', 234.00),
(56, 'uploads/staged/1733707490_stagedLowBlack.jpg', 'uploads/staged/1733707490_stagedHighBlack.jpg', 'black', 234.00),
(57, 'uploads/staged/1733707736_stagedLowColor.jpg', 'uploads/staged/1733707736_stagedHighColor.jpg', 'color', 123.00),
(58, 'uploads/staged/1733707737_stagedLowBlack.jpg', 'uploads/staged/1733707737_stagedHighBlack.jpg', 'black', 123.00),
(59, 'uploads/staged/1733707752_stagedLowColor.jpg', 'uploads/staged/1733707752_stagedHighColor.jpg', 'color', 123.00),
(61, 'uploads/staged/1733707757_stagedLowBlack.jpg', 'uploads/staged/1733707757_stagedHighBlack.jpg', 'black', 123.00),
(62, 'uploads/staged/1733707779_stagedLowColor.jpg', 'uploads/staged/1733707779_stagedHighColor.jpg', 'color', 123.00),
(63, 'uploads/staged/1733707779_stagedLowBlack.jpg', 'uploads/staged/1733707779_stagedHighBlack.jpg', 'black', 123.00),
(64, 'uploads/staged/1733707810_stagedLowColor.jpg', 'uploads/staged/1733707810_stagedHighColor.jpg', 'color', 123.00),
(65, 'uploads/staged/1733707810_stagedLowBlack.jpg', 'uploads/staged/1733707810_stagedHighBlack.jpg', 'black', 123.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `aboutPage`
--
ALTER TABLE `aboutPage`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `architecture_gallery`
--
ALTER TABLE `architecture_gallery`
  ADD PRIMARY KEY (`pictureID`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customerID`);

--
-- Indexes for table `main_gallery`
--
ALTER TABLE `main_gallery`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `nature_gallery`
--
ALTER TABLE `nature_gallery`
  ADD PRIMARY KEY (`pictureID`);

--
-- Indexes for table `orderDetails`
--
ALTER TABLE `orderDetails`
  ADD PRIMARY KEY (`orderDetailsID`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderID`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staged_gallery`
--
ALTER TABLE `staged_gallery`
  ADD PRIMARY KEY (`pictureID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `aboutPage`
--
ALTER TABLE `aboutPage`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `architecture_gallery`
--
ALTER TABLE `architecture_gallery`
  MODIFY `pictureID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customerID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `main_gallery`
--
ALTER TABLE `main_gallery`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `nature_gallery`
--
ALTER TABLE `nature_gallery`
  MODIFY `pictureID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `orderDetails`
--
ALTER TABLE `orderDetails`
  MODIFY `orderDetailsID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `orderID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staged_gallery`
--
ALTER TABLE `staged_gallery`
  MODIFY `pictureID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
