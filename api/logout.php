<?php
session_start();
header('Content-Type: application/json');

// Clear all session variables
$_SESSION = array();

// Destroy the session
session_destroy();

echo json_encode([
    "status" => "success",
    "message" => "Logged out successfully"
]);
?> 