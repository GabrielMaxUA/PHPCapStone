<?php
    $dsn = 'mysql:host=localhost;dbname=frame_me';
    $username = 'maximUA';
    $password = 'MaxGabriel123';

    try {
        $db = new PDO($dsn, $username, $password);
    } catch (PDOException $e) {
        $error_message = $e->getMessage();
        include('../errors/database_error.php');
        exit();
    }
?>