// Authentication utilities for admin panel

// Check if user is authenticated
function isAuthenticated() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    
    if (!token) return false;
    
    try {
        // Simple JWT token validation (checking expiration)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch (error) {
        return false;
    }
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

// Logout function
async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    window.location.href = '/admin/login.html';
}

// Auto-logout on token expiration
function setupAutoLogout() {
    const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const timeUntilExpiry = payload.exp * 1000 - Date.now();
            
            if (timeUntilExpiry > 0) {
                setTimeout(() => {
                    alert('Your session has expired. Please login again.');
                    logout();
                }, timeUntilExpiry);
            }
        } catch (error) {
            console.error('Token parsing error:', error);
        }
    }
}

// Initialize auth checks
document.addEventListener('DOMContentLoaded', function() {
    // Only run auth checks on admin pages (not login page)
    if (!window.location.pathname.includes('/admin/login.html')) {
        requireAuth();
        setupAutoLogout();
    }
});

// Make functions globally available
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.logout = logout;
window.setupAutoLogout = setupAutoLogout;
