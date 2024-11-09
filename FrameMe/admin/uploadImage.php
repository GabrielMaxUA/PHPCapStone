<?php
session_start();

// Include the database connection file
require_once('../model/database.php');

// Check if the form was submitted with a POST request
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve the product prices as an array and category from the form
    $productPrices = $_POST['productPrice'];
    $status = 1; // Default status for new product
    $category = $_POST['category'] ?? '';

    // Set the upload directory and file prefix based on the selected category
    switch ($category) {
        case 'A':
            $uploadDir = '../Assets/architecture/';
            $prefix = 'A';
            break;
        case 'N':
            $uploadDir = '../Assets/nature/';
            $prefix = 'N';
            break;
        case 'M':
            $uploadDir = '../Assets/models/';
            $prefix = 'M';
            break;
        default:
            echo "Invalid category.";
            exit;
    }

    // Ensure the upload directory exists
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) {
            echo "Failed to create directory.";
            exit;
        }
    }

    // Process each uploaded file
    foreach ($_FILES['productImage']['tmp_name'] as $index => $tmpName) {
        // Check if both the product price and file are empty and skip if true
        if (empty($productPrices[$index]) && empty($tmpName)) {
            continue;
        }

        // Retrieve the product price for the current index
        $productPrice = $productPrices[$index] ?? '';

        // Skip file if there was an upload error
        if ($_FILES['productImage']['error'][$index] !== UPLOAD_ERR_OK) {
            echo "Error uploading file #" . ($index + 1);
            continue;
        }

        // Set paths for high and low-quality versions
        $imageName = $prefix . basename($_FILES['productImage']['name'][$index]);
        $imageHighPath = $uploadDir . $imageName;
        $imageLowPath = $uploadDir . 'low_' . $imageName;

        // Move the uploaded file to the high-quality image path
        if (move_uploaded_file($tmpName, $imageHighPath)) {
            // Detect the MIME type for further processing
            $mimeType = mime_content_type($imageHighPath);
            if (!$mimeType) {
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $mimeType = finfo_file($finfo, $imageHighPath);
                finfo_close($finfo);
            }

            // Create an image resource based on MIME type
            if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
                $srcImage = imagecreatefromjpeg($imageHighPath);
            } elseif ($mimeType === 'image/png') {
                $srcImage = imagecreatefrompng($imageHighPath);
            } elseif ($mimeType === 'image/gif') {
                $srcImage = imagecreatefromgif($imageHighPath);
            } else {
                echo "Unsupported file type for file #" . ($index + 1) . ". Detected MIME type: " . $mimeType;
                continue;
            }

            // Resize image to 500px wide for the low-quality version
            list($width, $height) = getimagesize($imageHighPath);
            $newWidth = 500;
            $newHeight = ($height / $width) * 500;

            // Create a new true color image for resizing
            $dstImage = imagecreatetruecolor($newWidth, $newHeight);
            imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

            // Save the resized image in the appropriate format
            if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
                imagejpeg($dstImage, $imageLowPath);
            } elseif ($mimeType === 'image/png') {
                imagepng($dstImage, $imageLowPath);
            } elseif ($mimeType === 'image/gif') {
                imagegif($dstImage, $imageLowPath);
            }

            // Free up memory
            imagedestroy($srcImage);
            imagedestroy($dstImage);

            // Insert product info into the database
            try {
                $query = "INSERT INTO products (imageLow, imageHigh, productPrice, status) VALUES (:imageLow, :imageHigh, :productPrice, :status)";
                $statement = $db->prepare($query);
                $statement->bindValue(':imageLow', $imageLowPath);
                $statement->bindValue(':imageHigh', $imageHighPath);
                $statement->bindValue(':productPrice', $productPrice);
                $statement->bindValue(':status', $status);
                $statement->execute();
            } catch (PDOException $e) {
                error_log("Database error: " . $e->getMessage());
                echo "Error saving product for file #" . ($index + 1) . ": " . $e->getMessage();
            }
        } else {
            echo "Failed to move file #" . ($index + 1) . ".";
        }
    }

    // Set a session message and redirect if all images were processed
    $_SESSION['message'] = "Images uploaded successfully.";
    header("Location: ../signin/welcome.php");
    exit;
} else {
    echo "Invalid request.";
}
?>
