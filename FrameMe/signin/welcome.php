<?php 
session_start();
print_r($_SESSION); // Debug line to view session contents
require_once('../model/database.php')?>

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
      
      <a id="about"  href = "../index.php">About</a>
      <?php if(!isset($_SESSION['admin'])): ?>
        <a href="../admin/admin.php">Back to upload</a>
        <?php else: ?>
      <a id="gallery"  href = "../gallery/gallery_page.php">Gallery</a>
      <?php endif; ?>
    </div>
  </nav>
  <main>

  <?php if(!isset($_SESSION['admin'])): ?>
    <h1>Success</h1><br>
    <p>Image was uploaded!</p>
        <?php else: ?>
          <h1>Welcome <?php echo htmlspecialchars($_SESSION['customer'])?></h1><br>
          <p>Always a pleasure to see you !</p>
      <?php endif; ?>

  
  </main>
  <footer>
        <div class="border"></div>
        <p>&copy; All Rights Reserved.</p>
    </footer>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="../JS/app.js"></script>
</body>
</html>