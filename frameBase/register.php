<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'connection.php';
// Get the raw POST data
$postdata = file_get_contents("php://input");
// Check if data is present
if (isset($postdata) && !empty($postdata)) {
    $request = json_decode($postdata);

    // Validate that the decoded JSON object is present and has the required fields
    if (!isset($request->firstName, $request->lastName, $request->email, $request->password, $request->phone, $request->dob)) {
        http_response_code(400);
        echo json_encode(['error' => 'All fields are required.']);
        exit;
    }

    // Sanitize inputs
    $firstName = mysqli_real_escape_string($con, trim($request->firstName));
    $lastName = mysqli_real_escape_string($con, trim($request->lastName));
    $email = mysqli_real_escape_string($con, trim($request->email));
    $password = password_hash(trim($request->password), PASSWORD_BCRYPT);
    $phone = mysqli_real_escape_string($con, trim($request->phone));

    $dobISO = trim($request->dob);
    $dob = date('Y-m-d', strtotime($dobISO));

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid date format. Expected yyyy-MM-dd.']);
        exit;
    }

    // Calculate age and determine user status
    $birthDate = new DateTime($dob);
    $today = new DateTime();
    $age = $today->diff($birthDate)->y; // Calculate age in years
    $status = $age >= 18 ? 'active' : 'blocked'; // Determine status based on age

    // Check if email already exists
    $checkEmailSql = "SELECT `email` FROM `customers` WHERE `email` = '$email'";
    $checkEmailResult = mysqli_query($con, $checkEmailSql);

    if (mysqli_num_rows($checkEmailResult) > 0) {
        http_response_code(400); // Bad request
        echo json_encode(['error' => 'Customer with this email already exists. Please log in.']);
        exit;
    }

    // Insert data into the database
    $sql = "INSERT INTO `customers` (`firstName`, `lastName`, `email`, `password`, `phone`, `dob`, `status`) 
            VALUES ('$firstName', '$lastName', '$email', '$password', '$phone', '$dob', '$status')";

    if (mysqli_query($con, $sql)) {
        http_response_code(201); // Successfully created
        $customer = [
            'customerID' => mysqli_insert_id($con),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'dob' => $dob,
            'status' => $status // Include the status in the response
        ];
        echo json_encode(['data' => $customer]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to register customer: ' . mysqli_error($con)]);
    }
} else {
    http_response_code(400);
    echo json_encode(['error' => 'No input data provided.']);
}

$con->close();
?>
