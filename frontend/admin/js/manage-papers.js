// Global variables
let allPapers = [];
let filteredPapers = [];
let currentPage = 1;
const itemsPerPage = 10;
let paperToDelete = null;
let editingId = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('Manage Papers page initialized');
    initializePage();
    setupEventListeners();
    loadPapers();
});

function initializePage() {
    // Populate year filter
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

    // Category change handler
    const categorySelect = document.getElementById('category');
    if (categorySelect) {
        categorySelect.addEventListener('change', function(e) {
            const tradeField = document.getElementById('trade_or_combination');
            const tradeLabel = document.querySelector('label[for="trade_or_combination"]');
            
            if (e.target.value === 'TVET') {
                tradeField.placeholder = 'e.g., Plumbing, Carpentry, Electricity';
                if (tradeLabel) tradeLabel.innerHTML = 'Trade <span class="required">*</span>';
                tradeField.required = true;
            } else if (e.target.value === 'General') {
                tradeField.placeholder = 'e.g., PCM, MCB, History (for combinations)';
                if (tradeLabel) tradeLabel.innerHTML = 'Combination (Optional)';
                tradeField.required = false;
            } else {
                tradeField.placeholder = 'e.g., PCM, MCB, Plumbing';
                tradeField.required = false;
            }
        });
    }
}

function setupEventListeners() {
    // Add paper button
    const addBtn = document.getElementById('addPaperBtn');
    if (addBtn) {
        addBtn.addEventListener('click', openAddModal);
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToCSV);
    }

    // Modal close buttons
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    const cancelModalBtn = document.getElementById('cancelModalBtn');
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeModal);
    }

    const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
    if (closeDeleteModalBtn) {
        closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    }

    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    if (cancelDeleteBtn) {
        cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    }

    const closeViewModalBtn = document.getElementById('closeViewModalBtn');
    if (closeViewModalBtn) {
        closeViewModalBtn.addEventListener('click', closeViewModal);
    }

    // Confirm delete button - IMPORTANT: This is the key for delete functionality
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', confirmDelete);
    }

    // Form submission
    const paperForm = document.getElementById('paperForm');
    if (paperForm) {
        paperForm.addEventListener('submit', handleFormSubmit);
    }

    // File upload
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

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', removeSelectedFile);
    }

    // Filters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterPapers, 300));
    }

    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', filterPapers);
    }

    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', filterPapers);
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterPapers);
    }

    const subjectFilter = document.getElementById('subjectFilter');
    if (subjectFilter) {
        subjectFilter.addEventListener('change', filterPapers);
    }

    const tradeFilter = document.getElementById('tradeFilter');
    if (tradeFilter) {
        tradeFilter.addEventListener('input', debounce(filterPapers, 300));
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', filterPapers);
    }

    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', filterPapers);
    }

    // Pagination
    const prevPage = document.getElementById('prevPage');
    if (prevPage) {
        prevPage.addEventListener('click', () => changePage(-1));
    }

    const nextPage = document.getElementById('nextPage');
    if (nextPage) {
        nextPage.addEventListener('click', () => changePage(1));
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.logout();
        });
    }
}

// ============== PAPER CRUD OPERATIONS ==============

