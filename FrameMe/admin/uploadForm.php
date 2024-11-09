<?php
session_start();
$category = $_GET['category'] ?? '';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Upload Image</title>
</head>
<body>
    <h2>Upload Product Image</h2>
    <form action="uploadImage.php" method="post" enctype="multipart/form-data">
        <input type="hidden" name="category" value="<?php echo htmlspecialchars($category); ?>">
        <label for="productPrice">Product Price:</label>
        <input type="text" name="productPrice" required>
        <label for="productImage">Choose Image:</label>
        <input type="file" name="productImage" accept="image/*" required>
        <button type="submit">Upload</button>
    </form>
</body>
</html>
