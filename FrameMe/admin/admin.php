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
            <a class="social" href="./editCustomersList.php" target="">Edit customers</a>
            <a class="social" href="../signin/logout.php" target="">Logout</a>
    </div>
  </nav>
        <main>
            <section class="gallery">
              <a class="galleryOption" href="">   
                <img src="../Assets/mainPics/italy.png" alt="">
                <p><h1>Architecture</h1></p>
              </a>
              <a class="galleryOption" href="">   
                <img src="../Assets/mainPics/nature.png" alt="">
                <p><h1>Nature</h1></p>
              </a>
              <a class="galleryOption" href="">   
                <img src="../Assets/mainPics/models.png" alt="">
                <p><h1>Models</h1></p>
              </a>

                 
                
                
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
