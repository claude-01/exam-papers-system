// ========================================
// NESA PUBLIC PORTAL - ENHANCED VERSION
// ========================================

let allPapers = [];
let filteredPapers = [];
let currentPage = 1;
const itemsPerPage = 12;
let currentView = 'grid';
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
let selectedLanguage = localStorage.getItem('portal_language') || 'en';
let currentPreviewPaper = null;
let searchTimeout = null;
let searchSuggestions = [];
let trendingPapers = [];

const translations = {
    en: {
        searchPlaceholder: 'Search by subject, year, or keyword...',
        relatedPapers: 'Related Papers',
        comments: 'Comments',
        postComment: 'Post Comment',
        noComments: 'No comments yet. Be the first to comment.',
        noRelated: 'No related papers found.',
        downloading: 'Download started',
        bookmarked: 'Paper bookmarked',
        bookmarkRemoved: 'Bookmark removed',
        commentPosted: 'Comment posted successfully',
        commentFailed: 'Failed to post comment',
        replyLabel: 'Admin',
        trendingPapers: 'Trending Papers',
        searchSuggestions: 'Suggestions',
        noResults: 'No papers found',
        searching: 'Searching...'
    },
    fr: {
        searchPlaceholder: 'Rechercher par matiere, annee ou mot-cle...',
        relatedPapers: 'Documents similaires',
        comments: 'Commentaires',
        postComment: 'Publier le commentaire',
        noComments: 'Aucun commentaire pour le moment.',
        noRelated: 'Aucun document similaire trouve.',
        downloading: 'Telechargement demarre',
        bookmarked: 'Document enregistre',
        bookmarkRemoved: 'Favori supprime',
        commentPosted: 'Commentaire publie avec succes',
        commentFailed: 'Echec de publication du commentaire',
        replyLabel: 'Admin',
        trendingPapers: 'Documents Tendance',
        searchSuggestions: 'Suggestions',
        noResults: 'Aucun document trouve',
        searching: 'Recherche...'
    },
    rw: {
        searchPlaceholder: 'Shakisha ukoresheje isomo, umwaka cyangwa ijambo...',
        relatedPapers: 'Impapuro zifitanye isano',
        comments: 'Ibitekerezo',
        postComment: 'Ohereza igitekerezo',
        noComments: 'Nta bitekerezo biratangwa.',
        noRelated: 'Nta mpapuro zifitanye isano zabonetse.',
        downloading: 'Gukuramo byatangiye',
        bookmarked: 'Impapuro zabitswe',
        bookmarkRemoved: 'Ububiko bwakuweho',
        commentPosted: 'Igitekerezo cyoherejwe neza',
        commentFailed: 'Ntibikunze kohereza igitekerezo',
        replyLabel: 'Admin',
        trendingPapers: 'Impapuro Zihariye',
        searchSuggestions: 'Ibyashizweho',
        noResults: 'Nta mpapuro zabonetse',
        searching: 'Gushakisha...'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('NESA Public Portal initialized');
    setupEventListeners();
    populateYearFilter();
    applyLanguage(selectedLanguage);
    updateBookmarkCount();
    loadPapers();
    loadTrendingPapers();
});

// ============== STAFF LOGIN FUNCTIONS ==============

function showStaffLoginModal() {
    const modal = document.getElementById('staffLoginModal');
    if (modal) {
        modal.classList.add('active');
        document.getElementById('staffUsername')?.focus();
    }
}

function closeStaffLoginModal() {
    const modal = document.getElementById('staffLoginModal');
    if (modal) {
        modal.classList.remove('active');
        const username = document.getElementById('staffUsername');
        const password = document.getElementById('staffPassword');
        const errorDiv = document.getElementById('staffLoginError');
        if (username) username.value = '';
        if (password) password.value = '';
        if (errorDiv) errorDiv.style.display = 'none';
    }
}

async function handleStaffLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('staffUsername').value;
    const password = document.getElementById('staffPassword').value;
    const errorDiv = document.getElementById('staffLoginError');
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Invalid credentials');
        }
        
        // Success - redirect to admin dashboard
        window.location.href = '/admin/dashboard.html';
        
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = 'block';
        }
        
        // Reset button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Close modal when clicking outside
