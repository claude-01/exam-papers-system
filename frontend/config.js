// API Configuration
const API_BASE_URL = 'http://localhost:5000';

// Utility function to build API URLs
function getApiUrl(endpoint) {
    return `${API_BASE_URL}${endpoint}`;
}
