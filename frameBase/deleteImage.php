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
    $action = $_GET['action'] ?? '';

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

    // Ensure valid action
    $validActions = ['natureGallery', 'architectureGallery', 'stagedGallery'];
    if (!in_array($action, $validActions)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid action']);
        exit;
    }

    // Fetch file paths from the database
    $query = "SELECT imageLow, imageHigh FROM gallery WHERE pictureID = ?";
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
    $filePathLow = $row['imageLow'];
    $filePathHigh = $row['imageHigh'];

    // Delete the record from the database
    $deleteQuery = "DELETE FROM gallery WHERE pictureID = ? LIMIT 1";
    $deleteStmt = $con->prepare($deleteQuery);
    $deleteStmt->bind_param('i', $pictureID);

    if ($deleteStmt->execute()) {
        // Delete files if they exist
        $fileErrors = [];
        if ($filePathLow && file_exists($filePathLow)) {
            if (!unlink($filePathLow)) {
                $fileErrors[] = "Failed to delete low-resolution image: $filePathLow";
            }
        }
        if ($filePathHigh && file_exists($filePathHigh)) {
            if (!unlink($filePathHigh)) {
                $fileErrors[] = "Failed to delete high-resolution image: $filePathHigh";
            }
        }

        if (empty($fileErrors)) {
            echo json_encode(['message' => 'Image deleted successfully']);
        } else {
            echo json_encode([
                'message' => 'Image deleted from database, but some files could not be removed',
                'errors' => $fileErrors
            ]);
        }
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Failed to delete image from database']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
