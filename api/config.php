<?php
// Database configuration
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'todo_app_main');

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create connection
$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

// Check connection
if($conn === false){
    die("ERROR: Could not connect to MySQL. " . mysqli_connect_error());
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS " . DB_NAME;
if (!mysqli_query($conn, $sql)) {
    die("ERROR: Could not create database. " . mysqli_error($conn));
}

// Select the database
if (!mysqli_select_db($conn, DB_NAME)) {
    die("ERROR: Could not select database. " . mysqli_error($conn));
}

// Create tasks table if it doesn't exist
$sql = "CREATE TABLE IF NOT EXISTS tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    task VARCHAR(255) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)";

if (!mysqli_query($conn, $sql)) {
    die("ERROR: Could not create tasks table. " . mysqli_error($conn));
}

// Function to safely close database connection
function closeConnection() {
    global $conn;
    if($conn) {
        mysqli_close($conn);
    }
}

// Function to sanitize input
function sanitizeInput($data) {
    global $conn;
    if (is_string($data)) {
        return mysqli_real_escape_string($conn, htmlspecialchars(trim($data)));
    }
    return $data;
}
?>

