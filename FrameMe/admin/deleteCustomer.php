<?php
session_start();
require_once('../model/database.php');

// Check if custID is provided and valid
$customerID = filter_input(INPUT_GET, 'custID', FILTER_VALIDATE_INT);

if ($customerID) {
    // Prepare the delete query
    $query = "DELETE FROM customers WHERE custID = :custID";
    $statement = $db->prepare($query);
    $statement->bindValue(':custID', $customerID, PDO::PARAM_INT);

    // Execute the delete statement
    if ($statement->execute()) {
        $statement->closeCursor();

        // Redirect back to the main customer management page with a success message
       $_SESSION['message'] = "Customer deleted successfully.";
        header("Location: editCustomersList.php");
        exit;
    } else {
        $statement->closeCursor();
        $_SESSION['message'] = "Error deleting customer.";
    }
} else {
    $_SESSION['message'] = "Invalid customer ID.";
    header("Location: editCustomersList.php");
    exit;
}
?>
