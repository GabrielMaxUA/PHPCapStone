<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require 'connection.php'; // Ensure this includes your database connection

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ''; // Use an 'action' parameter to differentiate requests

if ($method === 'GET') {
    if ($action === 'mainGallery') {
        // Fetch data from the main_gallery table
        $query = "SELECT sText, sImageMain, nText, nImageMain, aText, aImageMain FROM main_gallery WHERE id = 1";
        $result = mysqli_query($con, $query);

        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            echo json_encode([
                'sText' => $row['sText'],
                'sImageMain' => $row['sImageMain'],
                'nText' => $row['nText'],
                'nImageMain' => $row['nImageMain'],
                'aText' => $row['aText'],
                'aImageMain' => $row['aImageMain']
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'Data not found']);
        }
    } elseif ($action === 'aboutPage') {
        // Fetch data from the aboutPage table
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
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid action for GET']);
    }
} elseif ($method === 'POST') {
    if ($action === 'mainGallery') {
        $response = [];
        $errors = [];

        // Text updates
        $sText = mysqli_real_escape_string($con, $_POST['sText'] ?? '');
        $nText = mysqli_real_escape_string($con, $_POST['nText'] ?? '');
        $aText = mysqli_real_escape_string($con, $_POST['aText'] ?? '');

        $textQuery = "UPDATE `main_gallery` SET `sText` = '$sText', `nText` = '$nText', `aText` = '$aText' WHERE id = 1";
        if (!mysqli_query($con, $textQuery)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update text']);
            exit;
        }

        // File uploads
        foreach (['nFile' => 'nImageMain', 'aFile' => 'aImageMain', 'sFile' => 'sImageMain'] as $fileKey => $dbColumn) {
            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === UPLOAD_ERR_OK) {
                $uploadDir = 'uploads/main/';
                $fileName = basename($_FILES[$fileKey]['name']);
                $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);

                $newFileName = time() . "_$fileKey.$fileExtension";
                $targetFilePath = $uploadDir . $newFileName;

                // Delete old file
                $query = "SELECT $dbColumn FROM main_gallery WHERE id = 1";
                $result = mysqli_query($con, $query);
                if ($result && $row = mysqli_fetch_assoc($result)) {
                    $oldFilePath = $row[$dbColumn];
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                    }
                }

                // Upload new file
                if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $targetFilePath)) {
                    $updateQuery = "UPDATE main_gallery SET $dbColumn = '$targetFilePath' WHERE id = 1";
                    if (mysqli_query($con, $updateQuery)) {
                        $response["{$fileKey}Url"] = $targetFilePath;
                    } else {
                        http_response_code(500);
                        echo json_encode(['message' => "Failed to update $fileKey"]);
                        exit;
                    }
                }
            }
        }
        echo json_encode($response);
    } elseif ($action === 'updateAboutPage') {
        // Parse the request input
        $input = json_decode(file_get_contents('php://input'), true);

        if ($input !== null && isset($input['bio'])) {
            $bioText = mysqli_real_escape_string($con, $input['bio']);
            $query = "UPDATE aboutPage SET bioText = '$bioText' WHERE id = 1";

            if (mysqli_query($con, $query)) {
                echo json_encode(['message' => 'Bio updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Failed to update bio']);
            }
            exit;
        }

        // Handle image upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/main/';
            $originalFileName = basename($_FILES['image']['name']);
            $fileExtension = pathinfo($originalFileName, PATHINFO_EXTENSION);

            $newFileName = time() . '_Main.' . $fileExtension;
            $targetFilePath = $uploadDir . $newFileName;

            $query = "SELECT mainImage FROM aboutPage WHERE id = 1";
            $result = mysqli_query($con, $query);
            if ($result && mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                $oldImagePath = $row['mainImage'];
                if ($oldImagePath && file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            if (move_uploaded_file($_FILES['image']['tmp_name'], $targetFilePath)) {
                $updateQuery = "UPDATE aboutPage SET mainImage = '$targetFilePath' WHERE id = 1";
                if (mysqli_query($con, $updateQuery)) {
                    echo json_encode([
                        'message' => 'Image uploaded successfully',
                        'imageUrl' => $targetFilePath
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(['message' => 'Failed to update image in database']);
                }
            } else {
                http_response_code(500);
                echo json_encode(['message' => 'Failed to upload image']);
            }
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid action for POST']);
    }
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
?>
