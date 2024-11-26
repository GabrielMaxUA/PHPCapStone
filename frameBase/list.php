<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'connection.php';

$contacts = [];
$sql = "SELECT customerID, firstName, lastName, email, password, phone, dob, status, type FROM customers";

if($_SERVER)
if($result = mysqli_query($con, $sql)) {
  $count = 0;
  while($row = mysqli_fetch_assoc($result)){
    $customers[$count]['customerID'] = $row['customerID'];
    $customers[$count]['firstName'] = $row['firstName'];
    $customers[$count]['lastName'] = $row['lastName'];
    $customers[$count]['email'] = $row['email'];
    $customers[$count]['password'] = $row['password'];
    $customers[$count]['phone'] = $row['phone'];
    $customers[$count]['status'] = $row['status'];
    $customers[$count]['type'] = $row['type'];
    $customers[$count]['dob'] = $row['dob'];
    $count++;
  }
  
  echo json_encode(['data' => $customers]);//necessary for angular to take data from
}
else{
   http_response_code(404);
}
?>