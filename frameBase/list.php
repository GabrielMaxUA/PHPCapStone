<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'connection.php';

// SQL query to fetch customer data and count of orderDetails
$sql = "
    SELECT 
        c.customerID, 
        c.firstName, 
        c.lastName, 
        c.email, 
        c.password, 
        c.phone, 
        c.dob, 
        c.status, 
        c.type, 
        c.created_at, 
        c.orderDetailsID,
        COALESCE(COUNT(od.orderDetailsID), 0) AS orderCount
    FROM customers c
    LEFT JOIN orders o ON c.customerID = o.customerID
    LEFT JOIN orderDetails od ON o.orderNumber = od.orderNumber
    GROUP BY c.customerID
";

if ($result = mysqli_query($con, $sql)) {
    $customers = [];
    $count = 0;
    while ($row = mysqli_fetch_assoc($result)) {
        $orderCount = $row['orderCount']; // Assign orderCount to a separate variable

        $customers[$count]['customerID'] = $row['customerID'];
        $customers[$count]['firstName'] = $row['firstName'];
        $customers[$count]['lastName'] = $row['lastName'];
        $customers[$count]['email'] = $row['email'];
        $customers[$count]['password'] = $row['password'];
        $customers[$count]['phone'] = $row['phone'];
        $customers[$count]['status'] = $row['status'];
        $customers[$count]['type'] = $row['type'];
        $customers[$count]['dob'] = $row['dob'];
        $customers[$count]['created_at'] = $row['created_at'];
        $customers[$count]['orderDetailsID'] = $orderCount; // Assign $orderCount to orderDetailsID
        $count++;
    }

    // Output the customers data as JSON
    echo json_encode(['data' => $customers]);
} else {
    http_response_code(404); // Not Found
    echo json_encode(['error' => 'Failed to fetch data']);
}
?>
