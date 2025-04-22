# TaskMaster Todo App

A modern, feature-rich todo application with task management and analytics capabilities.

## Features

- User authentication (Register/Login)
- Task management with priorities
- Due date tracking
- Task filtering and sorting
- Task completion tracking
- Analytics dashboard
- Responsive design
- Real-time task updates

## Technologies Used

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Database: MySQL
- Charts: Chart.js
- Icons: Font Awesome

## Setup Instructions

1. Clone the repository
2. Import `database.sql` to your MySQL server
3. Configure database connection in `config.php`
4. Place the files in your web server directory
5. Access the application through your web browser

## Database Configuration

Create a `config.php` file in the `api` directory with the following content:

```php
<?php
define('DB_SERVER', 'localhost');
define('DB_USERNAME', 'your_username');
define('DB_PASSWORD', 'your_password');
define('DB_NAME', 'todo_app_main');

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

if($conn === false){
    die("ERROR: Could not connect. " . mysqli_connect_error());
}
?>
```

## License

MIT License 