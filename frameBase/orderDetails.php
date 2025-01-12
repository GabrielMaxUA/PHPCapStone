<?php
require_once 'connection.php';
header('Content-Type: application/json');

// Check connection - use consistent variable name
if ($con->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $con->connect_error]));
}

if (isset($_GET['customerID'])) {
    $customerID = intval($_GET['customerID']);
    $sql = "SELECT od.orderDetailsID, od.orderNumber, od.date, od.total, c.firstName, c.lastName  
            FROM orderDetails od
            LEFT JOIN orders o ON od.orderID = o.orderID
            LEFT JOIN customers c ON o.customerID = c.customerID
            WHERE o.customerID = ?";
    
  
    $stmt = $con->prepare($sql);
    $stmt->bind_param('i', $customerID);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $response = [
            'customerInfo' => null,
            'orders' => []
        ];
        
        while ($row = $result->fetch_assoc()) {
            if (!$response['customerInfo']) {
                $response['customerInfo'] = [
                    'firstName' => $row['firstName'],
                    'lastName' => $row['lastName']
                ];
            }
            $response['orders'][] = [
                'orderDetailsID' => $row['orderDetailsID'],
                'orderNumber' => $row['orderNumber'],
                'date' => $row['date'],
                'total' => $row['total']
            ];
        }
        echo json_encode($response);
    } else {
        echo json_encode(['error' => 'Failed to fetch order details: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['error' => 'Customer ID is required']);
}

$con->close();
?>