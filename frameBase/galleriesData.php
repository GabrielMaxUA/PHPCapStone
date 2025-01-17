<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require 'baseUrl.php';
require_once 'connection.php'; 

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? ''; // Use an 'action' parameter to differentiate requests

$validActions = ['natureGallery', 'architectureGallery', 'stagedGallery'];
if (!in_array($action, $validActions)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid action']);
    exit;
}

// GET method handling
if ($method === 'GET') {
    if ($action === 'natureGallery') {
        // Fetch nature gallery data by filtering image names ending with natureLow
        $query = "SELECT imageLow, price, pictureID FROM gallery WHERE imageLow LIKE '%natureLow.%' AND status = 'active'";
        $result = mysqli_query($con, $query);
  
        if ($result) {
          if (mysqli_num_rows($result) > 0) {
              $response = [];
              while($row = mysqli_fetch_assoc($result)){
                  $response[] = [
                      'pictureID' => $row['pictureID'],
                      'nGalleryImage' =>$baseUrl . '/' .  $row['imageLow'],
                      'price' => $row['price'],
                  ];
              }
              http_response_code(200);
              echo json_encode($response);
          } else {
              http_response_code(200);
              echo json_encode([]);
          }
      } else {
          http_response_code(500);
          echo json_encode(['message' => 'Database error: ' . mysqli_error($con)]);
      }
    }
    elseif ($action === 'architectureGallery') {
      $query = "SELECT imageLow, price, pictureID FROM gallery WHERE imageLow LIKE '%archLow.%' AND status = 'active'";
      $result = mysqli_query($con, $query);
  
      if ($result) {
          if (mysqli_num_rows($result) > 0) {
              $response = [];
              while($row = mysqli_fetch_assoc($result)){
                  $response[] = [
                      'pictureID' => $row['pictureID'],
                      'aGalleryImage' => $baseUrl . '/' .  $row['imageLow'],
                      'price' => $row['price'],
                  ];
              }
              http_response_code(200);
              echo json_encode($response);
          } else {
              http_response_code(200);
              echo json_encode([]);
          }
      } else {
          http_response_code(500);
          echo json_encode(['message' => 'Database error: ' . mysqli_error($con)]);
      }
    }
    elseif ($action === 'stagedGallery') {
      $query = "SELECT imageLow, price, pictureID FROM gallery WHERE imageLow LIKE '%stagedLow%' AND status = 'active'";
      $result = mysqli_query($con, $query);
  
      if ($result) {
        if (mysqli_num_rows($result) > 0) {
            $response = [];
            while($row = mysqli_fetch_assoc($result)){
                // Extract type from filename (color or black)
                $type = (strpos($row['imageLow'], 'Color') !== false) ? 'color' : 'black';
                $response[] = [
                    'pictureID' => $row['pictureID'],
                    'sGalleryImage' =>$baseUrl . '/' .  $row['imageLow'],
                    'price' => $row['price'],
                    'type' => $type,
                ];
            }
            http_response_code(200);
            echo json_encode($response);
        } else {
            http_response_code(200);
            echo json_encode([]);
        }
      } else {
        http_response_code(500);
        echo json_encode(['message' => 'Database error: ' . mysqli_error($con)]);
      }
    }
  }
  // POST method handling
  elseif ($method === 'POST') {
    if ($action === 'natureGallery') {
      $response = [];
      $errors = [];
  
      $price = isset($_POST['price']) ? mysqli_real_escape_string($con, $_POST['price']) : null;
  
      if ($price === null) {
          http_response_code(400);
          echo json_encode(['message' => 'Price is required']);
          exit;
      }
  
      if (isset($_FILES['nGallery']) && $_FILES['nGallery']['error'] === UPLOAD_ERR_OK) {
          $uploadDir = 'uploads/nature/';
          $fileName = basename($_FILES['nGallery']['name']);
          $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  
          if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
              http_response_code(400);
              echo json_encode(['message' => 'Invalid file type']);
              exit;
          }
  
          $newFileNameHigh = uniqid() . '_natureHigh.' . $fileExtension;
          $targetFilePathHigh = $uploadDir . $newFileNameHigh;
  
          if (!move_uploaded_file($_FILES['nGallery']['tmp_name'], $targetFilePathHigh)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to upload image']);
              exit;
          }
  
          $newFileNameLow = uniqid() . '_natureLow.' . $fileExtension;
          $targetFilePathLow = $uploadDir . $newFileNameLow;
  
          if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to resize image']);
              exit;
          }
  
          $query = "INSERT INTO gallery (imageHigh, imageLow, price, status) 
                   VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$price', 'active')";
  
          if (!mysqli_query($con, $query)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to insert data into database']);
              exit;
          }
  
          $pictureID = mysqli_insert_id($con);
          $response['pictureID'] = $pictureID;
          $response['natureHigh'] = $targetFilePathHigh;
          $response['natureLow'] = $targetFilePathLow;
          $response['price'] = $price;
  
          echo json_encode($response);
          exit;
      } else {
          http_response_code(400);
          echo json_encode(['message' => 'No file uploaded']);
          exit;
      }
    }
    elseif ($action === 'stagedGallery') {
      $response = [];
      $colorCount = isset($_POST['colorCount']) ? intval($_POST['colorCount']) : 0;
      $blackCount = isset($_POST['blackCount']) ? intval($_POST['blackCount']) : 0;
  
      // Process color images
      for ($i = 0; $i < $colorCount; $i++) {
          if (isset($_FILES["colorImage_$i"]) && $_FILES["colorImage_$i"]['error'] === UPLOAD_ERR_OK) {
              $colorPrice = isset($_POST["colorImagePrice_$i"]) ? 
                  mysqli_real_escape_string($con, $_POST["colorImagePrice_$i"]) : null;
  
              $uploadDir = 'uploads/staged/';
              $fileName = basename($_FILES["colorImage_$i"]['name']);
              $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  
              if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
                  continue; // Skip invalid file types
              }
  
              $newFileNameHigh = uniqid() . '_stagedHighColor.' . $fileExtension;
              $targetFilePathHigh = $uploadDir . $newFileNameHigh;
  
              if (move_uploaded_file($_FILES["colorImage_$i"]['tmp_name'], $targetFilePathHigh)) {
                  $newFileNameLow = uniqid() . '_stagedLowColor.' . $fileExtension;
                  $targetFilePathLow = $uploadDir . $newFileNameLow;
  
                  if (resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
                      $query = "INSERT INTO gallery (imageHigh, imageLow, price, status) 
                               VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$colorPrice', 'active')";
  
                      if (mysqli_query($con, $query)) {
                          $response['color'][] = [
                              'pictureID' => mysqli_insert_id($con),
                              'stagedHigh' => $targetFilePathHigh,
                              'stagedLow' => $targetFilePathLow,
                              'price' => $colorPrice,
                              'type' => 'color'
                          ];
                      }
                  }
              }
          }
      }
  
      // Process black images
      for ($i = 0; $i < $blackCount; $i++) {
          if (isset($_FILES["blackImage_$i"]) && $_FILES["blackImage_$i"]['error'] === UPLOAD_ERR_OK) {
              $blackPrice = isset($_POST["blackImagePrice_$i"]) ? 
                  mysqli_real_escape_string($con, $_POST["blackImagePrice_$i"]) : null;
  
              $uploadDir = 'uploads/staged/';
              $fileName = basename($_FILES["blackImage_$i"]['name']);
              $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  
              if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
                  continue;
              }
  
              $newFileNameHigh = uniqid() . '_stagedHighBlack.' . $fileExtension;
              $targetFilePathHigh = $uploadDir . $newFileNameHigh;
  
              if (move_uploaded_file($_FILES["blackImage_$i"]['tmp_name'], $targetFilePathHigh)) {
                  $newFileNameLow = uniqid() . '_stagedLowBlack.' . $fileExtension;
                  $targetFilePathLow = $uploadDir . $newFileNameLow;
  
                  if (resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
                      $query = "INSERT INTO gallery (imageHigh, imageLow, price, status) 
                               VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$blackPrice', 'active')";
  
                      if (mysqli_query($con, $query)) {
                          $response['black'][] = [
                              'pictureID' => mysqli_insert_id($con),
                              'stagedHigh' => $targetFilePathHigh,
                              'stagedLow' => $targetFilePathLow,
                              'price' => $blackPrice,
                              'type' => 'black'
                          ];
                      }
                  }
              }
          }
      }
  
      echo json_encode($response);
  }
    elseif ($action === 'architectureGallery') {
      $response = [];
      $errors = [];
  
      $price = isset($_POST['price']) ? mysqli_real_escape_string($con, $_POST['price']) : null;
  
      if ($price === null) {
          http_response_code(400);
          echo json_encode(['message' => 'Price is required']);
          exit;
      }
  
      if (isset($_FILES['aGallery']) && $_FILES['aGallery']['error'] === UPLOAD_ERR_OK) {
          $uploadDir = 'uploads/architecture/';
          $fileName = basename($_FILES['aGallery']['name']);
          $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  
          if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
              http_response_code(400);
              echo json_encode(['message' => 'Invalid file type']);
              exit;
          }
  
          $newFileNameHigh = uniqid() . '_archHigh.' . $fileExtension;
          $targetFilePathHigh = $uploadDir . $newFileNameHigh;
  
          if (!move_uploaded_file($_FILES['aGallery']['tmp_name'], $targetFilePathHigh)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to upload image']);
              exit;
          }
  
          $newFileNameLow = uniqid() . '_archLow.' . $fileExtension;
          $targetFilePathLow = $uploadDir . $newFileNameLow;
  
          if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to resize image']);
              exit;
          }
  
          $query = "INSERT INTO gallery (imageHigh, imageLow, price, status) 
                   VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$price', 'active')";
  
          if (!mysqli_query($con, $query)) {
              http_response_code(500);
              echo json_encode(['message' => 'Failed to insert data into database']);
              exit;
          }
  
          $pictureID = mysqli_insert_id($con);
          $response['pictureID'] = $pictureID;
          $response['archHigh'] = $targetFilePathHigh;
          $response['archLow'] = $targetFilePathLow;
          $response['price'] = $price;
  
          echo json_encode($response);
          exit;
      } else {
          http_response_code(400);
          echo json_encode(['message' => 'No file uploaded']);
          exit;
      }
    }
  }



