<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
require_once('../model/database.php');

$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$password = filter_input(INPUT_POST, 'password');

$errors = [];

if (!$email) {
  $errors['email'] = 'PLease enter your email.';
}

if (!$password) {
  $errors['password'] = 'Please enter the password.';
}

if (empty($errors)) {
  $query = "SELECT * FROM customers WHERE eMail = :email";
  $statement = $db->prepare($query);
  $statement->bindValue(':email', $email);
  $statement->execute();
  $user = $statement->fetch(PDO::FETCH_ASSOC);
  $statement->closeCursor();

  if ($user) {
    // Email exists, now check the password
    if (password_verify($password, $user['userPassword'])) {
        // Password matches, log the user in
        $_SESSION['customer'] = $user['firstName'] . ' ' . $user['lastName'];

        // Redirect to the main page or dashboard
        header("Location: welcome.php");
        die();
    } else {
        // Invalid password
        $errors['password'] = 'Incorrect password. Please try again.';
    }
} else {
    // Email not found
    $errors['email'] = 'No account found with this email.';
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
                <a class="social" href="#" target="_blank">
                    <img src="../Assets/logos/instagram.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
                    <img src="../Assets/logos/facebook.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
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
    <form action="signin.php" method="post">
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
            <div class="button">
                <input type="submit" value="Sign in">
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
