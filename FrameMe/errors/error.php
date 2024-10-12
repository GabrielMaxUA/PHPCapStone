<?php 
session_start(); // Start the session to access session variables

?>
<!DOCTYPE html>
<html>

<!-- the head section -->
<head>
    <title>Error</title>
    <link rel="stylesheet" type="text/css" href="../main.css">
</head>

<!-- the body section -->
<body>
<header>
    <h1>SportsPro Technical Support</h1>
    <p>Error occurred</p>
    <nav>
        <ul>
            <li><a href="../index.php">Back home </a></li>
        </ul>
    </nav>
</header>
<main>
    <h1>Error</h1>
    <p>
        <?php 
        // Check if there's an error message set in the session
        if (isset($_SESSION['error'])) {
            // Display the error message and clear it from the session
            echo htmlspecialchars($_SESSION['error']);
            unset($_SESSION['error']); // Clear the error after displaying it
        }
        ?>
    </p>
</main>

<?php include '../view/footer.php'; ?>
