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
        

            <div class="form-group">
                <label for="firstName">First Name:</label>
                <h4> <?php echo htmlspecialchars($customer['firstName']); ?></h4>
            </div>

            <div class="form-group">
                <label for="lastName">Last Name:</label>
                <h4> <?php echo htmlspecialchars($customer['lastName'])?></h4>
            </div>

            <div class="form-group">
                <label for="phone">Phone:</label>
                <h4> <?php echo htmlspecialchars($customer['phone']); ?></h4>
            </div>

            <div class="form-group">
                <label for="DOB">DOB:</label>
                <h4><?php echo htmlspecialchars($customer['DOB']); ?></h4>
            </div>

            <div class="form-group">
                <label for="eMail">Email:</label>
                <h4><?php echo htmlspecialchars($customer['eMail']); ?></h4>
            </div>

            <form class="edit" method="POST" action="./edit.php">
            <input type="hidden" name="customerID" value="<?php echo htmlspecialchars($customerID); ?>">
            <div class="form-group checkbox-group">
              <?php if ($customer['banned']): ?>
                        <label for="bannedToggle">Blocked:</label>
                        <input type="checkbox" id="bannedToggle" name="banned" value="1" <?php echo $customer['banned'] ? 'checked' : ''; ?>>
              <?php else: ?>
                        <label for="bannedToggle">Block:</label>
                        <input type="checkbox" id="bannedToggle" name="banned" value="0" <?php echo $customer['banned'] ? 'checked' : ''; ?>>
              <?php endif ?>
            </div>

            <button type="submit">Save</button>
            <a href="editCustomersList.php"><button type="button">Cancel</button></a>
        </form>
    </main>

</body>
</html>
