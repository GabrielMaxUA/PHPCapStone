<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once 'connection.php'; // Ensure this includes your database connection
require_once 'baseUrl.php';
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch data from the main_gallery table
    $query = "SELECT sText, sImageMain, nText, nImageMain, aText, aImageMain FROM main_gallery WHERE id = 1";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode([
            'sText' => $row['sText'],
            'sImageMain' =>$baseUrl .  $row['sImageMain'],
            'nText' => $row['nText'],
            'nImageMain' =>$baseUrl  .  $row['nImageMain'],
            'aText' => $row['aText'],
            'aImageMain' => $baseUrl  . $row['aImageMain']
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Data not found']);
    }
} elseif ($method === 'POST') {
    // Handle text updates and file uploads
    $response = [];
    $errors = [];
    
    
    // Text updates
    $sText = mysqli_real_escape_string($con, $_POST['sText']) ?? '';
    $nText = mysqli_real_escape_string($con, $_POST['nText']) ?? '';
    $aText = mysqli_real_escape_string($con, $_POST['aText']) ?? '';

    $textQuery = "UPDATE `main_gallery` SET `sText` = '$sText', `nText` = '$nText', `aText` = '$aText' WHERE id = 1";
    if (mysqli_query($con, $textQuery)) {
        $response['message'] = 'Text updated successfully?';
    } else {
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

    // Respond with updated data
    echo json_encode($response);
} else {
    http_response_code(405);
    echo json_encode(['message' => 'Method not allowed']);
}
$con->close();
?>