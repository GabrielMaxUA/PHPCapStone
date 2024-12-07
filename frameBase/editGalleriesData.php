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

if ($method === 'POST') {
  if($action === 'natureGallery') {
    $action = 'nature';
    $pictureID = isset($_POST['pictureID']) ? intval($_POST['pictureID']) : null;
    $price = isset($_POST['price']) ? floatval($_POST['price']) : null;

    // Validate Inputs
    if ($price === null) {
        http_response_code(400);
        echo json_encode(['message' => 'Price is required']);
        exit;
    }

    if ($pictureID) {
        // UPDATE Existing Record
        $query = "UPDATE nature_gallery SET price = ? WHERE pictureID = ?";
        $stmt = $con->prepare($query);
        $stmt->bind_param('di', $price, $pictureID);
    
        if ($stmt->execute()) {
            // Fetch updated data
            fetchUpdatedData($con, $action);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to update price']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['message' => 'Picture ID is required for updating the price']);
    }
    exit;
}
elseif($action === 'architectureGallery'){
  $action = 'architecture';
  $pictureID = isset($_POST['pictureID']) ? intval($_POST['pictureID']) : null;
  $price = isset($_POST['price']) ? floatval($_POST['price']) : null;

  // Validate Inputs
  if ($price === null) {
      http_response_code(400);
      echo json_encode(['message' => 'Price is required']);
      exit;
  }

  if ($pictureID) {
      // UPDATE Existing Record
      $query = "UPDATE architecture_gallery SET price = ? WHERE pictureID = ?";
      $stmt = $con->prepare($query);
      $stmt->bind_param('di', $price, $pictureID);
  
      if ($stmt->execute()) {
          // Fetch updated data
          fetchUpdatedData($con, $action);
      } else {
          http_response_code(500);
          echo json_encode(['message' => 'Failed to update price']);
      }
  } else {
      http_response_code(400);
      echo json_encode(['message' => 'Picture ID is required for updating the price']);
  }
  exit;
}
}



// Function to Fetch Updated Data
function fetchUpdatedData($con, $action) {
  if($action === 'nature'){
    $query = "SELECT pictureID, natureLow AS nGalleryImage, price FROM nature_gallery";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $response = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $response[] = [
                'pictureID' => $row['pictureID'],
                'nGalleryImage' => $row['nGalleryImage'],
                'price' => number_format((float)$row['price'], 2, '.', '') // Ensure 2 decimal places
            ];
        }
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'No data found']);
    }
    exit;
  }
  elseif($action === 'architecture'){
    $query = "SELECT pictureID, archLow AS aGalleryImage, price FROM architecture_gallery";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
        $response = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $response[] = [
                'pictureID' => $row['pictureID'],
                'aGalleryImage' => $row['aGalleryImage'],
                'price' => number_format((float)$row['price'], 2, '.', '') // Ensure 2 decimal places
            ];
        }
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'No data found']);
    }
    exit;
  }
  else{
    exit;
  }
 
}
?>
