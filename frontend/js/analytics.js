// Analytics JavaScript (FIXED FOR NETLIFY + RENDER)
let visitorsChart = null;
let yearChart = null;
let subjectChart = null;

// 🔥 IMPORTANT: your backend URL
const API_BASE_URL = "https://exam-papers-system.onrender.com";

document.addEventListener('DOMContentLoaded', function() {
    console.log('Analytics page loaded');

    if (typeof Chart === 'undefined') {
        console.error('Chart.js not loaded!');
        showNotification('Chart.js library failed to load. Please refresh the page.', 'error');
        return;
    }

    loadAnalytics();
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadAnalytics();
        });
    }
}

async function loadAnalytics() {
    console.log('Loading analytics data...');

    showLoadingStates();

    try {
        const response = await fetch(`${API_BASE_URL}/api/analytics`, {
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Analytics API response:', result);

        if (!result.success) {
            throw new Error(result.message || 'Failed to load analytics');
        }

        const data = result.data || {};

        displayAnalytics(data);

        setTimeout(() => {
            createCharts(data);
        }, 100);

    } catch (error) {
        console.error('Error loading analytics:', error);
        showError(error.message);
        showNotification('Failed to load analytics: ' + error.message, 'error');
    }
}

function showLoadingStates() {
    const summaryElements = {
        totalPapers: document.getElementById('totalPapers'),
        activePapers: document.getElementById('activePapers'),
        totalVisits: document.getElementById('totalVisits'),
        totalDownloads: document.getElementById('totalDownloads')
    };

    Object.values(summaryElements).forEach(el => {
        if (el) el.textContent = '...';
    });

    const yearList = document.getElementById('papersByYear');
    if (yearList) yearList.innerHTML = '<div class="loading-text">Loading...</div>';

    const subjectList = document.getElementById('papersBySubject');
    if (subjectList) subjectList.innerHTML = '<div class="loading-text">Loading...</div>';

    const mostDownloaded = document.getElementById('mostDownloaded');
    if (mostDownloaded) mostDownloaded.innerHTML = '<div class="loading-text">Loading...</div>';
}

function showError(message) {
    const elements = {
        totalPapers: document.getElementById('totalPapers'),
        activePapers: document.getElementById('activePapers'),
        totalVisits: document.getElementById('totalVisits'),
        totalDownloads: document.getElementById('totalDownloads')
    };

    Object.values(elements).forEach(el => {
        if (el) el.textContent = 'Error';
    });
}

function displayAnalytics(data) {
    const visitors = data.visitors || {};
    const papers = data.papers || {};
    const downloads = data.downloads || {};

    document.getElementById('totalPapers').textContent = papers.total || 0;
    document.getElementById('activePapers').textContent = papers.active || 0;
    document.getElementById('totalVisits').textContent = visitors.total || 0;
    document.getElementById('totalDownloads').textContent = downloads.total || 0;

    displayPapersByYear(papers.byYear || []);
    displayPapersBySubject(papers.bySubject || []);
    displayMostDownloaded(downloads.mostDownloaded);
}

function displayPapersByYear(yearData) {
    const container = document.getElementById('papersByYear');
    if (!container) return;

    container.innerHTML = yearData.length
        ? yearData.map(item => `
            <div class="stat-item">
                <span>${item.year}</span>
                <span>${item.count}</span>
            </div>
        `).join('')
        : '<div>No data</div>';
}

function displayPapersBySubject(subjectData) {
    const container = document.getElementById('papersBySubject');
    if (!container) return;

    container.innerHTML = subjectData.length
        ? subjectData.map(item => `
            <div class="stat-item">
                <span>${item.subject}</span>
                <span>${item.count}</span>
            </div>
        `).join('')
        : '<div>No data</div>';
}

function displayMostDownloaded(item) {
    const container = document.getElementById('mostDownloaded');
    if (!container || !item) {
        container.innerHTML = '<div>No data</div>';
        return;
    }

    container.innerHTML = `
        <div>
            <h4>${item.subject}</h4>
            <p>${item.year} - ${item.download_count} downloads</p>
        </div>
    `;
}

function destroyCharts() {
    if (visitorsChart) visitorsChart.destroy();
    if (yearChart) yearChart.destroy();
    if (subjectChart) subjectChart.destroy();
}

function createCharts(data) {
    destroyCharts();

    const visitors = data.visitors || {};
    const papers = data.papers || {};

    // Visitors chart
    const ctx1 = document.getElementById('visitorsChart');
    if (ctx1) {
        visitorsChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['1','2','3','4','5'],
                datasets: [{
                    label: 'Visitors',
                    data: [10,20,15,30,25],
                    borderColor: '#3b82f6'
                }]
            }
        });
    }

    // Year chart
    const ctx2 = document.getElementById('papersYearChart');
    if (ctx2 && papers.byYear) {
        yearChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: papers.byYear.map(x => x.year),
                datasets: [{
                    data: papers.byYear.map(x => x.count),
                    backgroundColor: '#3b82f6'
                }]
            }
        });
    }
}

function showNotification(message) {
    console.log(message);
}

// expose globally
window.loadAnalytics = loadAnalytics;
