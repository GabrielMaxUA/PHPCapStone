<?php
session_start();
session_unset();
session_destroy();

header('Content-Type: application/json; charset=utf-8');
http_response_code(200); // Ensure the response code is 200 (OK)
echo json_encode(['status' => 'logged out yet?']);
?>
