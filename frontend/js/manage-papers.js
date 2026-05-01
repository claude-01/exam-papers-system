// Dashboard JavaScript

const API_BASE = "https://exam-papers-system.onrender.com";

document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard page loaded');
    loadDashboardData();
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
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
            throw new Error(`Server error: ${papersResponse.status}`);
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
        console.error('Dashboard error:', error);
        showNotification('Failed to load dashboard: ' + error.message, 'error');
        showErrorStates();
    }
}

function showLoadingStates() {
    const statsContainer = document.getElementById('statsContainer');

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">Loading...</div>
            <div class="stat-card">Loading...</div>
            <div class="stat-card">Loading...</div>
            <div class="stat-card">Loading...</div>
        `;
    }
}

function showErrorStates() {
    const statsContainer = document.getElementById('statsContainer');

    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card error">
                ❌ Failed to load data
                <button onclick="loadDashboardData()">Retry</button>
            </div>
        `;
    }
}

function updateStats(papers) {
    const container = document.getElementById('statsContainer');
    if (!container) return;

    const total = papers.length;
    const active = papers.filter(p => p.status === 'active').length;

    container.innerHTML = `
        <div class="stat-card">
            <h3>Total Papers</h3>
            <div class="value">${total}</div>
        </div>

        <div class="stat-card">
            <h3>Active Papers</h3>
            <div class="value">${active}</div>
        </div>
    `;
}

function displayRecentPapers(papers) {
    const tbody = document.getElementById('recentPapers');
    if (!tbody) return;

    if (!papers.length) {
        tbody.innerHTML = `<tr><td colspan="5">No papers found</td></tr>`;
        return;
    }

    tbody.innerHTML = papers.map(p => `
        <tr>
            <td>${p.id || '-'}</td>
            <td>${p.year || '-'}</td>
            <td>${p.subject || '-'}</td>
            <td>${p.level || '-'}</td>
            <td>${p.status || '-'}</td>
        </tr>
    `).join('');
}

async function loadAnalyticsSummary() {
    try {
        const response = await fetch(`${API_BASE}/api/analytics`, {
            credentials: 'include'
        });

        if (!response.ok) return;

        const data = await response.json();
        if (!data.success) return;

        updateVisitorStats(data.data);

    } catch (error) {
        console.error('Analytics error:', error);
    }
}

function updateVisitorStats(analytics) {
    const el = document.getElementById('totalVisits');
    if (!el) return;

    el.textContent = analytics?.visitors?.total || 0;
}

async function logout() {
    try {
        await fetch(`${API_BASE}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        window.location.href = '/admin/login.html';

    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/admin/login.html';
    }
}

function showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}
