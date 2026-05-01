// Global variables
let allPapers = [];
let filteredPapers = [];
let currentPage = 1;
const itemsPerPage = 10;
let paperToDelete = null;
let editingId = null;

// 🌐 FIX: central API base (important for deployment)
const API_BASE = "https://exam-papers-system.onrender.com";

document.addEventListener('DOMContentLoaded', function() {
    console.log('Manage Papers page initialized');
    initializePage();
    setupEventListeners();
    loadPapers();
});

function initializePage() {
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        const currentYear = new Date().getFullYear();
        for (let year = currentYear; year >= 2000; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        }
    }

    document.getElementById('category')?.addEventListener('change', function(e) {
        const tradeField = document.getElementById('trade_or_combination');
        const tradeLabel = tradeField?.previousElementSibling;

        if (!tradeField) return;

        if (e.target.value === 'TVET') {
            tradeField.placeholder = 'e.g., Plumbing, Carpentry, Electricity';
            if (tradeLabel) tradeLabel.innerHTML = 'Trade <span class="required">*</span>';
            tradeField.required = true;
        } else if (e.target.value === 'General') {
            tradeField.placeholder = 'e.g., PCM, MCB, History';
            if (tradeLabel) tradeLabel.innerHTML = 'Combination (Optional)';
            tradeField.required = false;
        } else {
            tradeField.placeholder = 'e.g., PCM, MCB, Plumbing';
            tradeField.required = false;
        }
    });
}

function setupEventListeners() {
    document.getElementById('addPaperBtn')?.addEventListener('click', openAddModal);

    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDeleteModalBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('cancelDeleteBtn')?.addEventListener('click', closeDeleteModal);
    document.getElementById('closeViewModalBtn')?.addEventListener('click', closeViewModal);

    document.getElementById('paperForm')?.addEventListener('submit', handleFormSubmit);

    const fileInput = document.getElementById('file');
    const fileUploadArea = document.getElementById('fileUploadArea');
    const removeFileBtn = document.getElementById('removeFileBtn');

    if (fileInput && fileUploadArea) {
        fileInput.addEventListener('change', handleFileSelect);
        fileUploadArea.addEventListener('click', () => fileInput.click());
        fileUploadArea.addEventListener('dragover', handleDragOver);
        fileUploadArea.addEventListener('dragleave', handleDragLeave);
        fileUploadArea.addEventListener('drop', handleFileDrop);
    }

    removeFileBtn?.addEventListener('click', removeSelectedFile);

    document.getElementById('searchInput')?.addEventListener('input', debounce(filterPapers, 300));
    document.getElementById('yearFilter')?.addEventListener('change', filterPapers);
    document.getElementById('levelFilter')?.addEventListener('change', filterPapers);
    document.getElementById('categoryFilter')?.addEventListener('change', filterPapers);
    document.getElementById('subjectFilter')?.addEventListener('change', filterPapers);
    document.getElementById('tradeFilter')?.addEventListener('input', debounce(filterPapers, 300));
    document.getElementById('statusFilter')?.addEventListener('change', filterPapers);
    document.getElementById('dateFilter')?.addEventListener('change', filterPapers);

    document.getElementById('prevPage')?.addEventListener('click', () => changePage(-1));
    document.getElementById('nextPage')?.addEventListener('click', () => changePage(1));

    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.Auth?.logout) window.Auth.logout();
    });

    document.getElementById('exportBtn')?.addEventListener('click', exportToCSV);
}

// ================= LOAD PAPERS =================

async function loadPapers() {
    showLoading();

    try {
        const response = await fetch(`${API_BASE}/api/admin/papers`, {
            credentials: 'include',
            headers: { 'Cache-Control': 'no-cache' }
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/admin/login.html';
                return;
            }
            throw new Error('Failed to load papers');
        }

        const result = await response.json();

        allPapers =
            (result?.success && result.data) ||
            (Array.isArray(result) && result) ||
            [];

        populateSubjectFilter();
        updateStats();

        filteredPapers = [...allPapers];
        filterPapers();

    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    }
}

// ================= FILTER =================

function filterPapers() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

    filteredPapers = allPapers.filter(p => {
        const subject = p.subject?.toLowerCase() || '';
        const trade = p.trade_or_combination?.toLowerCase() || '';

        return subject.includes(searchTerm) || trade.includes(searchTerm);
    });

    currentPage = 1;
    displayPapers();
}

// ================= DISPLAY =================

function displayPapers() {
    const tbody = document.getElementById('papersTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * itemsPerPage;
    const pageItems = filteredPapers.slice(start, start + itemsPerPage);

    tbody.innerHTML = pageItems.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.year}</td>
            <td>${p.subject}</td>
            <td>${p.level}</td>
            <td>${p.status}</td>
        </tr>
    `).join('');

    updatePagination(filteredPapers.length);
}

// ================= CRUD HELPERS =================

function openAddModal() {
    editingId = null;
    document.getElementById('paperForm')?.reset();
    document.getElementById('paperModal')?.classList.add('active');
}

function closeModal() {
    document.getElementById('paperModal')?.classList.remove('active');
    editingId = null;
    removeSelectedFile();
}

function closeViewModal() {
    document.getElementById('viewModal')?.classList.remove('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal')?.classList.remove('active');
    paperToDelete = null;
}

// ================= FILE =================

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) validateAndDisplayFile(file);
}

function validateAndDisplayFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('PDF only', 'error');
        return;
    }

    document.getElementById('fileName').textContent = file.name;
}

// ================= UTIL =================

function debounce(fn, wait) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
    };
}

function showLoading() {
    const tbody = document.getElementById('papersTableBody');
    if (tbody) tbody.innerHTML = `<tr><td>Loading...</td></tr>`;
}

function showNotification(msg, type) {
    console.log(type + ': ' + msg);
}

// expose
window.editPaper = editPaper;
window.viewPaper = viewPaper;
window.toggleStatus = toggleStatus;
window.openDeleteModal = openDeleteModal;
