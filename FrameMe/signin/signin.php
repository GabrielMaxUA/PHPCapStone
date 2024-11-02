<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start session
session_start();

// Automatically log out any previously logged-in user by destroying the session
if (isset($_SESSION['customer']) || isset($_SESSION['adminIn'])) {
    // Unset all of the session variables
    $_SESSION = [];

    // If the session uses cookies, delete the session cookie
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Destroy the session
    session_destroy();

    // Start a fresh session after logging out the previous user
    session_start();
}
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
    // Try to log in as admin first
    $query = "SELECT * FROM admins WHERE eMail = :email";
    $statement = $db->prepare($query);
    $statement->bindValue(':email', $email);
    $statement->execute();
    $user = $statement->fetch(PDO::FETCH_ASSOC);
    $statement->closeCursor();

    if ($user) {
        if (password_verify($password, $user['adminPassword'])) {
            $_SESSION['customer'] = $user['firstName'] . ' ' . $user['lastName'];
            print( $_SESSION['customer']);
            $_SESSION['adminIn'] = true;
            header("Location: ../admin/admin.php");
            die();
        } else {
            $errors['password'] = 'Incorrect password. Please try again.';
        }
    } else {
        // If no admin, check customers
        $query = "SELECT * FROM customers WHERE eMail = :email";
        $statement = $db->prepare($query);
        $statement->bindValue(':email', $email);
        $statement->execute();
        $user = $statement->fetch(PDO::FETCH_ASSOC);
        $statement->closeCursor();

        if ($user) {
            if (password_verify($password, $user['userPassword'])) {
                $_SESSION['customer'] = $user['firstName'] . ' ' . $user['lastName'];
                $_SESSION['adminIn'] = false;
                $_SESSION['customerEmail'] = $user['eMail'];
                header("Location: ./welcome.php");
                die();
            } else {
                $errors['password'] = 'Incorrect password. Please try again.';
            }
        } else {
            $errors['email'] = 'No account found with this email.';
        }
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
            <input type="password" name="password" value="<?php echo htmlspecialchars($password); ?>">
            <?php if (isset($errors['password'])): ?>
                <span class="error">
                    <span class="message"><?php echo $errors['password']; ?></span>
                </span>
            <?php endif; ?>
        </div>
            <div class="button">
                <input type="submit" value="Sign in">
                <div class = "link">
                <h3>Not a member yet?</h3>
                <a href="../registration/registration_form.php">Register</a>
                </div>
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
