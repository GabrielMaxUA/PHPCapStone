<?php
session_start();
$category = $_GET['category'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../app.css">
    <title>Upload Image</title>
</head>
<body>
    <h2>Upload Product Images for Gallery: <?php echo htmlspecialchars($category); ?></h2>
    <form class="upload" action="uploadImage.php" method="post" enctype="multipart/form-data" onsubmit="return validateForm()">
        <input type="hidden" name="category" value="<?php echo htmlspecialchars($category); ?>">
        <div id="inputFieldsContainer">
        <div class="fileInputContainer">
            <label for="productPrice">Product Price:</label>
            <input type="text" name="productPrice[]" >

            <label for="productImage">Choose Image:</label>
            <input type="file" name="productImage[]" accept="image/*" >
        </div>
        </div>

        <div class="button-container">
            <button type="button" class="add-more-btn" onclick="addFileInput()">Add More</button>
            <button type="submit">Upload</button>
        </div>
    </form>
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>    
    <script src="../JS/app.js"></script>
</body>
</html>
