// ========================================
// NESA PUBLIC PORTAL - COMPLETE JAVASCRIPT
// ========================================

// Global variables
let allPapers = [];
let filteredPapers = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentView = 'grid';
let bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Public page loaded');
    loadPapers();
    setupEventListeners();
    updateBookmarkCount();
    populateYearFilter();
    updateStats();
});

// ============== PAPER LOADING ==============

async function loadPapers() {
    console.log('Loading papers...');
    
    const container = document.getElementById('papersContainer');
    if (container) {
        container.innerHTML = '<div class="loading-spinner"></div>';
    }
    
    try {
        console.log('Fetching papers from API...');
        const response = await fetch('/api/papers/public');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Handle different response formats
        if (data.success && Array.isArray(data.data)) {
            allPapers = data.data;
        } else if (Array.isArray(data)) {
            allPapers = data;
        } else if (data.data && Array.isArray(data.data)) {
            allPapers = data.data;
        } else {
            console.warn('Unexpected API response format:', data);
            allPapers = [];
        }
        
        console.log(`Loaded ${allPapers.length} papers`);
        
        if (allPapers.length === 0) {
            console.warn('No papers found in database');
            if (container) {
                container.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No papers found</h3>
                        <p>No exam papers are currently available. Please check back later.</p>
                    </div>
                `;
            }
            return;
        }
        
        filteredPapers = [...allPapers];
        displayPapers();
        updateStats();
        
    } catch (error) {
        console.error('Error loading papers:', error);
        if (container) {
            container.innerHTML = `
                <div class="error-message" style="text-align:center; padding:2rem; color: var(--danger);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3>Failed to load papers</h3>
                    <p>Unable to connect to the server. Please check your internet connection and try refreshing the page.</p>
                    <button class="btn btn-primary" onclick="loadPapers()" style="margin-top: 1rem;">
                        <i class="fas fa-sync"></i> Retry
                    </button>
                </div>
            `;
        }
    }
}

function displayPapers() {
    const container = document.getElementById('papersContainer');
    
    if (!container) {
        console.error('papersContainer not found!');
        return;
    }
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pagePapers = filteredPapers.slice(start, end);
    
    if (pagePapers.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No papers found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="papers-grid">
            ${pagePapers.map(paper => {
                const isBookmarked = bookmarks.includes(paper.id);
                return `
                <div class="paper-card" data-id="${paper.id}">
                    <div class="paper-header">
                        <h3 class="paper-title">${paper.subject}</h3>
                        <span class="paper-level">${paper.level}</span>
                    </div>
                    <div class="paper-body">
                        <div class="paper-meta">
                            <span class="paper-year">${paper.year}</span>
                            <span class="paper-category">${paper.category}</span>
                        </div>
                        <div class="paper-trade">${paper.trade_or_combination}</div>
                        <div class="paper-actions">
                            <button class="btn btn-primary btn-sm" onclick="openPDFInViewer('${paper.file_url}', '${paper.subject}', '${paper.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="downloadPaper('${paper.id}', '${paper.file_url}')">
                                <i class="fas fa-download"></i> Download
                            </button>
                            <button class="btn btn-outline btn-sm action-btn bookmark ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark('${paper.id}')" title="${isBookmarked ? 'Remove bookmark' : 'Add bookmark'}">
                                <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                            </button>
                            <button class="btn btn-outline btn-sm action-btn comment" onclick="togglePaperComments('${paper.id}', '${paper.subject}')" title="View/Add comments">
                                <i class="fas fa-comment"></i> Comments
                            </button>
                        </div>
                        <div class="paper-comments" id="comments-${paper.id}" style="display: none;">
                            <div class="comments-list" id="comments-list-${paper.id}">
                                <div class="comments-loading">
                                    <i class="fas fa-spinner fa-spin"></i> Loading comments...
                                </div>
                            </div>
                            <div class="add-comment-section">
                                <form class="comment-form" onsubmit="submitPaperComment(event, '${paper.id}')">
                                    <div class="form-group">
                                        <input type="text" placeholder="Your name *" class="comment-name" required>
                                    </div>
                                    <div class="form-group">
                                        <input type="email" placeholder="Your email (optional)" class="comment-email">
                                    </div>
                                    <div class="form-group">
                                        <textarea placeholder="Add your comment..." class="comment-text" rows="3" required></textarea>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-sm">
                                        <i class="fas fa-paper-plane"></i> Post Comment
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            }).join('')}
        </div>
    `;
    
    updatePagination();
}

function updateResultCount() {
    const showingCount = document.getElementById('showingCount');
    if (showingCount) {
        showingCount.textContent = filteredPapers.length;
    }
}

function updateStats() {
    const totalPapers = allPapers.length;
    const totalDownloads = allPapers.reduce((sum, p) => sum + (p.download_count || 0), 0);
    const years = [...new Set(allPapers.map(p => p.year))].length;
    
    const totalEl = document.getElementById('totalPapersCount');
    const downloadsEl = document.getElementById('totalDownloadsCount');
    const yearsEl = document.getElementById('yearsCount');
    
    if (totalEl) totalEl.textContent = totalPapers;
    if (downloadsEl) downloadsEl.textContent = totalDownloads;
    if (yearsEl) yearsEl.textContent = years;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
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
    currentPage += direction;
    displayPapers();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============== FILTERS ==============

function populateYearFilter() {
    const yearFilter = document.getElementById('yearFilter');
    if (!yearFilter) return;
    
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2000; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            applyFilters();
        });
    }
    
    const yearFilter = document.getElementById('yearFilter');
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            applyFilters();
        });
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const level = document.getElementById('levelFilter')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    
    filteredPapers = allPapers.filter(paper => {
        const matchesSearch = paper.subject?.toLowerCase().includes(searchTerm);
        const matchesYear = !year || paper.year?.toString() === year;
        const matchesLevel = !level || paper.level === level;
        const matchesCategory = !category || paper.category === category;
        
        return matchesSearch && matchesYear && matchesLevel && matchesCategory;
    });
    
    currentPage = 1;
    displayPapers();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    
    filteredPapers = [...allPapers];
    currentPage = 1;
    displayPapers();
}

function setView(view) {
    currentView = view;
    const buttons = document.querySelectorAll('.view-option');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    displayPapers();
}

function toggleFilters() {
    const panel = document.getElementById('filtersPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function refreshPapers() {
    loadPapers();
}

function filterByLevel(level) {
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.value = level;
    }
    applyFilters();
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    if (event) event.target.classList.add('active');
}

function filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.value = category;
    }
    applyFilters();
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    if (event) event.target.classList.add('active');
}

function showAllPapers() {
    resetFilters();
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    const allPapersLink = document.querySelector('.sidebar-nav a[onclick="showAllPapers()"]');
    if (allPapersLink) allPapersLink.classList.add('active');
}

// ============== BOOKMARK FUNCTIONS ==============

function toggleBookmark(id) {
    const index = bookmarks.indexOf(id);
    if (index === -1) {
        bookmarks.push(id);
        showNotification('Paper bookmarked!', 'success');
    } else {
        bookmarks.splice(index, 1);
        showNotification('Bookmark removed', 'info');
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkCount();
    displayPapers();
}

function updateBookmarkCount() {
    const bookmarkCount = document.getElementById('bookmarkCount');
    if (bookmarkCount) {
        bookmarkCount.textContent = bookmarks.length;
    }
}

function showBookmarks() {
    filteredPapers = allPapers.filter(paper => bookmarks.includes(paper.id));
    currentPage = 1;
    displayPapers();
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
    if (event) event.target.classList.add('active');
}

// ============== PAPER ACTIONS ==============

async function downloadPaper(id, fileUrl) {
    try {
        await fetch(getApiUrl('/api/analytics/track-download'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId: id })
        });
    } catch (error) {
        console.error('Error tracking download:', error);
    }
    window.open(fileUrl, '_blank');
}

function previewPaper(fileUrl) {
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    const title = document.getElementById('previewTitle');
    
    if (modal && frame && title) {
        frame.src = fileUrl;
        
        // Extract filename from URL for title
        const fileName = fileUrl.split('/').pop();
        title.textContent = `Preview: ${fileName}`;
        
        modal.classList.add('active');
    }
}

function openPDFInViewer(fileUrl, fileName, paperId) {
    // Create PDF viewer overlay
    createPDFViewerOverlay(fileUrl, fileName, paperId);
    
    // Track view for analytics
    trackPDFView(fileUrl);
    
    showNotification('Opening PDF viewer...', 'success');
}

function createPDFViewerOverlay(fileUrl, fileName, paperId) {
    console.log('Creating PDF viewer overlay for:', fileUrl, fileName, paperId);
    
    // Store current paper ID globally
    window.currentPaperId = paperId;
    
    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'pdfViewerOverlay';
    overlay.className = 'pdf-viewer-overlay';
    overlay.innerHTML = `
        <div class="pdf-viewer-container">
            <div class="pdf-viewer-header">
                <button class="pdf-viewer-back-btn" onclick="closePDFViewer()">
                    <i class="fas fa-arrow-left"></i> Back to App
                </button>
                <div class="pdf-viewer-title">${fileName.replace('.pdf', '')}</div>
                <div class="pdf-viewer-actions">
                    <button class="pdf-viewer-btn" onclick="downloadPDFFromViewer('${fileUrl}', '${fileName}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="pdf-viewer-btn" onclick="sharePDFFromViewer('${fileUrl}')">
                        <i class="fas fa-share"></i> Share
                    </button>
                    <button class="pdf-viewer-btn" onclick="openCommentModalInPDF('${paperId}', '${fileName}')">
                        <i class="fas fa-comments"></i> Comments
                    </button>
                </div>
            </div>
            <div class="pdf-viewer-content">
                <iframe src="${fileUrl}" class="pdf-viewer-frame-full"></iframe>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(overlay);
    console.log('Overlay added to body');
    
    // Show overlay with animation
    setTimeout(() => {
        overlay.classList.add('pdf-viewer-show');
        console.log('Overlay show class added');
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    console.log('PDF viewer overlay created successfully');
}

function closePDFViewer() {
    const overlay = document.getElementById('pdfViewerOverlay');
    if (overlay) {
        console.log('Closing PDF viewer overlay');
        overlay.classList.remove('pdf-viewer-show');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    }
    
    // Restore body scroll
    document.body.style.overflow = '';
}

function downloadPDFFromViewer(fileUrl, fileName) {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Downloading PDF...', 'success');
}

function sharePDFFromViewer(fileUrl) {
    const shareUrl = window.location.origin + fileUrl;
    
    if (navigator.share) {
        navigator.share({
            title: 'NESA Exam Paper',
            text: 'Check out this exam paper',
            url: shareUrl
        }).catch(err => console.log('Share failed:', err));
    } else {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showNotification('Link copied to clipboard!', 'success');
        });
    }
}

