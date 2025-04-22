// Constants
const API_URL = 'http://localhost/Todo-App-main/api';
const chartColors = {
    primary: '#4a90e2',
    secondary: '#50c878',
    danger: '#ff6b6b',
    warning: '#ffd93d',
    info: '#6c757d',
    completed: '#28a745',
    pending: '#ffc107',
    overdue: '#dc3545'
};

// DOM Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const overdueTasksEl = document.getElementById('overdueTasks');

// Charts
let statusChart, priorityChart, timelineChart;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});

async function loadAnalytics() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch(`${API_URL}/tasks.php?user_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        
        updateStatistics(tasks);
        initializeCharts(tasks);
    } catch (error) {
        showError('Error loading analytics. Please try again.');
        console.error('Error:', error);
    }
}

function updateStatistics(tasks) {
    const now = new Date();
    const stats = {
        total: tasks.length,
        completed: tasks.filter(task => task.completed).length,
        pending: tasks.filter(task => !task.completed).length,
        overdue: tasks.filter(task => !task.completed && new Date(task.due_date) < now).length
    };
    
    totalTasksEl.textContent = stats.total;
    completedTasksEl.textContent = stats.completed;
    pendingTasksEl.textContent = stats.pending;
    overdueTasksEl.textContent = stats.overdue;
}

function initializeCharts(tasks) {
    createStatusChart(tasks);
    createPriorityChart(tasks);
    createTimelineChart(tasks);
}

function createStatusChart(tasks) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const data = {
        completed: tasks.filter(task => task.completed).length,
        pending: tasks.filter(task => !task.completed).length
    };
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [data.completed, data.pending],
                backgroundColor: [chartColors.completed, chartColors.pending],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 20
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

function createPriorityChart(tasks) {
    const ctx = document.getElementById('priorityChart').getContext('2d');
    const data = {
        high: tasks.filter(task => task.priority.toLowerCase() === 'high').length,
        medium: tasks.filter(task => task.priority.toLowerCase() === 'medium').length,
        low: tasks.filter(task => task.priority.toLowerCase() === 'low').length
    };
    
    priorityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Tasks by Priority',
                data: [data.high, data.medium, data.low],
                backgroundColor: [chartColors.danger, chartColors.warning, chartColors.primary],
                borderWidth: 0,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        padding: 10
                    },
                    grid: {
                        display: true,
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function createTimelineChart(tasks) {
    const ctx = document.getElementById('timelineChart').getContext('2d');
    const dates = getDateRange(tasks);
    const data = {
        completed: dates.map(date => 
            tasks.filter(task => 
                task.completed && 
                isSameDay(new Date(task.completion_date), date)
            ).length
        ),
        created: dates.map(date =>
            tasks.filter(task =>
                isSameDay(new Date(task.created_at), date)
            ).length
        )
    };
    
    timelineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates.map(date => formatDate(date)),
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: data.completed,
                    borderColor: chartColors.completed,
                    backgroundColor: hexToRGBA(chartColors.completed, 0.1),
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Tasks Created',
                    data: data.created,
                    borderColor: chartColors.primary,
                    backgroundColor: hexToRGBA(chartColors.primary, 0.1),
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 10,
                    bottom: 20,
                    left: 10,
                    right: 10
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        padding: 10
                    },
                    grid: {
                        display: true,
                        drawBorder: false
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

// Utility Functions
function getDateRange(tasks) {
    const dates = tasks.map(task => new Date(task.created_at));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date();
    
    const dateRange = [];
    let currentDate = minDate;
    
    while (currentDate <= maxDate) {
        dateRange.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dateRange;
}

function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

function formatDate(date) {
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Features Modal
function showFeatures() {
    const modal = document.getElementById('featuresModal');
    modal.classList.add('active');
}

function closeFeatures() {
    const modal = document.getElementById('featuresModal');
    modal.classList.remove('active');
} 