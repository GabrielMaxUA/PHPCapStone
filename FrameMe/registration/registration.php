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
$rPassword = filter_input(INPUT_POST, 'rPassword');
$dob = filter_input(INPUT_POST, 'dob');

$errors = [];

// Validate email format
if (!$email) {
    $errors['email'] = 'Invalid email format.';
}

if (!$firstName) {
  $errors['firstName'] = 'Please enter your first name.';
}

if (!$lastName) {
  $errors['lastName'] = 'Please enter your last name.';
}

// Validate password length
if (strlen($password) < 9) {
    $errors['password'] = 'Password must be at least 9 characters long.';
}

if($password != $rPassword){
  $errors['rPassword'] = 'Passwords are not matching.';
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
    // Using UNION to check both customers and admins tables for the same email
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
        $errors['email'] = 'An account with this email already exists in customers or admins.';
    }
}

// If no errors, proceed with saving data to the database
// Check if customer or admin already exists with the same email if no email validation error
if (empty($errors['email'])) {
    // Using UNION to check both customers and admins tables for the same email
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
        $errors['email'] = 'An account with this email already exists in customers or admins.';
    }
}

// If no errors and the email does not exist in both tables, proceed with saving data to the appropriate table
if (empty($errors)) {
    if ($email == 'maxim.don.mg@gmail.com') {
        // Insert into admins table if the email matches
        $query = "INSERT INTO admins (firstName, lastName, eMail, adminPassword) 
                  VALUES (:firstName, :lastName, :email, :password)";
        $statement = $db->prepare($query);

        $statement->bindValue(':firstName', $firstName);
        $statement->bindValue(':lastName', $lastName);
        $statement->bindValue(':email', $email);
        $statement->bindValue(':password', password_hash($password, PASSWORD_DEFAULT)); // Hashing password

        $statement->execute();
        $statement->closeCursor();

        $_SESSION['customer'] = $firstName . ' ' . $lastName;

        // Redirecting to confirmation page
        header("Location: ../index.php");
        die();
    } else {
        // Insert into customers table if the email does not match 'maxim.don.mg@gmail.com'
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
            <?php if (isset($_SESSION['customer'])): ?>
                    <a class="social" href="./signin/logout.php" target="">
                        Logout
                    </a>
                <?php endif; ?>
                <a class="social" href="#" target="">
                    <img src="../Assets/logos/instagram.png" alt="">
                </a>
                <a class="social" href="#" target="">
                    <img src="../Assets/logos/facebook.png" alt="">
                </a>
                <a class="social" href="#" target="">
                    <img src="../Assets/logos/message.png" alt="">
                </a>
            </div>
        </aside>
    </header>
<nav>
    <div class="border"></div>
    <div class="navbar">
        <a id="about"  href = "../index.php">Back to main</a>
        <!-- <a id="gallery"  href = "galleries.php">Gallery</a>
        <a id="info" href = "registration_form.php">Register</a> -->
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
            <label for="email">Email:</label>
            <input type="text" name="email" value="<?php echo htmlspecialchars($email); ?>">
            <?php if (isset($errors['email'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['email']; ?></span>
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
            <label for="password">Password:</label>
            <input type="text" name="password" value="<?php echo htmlspecialchars($password); ?>">
            <?php if (isset($errors['password'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['password']; ?></span>
                </span>
            <?php endif; ?>
        </div>
        <div class="labs">
            <label for="password">Password:</label>
            <input type="text" name="password" value="<?php echo htmlspecialchars($rPassword); ?>">
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
<footer>
        <div class="border"></div>
        <p>&copy; All Rights Reserved.</p>
    </footer>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="../JS/app.js"></script>
</body>
</html>