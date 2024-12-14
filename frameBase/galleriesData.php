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
$action = $_GET['action'] ?? ''; // Use an 'action' parameter to differentiate requests

$validActions = ['natureGallery', 'architectureGallery', 'stagedGallery'];
if (!in_array($action, $validActions)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid action']);
    exit;
}

if ($method === 'GET') {
  if ($action === 'natureGallery') {
      // Fetch data from the main_gallery table
      $query = "SELECT natureLow, price, pictureID FROM nature_gallery";
      $result = mysqli_query($con, $query);

      if ($result && mysqli_num_rows($result) > 0) {
        $response = [];
        while($row = mysqli_fetch_assoc($result)){
          $response[] = [
              'pictureID'=>$row['pictureID'],
              'nGalleryImage' => $row['natureLow'],
              'price' => $row['price'],
          ];
        }
          echo json_encode($response);
      } else {
          http_response_code(404);
          echo json_encode(['message' => 'Data not found']);
      }
  }
  elseif ($action === 'architectureGallery') {
    // Fetch data from the main_gallery table
    $query = "SELECT archLow, price, pictureID FROM architecture_gallery";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
      $response = [];
      while($row = mysqli_fetch_assoc($result)){
        $response[] = [
            'pictureID'=>$row['pictureID'],
            'aGalleryImage' => $row['archLow'],
            'price' => $row['price'],
        ];
      }
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Data not found']);
    }
  }
  elseif ($action === 'stagedGallery') {
    // Fetch data from the main_gallery table
    $query = "SELECT stagedLow, price, pictureID, type FROM staged_gallery";
    $result = mysqli_query($con, $query);

    if ($result && mysqli_num_rows($result) > 0) {
      $response = [];
      while($row = mysqli_fetch_assoc($result)){
        $response[] = [
            'pictureID'=>$row['pictureID'],
            'sGalleryImage' => $row['stagedLow'],
            'price' => $row['price'],
            'type' => $row['type']
        ];
      }
        echo json_encode($response);
    } else {
        http_response_code(404);
        echo json_encode(['message' => 'Data not found']);
    }
  }
}//GET if 
  elseif ($method === 'POST') {
  if ($action === 'natureGallery') {
    $response = [];
    $errors = [];

    // Step 1: Validate and Sanitize Input
    $price = isset($_POST['price']) ? mysqli_real_escape_string($con, $_POST['price']) : null;

    if ($price === null) {
        http_response_code(400);
        echo json_encode(['message' => 'Price is required']);
        exit;
    }

    // Step 2: Handle File Upload
    if (isset($_FILES['nGallery']) && $_FILES['nGallery']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/nature/'; 
        $fileName = basename($_FILES['nGallery']['name']);
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid file type']);
            exit;
        }

        $newFileNameHigh = time() . '_natureHigh.' . $fileExtension;
        $targetFilePathHigh = $uploadDir . $newFileNameHigh;

        if (!move_uploaded_file($_FILES['nGallery']['tmp_name'], $targetFilePathHigh)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload image']);
            exit;
        }

        $newFileNameLow = time() . '_natureLow.' . $fileExtension;
        $targetFilePathLow = $uploadDir . $newFileNameLow;

        if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to resize image']);
            exit;
        }

        $query = "INSERT INTO `nature_gallery` (`natureHigh`, `natureLow`, `price`) 
                  VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$price')";

        if (!mysqli_query($con, $query)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to insert data into database']);
            exit;
        }

        // Fetch the ID of the newly inserted record
        $pictureID = mysqli_insert_id($con);

        // Prepare and Return Response
        $response['pictureID'] = $pictureID; // Corrected typo
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
    $errors = [];

    // Step 1: Validate inputs
    $colorPrice = isset($_POST['colorPrice']) ? mysqli_real_escape_string($con, $_POST['colorPrice']) : null;
    $blackPrice = isset($_POST['blackPrice']) ? mysqli_real_escape_string($con, $_POST['blackPrice']) : null;

    // Check if at least one file is uploaded
    if (!isset($_FILES['colorImage']) && !isset($_FILES['blackImage'])) {
        http_response_code(400);
        echo json_encode(['message' => 'At least one image must be uploaded']);
        exit;
    }

    // Step 2: Process Color Image
    if (isset($_FILES['colorImage']) && $_FILES['colorImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/staged/';
        $fileName = basename($_FILES['colorImage']['name']);
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid file type for color image']);
            exit;
        }

        $newFileNameHigh = time() . '_stagedHighColor.' . $fileExtension;
        $targetFilePathHigh = $uploadDir . $newFileNameHigh;

        if (!move_uploaded_file($_FILES['colorImage']['tmp_name'], $targetFilePathHigh)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload color image']);
            exit;
        }

        $newFileNameLow = time() . '_stagedLowColor.' . $fileExtension;
        $targetFilePathLow = $uploadDir . $newFileNameLow;

        if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to resize color image']);
            exit;
        }

        $query = "INSERT INTO `staged_gallery` (`stagedHigh`, `stagedLow`, `price`, `type`) 
                  VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$colorPrice', 'color')";

        if (!mysqli_query($con, $query)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to insert color image data into database']);
            exit;
        }
        $response['color'] = [
            'pictureID' => mysqli_insert_id($con),
            'stagedHigh' => $targetFilePathHigh,
            'stagedLow' => $targetFilePathLow,
            'price' => $blackPrice,
            'type' => 'color'
        ];
        
    }

    // Step 3: Process Black/White Image
    if (isset($_FILES['blackImage']) && $_FILES['blackImage']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/staged/';
        $fileName = basename($_FILES['blackImage']['name']);
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

        if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid file type for black/white image']);
            exit;
        }

        $newFileNameHigh = time() . '_stagedHighBlack.' . $fileExtension;
        $targetFilePathHigh = $uploadDir . $newFileNameHigh;

        if (!move_uploaded_file($_FILES['blackImage']['tmp_name'], $targetFilePathHigh)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload black/white image']);
            exit;
        }

        $newFileNameLow = time() . '_stagedLowBlack.' . $fileExtension;
        $targetFilePathLow = $uploadDir . $newFileNameLow;

        if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to resize black/white image']);
            exit;
        }

        $query = "INSERT INTO `staged_gallery` (`stagedHigh`, `stagedLow`, `price`, `type`) 
                  VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$blackPrice', 'black')";

        if (!mysqli_query($con, $query)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to insert black/white image data into database']);
            exit;
        }

        $response['black'] = [
            'pictureID' => mysqli_insert_id($con),
            'stagedHigh' => $targetFilePathHigh,
            'stagedLow' => $targetFilePathLow,
            'price' => $blackPrice,
            'type' => 'black'
        ];
    }
    echo json_encode($response);
}
  elseif ($action === 'architectureGallery') {
    $response = [];
    $errors = [];
  
    // Step 1: Validate and Sanitize Input
    $price = isset($_POST['price']) ? mysqli_real_escape_string($con, $_POST['price']) : null;
  
    if ($price === null) {
        http_response_code(400);
        echo json_encode(['message' => 'Price is required']);
        exit;
    }
  
    // Step 2: Handle File Upload
    if (isset($_FILES['aGallery']) && $_FILES['aGallery']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = 'uploads/architecture/'; 
        $fileName = basename($_FILES['aGallery']['name']);
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
  
        if (!in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Invalid file type']);
            exit;
        }
  
        $newFileNameHigh = time() . '_archHigh.' . $fileExtension;
        $targetFilePathHigh = $uploadDir . $newFileNameHigh;
  
        if (!move_uploaded_file($_FILES['aGallery']['tmp_name'], $targetFilePathHigh)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to upload image']);
            exit;
        }
  
        $newFileNameLow = time() . '_archLow.' . $fileExtension;
        $targetFilePathLow = $uploadDir . $newFileNameLow;
  
        if (!resizeImage($targetFilePathHigh, $targetFilePathLow, 842, 375)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to resize image']);
            exit;
        }
  
        $query = "INSERT INTO `architecture_gallery` (`archHigh`, `archLow`, `price`) 
                  VALUES ('$targetFilePathHigh', '$targetFilePathLow', '$price')";
  
        if (!mysqli_query($con, $query)) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to insert data into database']);
            exit;
        }
  
        // Fetch the ID of the newly inserted record
        $pictureID = mysqli_insert_id($con);
  
        // Prepare and Return Response
        $response['pictureID'] = $pictureID; // Corrected typo
        $response['archHigh'] = $targetFilePathHigh;
        $response['archLow'] = $targetFilePathLow;
        $response['price'] = $price;
  
        echo json_encode($response);
        exit;
    }
    else {
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
