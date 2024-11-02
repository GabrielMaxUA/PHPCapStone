<?php
session_start();
require_once('../model/database.php');

// Retrieve and validate form inputs
$customerID = filter_input(INPUT_POST, 'customerID', FILTER_VALIDATE_INT);
$firstName = filter_input(INPUT_POST, 'firstName', FILTER_SANITIZE_STRING);
$lastName = filter_input(INPUT_POST, 'lastName', FILTER_SANITIZE_STRING);
$phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
$dob = filter_input(INPUT_POST, 'DOB', FILTER_SANITIZE_STRING);
$eMail = filter_input(INPUT_POST, 'eMail', FILTER_SANITIZE_EMAIL);
$banned = isset($_POST['banned']) ? 0 : 1;

// Check if required inputs are valid
if ($customerID && $firstName && $lastName && $phone && $dob && $eMail) {
    // Prepare the update query
    $query = "UPDATE customers SET firstName = :firstName, lastName = :lastName, phone = :phone, eMail = :eMail, DOB = :DOB, banned = :banned WHERE custID = :custID";
    $statement = $db->prepare($query);
    $statement->bindValue(':firstName', $firstName);
    $statement->bindValue(':lastName', $lastName);
    $statement->bindValue(':phone', $phone);
    $statement->bindValue(':DOB', $dob);
    $statement->bindValue(':eMail', $eMail);
    $statement->bindValue(':banned', $banned, PDO::PARAM_INT);
    $statement->bindValue(':custID', $customerID, PDO::PARAM_INT);
    
    // Execute the update
    if ($statement->execute()) {
        $statement->closeCursor();
        
        // Redirect to the main page after updating
        header("Location: editCustomersList.php");
        exit;
    } else {
        $statement->closeCursor();
        echo "Error updating customer information.";
    }
} else {
    echo "Invalid data. Please check the inputs.";
}
?>
