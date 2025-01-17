<?php
require_once 'connection.php';

// CORS is handled by .htaccess, but we still need to handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['pictureID']) || !isset($data['customerID'])) {
        throw new Exception('Missing required parameters');
    }

    $pictureID = (int)$data['pictureID'];
    $customerID = (int)$data['customerID'];

    // Get the high-res image path
    $stmt = $con->prepare("
        SELECT g.imageHigh
        FROM gallery g
        INNER JOIN orders o ON g.pictureID = o.pictureID
        WHERE g.pictureID = ? 
        AND o.customerID = ?
        AND g.status = 'purchased'
        LIMIT 1
    ");

    $stmt->bind_param('ii', $pictureID, $customerID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        throw new Exception('Image not found or not purchased by this customer');
    }

    $row = $result->fetch_assoc();
    $imagePath = $row['imageHigh'];
    
    // Construct server path considering frameBase directory
    $fullPath = __DIR__ . '/' . $imagePath;
    
    // Debug log
    error_log("Attempting to access file: " . $fullPath);

    if (!file_exists($fullPath)) {
        throw new Exception('Image file not found: ' . $fullPath);
    }

    // Get MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $fullPath);
    finfo_close($finfo);

    // Get file info for filename
    $fileInfo = pathinfo($fullPath);
    
    // Clear any previous output
    if (ob_get_level()) {
        ob_end_clean();
    }

    // Set download headers
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . $fileInfo['basename'] . '"');
    header('Content-Length: ' . filesize($fullPath));
    header('Pragma: public');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    
    // Stream file
    readfile($fullPath);
    exit;

} catch (Exception $e) {
    error_log("Download error: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
$con->close();
?>