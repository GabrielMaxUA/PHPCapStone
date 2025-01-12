<?php
header('Content-Type: application/json');
require_once 'connection.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

if ($con->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $con->connect_error]));
}

if (isset($_GET['orderNumber'])) {
    $orderNumber = $_GET['orderNumber'];
    $sql = "SELECT g.imageLow, g.imageHigh, g.price, g.status 
            FROM orders o
            LEFT JOIN gallery g ON o.pictureID = g.pictureID
            WHERE o.orderNumber = ?";
    $stmt = $con->prepare($sql);
    $stmt->bind_param('s', $orderNumber);

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $orderItems = [];
        while ($row = $result->fetch_assoc()) {
            $orderItems[] = $row;
        }
        echo json_encode($orderItems);
    } else {
        echo json_encode(['error' => 'Failed to fetch order items: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['error' => 'Order Number is required']);
}

$con->close();
?>
