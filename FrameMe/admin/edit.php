<?php
session_start();
require_once('../model/database.php');

// Retrieve and validate form inputs
$customerID = filter_input(INPUT_POST, 'customerID', FILTER_VALIDATE_INT);
$banned = isset($_POST['banned']);

// Check if required inputs are valid
if ($customerID) {
    // Prepare the update query
    $query = "UPDATE customers SET 
    banned = :banned WHERE custID = :custID";
    $statement = $db->prepare($query);
    $statement->bindValue(':banned', $banned, PDO::PARAM_INT);
    $statement->bindValue(':custID', $customerID, PDO::PARAM_INT);
    
    // Execute the update
    if ($statement->execute()) {
        $statement->closeCursor();
        
        // Redirect to the main page after updating
        $_SESSION['message'] = "Success updating customer.";
        header("Location: editCustomersList.php");
        exit;
    } else {
        $statement->closeCursor();
        $_SESSION['message'] = "Error updating customer.";
        echo "Error updating customer information.";
    }
} else {
    $_SESSION['message'] = "Error updating customer. Invalid Data";
    echo "Invalid data. Please check the inputs.";
}
?>
