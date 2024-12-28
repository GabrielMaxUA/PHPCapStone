<?php

session_start();


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_log('Session data: ' . print_r($_SESSION, true));
error_log('Cookie data: ' . print_r($_COOKIE, true));

// Check both cookie and session variables
if (isset($_COOKIE['authToken']) && isset($_SESSION['userType'])) {
    // Check if session hasn't expired (30 minutes = 1800 seconds)
    if (!isset($_SESSION['last_activity']) || (time() - $_SESSION['last_activity'] > 1800)) {
        // Session expired
        session_unset();
        session_destroy();
        setcookie('authToken', '', time() - 3600, '/');
        
        http_response_code(401);
        echo json_encode([
            'authenticated' => false,
            'message' => 'Session expired'
        ]);
        exit;
    }

    // Update last activity time
    $_SESSION['last_activity'] = time();
    
    // Renew the cookie
    setcookie('authToken', $_COOKIE['authToken'], [
        'expires' => time() + 1800,
        'path' => '/',
        'httponly' => true,
        'secure' => isset($_SERVER['HTTPS']),
        'samesite' => 'Strict'
    ]);
    
    echo json_encode([
        'authenticated' => true,
        'userType' => $_SESSION['userType'],
        'userStatus' => $_SESSION['userStatus'],
        'email' => $_SESSION['email'] ?? null
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        'authenticated' => false,
        'message' => 'No valid session found'
    ]);
}