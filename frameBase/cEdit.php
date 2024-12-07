<?php
session_start();

require 'connection.php';
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}
header('Content-Type: application/json; charset=utf-8');

$response = [];
$postdata = file_get_contents("php://input");

// Check if data is present
if (isset($postdata) && !empty($postdata)) {
    $request = json_decode($postdata, true); // Decode as associative array for simplicity

    // Validate required fields
    if (!isset($request['data']['customerID'], $request['data']['status'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields.']);
        exit;
    }

    $customerID = mysqli_real_escape_string($con, (int)$request['data']['customerID']);
    $status = mysqli_real_escape_string($con, trim($request['data']['status']));

    // Validate the status value
    if ($status === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Status cannot be empty.']);
        exit;
    }

    // Update the database
    $sql = "UPDATE `customers` SET `status`='$status' WHERE `customerID`='$customerID'";

    if (mysqli_query($con, $sql)) {
        $response['status'] = 'Updated successfully';
        http_response_code(200); // Success
    } else {
        $response['error'] = 'Database update failed';
        http_response_code(422); // Unprocessable Entity
    }
    echo json_encode($response);
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No input data provided.']);
}
?>
