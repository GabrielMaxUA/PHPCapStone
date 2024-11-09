<?php
session_start();
print("Welcome admin " . $_SESSION['customer']); // Debug line to view session contents
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
        <!-- <div class="menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div> -->
        <!-- <aside>
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
        </aside> -->
    </header>
    
  <nav>
    <div class="border"></div>
    <div class="navbar">
            <a class="social" href="../orders_page.php" target="">Orders</a>
            <a class="social" href="./editCustomersList.php" target="">Edit customers</a>
            <a class="social" href="../signin/logout.php" target="">Logout</a>
    </div>
  </nav>
        <main>
            <section class="gallery">
              <div class="galleryOption">
                <img src="../Assets/mainPics/italy.png" alt="">
                <a  href=""><h1>Architecture</h1></a>
                <button class="addPic" onclick="window.location.href='./uploadForm.php?category=A'">Add Photos</button>
              </div>
               
              <div class="galleryOption">
                <img src="../Assets/mainPics/nature.png" alt="">
                <a  href=""><h1>Nature</h1></a>
                <button class="addPic" onclick="window.location.href='./uploadForm.php?category=N'">Add Photos</button>
              </div>
              <div class="galleryOption">     
                <img src="../Assets/mainPics/models.png" alt="">
                <a  href=""><h1>Models</h1></a>
                <button class="addPic" onclick="window.location.href='./uploadForm.php?category=M'">Add Photos</button>
              </div>
               
            </section>
        </main>
        <footer>
        <div class="border"></div>
        <p>&copy; All Rights Reserved.</p>
    </footer>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="../JS/app.js"></script>
</body>
</html>
