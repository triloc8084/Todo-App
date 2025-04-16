document.addEventListener('DOMContentLoaded', function() {
    // Handle registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.message || 'Registration failed. Please try again.');
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Error:', error);
            }
        });
    }

    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.status === 'success') {
                    // Store user data in localStorage for persistence
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'index.html';
                } else {
                    alert(data.message || 'Login failed. Please try again.');
                }
            } catch (error) {
                alert('An error occurred. Please try again.');
                console.error('Error:', error);
            }
        });
    }

    // Add logout functionality
    const logoutBtn = document.createElement('a');
    logoutBtn.href = '#';
    logoutBtn.className = 'auth-btn login-btn';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    });

    // Update auth buttons based on login state
    function updateAuthButtons() {
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;

        const user = localStorage.getItem('user');
        if (user) {
            authButtons.innerHTML = '';
            authButtons.appendChild(logoutBtn);
        }
    }

    // Check authentication status
    function checkAuth() {
        const user = localStorage.getItem('user');
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Clear any potentially corrupted user data
        if (user && typeof JSON.parse(user) !== 'object') {
            localStorage.removeItem('user');
            return;
        }

        // Handle page access
        if (currentPage === 'index.html') {
            if (!user) {
                window.location.href = 'login.html';
            }
        } else if ((currentPage === 'login.html' || currentPage === 'register.html') && user) {
            window.location.href = 'index.html';
        }
    }

    // Initialize
    checkAuth();
    updateAuthButtons();
}); 