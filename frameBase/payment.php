<?php
require_once 'connection.php';
header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['items']) || !isset($data['total']) || !isset($data['customerID'])) {
        throw new Exception('Missing required data');
    }

    // Verify total against database prices
    $calculatedTotal = 0;
    foreach ($data['items'] as $item) {
        $stmt = $con->prepare("SELECT price FROM gallery WHERE pictureID = ? AND status = 'active'");
        $stmt->bind_param('i', $item['pictureID']);
        $stmt->execute();
        $result = $stmt->get_result();
        $priceData = $result->fetch_assoc();
        
        if (!$priceData) {
            throw new Exception('Invalid item in cart');
        }
        $calculatedTotal += $priceData['price'];
    }

    // Verify total matches
    if (abs($calculatedTotal - $data['total']) > 0.01) {
        throw new Exception('Price mismatch detected');
    }

    // Generate unique order number
    $orderNumber = uniqid('ORD_', true);

    // Return payment intent for frontend
    echo json_encode([
        'success' => true,
        'orderNumber' => $orderNumber,
        'total' => $calculatedTotal,
        // Add PayPal client-id that frontend will use
        'paypalClientId' => 'YOUR_PAYPAL_CLIENT_ID'
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>