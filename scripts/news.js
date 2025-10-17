/**
 * Financial News Page Logic
 * Handles news display, filtering, search, and pagination
 */

class NewsPage {
    constructor() {
        this.newsService = new NewsService();
        this.state = {
            currentCategory: 'all',
            currentQuery: '',
            currentPage: 1,
            articlesPerPage: 12,
            allArticles: [],
            filteredArticles: []
        };
        
        this.elements = {
            newsGrid: document.getElementById('newsGrid'),
            newsLoading: document.getElementById('newsLoading'),
            newsError: document.getElementById('newsError'),
            newsPagination: document.getElementById('newsPagination'),
            searchInput: document.getElementById('newsSearch'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            totalArticles: document.getElementById('totalArticles'),
            lastUpdate: document.getElementById('lastUpdate'),
            trendingTopics: document.getElementById('trendingTopics'),
            prevPageBtn: document.getElementById('prevPage'),
            nextPageBtn: document.getElementById('nextPage'),
            pageInfo: document.getElementById('pageInfo'),
            retryBtn: document.getElementById('retryBtn')
        };
        
        this.init();
    }

    /**
     * Initialize the news page
     */
    async init() {
        this.setupEventListeners();
        await this.loadNews();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Filter buttons
        this.elements.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilterClick(btn));
        });

        // Search input with debouncing
        let searchTimeout;
        this.elements.searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearch(e.target.value);
            }, 300);
        });

        // Pagination buttons
        this.elements.prevPageBtn?.addEventListener('click', () => this.prevPage());
        this.elements.nextPageBtn?.addEventListener('click', () => this.nextPage());

        // Retry button
        this.elements.retryBtn?.addEventListener('click', () => this.loadNews());
    }

    /**
     * Load news from service
     */
    async loadNews() {
        this.showLoading();
        this.hideError();

        try {
            const articles = await this.newsService.fetchNews({
                category: this.state.currentCategory,
                query: this.state.currentQuery
            });

            this.state.allArticles = articles;
            this.filterAndDisplay();
            this.updateStats();
            this.updateTrendingTopics();

        } catch (error) {
            console.error('Failed to load news:', error);
            this.showError('Failed to load news. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Handle filter button click
     */
    handleFilterClick(button) {
        const category = button.dataset.category;
        
        // Update active state
        this.elements.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Update state and reload
        this.state.currentCategory = category;
        this.state.currentPage = 1;
        this.filterAndDisplay();
    }

    /**
     * Handle search input
     */
    handleSearch(query) {
        this.state.currentQuery = query;
        this.state.currentPage = 1;
        this.filterAndDisplay();
    }

    /**
     * Filter articles and display current page
     */
    filterAndDisplay() {
        // Filter articles
        let filtered = this.state.allArticles;

        // Apply category filter
        if (this.state.currentCategory !== 'all') {
            filtered = filtered.filter(article => 
                article.category === this.state.currentCategory
            );
        }

        // Apply search filter
        if (this.state.currentQuery) {
            const query = this.state.currentQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(query) ||
                article.description.toLowerCase().includes(query) ||
                article.source.toLowerCase().includes(query)
            );
        }

        this.state.filteredArticles = filtered;
        this.displayCurrentPage();
        this.updatePagination();
    }

    /**
     * Display articles for current page
     */
    displayCurrentPage() {
        const start = (this.state.currentPage - 1) * this.state.articlesPerPage;
        const end = start + this.state.articlesPerPage;
        const pageArticles = this.state.filteredArticles.slice(start, end);

        if (pageArticles.length === 0) {
            this.elements.newsGrid.innerHTML = this.getEmptyState();
            return;
        }

        this.elements.newsGrid.innerHTML = pageArticles
            .map(article => this.createArticleCard(article))
            .join('');
    }

    /**
     * Create article card HTML
     */
    createArticleCard(article) {
        const timeAgo = this.getTimeAgo(article.publishedAt);
        const categoryBadge = this.getCategoryBadge(article.category);
        
        return `
            <article class="news-card">
                ${article.image ? `
                    <div class="news-card-image">
                        <img src="${article.image}" alt="${article.title}" 
                             onerror="this.parentElement.style.display='none'">
                    </div>
                ` : ''}
                <div class="news-card-content">
                    <div class="news-card-header">
                        ${categoryBadge}
                        <span class="news-card-time">${timeAgo}</span>
                    </div>
                    <h3 class="news-card-title">
                        <a href="${article.url}" target="_blank" rel="noopener noreferrer">
                            ${article.title}
                        </a>
                    </h3>
                    <p class="news-card-description">${article.description}</p>
                    <div class="news-card-footer">
                        <span class="news-card-source">
                            <span class="material-icons-sharp">article</span>
                            ${article.source}
                        </span>
                        ${article.author !== 'Unknown' ? `
                            <span class="news-card-author">
                                <span class="material-icons-sharp">person</span>
                                ${article.author}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Get category badge HTML
     */
    getCategoryBadge(category) {
        const badges = {
            markets: '<span class="category-badge badge-primary">Markets</span>',
            crypto: '<span class="category-badge badge-warning">Crypto</span>',
            commodities: '<span class="category-badge badge-success">Commodities</span>',
            forex: '<span class="category-badge badge-info">Forex</span>'
        };
        return badges[category] || '<span class="category-badge badge-primary">News</span>';
    }

    /**
     * Get empty state HTML
     */
    getEmptyState() {
        return `
            <div class="news-empty-state">
                <span class="material-icons-sharp">feed</span>
                <h3>No articles found</h3>
                <p>Try adjusting your filters or search query</p>
            </div>
        `;
    }

    /**
     * Update pagination controls
     */
    updatePagination() {
        const totalPages = Math.ceil(
            this.state.filteredArticles.length / this.state.articlesPerPage
        );

        // Update page info
        if (this.elements.pageInfo) {
            this.elements.pageInfo.textContent = 
                `Page ${this.state.currentPage} of ${totalPages || 1}`;
        }

        // Update button states
        if (this.elements.prevPageBtn) {
            this.elements.prevPageBtn.disabled = this.state.currentPage === 1;
        }
        
        if (this.elements.nextPageBtn) {
            this.elements.nextPageBtn.disabled = 
                this.state.currentPage >= totalPages || totalPages === 0;
        }

        // Show/hide pagination
        if (this.elements.newsPagination) {
            this.elements.newsPagination.style.display = 
                totalPages > 1 ? 'flex' : 'none';
        }
    }

    /**
     * Go to previous page
     */
    prevPage() {
        if (this.state.currentPage > 1) {
            this.state.currentPage--;
            this.displayCurrentPage();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    /**
     * Go to next page
     */
    nextPage() {
        const totalPages = Math.ceil(
            this.state.filteredArticles.length / this.state.articlesPerPage
        );
        
        if (this.state.currentPage < totalPages) {
            this.state.currentPage++;
            this.displayCurrentPage();
            this.updatePagination();
            this.scrollToTop();
        }
    }

    /**
     * Update stats in sidebar
     */
    updateStats() {
        // Update total articles count
        if (this.elements.totalArticles) {
            this.elements.totalArticles.textContent = 
                this.state.allArticles.length;
        }

        // Update last update time
        if (this.elements.lastUpdate) {
            const now = new Date();
            this.elements.lastUpdate.textContent = 
                now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
        }
    }

    /**
     * Update trending topics
     */
    updateTrendingTopics() {
        if (!this.elements.trendingTopics) return;

        const topics = this.newsService.getTrendingTopics(this.state.allArticles, 8);
        
        this.elements.trendingTopics.innerHTML = topics
            .map(topic => `<span class="topic-tag">${topic}</span>`)
            .join('');
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.elements.newsLoading) {
            this.elements.newsLoading.style.display = 'flex';
        }
        if (this.elements.newsGrid) {
            this.elements.newsGrid.style.display = 'none';
        }
        if (this.elements.newsPagination) {
            this.elements.newsPagination.style.display = 'none';
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        if (this.elements.newsLoading) {
            this.elements.newsLoading.style.display = 'none';
        }
        if (this.elements.newsGrid) {
            this.elements.newsGrid.style.display = 'grid';
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        if (this.elements.newsError) {
            this.elements.newsError.querySelector('p').textContent = message;
            this.elements.newsError.style.display = 'flex';
        }
        if (this.elements.newsGrid) {
            this.elements.newsGrid.style.display = 'none';
        }
    }

    /**
     * Hide error state
     */
    hideError() {
        if (this.elements.newsError) {
            this.elements.newsError.style.display = 'none';
        }
    }

    /**
     * Get time ago string
     */
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [unit, secondsInUnit] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInUnit);
            if (interval >= 1) {
                return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
            }
        }

        return 'Just now';
    }

    /**
     * Scroll to top of news grid
     */
    scrollToTop() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.newsPage = new NewsPage();
    });
} else {
    window.newsPage = new NewsPage();
}