async function loadPapers() {
    showLoading();

    try {
        const response = await fetch(getApiUrl('/api/admin/papers'), {
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache'
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
        console.log('Papers loaded:', result);

        // Handle different response formats
        if (result.success && Array.isArray(result.data)) {
            allPapers = result.data;
        } else if (Array.isArray(result)) {
            allPapers = result;
        } else if (result.data && Array.isArray(result.data)) {
            allPapers = result.data;
        } else {
            allPapers = [];
        }

        // Populate subject filter
        populateSubjectFilter();

        // Update stats
        updateStats();

        // Apply filters and display
        filteredPapers = [...allPapers];
        filterPapers();

    } catch (error) {
        console.error('Error loading papers:', error);
        showNotification('Failed to load papers: ' + error.message, 'error');
        const tbody = document.getElementById('papersTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center error-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load papers: ${error.message}</p>
                        <button onclick="loadPapers()" class="btn btn-secondary btn-sm">Retry</button>
                    </td>
                </tr>
            `;
        }
    }
}

function populateSubjectFilter() {
    const subjectFilter = document.getElementById('subjectFilter');
    if (!subjectFilter) return;

    const subjects = [...new Set(allPapers.map(p => p.subject))].sort();
    subjectFilter.innerHTML = '<option value="">All Subjects</option>';
    
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        subjectFilter.appendChild(option);
    });
}

function updateStats() {
    const total = allPapers.length;
    const active = allPapers.filter(p => p.status === 'active').length;
    const primary = allPapers.filter(p => p.level === 'Primary').length;
    const olevel = allPapers.filter(p => p.level === 'O-Level').length;
    const alevel = allPapers.filter(p => p.level === 'A-Level').length;
    const general = allPapers.filter(p => p.category === 'General').length;
    const tvet = allPapers.filter(p => p.category === 'TVET').length;

    document.getElementById('totalPapersCount').textContent = total;
    document.getElementById('activePapersCount').textContent = active;
    document.getElementById('primaryCount').textContent = primary;
    document.getElementById('olevelCount').textContent = olevel;
    document.getElementById('alevelCount').textContent = alevel;
    document.getElementById('generalCount').textContent = general;
    document.getElementById('tvetCount').textContent = tvet;
}

function filterPapers() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const level = document.getElementById('levelFilter')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const subject = document.getElementById('subjectFilter')?.value || '';
    const trade = document.getElementById('tradeFilter')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';

    filteredPapers = allPapers.filter(paper => {
        const matchesSearch = (paper.subject?.toLowerCase().includes(searchTerm) ||
                              (paper.trade_or_combination || '').toLowerCase().includes(searchTerm));
        const matchesYear = !year || paper.year?.toString() === year;
        const matchesLevel = !level || paper.level === level;
        const matchesCategory = !category || paper.category === category;
        const matchesSubject = !subject || paper.subject === subject;
        const matchesTrade = !trade || (paper.trade_or_combination || '').toLowerCase().includes(trade);
        const matchesStatus = !status || paper.status === status;

        // Date filtering
        let matchesDate = true;
        if (dateFilter && paper.created_at) {
            const paperDate = new Date(paper.created_at);
            const today = new Date();
            const compareDate = new Date();

            switch(dateFilter) {
                case 'today':
                    matchesDate = paperDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    compareDate.setDate(today.getDate() - 7);
                    matchesDate = paperDate >= compareDate;
                    break;
                case 'month':
                    compareDate.setMonth(today.getMonth() - 1);
                    matchesDate = paperDate >= compareDate;
                    break;
                case 'year':
                    compareDate.setFullYear(today.getFullYear() - 1);
                    matchesDate = paperDate >= compareDate;
                    break;
            }
        }

        return matchesSearch && matchesYear && matchesLevel && matchesCategory && 
               matchesSubject && matchesTrade && matchesStatus && matchesDate;
    });

    currentPage = 1;
    displayPapers();
}

function displayPapers() {
    const tbody = document.getElementById('papersTableBody');
    if (!tbody) return;

    const start = (currentPage - 1) * itemsPerPage;
    const paginatedPapers = filteredPapers.slice(start, start + itemsPerPage);

    if (paginatedPapers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <i class="fas fa-folder-open" style="font-size: 2rem; color: #4a5568;"></i>
                    <p>No papers found</p>
                </td>
            </tr>
        `;
        updatePagination(0);
        return;
    }

    tbody.innerHTML = paginatedPapers.map(paper => {
        const fileUrl = paper.file_path ? `/${paper.file_path.replace(/\\/g, '/')}` : '#';
        const category = paper.category || 'General';
        const trade = paper.trade_or_combination || '-';
        
        // Determine level class for styling
        let levelClass = '';
        if (paper.level === 'Primary') levelClass = 'level-primary';
        else if (paper.level === 'O-Level') levelClass = 'level-olevel';
        else if (paper.level === 'A-Level') levelClass = 'level-alevel';
        
        return `
            <tr>
                <td>${paper.id}</td>
                <td>${paper.year}</td>
                <td><strong>${paper.subject}</strong></td>
                <td><span class="level-badge ${levelClass}">${paper.level}</span></td>
                <td>
                    <span class="category-badge category-${category.toLowerCase()}">
                        ${category}
                    </span>
                </td>
                <td>
                    ${trade !== '-' ? `<span class="trade-badge">${trade}</span>` : '-'}
                </td>
                <td>
                    <div class="file-actions">
                        <a href="${fileUrl}" target="_blank" class="download-link" title="View PDF">
                            <i class="fas fa-eye"></i> View
                        </a>
                        <button class="action-btn download" onclick="downloadPaper('${fileUrl}', '${paper.subject}')" title="Download PDF">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${paper.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${paper.status}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="viewPaper(${paper.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="editPaper(${paper.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn toggle ${paper.status === 'active' ? 'deactivate' : 'activate'}" 
                                onclick="toggleStatus(${paper.id})" 
                                title="${paper.status === 'active' ? 'Deactivate' : 'Activate'}">
                            <i class="fas fa-${paper.status === 'active' ? 'eye-slash' : 'eye'}"></i>
                        </button>
                        <button class="action-btn delete" onclick="openDeleteModal(${paper.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    updatePagination(filteredPapers.length);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageInfo = document.getElementById('pageInfo');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${Math.max(1, totalPages)}`;
    }

    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        displayPapers();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ============== MODAL FUNCTIONS ==============

function openAddModal() {
    editingId = null;
    document.getElementById('modalTitle').textContent = 'Add New Paper';
    document.getElementById('paperForm').reset();
    document.getElementById('statusGroup').style.display = 'none';
    document.getElementById('fileRequired').style.display = 'inline';
    document.getElementById('fileUploadGroup').style.display = 'block';
    removeSelectedFile();
    document.getElementById('paperModal').classList.add('active');
}

function editPaper(id) {
    const paper = allPapers.find(p => p.id === id);
    if (!paper) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Paper';
    document.getElementById('year').value = paper.year;
    document.getElementById('subject').value = paper.subject;
    document.getElementById('level').value = paper.level;
    document.getElementById('category').value = paper.category || 'General';
    document.getElementById('trade_or_combination').value = paper.trade_or_combination || '';
    document.getElementById('status').value = paper.status;

    // Trigger category change
    const event = new Event('change');
    document.getElementById('category').dispatchEvent(event);

    document.getElementById('statusGroup').style.display = 'block';
    document.getElementById('fileRequired').style.display = 'none';

    if (paper.file_path) {
        const fileName = paper.file_path.split('/').pop();
        document.getElementById('fileName').textContent = `Current: ${fileName}`;
        document.getElementById('fileSize').textContent = '(existing file)';
        document.getElementById('fileUploadArea').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'flex';
    }

    document.getElementById('paperModal').classList.add('active');
}

function viewPaper(id) {
    const paper = allPapers.find(p => p.id === id);
    if (!paper) return;

    const fileUrl = paper.file_path ? `/${paper.file_path.replace(/\\/g, '/')}` : '#';
    const detailsDiv = document.getElementById('paperDetails');
    detailsDiv.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px;">
            <!-- Paper Details -->
            <div>
                <h3 style="margin-bottom: 15px; color: var(--accent-primary);">
                    <i class="fas fa-info-circle"></i> Paper Details
                </h3>
                <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px;">
                    <p><strong>ID:</strong> ${paper.id}</p>
                    <p><strong>Year:</strong> ${paper.year}</p>
                    <p><strong>Subject:</strong> ${paper.subject}</p>
                    <p><strong>Level:</strong> ${paper.level}</p>
                    <p><strong>Category:</strong> ${paper.category || 'General'}</p>
                    <p><strong>Trade/Combination:</strong> ${paper.trade_or_combination || '-'}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${paper.status === 'active' ? 'status-active' : 'status-inactive'}">${paper.status}</span></p>
                    <p><strong>Created:</strong> ${new Date(paper.created_at).toLocaleString()}</p>
                    <p><strong>Downloads:</strong> ${paper.download_count || 0}</p>
                </div>
            </div>
            
            <!-- PDF Preview -->
            <div>
                <h3 style="margin-bottom: 15px; color: var(--accent-primary);">
                    <i class="fas fa-file-pdf"></i> PDF Preview
                </h3>
                <div style="background: var(--bg-secondary); padding: 15px; border-radius: 8px; text-align: center;">
                    ${fileUrl !== '#' ? `
                        <iframe src="${fileUrl}" 
                                style="width: 100%; height: 500px; border: none; border-radius: 8px; background: white;"
                                frameborder="0">
                        </iframe>
                        <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
                            <button class="btn btn-primary" onclick="downloadPaper('${fileUrl}', '${paper.subject}')">
                                <i class="fas fa-download"></i> Download PDF
                            </button>
                            <button class="btn btn-info" onclick="openCommentsModal(${paper.id})">
                                <i class="fas fa-comments"></i> View Comments
                            </button>
                            <button class="btn btn-secondary" onclick="window.open('${fileUrl}', '_blank')">
                                <i class="fas fa-external-link-alt"></i> Open in New Tab
                            </button>
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 50px; color: var(--text-secondary);">
                            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 10px;"></i>
                            <p>No PDF file available</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;

    document.getElementById('viewModal').classList.add('active');
}

function closeModal() {
    document.getElementById('paperModal').classList.remove('active');
    editingId = null;
    removeSelectedFile();
}

function closeViewModal() {
    document.getElementById('viewModal').classList.remove('active');
}

// ============== DOWNLOAD FUNCTIONALITY ==============

function downloadPaper(fileUrl, subject) {
    try {
        // Create a temporary link element for download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.target = '_blank';
        link.download = `${subject.replace(/[^a-zA-Z0-9]/g, '_')}_paper.pdf`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Track download for analytics
        trackDownload(fileUrl);
        
        showNotification(`Downloading ${subject} paper...`, 'success');
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download paper', 'error');
    }
}

async function trackDownload(fileUrl) {
    try {
        // Extract paper ID from file URL for tracking
        const paperId = fileUrl.match(/\/uploads\/(\d+)/)?.[1];
        if (paperId) {
            await fetch(getApiUrl('/api/analytics/track-download'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperId: parseInt(paperId) }),
                credentials: 'include'
            });
        }
    } catch (error) {
        console.error('Error tracking download:', error);
    }
}

// ============== DELETE FUNCTIONALITY ==============

function openDeleteModal(id) {
    const paper = allPapers.find(p => p.id === id);
    if (!paper) return;

    paperToDelete = id;
    document.getElementById('deletePaperInfo').textContent = 
        `${paper.subject} (${paper.year} - ${paper.level})`;
    document.getElementById('deleteModal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
    paperToDelete = null;
}

async function confirmDelete() {
    if (!paperToDelete) {
        showNotification('No paper selected for deletion', 'error');
        return;
    }

    const deleteBtn = document.getElementById('confirmDeleteBtn');
    const originalText = deleteBtn.innerHTML;

    try {
        // Show loading state
        deleteBtn.disabled = true;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';

        console.log(`Attempting to delete paper with ID: ${paperToDelete}`);

        // Send delete request
        const response = await fetch(`/api/papers/${paperToDelete}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Parse response
        const data = await response.json();
        console.log('Delete response:', data);

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        // Success
        showNotification('Paper deleted successfully', 'success');
        closeDeleteModal();
        
        // Reload papers
        await loadPapers();

    } catch (error) {
        console.error('Error deleting paper:', error);
        showNotification('Failed to delete paper: ' + error.message, 'error');
    } finally {
        // Restore button
        deleteBtn.disabled = false;
        deleteBtn.innerHTML = originalText;
    }
}

// ============== FORM HANDLING ==============

async function handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.getElementById('savePaperBtn');
    const originalText = submitBtn.innerHTML;

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        const formData = new FormData();
        formData.append('year', document.getElementById('year').value);
        formData.append('subject', document.getElementById('subject').value);
        formData.append('level', document.getElementById('level').value);
        formData.append('category', document.getElementById('category').value);
        formData.append('trade_or_combination', document.getElementById('trade_or_combination').value);

        const file = document.getElementById('file').files[0];
        if (file) {
            formData.append('file', file);
        }

        if (editingId) {
            formData.append('status', document.getElementById('status').value);
        }

        // Validate
        if (!editingId && !file) {
            throw new Error('Please select a PDF file');
        }

        const category = document.getElementById('category').value;
        const trade = document.getElementById('trade_or_combination').value;
        if (category === 'TVET' && !trade) {
            throw new Error('Trade is required for TVET papers');
        }

        const url = editingId ? `/api/papers/${editingId}` : '/api/papers';
        const method = editingId ? 'PUT' : 'POST';

        console.log(`Saving paper with ${method} to ${url}`);

        const response = await fetch(url, {
            method: method,
            body: formData,
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to save paper');
        }

        showNotification(`Paper ${editingId ? 'updated' : 'added'} successfully`, 'success');
        closeModal();
        await loadPapers();

    } catch (error) {
        console.error('Error saving paper:', error);
        showNotification(error.message, 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

async function toggleStatus(id) {
    const paper = allPapers.find(p => p.id === id);
    if (!paper) return;

    const newStatus = paper.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} this paper?`)) return;

    try {
        const response = await fetch(`/api/papers/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                year: paper.year,
                subject: paper.subject,
                level: paper.level,
                category: paper.category,
                trade_or_combination: paper.trade_or_combination,
                status: newStatus
            }),
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to update status');
        }

        showNotification(`Paper ${action}d successfully`, 'success');
        await loadPapers();

    } catch (error) {
        console.error('Error updating status:', error);
        showNotification('Failed to update status: ' + error.message, 'error');
    }
}

// ============== FILE HANDLING ==============

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) validateAndDisplayFile(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea')?.classList.add('drag-over');
}

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea')?.classList.remove('drag-over');
}