window.addEventListener('click', function(e) {
    const modal = document.getElementById('staffLoginModal');
    if (e.target === modal) {
        closeStaffLoginModal();
    }
});

// Make sure to add these to the window object at the bottom of your file
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            handleAdvancedSearch(this.value);
        });
        
        searchInput.addEventListener('focus', function() {
            if (this.value.length >= 2) {
                showSearchSuggestions();
            }
        });
        
        searchInput.addEventListener('blur', function() {
            setTimeout(() => hideSearchSuggestions(), 200);
        });
    }
    document.getElementById('yearFilter')?.addEventListener('change', filterPapers);
    document.getElementById('levelFilter')?.addEventListener('change', filterPapers);
    document.getElementById('categoryFilter')?.addEventListener('change', filterPapers);
    document.getElementById('subjectFilter')?.addEventListener('change', filterPapers);

    document.getElementById('menuToggle')?.addEventListener('click', function() {
        document.querySelector('.public-sidebar').classList.toggle('active');
    });

    document.getElementById('languageSelect')?.addEventListener('change', function(e) {
        applyLanguage(e.target.value);
    });

    document.getElementById('commentForm')?.addEventListener('submit', handleCommentSubmit);

    const previewModal = document.getElementById('previewModal');
    window.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closePreview();
        }
        const staffModal = document.getElementById('staffLoginModal');
        if (e.target === staffModal) {
            closeStaffLoginModal();
        }
    });
}

function t(key) {
    return translations[selectedLanguage]?.[key] || translations.en[key] || key;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function updateBookmarkCount() {
    const el = document.getElementById('bookmarkCount');
    if (el) el.textContent = bookmarks.length;
}

function applyLanguage(lang) {
    selectedLanguage = translations[lang] ? lang : 'en';
    localStorage.setItem('portal_language', selectedLanguage);
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) languageSelect.value = selectedLanguage;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');
    const relatedTitle = document.querySelector('#relatedPapersSection h3');
    if (relatedTitle) relatedTitle.textContent = t('relatedPapers');
    const commentsTitle = document.querySelector('#commentsSection h3');
    if (commentsTitle) commentsTitle.textContent = t('comments');
    const submitBtn = document.querySelector('#commentForm button[type="submit"]');
    if (submitBtn) submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t('postComment')}`;
}

function populateYearFilter() {
    const yearFilter = document.getElementById('yearFilter');
    if (!yearFilter) return;
    
    const currentYear = new Date().getFullYear();
    yearFilter.innerHTML = '<option value="">All Years</option>';
    for (let year = currentYear; year >= 2000; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }
}

async function loadPapers() {
    console.log('Loading papers...');
    
    const container = document.getElementById('papersContainer');
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    try {
        const response = await fetch('/api/papers/public');
        const data = await response.json();
        
        console.log('API Response:', data);
        
        if (data.success && Array.isArray(data.data)) {
            allPapers = data.data;
        } else if (Array.isArray(data)) {
            allPapers = data;
        } else {
            allPapers = [];
        }
        
        console.log(`Loaded ${allPapers.length} papers`);
        
        document.getElementById('totalPapersCount').textContent = allPapers.length;
        document.getElementById('totalDownloadsCount').textContent = allPapers.reduce((sum, p) => sum + (p.download_count || 0), 0);
        document.getElementById('yearsCount').textContent = [...new Set(allPapers.map(p => p.year))].length;
        
        // Populate subject filter
        populateSubjectFilter();
        
        filteredPapers = [...allPapers];
        document.getElementById('showingCount').textContent = filteredPapers.length;
        displayPapers();
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ef4444;"></i>
                <h3>Failed to load papers</h3>
                <p>${error.message}</p>
                <button onclick="loadPapers()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
                    Retry
                </button>
            </div>
        `;
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

