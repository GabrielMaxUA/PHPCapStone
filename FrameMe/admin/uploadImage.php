<?php
// Start a session to handle session variables, including messages for success or failure.
session_start();

// Include the database connection file to allow access to the database.
require_once('../model/database.php');

// Check if the form was submitted with a POST request.
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Retrieve the product price from the form submission.
    $productPrice = $_POST['productPrice'];
    
    // Retrieve the uploaded image file from the form submission.
    $image = $_FILES['productImage'];
    
    // Set the default status for the new product to active (1).
    $status = 1;
    
    // Get the selected category (A, N, or M) to determine where the image will be stored.
    $category = $_POST['category'] ?? '';

    // Set the upload directory and file prefix based on the selected category.
    switch ($category) {
        case 'A': // For Architecture category
            $uploadDir = '../Assets/architecture/';
            $prefix = 'A';
            break;
        case 'N': // For Nature category
            $uploadDir = '../Assets/nature/';
            $prefix = 'N';
            break;
        case 'M': // For Models category
            $uploadDir = '../Assets/models/';
            $prefix = 'M';
            break;
        default: // If the category is invalid, show an error and exit the script.
            echo "Invalid category.";
            exit;
    }

    // Check if the upload directory exists; if not, attempt to create it with full permissions.
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0777, true)) { // true enables recursive directory creation
            echo "Failed to create directory."; // Error message if directory creation fails.
            exit;
        }
    }

    // Set the file name with a prefix and full path for both high and low resolution images.
    $imageName = $prefix . basename($image['name']); // Add prefix to original file name
    $imageHighPath = $uploadDir . $imageName; // Full path for the high-quality image
    $imageLowPath = $uploadDir . 'low_' . $imageName; // Full path for the resized low-quality image

    // Move the uploaded file to the high-quality image path.
    if (move_uploaded_file($image['tmp_name'], $imageHighPath)) {
        // Check the MIME type of the uploaded image file.
        $mimeType = mime_content_type($imageHighPath);
        
        // Fallback to using finfo if mime_content_type fails to detect MIME type.
        if (!$mimeType) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $imageHighPath);
            finfo_close($finfo);
        }

        // Create the source image resource based on the MIME type.
        if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
            $srcImage = imagecreatefromjpeg($imageHighPath);
        } elseif ($mimeType === 'image/png') {
            $srcImage = imagecreatefrompng($imageHighPath);
        } elseif ($mimeType === 'image/gif') {
            $srcImage = imagecreatefromgif($imageHighPath);
        } else {
            // If the file type is unsupported, output an error and stop the script.
            echo "Unsupported file type. Detected MIME type: " . $mimeType;
            exit;
        }

        // Get original image dimensions and set new dimensions for the low-quality image (500px wide).
        list($width, $height) = getimagesize($imageHighPath);
        $newWidth = 500; // Set the new width for the resized image
        $newHeight = ($height / $width) * 500; // Calculate the height while keeping the aspect ratio

        // Create a blank image with the new dimensions for the resized image.
        $dstImage = imagecreatetruecolor($newWidth, $newHeight);

        // Copy and resize the high-quality image to the low-quality image size.
        imagecopyresampled($dstImage, $srcImage, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        // Save the resized image in the appropriate format (JPEG, PNG, or GIF) based on the original MIME type.
        if ($mimeType === 'image/jpeg' || $mimeType === 'image/jpg') {
            imagejpeg($dstImage, $imageLowPath);
        } elseif ($mimeType === 'image/png') {
            imagepng($dstImage, $imageLowPath);
        } elseif ($mimeType === 'image/gif') {
            imagegif($dstImage, $imageLowPath);
        }

        // Free up memory by destroying the image resources.
        imagedestroy($srcImage);
        imagedestroy($dstImage);

        // Insert product information into the database, including paths for high and low-quality images, product price, and status.
        try {
            $query = "INSERT INTO products (imageLow, imageHigh, productPrice, status) VALUES (:imageLow, :imageHigh, :productPrice, :status)";
            $statement = $db->prepare($query); // Prepare the query to prevent SQL injection
            $statement->bindValue(':imageLow', $imageLowPath); // Bind the low-quality image path
            $statement->bindValue(':imageHigh', $imageHighPath); // Bind the high-quality image path
            $statement->bindValue(':productPrice', $productPrice); // Bind the product price
            $statement->bindValue(':status', $status); // Bind the status
            $statement->execute(); // Execute the query

            // Set a session message to indicate successful upload and redirect to the welcome page.
            $_SESSION['message'] = "Image is uploaded";
            header("Location: ../signin/welcome.php");
            exit; // Stop further script execution after redirection
        } catch (PDOException $e) {
            // Log the error message and output a user-friendly message in case of a database error.
            error_log("Database error: " . $e->getMessage());
            echo "There was an error saving the product: " . $e->getMessage();
            echo "imageLowPath: $imageLowPath, imageHighPath: $imageHighPath";
        }
    } else {
        // If the file fails to move to the destination, output an error message.
        echo "Failed to move the uploaded file.";
    }
} else {
    // Output an error message if the form was not submitted with a POST request.
    echo "Invalid request.";
}
?>
