// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5000'
    : 'https://exam-papers-system.onrender.com';

// Utility function to build API URLs
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}
