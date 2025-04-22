<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once 'config.php';

try {
    // Get all tasks
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!isset($_GET['user_id'])) {
            throw new Exception("User ID is required");
        }
        
        $userId = intval($_GET['user_id']);
        $sql = "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception(mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($stmt, "i", $userId);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception(mysqli_stmt_error($stmt));
        }
        
        $result = mysqli_stmt_get_result($stmt);
        
        $tasks = array();
        while($row = mysqli_fetch_assoc($result)) {
            $row['completed'] = (bool)$row['completed'];
            $tasks[] = $row;
        }
        
        echo json_encode($tasks);
    }

    // Create new task
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !isset($data->task) || !isset($data->priority) || !isset($data->user_id)) {
            throw new Exception("Task, priority, and user ID are required");
        }
        
        $task = sanitizeInput($data->task);
        $priority = sanitizeInput($data->priority);
        $dueDate = !empty($data->dueDate) ? sanitizeInput($data->dueDate) : null;
        $userId = intval($data->user_id);
        
        $sql = "INSERT INTO tasks (user_id, task, priority, due_date) VALUES (?, ?, ?, ?)";
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception(mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($stmt, "isss", $userId, $task, $priority, $dueDate);
        
        if(!mysqli_stmt_execute($stmt)) {
            throw new Exception(mysqli_stmt_error($stmt));
        }
        
        $newId = mysqli_insert_id($conn);
        
        echo json_encode([
            "status" => "success",
            "message" => "Task created successfully",
            "task" => [
                "id" => $newId,
                "user_id" => $userId,
                "task" => $task,
                "priority" => $priority,
                "due_date" => $dueDate,
                "completed" => false,
                "created_at" => date('Y-m-d H:i:s')
            ]
        ]);
    }

    // Update task completion status
    if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !isset($data->id)) {
            throw new Exception("Task ID is required");
        }
        
        $id = intval($data->id);
        $completed = isset($data->completed) ? ($data->completed ? 1 : 0) : 0;
        
        // First check if task exists and get current status
        $check_sql = "SELECT completed FROM tasks WHERE id = ?";
        $check_stmt = mysqli_prepare($conn, $check_sql);
        
        if (!$check_stmt) {
            throw new Exception(mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($check_stmt, "i", $id);
        
        if (!mysqli_stmt_execute($check_stmt)) {
            throw new Exception(mysqli_stmt_error($check_stmt));
        }
        
        $result = mysqli_stmt_get_result($check_stmt);
        
        if (!$row = mysqli_fetch_assoc($result)) {
            throw new Exception("Task not found");
        }
        
        // Toggle completion status
        $new_status = $row['completed'] ? 0 : 1;
        
        // Update the task
        $sql = "UPDATE tasks SET completed = ? WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception(mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($stmt, "ii", $new_status, $id);
        
        if(!mysqli_stmt_execute($stmt)) {
            throw new Exception(mysqli_stmt_error($stmt));
        }
        
        echo json_encode([
            "status" => "success",
            "message" => "Task updated successfully",
            "task" => [
                "id" => $id,
                "completed" => (bool)$new_status
            ]
        ]);
    }

    // Delete task
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!isset($_GET['id'])) {
            throw new Exception("Task ID is required");
        }
        
        $id = intval($_GET['id']);
        
        $sql = "DELETE FROM tasks WHERE id = ?";
        $stmt = mysqli_prepare($conn, $sql);
        
        if (!$stmt) {
            throw new Exception(mysqli_error($conn));
        }
        
        mysqli_stmt_bind_param($stmt, "i", $id);
        
        if(!mysqli_stmt_execute($stmt)) {
            throw new Exception(mysqli_stmt_error($stmt));
        }
        
        if (mysqli_affected_rows($conn) === 0) {
            throw new Exception("Task not found");
        }
        
        echo json_encode([
            "status" => "success",
            "message" => "Task deleted successfully",
            "id" => $id
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
} finally {
    closeConnection();
}
?> 