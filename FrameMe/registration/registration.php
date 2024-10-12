<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once('../model/database.php');

// Getting data from form
$firstName = filter_input(INPUT_POST, 'firstName');
$lastName = filter_input(INPUT_POST, 'lastName');
$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$phone = filter_input(INPUT_POST, 'phone');
$password = filter_input(INPUT_POST, 'password');
$dob = filter_input(INPUT_POST, 'dob');

$errors = [];

// Validate email format
if (!$email) {
    $errors['email'] = 'Invalid email format.';
}

// Validate password length
if (strlen($password) < 9) {
    $errors['password'] = 'Password must be at least 9 characters long.';
}

// Validate phone number (basic check for valid characters)
$phone = preg_replace('/[^0-9]/', '', $phone); // Remove non-numeric characters
if (strlen($phone) < 10) {
    $errors['phone'] = 'Invalid phone number. Please provide a valid phone number with at least 10 digits.';
}

// Date of Birth Validation
switch (true) {
  case preg_match('/^\d{2}\/\d{2}\/\d{4}$/', $dob):
      // MM/DD/YYYY format (e.g., 10/02/2024)
      $birthDateObj = DateTime::createFromFormat('m/d/Y', $dob);
      break;

  case preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob):
      // YYYY-MM-DD format (e.g., 2024-10-02)
      $birthDateObj = DateTime::createFromFormat('Y-m-d', $dob);
      break;

  case preg_match('/^[A-Za-z]+\s+\d{1,2},?\s+\d{4}$/i', $dob):
      // Month Day, Year format (e.g., October 2, 2024)
      $birthDateObj = new DateTime($dob); 
      break;

  default:
      $errors['dob'] = 'Invalid date format. Please use a valid date format.';
}

if (!isset($birthDateObj)) {
    $errors['dob'] = 'Invalid date of birth.';
} else {
    $dob = $birthDateObj->format('Y-m-d'); // Convert to standard format for DB
}

// Check if customer already exists with the same email if no email validation error
if (empty($errors['email'])) {
    $query = "SELECT COUNT(*) FROM customers WHERE eMail = :email";
    $statement = $db->prepare($query);
    $statement->bindValue(':email', $email);
    $statement->execute();
    $count = $statement->fetchColumn();
    $statement->closeCursor();

    if ($count > 0) {
        $errors['email'] = 'A customer with this email already exists.';
    }
}

// If no errors, proceed with saving data to the database
if (empty($errors)) {
    $query = "INSERT INTO customers (firstName, lastName, eMail, phone, userPassword, DOB) 
              VALUES (:firstName, :lastName, :email, :phone, :password, :dob)";
    $statement = $db->prepare($query);

    $statement->bindValue(':firstName', $firstName);
    $statement->bindValue(':lastName', $lastName);
    $statement->bindValue(':email', $email);
    $statement->bindValue(':phone', $phone);
    $statement->bindValue(':password', password_hash($password, PASSWORD_DEFAULT)); // Hashing password
    $statement->bindValue(':dob', $dob);

    $statement->execute();
    $statement->closeCursor();

    $_SESSION['customer'] = $firstName . ' ' . $lastName;

    // Redirecting to confirmation page
    header("Location: ../index.php");
    die();
}
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../app.css">
    <title>Document</title>
</head>
<body>
    <header>
        <img class="signature" src="../Assets/logos/enoBW.png" alt="">
        <div class="menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <aside>
            <div class="nav">
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/instagram.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/facebook.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/message.png" alt="">
                </a>
            </div>
        </aside>
    </header>
<nav>
    <div class="border"></div>
    <div class="navbar">
        <a id="about"  href = "../index.php">About</a>
        <a id="gallery"  href = "galleries.php">Gallery</a>
        <a id="info" href = "registration_form.php">Register</a>
    </div>
</nav>
<main>
<form action="registration.php" method="post">
    <div id="data">

        <div class="labs">
            <label for="firstName">First name:</label>
            <input type="text" name="firstName" value="<?php echo htmlspecialchars($firstName); ?>">
            <?php if (isset($errors['firstName'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['firstName']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <div class="labs">
            <label for="lastName">Last name:</label>
            <input type="text" name="lastName" value="<?php echo htmlspecialchars($lastName); ?>">
            <?php if (isset($errors['lastName'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['lastName']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <div class="labs">
            <label for="phone">Phone:</label>
            <input type="text" name="phone" value="<?php echo htmlspecialchars($phone); ?>">
            <?php if (isset($errors['phone'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['phone']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <div class="labs">
            <label for="email">Email:</label>
            <input type="text" name="email" value="<?php echo htmlspecialchars($email); ?>">
            <?php if (isset($errors['email'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['email']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <div class="labs">
            <label for="password">Password:</label>
            <input type="text" name="password" value="<?php echo htmlspecialchars($password); ?>">
            <?php if (isset($errors['password'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['password']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <div class="labs">
            <label for="dob">DOB:</label>
            <input type="text" name="dob" value="<?php echo htmlspecialchars($dob); ?>">
            <?php if (isset($errors['dob'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['dob']; ?></span>
                </span>
            <?php endif; ?>
        </div>

        <input type="hidden" name="custID" value="<?php echo htmlspecialchars($custID); ?>">

        <div class="button">
            <input type="submit" value="Register">
        </div>
    </div>
</form>

</main>
<?php include '../layout/footer.php'; ?>