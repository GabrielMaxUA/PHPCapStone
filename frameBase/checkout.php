<?php
require_once 'connection.php';

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Invalid JSON data');
    }

    // Validate required fields
    if (!isset($data['orderNumber']) || !is_string($data['orderNumber'])) {
        throw new Exception('Invalid or missing orderNumber');
    }
    if (!isset($data['customerID']) || !is_numeric($data['customerID'])) {
        throw new Exception('Invalid or missing customerID');
    }
    if (!isset($data['cartItems']) || !is_array($data['cartItems'])) {
        throw new Exception('Invalid or missing cartItems');
    }

    // Start transaction
    mysqli_begin_transaction($con);
    error_log("Started transaction");

    // Calculate total amount
    $totalAmount = 0;
    foreach ($data['cartItems'] as $item) {
        if (!isset($item['price']) || !is_numeric($item['price']) || !isset($item['pictureID'])) {
            throw new Exception('Invalid cart item data');
        }
        $totalAmount += $item['price'];
    }
    error_log("Calculated total amount: " . $totalAmount);

    // First insert into orders table and get orderID
    $firstItem = true;
    $orderID = null;
    
    foreach ($data['cartItems'] as $item) {
        $pictureID = (int)$item['pictureID'];
        $customerID = (int)$data['customerID'];
        $orderNumber = $data['orderNumber'];

        // First check the current status from gallery
        $stmtCheckStatus = $con->prepare("
            SELECT status 
            FROM gallery 
            WHERE pictureID = ?
        ");
        $stmtCheckStatus->bind_param('i', $pictureID);
        $stmtCheckStatus->execute();
        $statusResult = $stmtCheckStatus->get_result();
        $statusRow = $statusResult->fetch_assoc();
        $currentStatus = $statusRow['status'];
        $stmtCheckStatus->close();

        // Insert into orders with the appropriate status
        $stmtOrders = $con->prepare("
            INSERT INTO orders (orderNumber, pictureID, customerID, status) 
            VALUES (?, ?, ?, ?)
        ");
        
        // Use current status if it's downloaded, otherwise set as purchased
        $orderStatus = $currentStatus === 'downloaded' ? 'downloaded' : 'purchased';
        
        $stmtOrders->bind_param('siis', $orderNumber, $pictureID, $customerID, $orderStatus);
        
        if (!$stmtOrders->execute()) {
            throw new Exception('Failed to insert into orders: ' . $stmtOrders->error);
        }
        
        if ($firstItem) {
            $orderID = $stmtOrders->insert_id;
            $firstItem = false;
            
            // Insert into orderDetails once we have the first orderID
            $stmtDetails = $con->prepare("
                INSERT INTO orderDetails (orderNumber, date, total, orderID) 
                VALUES (?, NOW(), ?, ?)
            ");
            
            $stmtDetails->bind_param('sdi', $orderNumber, $totalAmount, $orderID);
            
            if (!$stmtDetails->execute()) {
                throw new Exception('Failed to insert into orderDetails: ' . $stmtDetails->error);
            }
            
            $orderDetailsID = $stmtDetails->insert_id;
            
            // Update customer with orderDetailsID
            $stmtUpdateCustomer = $con->prepare("
                UPDATE customers 
                SET orderDetailsID = ? 
                WHERE customerID = ?
            ");
            
            $stmtUpdateCustomer->bind_param('ii', $orderDetailsID, $customerID);
            
            if (!$stmtUpdateCustomer->execute()) {
                throw new Exception('Failed to update customer: ' . $stmtUpdateCustomer->error);
            }
        }

        // Update gallery status to match order status
        $stmtUpdateGallery = $con->prepare("
            UPDATE gallery 
            SET status = ? 
            WHERE pictureID = ?
        ");
        
        $stmtUpdateGallery->bind_param('si', $orderStatus, $pictureID);
        
        if (!$stmtUpdateGallery->execute()) {
            throw new Exception('Failed to update gallery status: ' . $stmtUpdateGallery->error);
        }
        
        $stmtOrders->close();
        $stmtUpdateGallery->close();
    }

    // Commit transaction
    mysqli_commit($con);

    echo json_encode([
        'success' => true,
        'message' => 'Order processed successfully',
        'orderNumber' => $data['orderNumber'],
        'status' => 'purchased'
    ]);

} catch (Exception $e) {
    if (isset($con)) {
        mysqli_rollback($con);
    }

    error_log('Order Error: ' . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} finally {
    if (isset($stmtDetails)) $stmtDetails->close();
    if (isset($stmtUpdateCustomer)) $stmtUpdateCustomer->close();
    if (isset($con)) $con->close();
}
?>