async function handleAdvancedSearch(query) {
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
        filteredPapers = allPapers;
        document.getElementById('showingCount').textContent = filteredPapers.length;
        currentPage = 1;
        displayPapers();
        hideSearchSuggestions();
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const year = document.getElementById('yearFilter')?.value || '';
            const level = document.getElementById('levelFilter')?.value || '';
            const category = document.getElementById('categoryFilter')?.value || '';
            
            const params = new URLSearchParams({ q: query });
            if (year) params.append('year', year);
            if (level) params.append('level', level);
            if (category) params.append('category', category);
            
            const response = await fetch(`/api/papers/public/search?${params}`);
            const data = await response.json();
            
            if (data.success) {
                filteredPapers = data.data;
                searchSuggestions = data.data.slice(0, 5);
                document.getElementById('showingCount').textContent = filteredPapers.length;
                currentPage = 1;
                displayPapers();
                
                if (query.length >= 2) {
                    showSearchSuggestions();
                }
            }
        } catch (error) {
            console.error('Search error:', error);
            filteredPapers = allPapers.filter(paper => 
                paper.subject.toLowerCase().includes(query.toLowerCase())
            );
            document.getElementById('showingCount').textContent = filteredPapers.length;
            currentPage = 1;
            displayPapers();
        }
    }, 300);
}

function showSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (!container || searchSuggestions.length === 0) return;
    
    container.innerHTML = `
        <div class="suggestions-dropdown">
            <div class="suggestions-header">${t('searchSuggestions')}</div>
            ${searchSuggestions.map(paper => `
                <div class="suggestion-item" onclick="selectSuggestion('${escapeHtml(paper.subject)}')">
                    <strong>${escapeHtml(paper.subject)}</strong>
                    <span>${paper.level} - ${paper.year}</span>
                </div>
            `).join('')}
        </div>
    `;
    container.style.display = 'block';
}

function hideSearchSuggestions() {
    const container = document.getElementById('searchSuggestions');
    if (container) {
        container.style.display = 'none';
    }
}

function selectSuggestion(subject) {
    document.getElementById('searchInput').value = subject;
    hideSearchSuggestions();
    handleAdvancedSearch(subject);
}

async function loadTrendingPapers() {
    try {
        const response = await fetch('/api/papers/public/trending?limit=8');
        const data = await response.json();
        
        if (data.success) {
            trendingPapers = data.data;
            displayTrendingPapers();
        }
    } catch (error) {
        console.error('Error loading trending papers:', error);
    }
}

function displayTrendingPapers() {
    const container = document.getElementById('trendingPapersContainer');
    if (!container || trendingPapers.length === 0) return;
    
    container.innerHTML = `
        <section class="trending-section">
            <h3>${t('trendingPapers')}</h3>
            <div class="trending-grid">
                ${trendingPapers.map(paper => `
                    <div class="trending-paper" onclick="previewPaper(${paper.id})">
                        <div class="trending-number">🔥</div>
                        <div class="trending-content">
                            <h4>${escapeHtml(paper.subject)}</h4>
                            <p>${paper.level} - ${paper.year}</p>
                            <div class="trending-stats">
                                <span><i class="fas fa-download"></i> ${paper.download_count}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function filterPapers() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const level = document.getElementById('levelFilter')?.value || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const subject = document.getElementById('subjectFilter')?.value || '';
    
    filteredPapers = allPapers.filter(paper => {
        const matchesSearch = paper.subject.toLowerCase().includes(searchTerm);
        const matchesYear = !year || paper.year.toString() === year;
        const matchesLevel = !level || paper.level === level;
        const matchesCategory = !category || paper.category === category;
        const matchesSubject = !subject || paper.subject === subject;
        
        return matchesSearch && matchesYear && matchesLevel && matchesCategory && matchesSubject;
    });
    
    document.getElementById('showingCount').textContent = filteredPapers.length;
    currentPage = 1;
    displayPapers();
}

