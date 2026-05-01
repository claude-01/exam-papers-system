// ================================
// DASHBOARD JS (FIXED FOR ONLINE DEPLOYMENT)
// ================================

const API_BASE_URL = "https://exam-papers-system.onrender.com";

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

        // ================================
        // FIXED API CALL
        // ================================
        const papersResponse = await fetch(`${API_BASE_URL}/api/papers/admin`, {
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
        console.log('Papers data received:', papersData);

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
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card loading">Loading...</div>
        <div class="stat-card loading">Loading...</div>
        <div class="stat-card loading">Loading...</div>
        <div class="stat-card loading">Loading...</div>
    `;
}

function showErrorStates() {
    const statsContainer = document.getElementById('statsContainer');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card error">
                <p>Failed to load data</p>
                <button onclick="loadDashboardData()">Retry</button>
            </div>
        `;
    }
}

function updateStats(papers) {
    const totalPapers = papers.length;
    const activePapers = papers.filter(p => p.status === 'active').length;
    const years = [...new Set(papers.map(p => p.year))].length;
    const subjects = [...new Set(papers.map(p => p.subject))].length;

    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    statsContainer.innerHTML = `
        <div class="stat-card">
            <h3>Total Papers</h3>
            <div class="value">${totalPapers}</div>
        </div>
        <div class="stat-card">
            <h3>Active Papers</h3>
            <div class="value">${activePapers}</div>
        </div>
        <div class="stat-card">
            <h3>Total Years</h3>
            <div class="value">${years}</div>
        </div>
        <div class="stat-card">
            <h3>Subjects</h3>
            <div class="value">${subjects}</div>
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

    tbody.innerHTML = papers.map(paper => `
        <tr>
            <td>${paper.id}</td>
            <td>${paper.year}</td>
            <td>${paper.subject}</td>
            <td>${paper.level}</td>
            <td>${paper.status}</td>
        </tr>
    `).join('');
}

async function loadAnalyticsSummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache' }
        });

        const data = await response.json();

        updateVisitorStats(data.data);

    } catch (error) {
        console.error(error);
    }
}

function updateVisitorStats(analytics) {
    if (!analytics) return;

    const totalVisits = document.getElementById('totalVisits');
    const totalDownloads = document.getElementById('totalDownloads');

    if (totalVisits) totalVisits.textContent = analytics.visitors?.total || 0;
    if (totalDownloads) totalDownloads.textContent = analytics.downloads?.total || 0;
}

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });

        window.location.href = '/admin/login.html';

    } catch (error) {
        window.location.href = '/admin/login.html';
    }
}

function showNotification(message) {
    console.log(message);
}
