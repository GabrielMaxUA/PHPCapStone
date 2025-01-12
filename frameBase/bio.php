<?php
session_start();

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'connection.php';

// Determine the request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch bioText and mainImage
    $query = "SELECT bioText, mainImage FROM aboutPage WHERE id = 1";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode([
            'bioText' => $row['bioText'],
            'mainImage' => $row['mainImage']
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Failed to fetch data']);
    }
} elseif ($method === 'POST') {
    // Parse the request input
    $input = json_decode(file_get_contents('php://input'), true);

    // Handle bio update
    if ($input !== null && isset($input['bio'])) {
        $bioText = mysqli_real_escape_string($con, $input['bio']);
        $query = "UPDATE aboutPage SET bioText = '$bioText' WHERE id = 1";

        if (mysqli_query($con, $query)) {
            echo json_encode(['message' => 'Bio updated successfully']);
        } else {
            error_log("Database error: " . mysqli_error($con));
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update bio']);
        }
        exit; // Exit after handling bio
    }

    // Handle image upload
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/';
        $originalFileName = basename($_FILES['image']['name']);
        $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);

        // Generate a new file name with "Main"
        $newFileName = time() . '_Main.' . $fileExtension;
        $targetFilePath = $uploadDir . $newFileName;

        // Fetch and delete the old image
        $query = "SELECT mainImage FROM aboutPage WHERE id = 1";
        $result = mysqli_query($con, $query);

        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $oldImagePath = $row['mainImage'];

            if ($oldImagePath && file_exists($oldImagePath)) {
                if (!unlink($oldImagePath)) {
                    error_log("Failed to delete old image: $oldImagePath");
                }
            }
        }

        // Save the new image to the uploads directory
        if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
            // Update the database with the new image path
            $updateQuery = "UPDATE aboutPage SET mainImage = '$targetFilePath' WHERE id = 1";

            if (mysqli_query($con, $updateQuery)) {
                echo json_encode([
                    'message' => 'Image uploaded successfully',
                    'imageUrl' => $targetFilePath
                ]);
            } else {
                error_log("Database error: " . mysqli_error($con));
                http_response_code(500);
                echo json_encode(['message' => 'Failed to update image in database']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload image']);
        }
        exit; // Exit after handling image
    }

    // Handle invalid input
    http_response_code(400);
    echo json_encode(['message' => 'Invalid input: No bio or image provided']);
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
