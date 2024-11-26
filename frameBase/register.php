<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

require 'connection.php';
// Get the raw POST data
$postdata = file_get_contents("php://input", true);
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

    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
      http_response_code(400);
      echo json_encode(['error' => 'Invalid date format. Expected yyyy-MM-dd.']);
      exit;
  }
    // Insert data into the database
    $sql = "INSERT INTO `customers` (`firstName`, `lastName`, `email`, `password`, `phone`, `dob`) 
            VALUES ('$firstName', '$lastName', '$email', '$password', '$phone', '$dob')";

    if (mysqli_query($con, $sql)) {
        http_response_code(201); // Successfully created
        $customer = [
            'customerID' => mysqli_insert_id($con),
            'firstName' => $firstName,
            'lastName' => $lastName,
            'email' => $email,
            'phone' => $phone,
            'dob' => $dob
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

?>