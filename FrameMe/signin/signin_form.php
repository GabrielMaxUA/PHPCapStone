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
    <form action="signin.php" method="post">
            <div class="labs">
                <label for="">Email:</label>
                <input type="email" name="email"><br>
            </div>
            <div class="labs" >
                <label for="">Password:</label>
                <input type="password" name="password"><br>
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
