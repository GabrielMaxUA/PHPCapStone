<?php
require_once 'connection.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    // Get the request data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['pictureID'])) {
        throw new Exception('Missing pictureID parameter');
    }

    $pictureID = (int)$data['pictureID'];

    // Check if the image exists and is purchased
    $stmt = $con->prepare("
        SELECT status, price 
        FROM gallery 
        WHERE pictureID = ?
    ");

    $stmt->bind_param('i', $pictureID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Image not found');
    }

    $row = $result->fetch_assoc();

    echo json_encode([
      'success' => true,
      'status' => $row['status'],
      'price' => $row['price'],
      'isActive' => $row['status'] === 'active',
      'isPurchased' => $row['status'] === 'purchased',
      'isDownloaded' => $row['status'] === 'downloaded'
  ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    if (isset($con)) {
        $con->close();
    }
}
?>