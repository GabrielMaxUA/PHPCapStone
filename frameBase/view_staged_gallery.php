<?php
require 'connection.php';

if (!$con) {
    echo json_encode(['message' => 'Database connection failed']);
    exit;
}

$query = "SELECT pictureID, stagedLow, price, type FROM staged_gallery";
$result = mysqli_query($con, $query);

if ($result) {
    $response = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $response[] = $row;
    }
    echo json_encode($response);
} else {
    echo json_encode(['message' => 'Query failed', 'error' => mysqli_error($con)]);
}
?>