function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.getElementById('fileUploadArea')?.classList.remove('drag-over');

    const file = event.dataTransfer.files[0];
    if (file) {
        document.getElementById('file').files = event.dataTransfer.files;
        validateAndDisplayFile(file);
    }
}

function validateAndDisplayFile(file) {
    if (file.type !== 'application/pdf') {
        showNotification('Please select a PDF file', 'error');
        document.getElementById('file').value = '';
        return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        showNotification('File size must be less than 10MB', 'error');
        document.getElementById('file').value = '';
        return;
    }

    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = `(${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    document.getElementById('fileUploadArea').style.display = 'none';
    document.getElementById('fileInfo').style.display = 'flex';
}

function removeSelectedFile() {
    document.getElementById('file').value = '';
    document.getElementById('fileInfo').style.display = 'none';
    document.getElementById('fileUploadArea').style.display = 'block';
}

// ============== FILTER FUNCTIONS ==============

function applyFilters() {
    filterPapers();
    document.getElementById('filtersPanel')?.classList.remove('active');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subjectFilter').value = '';
    document.getElementById('tradeFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('dateFilter').value = '';

    filterPapers();
}

// ============== EXPORT FUNCTION ==============

function exportToCSV() {
    const headers = ['ID', 'Year', 'Subject', 'Level', 'Category', 'Trade/Combination', 'Status', 'Created'];
    const csvRows = [];

    csvRows.push(headers.join(','));

    filteredPapers.forEach(paper => {
        const row = [
            paper.id,
            paper.year,
            `"${paper.subject}"`,
            paper.level,
            paper.category || 'General',
            paper.trade_or_combination || '-',
            paper.status,
            new Date(paper.created_at).toLocaleDateString()
        ];
        csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `papers_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showNotification('Export started', 'success');
}

