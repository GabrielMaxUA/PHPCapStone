<?php
session_start();
?>


<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./app.css">
    <title>Document</title>
</head>
<body>
    <header>
        <img class="signature" src="./Assets/logos/enoBW.png" alt="">
        <div class="menu">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>
        <aside>
            <div class="nav">
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/instagram.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/facebook.png" alt="">
                </a>
                <a class="social" href="#" target="_blank">
                    <img src="./Assets/logos/message.png" alt="">
                </a>
            </div>
        </aside>
    </header>
    
  <nav>
    <div class="border"></div>
    <div class="navbar">
      <a id="about"  href = "index.php">About</a>
      <a id="gallery"  href = "./gallery/gallery_page.php">Gallery</a>

        <?php if (!isset($_SESSION['customer'])): ?>
            <a id="info" href="signin/signin_form.php">Sign in/Register</a>
        <?php elseif (isset($_SESSION['admin'])): ?>
            <a id="info" href="orders.php">Orders</a>
        <?php else: ?>
            <a id="info" href="cart.php" >Cart</a>
        <?php endif; ?>

        <?php if (isset($_SESSION['customer'])): ?>
            <a class="social" href="./signin/logout.php" target="">Logout</a>
        <?php endif; ?>
    </div>
  </nav>
        <main>
            <section class="about">
                    <img src="./Assets/mainPics/author.png" alt="">
                <div class="bio">
                    <h1>Enok Da Rocha Medeiros: The Poet with a Lens</h1><br>

                    <p>Enok Da Rocha Medeiros, a dedicated photographer from Brazil, embodies patience and 
                        a deep passion for capturing the world through his lens. From a very young age, 
                        Enok was fascinated by the beauty of fleeting moments—the kind that often go 
                        unnoticed in the rush of daily life. His love for photography started 
                        as a child, when he would spend hours observing the vibrant world around him, 
                        soaking in every color, texture, and nuance that nature and urban landscapes offered.</p><br>
                    
                    <p>Enok is an artist who believes that perfection lies in imperfection. 
                        Unlike many in the modern world of photography, he prefers to present 
                        his shots as they are, without the touch of editing software. For Enok, 
                        a photograph is a raw, unfiltered testament to the moment it captures—a 
                        testament to the beauty that exists in our imperfections. <br>
                        He sees art everywhere: in the simplicity of a quiet street corner, 
                        the complexity of a bustling market, the soft light of dawn, 
                        and the vibrant hues of a sunset.</p><br>
                    
                    <p>His inspiration stems from the beauty of the moment and the belief that art 
                        surrounds us if we take the time to truly see it. Enok's photographs 
                        are a dance between simplicity and complexity, balancing the 
                        vivid colors that ignite his imagination 
                        with the understated elegance of everyday life. 
                        His approach is deeply personal; every image tells a story, 
                        capturing the essence of a moment as it naturally unfolds.</p><br>
                    
                    <p>For Enok, photography is not just about taking pictures; 
                        it's about seeing the world differently, appreciating the 
                        details that others might miss, and finding the extraordinary 
                        in the ordinary. His work is a celebration of life’s simple 
                        pleasures and the vibrant colors that paint our world, 
                        reminding us that beauty is all around—we just need to look.</p><br>
                </div>
            </section>
        </main>
    <footer>
        <div class="border"></div>
        <p>&copy; All Rights Reserved.</p>
    </footer>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="JS/app.js"></script>
</body>
</html>
