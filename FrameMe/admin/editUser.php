<?php
session_start();
require_once('../model/database.php');

// Retrieve customerID from URL and fetch customer data
$customerID = filter_input(INPUT_GET, 'custID', FILTER_VALIDATE_INT);

if ($customerID) {
    // Fetch customer data from the database
    $query = "SELECT custID, firstName, lastName, eMail, phone, DOB, banned FROM customers WHERE custID = :custID";
    $statement = $db->prepare($query);
    $statement->bindValue(':custID', $customerID, PDO::PARAM_INT);
    $statement->execute();
    $customer = $statement->fetch(PDO::FETCH_ASSOC);
    $statement->closeCursor();
    
    if (!$customer) {
        echo "Customer not found.";
        exit;
    }
} else {
    echo "Invalid customer ID.";
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Customer</title>
    <link rel="stylesheet" href="../app.css">
</head>
<body>
    <header>
        <img class="signature" src="../Assets/logos/enoBW.png" alt="">
    </header>

    <main>
        <h2>Edit Customer</h2>
        <form class = "edit" method="POST" action="Edit.php">
            <!-- Hidden input to pass customerID to Edit.php -->
            <input type="hidden" name="customerID" value="<?php echo htmlspecialchars($customerID); ?>">

            <label for="firstName">First Name:</label>
            <input type="text" name="firstName" id="firstName" value="<?php echo htmlspecialchars($customer['firstName']); ?>" required>
            
            <label for="lastName">Last Name:</label>
            <input type="text" name="lastName" id="lastName" value="<?php echo htmlspecialchars($customer['lastName']); ?>" required>
            
            <label for="phone">Phone:</label>
            <input type="text" name="phone" id="phone" value="<?php echo htmlspecialchars($customer['phone']); ?>" required>
            
            <label for="DOB">DOB:</label>
            <input type="date" name="DOB" id="DOB" value="<?php echo htmlspecialchars($customer['DOB']); ?>" required>

            <label for="eMail">Email:</label>
            <input type="email" name="eMail" id="eMail" value="<?php echo htmlspecialchars($customer['eMail']); ?>" required>

            <?php if(!$customer['banned']):?>
              <label for="banned">Ban User:</label>
              <input type="checkbox" id="bannedToggle" name="banned" value="0" <?php echo $customer['banned'] ? 'checked' : ''; ?>>
            <?php elseif($customer['banned']):?>
              <label for="banned">Activate:</label>
              <input type="checkbox" id="bannedToggle" name="banned" value="0" <?php echo $customer['banned'] ? 'checked' : ''; ?>>
            <?php endif?>
              
            
            <button type="submit">Save Changes</button>
            <a href="admin.php"><button type="button">Cancel</button></a>
        </form>
    </main>

</body>
</html>
