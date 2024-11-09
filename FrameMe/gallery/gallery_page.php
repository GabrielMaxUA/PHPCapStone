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
        <?php if (isset($_SESSION['customer']) && isset($_SESSION['admin'])): ?>
            <a class="social" href="./admin.php" target="">Main</a>
        <?php else: ?>
            <a id="about"  href = "../index.php">About</a>
        <?php endif; ?>
      
      <!-- <a id="gallery"  href = "gallery.php">Gallery</a> -->

        <?php if (!isset($_SESSION['customer'])): ?>
                <a id="info" href="../signin/signin_form.php">Sign in/Register</a>
            <?php else: ?>
                <a id="info" href="../cart.php" >Cart</a>
            <?php endif; ?>
        <?php if (isset($_SESSION['customer'])): ?>
                    <a class="social" href="../signin/logout.php" target="">
                        Logout
                    </a>
        <?php endif; ?>
    </div>
  </nav>
        <main>
            <div class="gallery">
              <div class="galleryOption">   
                <img src="../Assets/mainPics/italy.png" alt="">
                <p>Architecture</p>
              </div>
              <div class="galleryOption">   
                <img src="../Assets/mainPics/nature.png" alt="">
                <p>Nature</p>
              </div>
              <div class="galleryOption">   
                <img src="../Assets/mainPics/models.png" alt="">
                <p>Models</p>
              </div>
        </div>
    </main>
<footer>
<div class="border"></div>
    <p>&copy; All Rights Reserved.</p>
</footer>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="../JS/app.js"></script>
</body>
</html>
