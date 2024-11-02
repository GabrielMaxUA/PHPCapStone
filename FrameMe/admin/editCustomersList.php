<?php
session_start();
require_once('../model/database.php');

print("Welcome admin " . $_SESSION['customer']); // Debug line to view session contents

// Capture the search term if submitted
$searchTerm = filter_input(INPUT_POST, 'search', FILTER_SANITIZE_STRING);

// Modify the query to include search conditions if a term is provided
$query = "SELECT custID, firstName, lastName, email, phone, DOB, banned FROM customers";
if ($searchTerm) {
    $query .= " WHERE lastName LIKE :searchTerm 
                OR email LIKE :searchTerm 
                OR phone LIKE :searchTerm";
}

$statement = $db->prepare($query);

if ($searchTerm) {
    $statement->bindValue(':searchTerm', '%' . $searchTerm . '%');
}

$statement->execute();
$customers = $statement->fetchAll(PDO::FETCH_ASSOC);
$statement->closeCursor();
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../app.css">
    <title>Customer Management</title>
</head>
<body>
  <header>
      <img class="signature" src="../Assets/logos/enoBW.png" alt="">
  </header>
  
  <div class="border"></div>
    <div class="navbar">
        <a class="social" href="./admin.php" target="">Back to main</a>
        <a class="social" href="../signin/logout.php" target="">Logout</a>
    </div>

  <main>
    <!-- Search Form -->
    <div class="search">
      <h3>Search:</h3>&nbsp;
      <form method="POST" action="" style = "border: none; background: none;">
        <input type="text" name="search" id="searchInput" placeholder="Enter name, email, or phone" 
               value="<?php echo htmlspecialchars($searchTerm); ?>">
        <button type="submit" style ="margin: 0 auto; width: 50px; margin-top: 30px; ">Search</button>
      </form>
    </div>

    <!-- Results Table -->
    <table>
      <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>DOB</th>
          <th>Status</th>
          <th>Edit user</th>
          <th>Delete</th>
      </tr>
      <?php if ($customers): ?>
        <?php foreach ($customers as $customer): ?>
            <tr>
                <td><?php echo htmlspecialchars($customer['firstName'] . ' ' . $customer['lastName']); ?></td>
                <td><?php echo htmlspecialchars($customer['phone']); ?></td>
                <td><?php echo htmlspecialchars($customer['email']); ?></td>
                <td><?php echo htmlspecialchars($customer['dob']); ?></td>
                <td><?php echo $customer['banned'] ? 'Blocked' : 'Active'; ?></td>
                <td>
                    <a href="editUser.php?custID=<?php echo urlencode($customer['custID']); ?>">
                        <button type="button">Edit</button>
                    </a>
                </td>
                <td>
                    <a href="deleteUser.php?custID=<?php echo urlencode($customer['custID']); ?>">
                        <button type="button">Delete</button>
                    </a>
                </td>
            </tr>
        <?php endforeach; ?>
      <?php else: ?>
        <tr>
            <td colspan="7">No results found for "<?php echo htmlspecialchars($searchTerm); ?>"</td>
        </tr>
      <?php endif; ?>
    </table>
  </main>

  <footer>
    <div class="border"></div>
    <p>&copy; All Rights Reserved.</p>
  </footer>
</body>
</html>
