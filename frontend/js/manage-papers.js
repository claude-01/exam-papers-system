// Dashboard JavaScript

const API_BASE = "https://exam-papers-system.onrender.com";

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    loadDashboardData();
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

async function loadDashboardData() {
    console.log('Loading dashboard data...');
    
    try {
        showLoadingStates();

        const papersResponse = await fetch(`${API_BASE}/api/papers/admin`, {
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json'
            }
        });

        if (!papersResponse.ok) {
            if (papersResponse.status === 401) {
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${papersResponse.status}`);
        }

        const papersData = await papersResponse.json();

        if (!papersData.success) {
            throw new Error(papersData.message || 'Failed to load papers');
        }

        const papers = papersData.data || [];

        updateStats(papers);
        displayRecentPapers(papers.slice(0, 5));

        await loadAnalyticsSummary();

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data: ' + error.message, 'error');
        showErrorStates();
    }
}

function showLoadingStates() {
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `<div class="stat-card loading"><p>Loading...</p></div>`;
    }
}

function showErrorStates() {
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `<div class="stat-card error"><p>Failed to load</p></div>`;
    }
}

function updateStats(papers) {
    const totalPapers = papers.length;
    const activePapers = papers.filter(p => p.status === 'active').length;

    document.getElementById('statsContainer').innerHTML = `
        <div class="stat-card"><h3>Total Papers</h3><div>${totalPapers}</div></div>
        <div class="stat-card"><h3>Active Papers</h3><div>${activePapers}</div></div>
    `;
}

function displayRecentPapers(papers) {
    const tbody = document.getElementById('recentPapers');
    if (!tbody) return;

    tbody.innerHTML = papers.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.year}</td>
            <td>${p.subject}</td>
            <td>${p.level}</td>
            <td>${p.status}</td>
        </tr>
    `).join('');
}

async function loadAnalyticsSummary() {
    try {
        const response = await fetch(`${API_BASE}/api/analytics`, {
            credentials: 'include'
        });

        const data = await response.json();

        if (!data.success) return;

        updateVisitorStats(data.data);

    } catch (error) {
        console.error(error);
    }
}

function updateVisitorStats(analytics) {
    document.getElementById('totalVisits').textContent =
        analytics?.visitors?.total || 0;
}

async function logout() {
    await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });

    window.location.href = '/admin/login.html';
}

function showNotification(message, type) {
    console.log(type + ': ' + message);
}
