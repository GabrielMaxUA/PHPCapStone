<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once('../model/database.php');

// Initialize variables
$firstName = filter_input(INPUT_POST, 'firstName');
$lastName = filter_input(INPUT_POST, 'lastName');
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$phone = filter_input(INPUT_POST, 'phone');
$password = filter_input(INPUT_POST, 'password');
$rPassword = filter_input(INPUT_POST, 'rPassword');
$dob = filter_input(INPUT_POST, 'dob');

// Clear errors on each form submission
$errors = [];

// Validate form inputs
if (!$email) {
    $errors['email'] = 'Invalid email format.';
}
if (!$firstName) {
    $errors['firstName'] = 'Please enter your first name.';
}
if (!$lastName) {
    $errors['lastName'] = 'Please enter your last name.';
}
if (strlen($password) < 9) {
    $errors['password'] = 'Password must be at least 9 characters long.';
} elseif ($password !== $rPassword) {
    $errors['rPassword'] = 'Passwords are not matching.';
}

// Sanitize and validate phone
$phone = preg_replace('/[^0-9]/', '', $phone); 
if (strlen($phone) < 10) {
    $errors['phone'] = 'Invalid phone number. Please provide at least 10 digits.';
}

// Date of Birth Validation
switch (true) {
    case preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob):
        $birthDateObj = DateTime::createFromFormat('m/d/Y', $dob);
        break;
    case preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob):
        $birthDateObj = DateTime::createFromFormat('Y-m-d', $dob);
        break;
    case preg_match('/^\d{2}\s+\d{2}\s+\d{4}$/', $dob): // MM DD YYYY format
        $birthDateObj = DateTime::createFromFormat('m d Y', $dob);
        break;
    case preg_match('/^[A-Za-z]+\s+\d{1,2},?\s+\d{4}$/i', $dob):
        $birthDateObj = new DateTime($dob);
        break;
    default:
        $errors['dob'] = 'Invalid date of birth. Use format MM-DD-YYYY';
}

if (isset($birthDateObj)) {
    $dob = $birthDateObj->format('Y-m-d'); // Convert to standard format for DB
} else {
    $errors['dob'] = 'Invalid date format. Please enter a valid date.';
}

// Check if email already exists
if (empty($errors['email'])) {
    $query = "SELECT COUNT(*) FROM (
                SELECT eMail FROM customers WHERE eMail = :email
                UNION 
                SELECT eMail FROM admins WHERE eMail = :email
              ) AS emailCheck";
    $statement = $db->prepare($query);
    $statement->bindValue(':email', $email);
    $statement->execute();
    $count = $statement->fetchColumn();
    $statement->closeCursor();

    if ($count > 0) {
        $errors['email'] = 'An account with this email already exists. Please sign in.';
    }
}

// Insert into the database if no errors exist
if (empty($errors)) {
    if ($email === 'maxim.don.mg@gmail.com' || $email === 'enorocha78@gmail.com') {
        // Admin insert
        $query = "INSERT INTO admins (firstName, lastName, eMail, adminPassword) 
                  VALUES (:firstName, :lastName, :email, :password)";
        $statement = $db->prepare($query);
        $statement->bindValue(':firstName', $firstName);
        $statement->bindValue(':lastName', $lastName);
        $statement->bindValue(':email', $email);
        $statement->bindValue(':password', password_hash($password, PASSWORD_DEFAULT));
        $statement->execute();
        $statement->closeCursor();

        $_SESSION['customer'] = $firstName . ' ' . $lastName;
        header("Location: ../admin.php");
        exit();
    } else {
        // Customer insert
        $query = "INSERT INTO customers (firstName, lastName, eMail, phone, userPassword, DOB) 
                  VALUES (:firstName, :lastName, :email, :phone, :password, :dob)";
        $statement = $db->prepare($query);
        $statement->bindValue(':firstName', $firstName);
        $statement->bindValue(':lastName', $lastName);
        $statement->bindValue(':email', $email);
        $statement->bindValue(':phone', $phone);
        $statement->bindValue(':password', password_hash($password, PASSWORD_DEFAULT));
        $statement->bindValue(':dob', $dob);
        $statement->execute();
        $statement->closeCursor();

        $_SESSION['customer'] = $firstName . ' ' . $lastName;
        header("Location: ../index.php");
        exit();
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../app.css">
    <title>Registration</title>
</head>
<body>
    <main>
        <form action="registration.php" method="post">
            <div id="data">
                <!-- Display errors and maintain form values on error -->
                <div class="labs">
                    <label for="firstName">First name:</label>
                    <input type="text" name="firstName" value="<?php echo htmlspecialchars($firstName); ?>">
                    <?php if (isset($errors['firstName'])): ?>
                        <span class="error"><?php echo $errors['firstName']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="lastName">Last name:</label>
                    <input type="text" name="lastName" value="<?php echo htmlspecialchars($lastName); ?>">
                    <?php if (isset($errors['lastName'])): ?>
                        <span class="error"><?php echo $errors['lastName']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="email">Email:</label>
                    <input type="text" name="email" value="<?php echo htmlspecialchars($email); ?>">
                    <?php if (isset($errors['email'])): ?>
                        <span class="error"><?php echo $errors['email']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="phone">Phone:</label>
                    <input type="text" name="phone" value="<?php echo htmlspecialchars($phone); ?>">
                    <?php if (isset($errors['phone'])): ?>
                        <span class="error"><?php echo $errors['phone']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="password">Password:</label>
                    <input type="password" name="password" value="">
                    <?php if (isset($errors['password'])): ?>
                        <span class="error"><?php echo $errors['password']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="rPassword">Confirm Password:</label>
                    <input type="password" name="rPassword" value="">
                    <?php if (isset($errors['rPassword'])): ?>
                        <span class="error"><?php echo $errors['rPassword']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="labs">
                    <label for="dob">Date of Birth:</label>
                    <input type="text" name="dob" value="<?php echo htmlspecialchars($dob); ?>">
                    <?php if (isset($errors['dob'])): ?>
                        <span class="error"><?php echo $errors['dob']; ?></span>
                    <?php endif; ?>
                </div>

                <div class="button">
                    <input type="submit" value="Register">
                </div>
            </div>
        </form>
    </main>
</body>
</html>