function displayPapers() {
    const container = document.getElementById('papersContainer');
    
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedPapers = filteredPapers.slice(start, start + itemsPerPage);
    
    document.getElementById('showingCount').textContent = filteredPapers.length;
    if (filteredPapers.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem;">No papers found</div>';
        return;
    }
    
    container.className = `papers-container ${currentView}-view`;
    container.innerHTML = paginatedPapers.map(paper => {
        const fileUrl = paper.file_path ? `/${paper.file_path.replace(/\\/g, '/')}` : '#';
        const isBookmarked = bookmarks.includes(paper.id);
        
        return `
            <div class="paper-card ${currentView}" data-id="${paper.id}">
                <div class="paper-header">
                    <span class="paper-type ${(paper.category || 'general').toLowerCase()}">
                        ${paper.category || 'General'}
                    </span>
                    <span>${paper.year}</span>
                </div>
                <div class="paper-body">
                    <h3>${paper.subject}</h3>
                    <div class="paper-meta">
                        <span><i class="fas fa-graduation-cap"></i> ${paper.level}</span>
                        ${paper.trade_or_combination ? 
                            `<span><i class="fas fa-tag"></i> ${paper.trade_or_combination}</span>` : ''}
                    </div>
                </div>
                <div class="paper-actions">
                    <button class="action-btn download" onclick="downloadPaper(${paper.id}, '${fileUrl}')" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="action-btn preview" onclick="previewPaper(${paper.id})" title="Preview">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn bookmark ${isBookmarked ? 'active' : ''}" 
                            onclick="toggleBookmark(${paper.id})" title="Bookmark">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    updatePagination();
}

function updatePagination() {
    const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = currentPage <= 1;
    document.getElementById('nextPage').disabled = currentPage >= totalPages;
}

function changePage(direction) {
    currentPage += direction;
    displayPapers();
}

function setView(view) {
    currentView = view;
    displayPapers();
}

function toggleFilters() {
    document.getElementById('filtersPanel').classList.toggle('active');
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subjectFilter').value = '';
    filterPapers();
}

function applyFilters() {
    filterPapers();
    document.getElementById('filtersPanel').classList.remove('active');
}

async function downloadPaper(id, fileUrl) {
    try {
        await fetch('/api/analytics/track-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paperId: id })
        });
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        link.rel = 'noopener';
        document.body.appendChild(link);
        link.click();
        link.remove();
        showNotification(t('downloading'));
    } catch (error) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}

async function previewPaper(paperId) {
    const paper = allPapers.find((p) => p.id === paperId);
    if (!paper) return;
    currentPreviewPaper = paper;

    const fileUrl = paper.file_path ? `/${paper.file_path.replace(/\\/g, '/')}` : '';
    const frame = document.getElementById('previewFrame');
    frame.src = '';
    requestAnimationFrame(() => { frame.src = fileUrl; });
    document.getElementById('previewTitle').textContent = `${paper.subject} - ${paper.year}`;

    const downloadBtn = document.getElementById('viewerDownloadBtn');
    if (downloadBtn) downloadBtn.onclick = () => downloadPaper(paper.id, fileUrl);
    const bookmarkBtn = document.getElementById('viewerBookmarkBtn');
    if (bookmarkBtn) {
        bookmarkBtn.classList.toggle('active', bookmarks.includes(paper.id));
        bookmarkBtn.onclick = () => {
            toggleBookmark(paper.id);
            bookmarkBtn.classList.toggle('active', bookmarks.includes(paper.id));
        };
    }

    document.getElementById('previewModal').classList.add('active');
    await Promise.all([loadRelatedPapers(paper), loadComments(paper.id)]);
}

function closePreview() {
    document.getElementById('previewModal').classList.remove('active');
    document.getElementById('previewFrame').src = '';
    currentPreviewPaper = null;
}

function toggleBookmark(id) {
    const index = bookmarks.indexOf(id);
    if (index === -1) {
        bookmarks.push(id);
        showNotification(t('bookmarked'));
    } else {
        bookmarks.splice(index, 1);
        showNotification(t('bookmarkRemoved'));
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    document.getElementById('bookmarkCount').textContent = bookmarks.length;
    displayPapers();
}

function showBookmarks() {
    filteredPapers = allPapers.filter(paper => bookmarks.includes(paper.id));
    currentPage = 1;
    displayPapers();
}

function filterByCategory(category) {
    document.getElementById('categoryFilter').value = category;
    filterPapers();
}

function filterByLevel(level) {
    document.getElementById('levelFilter').value = level;
    filterPapers();
}

function showAllPapers() {
    document.getElementById('searchInput').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('levelFilter').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('subjectFilter').value = '';
    filterPapers();
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #1a1e24;
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        border-left: 4px solid #3b82f6;
        z-index: 9999;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

async function loadRelatedPapers(paper) {
    const container = document.getElementById('relatedPapersList');
    if (!container) return;
    container.innerHTML = '<div class="loading-spinner"></div>';
    try {
        const res = await fetch(`/api/papers/public/${paper.id}/related?limit=6`);
        const data = await res.json();
        const related = data.success ? data.data : [];
        if (!related.length) {
            container.innerHTML = `<p class="empty-text">${t('noRelated')}</p>`;
            return;
        }
        container.innerHTML = related.map((item) => `
            <button type="button" class="related-paper-item" onclick="previewPaper(${item.id})">
                <strong>${escapeHtml(item.subject)}</strong>
                <span>${escapeHtml(item.level)} - ${escapeHtml(item.year)}</span>
            </button>
        `).join('');
    } catch (error) {
        container.innerHTML = `<p class="empty-text">${t('noRelated')}</p>`;
    }
}

async function loadComments(paperId) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) return;
    commentsList.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const res = await fetch(`/api/papers/public/${paperId}/comments`);
        const data = await res.json();
        const comments = data.success ? data.data : [];
        if (!comments.length) {
            commentsList.innerHTML = `<p class="empty-text">${t('noComments')}</p>`;
            return;
        }

        commentsList.innerHTML = comments.map((comment) => `
            <div class="comment-item ${comment.is_admin_comment ? 'admin-comment' : ''}">
                <div class="comment-meta">
                    <strong>${escapeHtml(comment.user_name)}</strong>
                    ${comment.is_admin_comment ? `<span class="admin-tag">${t('replyLabel')}</span>` : ''}
                    <span>${new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <p>${escapeHtml(comment.comment)}</p>
            </div>
        `).join('');
    } catch (error) {
        commentsList.innerHTML = `<p class="empty-text">${t('noComments')}</p>`;
    }
}

async function handleCommentSubmit(event) {
    event.preventDefault();
    if (!currentPreviewPaper) return;

    const nameInput = document.getElementById('commentName');
    const emailInput = document.getElementById('commentEmail');
    const commentInput = document.getElementById('commentText');
    const comment = commentInput.value.trim();
    if (!comment) return;

    try {
        const response = await fetch(`/api/papers/public/${currentPreviewPaper.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_name: nameInput.value.trim() || 'Anonymous',
                user_email: emailInput.value.trim(),
                comment
            })
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
            throw new Error(result.message || t('commentFailed'));
        }
        commentInput.value = '';
        showNotification(t('commentPosted'));
        await loadComments(currentPreviewPaper.id);
    } catch (error) {
        showNotification(t('commentFailed'));
    }
}

function refreshPapers() {
    loadPapers();
}

function trackVisit() {
    fetch('/api/analytics/track-visit', { method: 'POST' }).catch(() => {});
}

// Make functions global
window.filterByCategory = filterByCategory;
window.filterByLevel = filterByLevel;
window.showAllPapers = showAllPapers;
window.toggleFilters = toggleFilters;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;
window.setView = setView;
window.downloadPaper = downloadPaper;
window.previewPaper = previewPaper;
window.closePreview = closePreview;
window.toggleBookmark = toggleBookmark;
window.showBookmarks = showBookmarks;
window.changePage = changePage;
window.refreshPapers = refreshPapers;
window.loadPapers = loadPapers;
window.showStaffLoginModal = showStaffLoginModal;
window.closeStaffLoginModal = closeStaffLoginModal;
window.handleStaffLogin = handleStaffLogin;
window.handleAdvancedSearch = handleAdvancedSearch;
window.selectSuggestion = selectSuggestion;
window.loadTrendingPapers = loadTrendingPapers;
