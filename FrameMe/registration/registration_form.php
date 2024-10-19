<?php
session_start();
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
    <form action="registration.php" method="post">
        <div id="data">
            <div class="labs">
                <label for="">First name:</label>
                <input type="text" name="firstName"><br>
            </div>

            <div class="labs">
                <label for="">Last name:</label>
                <input type="text" name="lastName"><br>
            </div>

            <div class="labs">
                <label for="">Email:</label>
                <input type="email" name="email"><br>
            </div>

            <div class="labs" >
                <label for="">Phone:</label>
                <input type="phone" name="phone"><br>
            </div>
            <div class="labs" >
                <label for="">Password:</label>
                <input type="password" name="password"><br>
            </div>
            <div class="labs" >
                <label for="">Re-renter Password:</label>
                <input type="password" name="rPassword"><br>
            </div>
            <div class="labs" >
                <label for="">DOB:</label>
                <input type="text" name="dob"><br>
            </div>

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