function resizeImage($sourcePath, $targetPath, $maxWidth, $maxHeight)
{
    list($originalWidth, $originalHeight, $imageType) = getimagesize($sourcePath);

    // Load the source image based on its type
    $imageResource = match ($imageType) {
        IMAGETYPE_JPEG => imagecreatefromjpeg($sourcePath),
        IMAGETYPE_PNG => imagecreatefrompng($sourcePath),
        IMAGETYPE_GIF => imagecreatefromgif($sourcePath),
        default => null,
    };

    if (!$imageResource) {
        return false; // Failed to load the image
    }

    // Calculate aspect ratio
    $aspectRatio = $originalWidth / $originalHeight;

    // Determine the new dimensions based on the aspect ratio
    if ($aspectRatio == 1) { // 1:1 ratio
        $newWidth = $maxWidth; // Fixed width
        $newHeight = $maxWidth; // Fixed height
    } elseif ($aspectRatio > 1.77) { // 16:9 ratio (wider)
        $newWidth = $maxWidth; // Fixed width
        $newHeight = round($newWidth / $aspectRatio); // Adjusted height
    } elseif ($aspectRatio < 0.67) { // 9:16 ratio (taller)
        $newHeight = $maxHeight; // Fixed height
        $newWidth = round($newHeight * $aspectRatio); // Adjusted width
    } else { // Default case
        $newWidth = $maxWidth; // Fixed width
        $newHeight = round($newWidth / $aspectRatio); // Adjusted height
    }

    // Create a new blank image with the calculated dimensions
    $newImage = imagecreatetruecolor($newWidth, $newHeight);

    // Preserve transparency for PNG and GIF
    if ($imageType == IMAGETYPE_PNG || $imageType == IMAGETYPE_GIF) {
        imagealphablending($newImage, false);
        imagesavealpha($newImage, true);
    }

    // Resize the original image into the new image
    imagecopyresampled(
        $newImage,
        $imageResource,
        0, 0, 0, 0,
        $newWidth,
        $newHeight,
        $originalWidth,
        $originalHeight
    );

    // Save the resized image based on its type
    $success = match ($imageType) {
        IMAGETYPE_JPEG => imagejpeg($newImage, $targetPath, 90),
        IMAGETYPE_PNG => imagepng($newImage, $targetPath),
        IMAGETYPE_GIF => imagegif($newImage, $targetPath),
        default => false,
    };

    // Free up memory
    imagedestroy($newImage);
    imagedestroy($imageResource);

    return $success;
}
$con->close();
?>