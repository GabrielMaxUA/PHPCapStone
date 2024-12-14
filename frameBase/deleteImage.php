<?php

header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require 'connection.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Parse parameters
    $pictureID = isset($_GET['pictureID']) ? intval($_GET['pictureID']) : null;
    $action = isset($_GET['action']) ? $_GET['action'] : '';

    // Validate inputs
    if (!$pictureID || $pictureID < 1) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid or missing pictureID']);
        exit;
    }
    if (empty($action)) {
        http_response_code(400);
        echo json_encode(['message' => 'Action is required']);
        exit;
    }

    // Determine table and file columns based on action
    if ($action === 'natureGallery') {
        $table = 'nature_gallery';
        $fileLowColumn = 'natureLow';
        $fileHighColumn = 'natureHigh';
    } elseif ($action === 'architectureGallery') {
        $table = 'architecture_gallery';
        $fileLowColumn = 'archLow';
        $fileHighColumn = 'archHigh';
    } 
    elseif ($action === 'stagedGallery') {
        $table = 'staged_gallery';
        $fileLowColumn = 'stagedLow';
        $fileHighColumn = 'stagedHigh';
    }else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid action']);
        exit;
    }

    // Fetch file paths from the database
    $query = "SELECT $fileLowColumn AS fileLow, $fileHighColumn AS fileHigh FROM $table WHERE pictureID = ?";
    $stmt = $con->prepare($query);
    $stmt->bind_param('i', $pictureID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(404);
        echo json_encode(['message' => 'Image not found']);
        exit;
    }

    $row = $result->fetch_assoc();
    $filePathLow = $row['fileLow'];
    $filePathHigh = $row['fileHigh'];

    // Delete the record from the database
    $deleteQuery = "DELETE FROM $table WHERE pictureID = ? LIMIT 1";
    $stmt = $con->prepare($deleteQuery);
    $stmt->bind_param('i', $pictureID);

    if ($stmt->execute()) {
        // Delete files if they exist
        if (file_exists($filePathLow)) {
            unlink($filePathLow);
        }
        if (file_exists($filePathHigh)) {
            unlink($filePathHigh);
        }

        echo json_encode(['message' => 'Image deleted successfully']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to delete image']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}



?>
