<?php
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['pictureID']) || !isset($data['status'])) {
        throw new Exception('Missing required parameters');
    }

    $pictureID = (int)$data['pictureID'];
    $status = $data['status'];

    // Start transaction to ensure both updates succeed or fail together
    mysqli_begin_transaction($con);

    // Update the image status
    $stmtGallery = $con->prepare("
        UPDATE gallery 
        SET status = ?
        WHERE pictureID = ?
    ");

    $stmtGallery->bind_param('si', $status, $pictureID);
    $success = $stmtGallery->execute();

    if (!$success) {
        throw new Exception('Failed to update image status');
    }
    // Update the status in orders table
    $stmtOrders = $con->prepare("
        UPDATE orders 
        SET status = ?
        WHERE pictureID = ?
    ");

    $stmtOrders->bind_param('si', $status, $pictureID);
    $successOrders = $stmtOrders->execute();

    if (!$successOrders) {
      throw new Exception('Failed to update order status in orders');
  }

  // If both updates succeeded, commit the transaction
  mysqli_commit($con);

    header('Content-Type: application/json');
    echo json_encode([
        'success' => true,
        'message' => 'Image status updated successfully'
    ]);

} catch (Exception $e) {
    error_log("Update status error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>