// ========================================
// NESA PUBLIC PORTAL - MAIN JAVASCRIPT (FIXED VERSION)
// ========================================

// Global variables
let allPapers = [];
let filteredPapers = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentView = 'grid';
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
let currentPaperForShare = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('NESA Public Portal initialized');

    initializePage();
    setupEventListeners();
    loadPapers(); // Load immediately
    updateBookmarkCount();
});

// ========================================
// INITIALIZATION
// ========================================

function initializePage() {
    console.log('Initializing page...');

    // Year filter
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        const currentYear = new Date().getFullYear();
        yearFilter.innerHTML = '<option value="">All Years</option>';

        for (let year = currentYear; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    }

    // Saved view mode
    const savedView = localStorage.getItem('viewMode');
    if (savedView) setView(savedView);

    // Sidebar toggle
    document.getElementById('menuToggle')?.addEventListener('click', toggleSidebar);
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    console.log('Setting up event listeners...');

    document.getElementById('searchInput')?.addEventListener(
        'input',
        debounce(handleSearch, 400)
    );

    ['yearFilter', 'levelFilter', 'categoryFilter', 'subjectFilter'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', filterPapers);
    });

    document.getElementById('tradeFilter')?.addEventListener(
        'input',
        debounce(filterPapers, 400)
    );

    window.addEventListener('click', (e) => {
        if (e.target.id === 'previewModal') closePreview();
        if (e.target.id === 'shareModal') closeShareModal();
    });
}

// ========================================
// LOAD PAPERS
// ========================================

async function loadPapers() {
    const container = document.getElementById('papersContainer');

    if (container) {
        container.innerHTML = '<div class="loading-spinner"></div>';
    }

    try {
        const response = await fetch('/api/papers/public');

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();

        allPapers =
            (data.success && data.data) ||
            data.data ||
            (Array.isArray(data) ? data : []);

        console.log(`Loaded ${allPapers.length} papers`);

        populateSubjectFilter();
        updateStats();

        filteredPapers = [...allPapers];
        displayPapers();
    } catch (error) {
        console.error('Load error:', error);

        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Failed to load papers</h3>
                    <p>${error.message}</p>
                    <button onclick="loadPapers()" class="btn-primary">Retry</button>
                </div>
            `;
        }
    }
}

// ========================================
// FILTERING
// ========================================

function filterPapers() {
    const search = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const level = document.getElementById('levelFilter')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const subject = document.getElementById('subjectFilter')?.value || '';
    const trade = document.getElementById('tradeFilter')?.value.toLowerCase() || '';

    filteredPapers = allPapers.filter(p => {
        return (
            (!search ||
                p.subject?.toLowerCase().includes(search) ||
                (p.trade_or_combination || '').toLowerCase().includes(search)) &&
            (!year || String(p.year) === year) &&
            (!level || p.level === level) &&
            (!category || p.category === category) &&
            (!subject || p.subject === subject) &&
            (!trade || (p.trade_or_combination || '').toLowerCase().includes(trade))
        );
    });

    currentPage = 1;
    displayPapers();
}

// ========================================
// DISPLAY
// ========================================

function displayPapers() {
    const container = document.getElementById('papersContainer');
    if (!container) return;

    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredPapers.slice(start, start + itemsPerPage);

    if (filteredPapers.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No papers found</h3>
                <p>Try different filters</p>
                <button onclick="resetFilters()" class="btn-primary">Reset</button>
            </div>
        `;
        updatePagination(0);
        return;
    }

    container.className = `papers-container ${currentView}-view`;

    container.innerHTML = pageItems.map(paper => {
        const isBookmarked = bookmarks.includes(paper.id);
        const fileUrl = paper.file_path ? `/${paper.file_path.replace(/\\/g, '/')}` : '#';

        return `
        <div class="paper-card ${currentView}" data-id="${paper.id}">
            <div class="paper-header">
                <span>${paper.category || 'General'}</span>
                <span>${paper.year}</span>
            </div>

            <div class="paper-body">
                <h3>${paper.subject}</h3>
                <p>${paper.level}</p>
            </div>

            <div class="paper-actions">
                <button onclick="downloadPaper(${paper.id}, '${fileUrl}')">⬇</button>
                <button onclick="sharePaper(${paper.id})">🔗</button>
                <button onclick="previewPaper('${fileUrl}', '${paper.subject}')">👁</button>
                <button onclick="toggleBookmark(${paper.id})" class="${isBookmarked ? 'active' : ''}">
                    ★
                </button>
            </div>
        </div>`;
    }).join('');

    updatePagination(filteredPapers.length);
}

// ========================================
// PAGINATION
// ========================================

function updatePagination(total) {
    const pages = Math.ceil(total / itemsPerPage);

    document.getElementById('pageInfo').textContent =
        `Page ${currentPage} of ${Math.max(1, pages)}`;

    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= pages;
}

function changePage(dir) {
    const pages = Math.ceil(filteredPapers.length / itemsPerPage);
    const next = currentPage + dir;

    if (next >= 1 && next <= pages) {
        currentPage = next;
        displayPapers();
    }
}

// ========================================
// SEARCH
// ========================================

function handleSearch() {
    currentPage = 1;
    filterPapers();
}

// ========================================
// BOOKMARKS
// ========================================

function toggleBookmark(id) {
    const i = bookmarks.indexOf(id);

    if (i === -1) bookmarks.push(id);
    else bookmarks.splice(i, 1);

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));

    updateBookmarkCount();
    displayPapers();
}

function updateBookmarkCount() {
    const el = document.getElementById('bookmarkCount');
    if (el) el.textContent = bookmarks.length;
}

// ========================================
// ACTIONS
// ========================================

async function downloadPaper(id, url) {
    try {
        await fetch('/api/analytics/track-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId: id })
        });

        window.open(url, '_blank');
    } catch {
        window.open(url, '_blank');
    }
}

function previewPaper(url, title) {
    document.getElementById('previewFrame').src = url;
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewModal').classList.add('active');
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
    document.getElementById('previewFrame').src = '';
}

// ========================================
// SHARE
// ========================================

function sharePaper(id) {
    const paper = allPapers.find(p => p.id === id);
    if (!paper) return;

    currentPaperForShare = paper;

    const link = `${window.location.origin}/${paper.file_path.replace(/\\/g, '/')}`;

    document.getElementById('shareLink').textContent = link;
    document.getElementById('shareModal').classList.add('active');
}

function closeShareModal() {
    document.getElementById('shareModal').classList.remove('active');
    currentPaperForShare = null;
}

// ========================================
// UI HELPERS
// ========================================

function setView(view) {
    currentView = view;
    localStorage.setItem('viewMode', view);
    displayPapers();
}

function toggleSidebar() {
    document.querySelector('.public-sidebar')?.classList.toggle('active');
}

function debounce(fn, t) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), t);
    };
}

// ========================================
// EXPORT GLOBALS
// ========================================

window.changePage = changePage;
window.setView = setView;
window.loadPapers = loadPapers;
window.toggleBookmark = toggleBookmark;
window.downloadPaper = downloadPaper;
window.previewPaper = previewPaper;
window.closePreview = closePreview;
window.sharePaper = sharePaper;
window.closeShareModal = closeShareModal;
window.filterPapers = filterPapers;