async function trackPDFView(fileUrl) {
    try {
        // Extract paper ID from file URL for tracking
        const paperId = fileUrl.match(/\/uploads\/(\d+)/)?.[1];
        if (paperId) {
            await fetch(getApiUrl('/api/analytics/track-view'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paperId: parseInt(paperId) }),
                credentials: 'include'
            });
        }
    } catch (error) {
        console.error('Error tracking view:', error);
    }
}

function closePreview() {
    const modal = document.getElementById('previewModal');
    const frame = document.getElementById('previewFrame');
    if (modal) modal.classList.remove('active');
    if (frame) frame.src = '';
}

function sharePaper(fileUrl) {
    const modal = document.getElementById('shareModal');
    const shareLink = document.getElementById('shareLink');
    if (modal && shareLink) {
        shareLink.textContent = window.location.origin + fileUrl;
        modal.classList.add('active');
    }
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) modal.classList.remove('active');
}

function shareViaWhatsApp() {
    const link = document.getElementById('shareLink')?.textContent;
    if (link) {
        window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, '_blank');
    }
}

function shareViaEmail() {
    const link = document.getElementById('shareLink')?.textContent;
    if (link) {
        window.location.href = `mailto:?subject=NESA Exam Paper&body=Check out this exam paper: ${link}`;
    }
}

