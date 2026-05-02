// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5000'
    : window.location.hostname === 'nesapastnationalexam.netlify.app'
        ? 'https://exam-papers-system-1.onrender.com'
        : 'https://exam-papers-system-1.onrender.com';

// Utility function to build API URLs
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}
