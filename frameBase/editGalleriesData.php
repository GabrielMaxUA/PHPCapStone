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

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// Validate action
$validActions = ['natureGallery', 'architectureGallery', 'stagedGallery'];
if (!in_array($action, $validActions)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid action']);
    exit;
}

// Handle POST requests for updating
if ($method === 'POST') {
    $pictureID = isset($_POST['pictureID']) ? intval($_POST['pictureID']) : null;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : null;

    // Validate inputs
    if ($price === null) {
        http_response_code(400);
        echo json_encode(['message' => 'Price is required']);
        exit;
    }

    if ($pictureID) {
        // Update existing record in the gallery table
        $query = "UPDATE gallery SET price = ? WHERE pictureID = ?";
        $stmt = $con->prepare($query);

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to prepare statement: ' . $con->error]);
            exit;
        }

        $stmt->bind_param('di', $price, $pictureID);

        if ($stmt->execute()) {
            // Fetch updated data
            fetchUpdatedData($con, $action);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update price: ' . $stmt->error]);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Picture ID is required for updating the price']);
    }
    exit;
}

// Function to fetch updated data
function fetchUpdatedData($con, $action) {
    $query = "SELECT pictureID, imageLow, price FROM gallery";

    // Customize output based on action
    if ($action === 'natureGallery') {
        $query .= " WHERE imageLow LIKE '%natureLow%'";
    } elseif ($action === 'architectureGallery') {
        $query .= " WHERE imageLow LIKE '%archLow%'";
    } elseif ($action === 'stagedGallery') {
        $query .= " WHERE imageLow LIKE '%stagedLow%'";
    }

    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $response = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $type = null;
            if ($action === 'stagedGallery') {
                $type = strpos($row['imageLow'], 'Color') !== false ? 'color' : 'black';
            }

            $response[] = [
                'pictureID' => $row['pictureID'],
                'imageLow' => $row['imageLow'],
                'price' => number_format((float)$row['price'], 2, '.', ''), // Ensure 2 decimal places
                'type' => $type, // Only relevant for stagedGallery
            ];
        }
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'No data found']);
    }
}
$con->close();
?>