// ============== UTILITY FUNCTIONS ==============

function showLoading() {
    const tbody = document.getElementById('papersTableBody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center">
                    <div class="loading-spinner"></div>
                    <p>Loading papers...</p>
                </td>
            </tr>
        `;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showNotification(message, type) {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        alert(message);
        return;
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============== COMMENT FUNCTIONS ==============

let currentPaperId = null;

function openCommentsModal(paperId) {
    currentPaperId = paperId;
    document.getElementById('commentsModal').classList.add('active');
    loadAdminComments(paperId);
}

function closeCommentsModal() {
    console.log('Closing comments modal...');
    document.getElementById('commentsModal').classList.remove('active');
    currentPaperId = null;
}

function loadAdminComments(paperId) {
    console.log('Loading admin comments for paper ID:', paperId);
    
    const commentsList = document.getElementById('adminCommentsList');
    const commentsCount = document.getElementById('adminCommentsCount');
    
    if (!commentsList) {
        console.error('adminCommentsList element not found!');
        return;
    }
    
    if (!commentsCount) {
        console.error('adminCommentsCount element not found!');
    }
    
    // Show loading state
    commentsList.innerHTML = `
        <div class="comments-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading comments...
        </div>
    `;
    
    console.log('Fetching comments from API...');
    
    fetch(`/api/comments/paper/${paperId}`)
        .then(response => {
            console.log('API response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('API response data:', data);
            if (data.success) {
                console.log('Comments loaded successfully:', data.data);
                displayAdminComments(data.data);
                if (commentsCount) {
                    commentsCount.textContent = data.data.length;
                    console.log('Updated comment count to:', data.data.length);
                }
            } else {
                throw new Error(data.message || 'Failed to load comments');
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            displayAdminCommentError('Failed to load comments: ' + error.message);
            if (commentsCount) {
                commentsCount.textContent = '0';
            }
        });
}

function displayAdminComments(comments) {
    const commentsList = document.getElementById('adminCommentsList');
    if (!commentsList) return;
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="no-comments">
                <i class="fas fa-comment-slash"></i>
                No comments yet. Be the first to comment!
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="admin-comment-item" data-comment-id="${comment.id}">
            <div class="admin-comment-header">
                <div class="admin-comment-author ${comment.is_admin_comment ? 'admin' : ''}">
                    ${comment.user_name}
                    ${comment.is_admin_comment ? '<span class="admin-comment-badge">Admin</span>' : ''}
                </div>
                <div class="admin-comment-time">${formatAdminCommentTime(comment.created_at)}</div>
                <div class="admin-comment-actions">
                    ${!comment.is_admin_comment ? `
                        <button class="btn btn-sm btn-primary" onclick="showReplyForm(${comment.id})" title="Reply">
                            <i class="fas fa-reply"></i> Reply
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})" title="Delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-danger" onclick="deleteComment(${comment.id})" title="Delete">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    `}
                </div>
            </div>
            <div class="admin-comment-text">${escapeAdminHtml(comment.comment)}</div>
            <div class="admin-reply-form" id="reply-form-${comment.id}" style="display: none;">
                <div class="reply-input-group">
                    <textarea class="form-control" id="reply-input-${comment.id}" 
                        placeholder="Write your reply..." 
                        maxlength="1000" rows="2"></textarea>
                    <div class="reply-actions">
                        <button class="btn btn-sm btn-secondary" onclick="cancelReply(${comment.id})">Cancel</button>
                        <button class="btn btn-sm btn-primary" onclick="submitReply(${comment.id})">
                            <i class="fas fa-paper-plane"></i> Reply
                        </button>
                    </div>
                </div>
            </div>
            <div class="admin-replies" id="replies-${comment.id}">
                ${comment.replies ? comment.replies.map(reply => `
                    <div class="admin-reply-item">
                        <div class="admin-reply-header">
                            <div class="admin-reply-author">
                                ${reply.user_name}
                                ${reply.is_admin_comment ? '<span class="admin-comment-badge">Admin</span>' : ''}
                            </div>
                            <div class="admin-reply-time">${formatAdminCommentTime(reply.created_at)}</div>
                            <div class="admin-reply-actions">
                                <button class="btn btn-sm btn-danger" onclick="deleteComment(${reply.id})" title="Delete">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                        <div class="admin-reply-text">${escapeAdminHtml(reply.comment)}</div>
                    </div>
                `).join('') : ''}
            </div>
        </div>
    `).join('');
}

function displayAdminCommentError(message) {
    const commentsList = document.getElementById('adminCommentsList');
    if (commentsList) {
        commentsList.innerHTML = `
            <div class="comments-error">
                <i class="fas fa-exclamation-triangle"></i>
                ${message}
            </div>
        `;
    }
}

function submitAdminComment() {
    const commentInput = document.getElementById('adminCommentInput');
    const submitBtn = event.target;
    
    if (!commentInput || !currentPaperId) return;
    
    const comment = commentInput.value.trim();
    
    // Validation
    if (!comment) {
        showNotification('Please enter a comment', 'warning');
        commentInput.focus();
        return;
    }
    
    if (comment.length < 3) {
        showNotification('Comment must be at least 3 characters', 'warning');
        commentInput.focus();
        return;
    }
    
    // Disable submit button
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    
    // Submit comment as admin
    fetch(getApiUrl('/api/comments'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paper_id: currentPaperId,
            user_name: 'Administrator',
            user_email: 'admin@nesa.gov.rw',
            comment: comment,
            is_admin_comment: true
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form
            commentInput.value = '';
            
            // Reload comments
            loadAdminComments(currentPaperId);
            
            showNotification('Comment posted successfully!', 'success');
        } else {
            throw new Error(data.message || 'Failed to post comment');
        }
    })
    .catch(error => {
        console.error('Error posting comment:', error);
        showNotification('Failed to post comment', 'error');
    })
    .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    });
}

function refreshComments() {
    if (currentPaperId) {
        loadAdminComments(currentPaperId);
        showNotification('Comments refreshed', 'info');
    }
}

function formatAdminCommentTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
}

function escapeAdminHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============== ADMIN REPLY AND DELETE FUNCTIONS ==============

function showReplyForm(commentId) {
    // Hide all reply forms
    document.querySelectorAll('.admin-reply-form').forEach(form => {
        form.style.display = 'none';
    });
    
    // Show the selected reply form
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'block';
        // Focus on the textarea
        const textarea = document.getElementById(`reply-input-${commentId}`);
        if (textarea) {
            textarea.focus();
        }
    }
}

function cancelReply(commentId) {
    const replyForm = document.getElementById(`reply-form-${commentId}`);
    if (replyForm) {
        replyForm.style.display = 'none';
        // Clear the textarea
        const textarea = document.getElementById(`reply-input-${commentId}`);
        if (textarea) {
            textarea.value = '';
        }
    }
}

function submitReply(commentId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    
    if (!replyInput || !currentPaperId) return;
    
    const reply = replyInput.value.trim();
    
    // Validation
    if (!reply) {
        showNotification('Please enter a reply', 'warning');
        replyInput.focus();
        return;
    }
    
    if (reply.length < 3) {
        showNotification('Reply must be at least 3 characters', 'warning');
        replyInput.focus();
        return;
    }
    
    // Submit reply as admin
    fetch(getApiUrl('/api/comments'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paper_id: currentPaperId,
            user_name: 'Administrator',
            user_email: 'admin@nesa.gov.rw',
            comment: reply,
            is_admin_comment: true,
            parent_id: commentId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form and hide it
            cancelReply(commentId);
            
            // Reload comments
            loadAdminComments(currentPaperId);
            
            showNotification('Reply posted successfully!', 'success');
        } else {
            throw new Error(data.message || 'Failed to post reply');
        }
    })
    .catch(error => {
        console.error('Error posting reply:', error);
        showNotification('Failed to post reply', 'error');
    });
}

function deleteComment(commentId) {
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
        return;
    }
    
    fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload comments
            loadAdminComments(currentPaperId);
            
            showNotification('Comment deleted successfully', 'success');
        } else {
            throw new Error(data.message || 'Failed to delete comment');
        }
    })
    .catch(error => {
        console.error('Error deleting comment:', error);
        showNotification('Failed to delete comment', 'error');
    });
}

// Make functions globally available for inline onclick handlers
window.editPaper = editPaper;
window.viewPaper = viewPaper;
window.toggleStatus = toggleStatus;
window.openDeleteModal = openDeleteModal;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.closeViewModal = closeViewModal;
window.confirmDelete = confirmDelete;
window.loadPapers = loadPapers;
window.openCommentsModal = openCommentsModal;
window.closeCommentsModal = closeCommentsModal;
window.submitAdminComment = submitAdminComment;
window.refreshComments = refreshComments;
window.loadAdminComments = loadAdminComments;
window.displayAdminComments = displayAdminComments;
window.displayAdminCommentError = displayAdminCommentError;
window.formatAdminCommentTime = formatAdminCommentTime;
window.escapeAdminHtml = escapeAdminHtml;
window.showReplyForm = showReplyForm;
window.cancelReply = cancelReply;
window.submitReply = submitReply;
window.deleteComment = deleteComment;