function copyLink() {
    const link = document.getElementById('shareLink')?.textContent;
    if (link) {
        navigator.clipboard.writeText(link);
        showNotification('Link copied!', 'success');
        closeShareModal();
    }
}

// ============== STAFF LOGIN ==============

function showStaffLoginModal() {
    const modal = document.getElementById('staffLoginModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeStaffLoginModal() {
    const modal = document.getElementById('staffLoginModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

async function handleStaffLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('staffUsername').value;
    const password = document.getElementById('staffPassword').value;
    const errorDiv = document.getElementById('staffLoginError');
    
    errorDiv.style.display = 'none';
    
    try {
        const response = await fetch(getApiUrl('/api/auth/login'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Login failed');
        }
        
        closeStaffLoginModal();
        window.location.href = '/admin/dashboard.html';
        
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
    }
}

// ============== NOTIFICATION ==============

function showNotification(message, type = 'info', duration = 4000) {
    const container = document.getElementById('notificationContainer');
    if (!container) {
        console.log(message);
        return;
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Icon mapping for different types
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">
                <i class="fas fa-${icons[type] || icons.info}"></i>
            </div>
            <div class="notification-message">
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="closeNotification(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to container
    container.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
    
    // Auto-remove after duration
    setTimeout(() => {
        removeNotification(notification);
    }, duration);
    
    return notification;
}

function closeNotification(notification) {
    notification.classList.remove('notification-show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

function removeNotification(notification) {
    notification.classList.remove('notification-show');
    setTimeout(() => {
        notification.remove();
    }, 300);
}

// ============== COMMENT HELPER FUNCTIONS ==============

function loadComments(fileUrl) {
    // This function is for the old embedded comments - kept for compatibility
    console.log('Loading comments for:', fileUrl);
}

function displayComments(comments) {
    // This function is for the old embedded comments - kept for compatibility
    console.log('Displaying comments:', comments);
}

function displayCommentError(message) {
    // This function is for the old embedded comments - kept for compatibility
    console.log('Comment error:', message);
}

function submitComment(fileUrl) {
    // This function is for the old embedded comments - kept for compatibility
    console.log('Submitting comment for:', fileUrl);
}

function formatCommentTime(dateString) {
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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

let currentPaperId = null;

function openCommentModal(paperId, fileName) {
    console.log('Opening comment modal for paper ID:', paperId, fileName);
    currentPaperId = paperId;
    
    const modal = document.getElementById('commentModal');
    if (!modal) {
        console.error('Comment modal not found!');
        showNotification('Comment modal not found', 'error');
        return;
    }
    
    // Update modal title
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-comments"></i> Comment on ${fileName}`;
    }
    
    // Clear form
    document.getElementById('modalCommentName').value = '';
    document.getElementById('modalCommentEmail').value = '';
    document.getElementById('modalCommentText').value = '';
    
    // Show modal
    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('Comment modal opened successfully');
}

function openCommentModalInPDF(paperId, fileName) {
    console.log('Opening comment modal from PDF viewer for paper ID:', paperId, fileName);
    
    // Set current paper ID
    currentPaperId = paperId;
    
    // Find or create comment modal
    let modal = document.getElementById('commentModal');
    
    // If modal doesn't exist, create it
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'commentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2><i class="fas fa-comments"></i> Comments - ${fileName}</h2>
                    <button class="close-btn" onclick="closeCommentModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="comment-form">
                        <div class="form-group">
                            <input type="text" id="modalCommentName" placeholder="Your Name" required>
                        </div>
                        <div class="form-group">
                            <input type="email" id="modalCommentEmail" placeholder="Your Email (optional)">
                        </div>
                        <div class="form-group">
                            <textarea id="modalCommentText" placeholder="Write your comment..." rows="3" required></textarea>
                        </div>
                        <button class="btn btn-primary" onclick="submitModalComment(event)">
                            <i class="fas fa-paper-plane"></i> Post Comment
                        </button>
                    </div>
                    
                    <div class="comments-section">
                        <h3>
                            <i class="fas fa-comments"></i>
                            All Comments
                            <span class="comments-count" id="modalCommentsCount">0</span>
                        </h3>
                        <div class="comments-list" id="modalCommentsList">
                            <div class="modal-comments-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                                Loading comments...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal title
    const modalTitle = modal.querySelector('.modal-header h2');
    if (modalTitle) {
        modalTitle.innerHTML = `<i class="fas fa-comments"></i> Comments - ${fileName}`;
    }
    
    // Show modal
    modal.classList.add('active');
    loadModalComments(paperId);
    
    showNotification('Comments opened successfully', 'success');
}

function closeCommentModal() {
    console.log('Closing comment modal...');
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.classList.remove('active');
        currentPaperId = null;
    }
}

function loadModalComments(paperId) {
    const commentsList = document.getElementById('modalCommentsList');
    const commentsCount = document.getElementById('modalCommentsCount');
    
    if (!commentsList) {
        console.error('Comments list element not found!');
        return;
    }
    
    // Show loading state
    commentsList.innerHTML = `
        <div class="modal-comments-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading comments...
        </div>
    `;
    
    if (!paperId) {
        console.error('No paper ID provided');
        displayModalCommentError('Could not load comments');
        return;
    }

    console.log('Loading comments for paper ID:', paperId);

    fetch(`/api/comments/paper/${paperId}`)
        .then(response => response.json())
        .then(data => {
            console.log('Comments loaded:', data);
            if (data.success) {
                displayModalComments(data.data);
                if (commentsCount) {
                    commentsCount.textContent = data.data.length;
                }
            } else {
                throw new Error(data.message || 'Failed to load comments');
            }
        })
        .catch(error => {
            console.error('Error loading comments:', error);
            displayModalCommentError('Failed to load comments');
            if (commentsCount) {
                commentsCount.textContent = '0';
            }
        });
}

function displayModalComments(comments) {
    const commentsList = document.getElementById('modalCommentsList');
    if (!commentsList) return;
    
    console.log('Displaying comments:', comments);
    
    if (comments.length === 0) {
        commentsList.innerHTML = `
            <div class="modal-no-comments">
                <i class="fas fa-comment-slash"></i>
                No comments yet. Be the first to comment!
            </div>
        `;
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="modal-comment-item">
            <div class="modal-comment-header">
                <div class="modal-comment-author ${comment.is_admin_comment ? 'admin' : ''}">
                    ${comment.user_name}
                    ${comment.is_admin_comment ? '<span class="modal-comment-badge">Admin</span>' : ''}
                </div>
                <div class="modal-comment-time">${formatCommentTime(comment.created_at)}</div>
            </div>
            <div class="modal-comment-text">${escapeHtml(comment.comment)}</div>
        </div>
    `).join('');
}

function displayModalCommentError(message) {
    const commentsList = document.getElementById('modalCommentsList');
    if (commentsList) {
        commentsList.innerHTML = `
            <div class="modal-comments-error">
                <i class="fas fa-exclamation-triangle"></i>
                ${message}
            </div>
        `;
    }
}

function submitModalComment(event) {
    const nameInput = document.getElementById('modalCommentName');
    const emailInput = document.getElementById('modalCommentEmail');
    const commentInput = document.getElementById('modalCommentText');
    const submitBtn = event && event.target ? event.target : document.querySelector('button[onclick="submitModalComment()"]');
    
    if (!nameInput || !commentInput || !currentPaperId) return;
    
    const userName = nameInput.value.trim();
    const userEmail = emailInput.value.trim();
    const comment = commentInput.value.trim();
    
    // Validation
    if (!userName) {
        showNotification('Please enter your name', 'warning');
        nameInput.focus();
        return;
    }
    
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
    
    // Submit comment
    fetch(getApiUrl('/api/comments'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            paper_id: parseInt(currentPaperId),
            user_name: userName,
            user_email: userEmail,
            comment: comment
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            commentInput.value = '';
            
            // Reload comments
            loadModalComments(currentPaperId);
            
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

// ============== COMMENTS ==============

async function openCommentModal(paperId, subject) {
    let modal = document.getElementById('commentModal');
    
    if (!modal) {
        // Create modal if it doesn't exist
        modal = document.createElement('div');
        modal.id = 'commentModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add Comment</h2>
                    <button class="modal-close" onclick="closeCommentModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p id="paperTitle" style="color: var(--text-secondary); margin-bottom: 1.5rem;"></p>
                    <form id="commentForm" onsubmit="submitComment(event)">
                        <div class="form-group">
                            <label for="commentName">Name *</label>
                            <input type="text" id="commentName" name="name" required placeholder="Your name">
                        </div>
                        <div class="form-group">
                            <label for="commentEmail">Email (optional)</label>
                            <input type="email" id="commentEmail" name="email" placeholder="your.email@example.com">
                        </div>
                        <div class="form-group">
                            <label for="commentText">Comment *</label>
                            <textarea id="commentText" name="comment" rows="5" required placeholder="Share your thoughts about this paper..."></textarea>
                        </div>
                        <div class="form-group" style="display: none;">
                            <input type="hidden" id="commentPaperId" name="paperId" value="">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeCommentModal()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Comment</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Set paper info
    document.getElementById('paperTitle').textContent = 'Commenting on: ' + subject;
    document.getElementById('commentPaperId').value = paperId;
    document.getElementById('commentForm').reset();
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeCommentModal() {
    const modal = document.getElementById('commentModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

async function submitComment(event) {
    event.preventDefault();
    
    const paperId = document.getElementById('commentPaperId').value;
    const name = document.getElementById('commentName').value;
    const email = document.getElementById('commentEmail').value;
    const comment = document.getElementById('commentText').value;
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const response = await fetch(getApiUrl('/api/comments'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId, name, email, comment })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Comment submitted successfully!', 'success');
            closeCommentModal();
        } else {
            showNotification(data.message || 'Failed to submit comment', 'error');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        showNotification('Error submitting comment', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// ============== TRACK VISIT ==============

async function trackVisit() {
    try {
        await fetch(getApiUrl('/api/analytics/track-visit'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error tracking visit:', error);
    }
}

// ============== PAPER COMMENTS ==============

async function togglePaperComments(paperId, subject) {
    const commentsSection = document.getElementById(`comments-${paperId}`);
    if (commentsSection.style.display === 'none') {
        commentsSection.style.display = 'block';
        await loadPaperComments(paperId);
    } else {
        commentsSection.style.display = 'none';
    }
}

async function loadPaperComments(paperId) {
    try {
        const response = await fetch(`/api/comments/paper/${paperId}`);
        const data = await response.json();
        
        if (data.success) {
            displayPaperComments(paperId, data.data || []);
        } else {
            displayPaperComments(paperId, []);
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById(`comments-list-${paperId}`);
        commentsList.innerHTML = '<div class="no-comments">No comments yet</div>';
    }
}

function displayPaperComments(paperId, comments) {
    const commentsList = document.getElementById(`comments-list-${paperId}`);
    
    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
        return;
    }
    
    commentsList.innerHTML = comments.map(comment => `
        <div class="comment-item">
            <div class="comment-header">
                <strong class="comment-author">${escapeHtml(comment.user_name)}</strong>
                <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
            </div>
            <p class="comment-text">${escapeHtml(comment.comment)}</p>
        </div>
    `).join('');
}

async function submitPaperComment(event, paperId) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('.comment-name').value;
    const email = form.querySelector('.comment-email').value;
    const comment = form.querySelector('.comment-text').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
        
        const response = await fetch('/api/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId, name, email, comment })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showNotification('Comment posted successfully!', 'success');
            form.reset();
            await loadPaperComments(paperId);
        } else {
            showNotification(data.message || 'Failed to post comment', 'error');
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        showNotification('Error posting comment', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Post Comment';
    }
}

// Make functions globally available
window.showAllPapers = showAllPapers;
window.filterByLevel = filterByLevel;
window.filterByCategory = filterByCategory;
window.showBookmarks = showBookmarks;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.setView = setView;
window.changePage = changePage;
window.toggleFilters = toggleFilters;
window.refreshPapers = refreshPapers;
window.downloadPaper = downloadPaper;
window.previewPaper = previewPaper;
window.closePreview = closePreview;
window.openPDFInViewer = openPDFInViewer;
window.createPDFViewerOverlay = createPDFViewerOverlay;
window.closePDFViewer = closePDFViewer;
window.downloadPDFFromViewer = downloadPDFFromViewer;
window.sharePDFFromViewer = sharePDFFromViewer;
window.sharePaper = sharePaper;
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.submitComment = submitComment;
window.togglePaperComments = togglePaperComments;
window.loadPaperComments = loadPaperComments;
window.displayPaperComments = displayPaperComments;
window.submitPaperComment = submitPaperComment;
window.closeShareModal = closeShareModal;
window.shareViaWhatsApp = shareViaWhatsApp;
window.shareViaEmail = shareViaEmail;
window.copyLink = copyLink;
window.toggleBookmark = toggleBookmark;
window.showStaffLoginModal = showStaffLoginModal;
window.closeStaffLoginModal = closeStaffLoginModal;
window.handleStaffLogin = handleStaffLogin;
window.trackVisit = trackVisit;
window.showNotification = showNotification;
window.closeNotification = closeNotification;
window.removeNotification = removeNotification;
window.loadComments = loadComments;
window.displayComments = displayComments;
window.displayCommentError = displayCommentError;
window.submitComment = submitComment;
window.formatCommentTime = formatCommentTime;
window.escapeHtml = escapeHtml;
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.openCommentModalInPDF = openCommentModalInPDF;
window.loadModalComments = loadModalComments;
window.displayModalComments = displayModalComments;
window.displayModalCommentError = displayModalCommentError;
window.submitModalComment = submitModalComment;