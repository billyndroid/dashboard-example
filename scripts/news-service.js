/**
 * Financial News Service
 * Fetches financial news from multiple reliable sources with fallback mechanisms
 * Supports NewsAPI, Alpha Vantage News, and mock data
 */

class NewsService {
    constructor() {
        // API Configuration - Users should add their own API keys
        this.config = {
            newsapi: {
                enabled: false, // Set to true when API key is added
                key: '', // Get free key from https://newsapi.org
                baseUrl: 'https://newsapi.org/v2'
            },
            alphaVantage: {
                enabled: false, // Set to true when API key is added
                key: '', // Get free key from https://www.alphavantage.co
                baseUrl: 'https://www.alphavantage.co/query'
            },
            useMockData: true // Fallback to mock data when APIs are not configured
        };

        this.cache = {
            articles: [],
            timestamp: null,
            ttl: 5 * 60 * 1000 // 5 minutes cache
        };

        this.categories = {
            all: ['business', 'finance', 'markets', 'economy'],
            markets: ['stock market', 'wall street', 'nasdaq', 'dow jones', 's&p 500'],
            crypto: ['bitcoin', 'ethereum', 'cryptocurrency', 'blockchain'],
            commodities: ['gold', 'oil', 'silver', 'commodities'],
            forex: ['forex', 'currency', 'dollar', 'euro']
        };
    }

    /**
     * Fetch financial news with automatic fallback
     * @param {Object} options - Fetch options (category, query, pageSize)
     * @returns {Promise<Array>} Array of news articles
     */
    async fetchNews(options = {}) {
        const { category = 'all', query = '', pageSize = 20 } = options;

        // Check cache first
        if (this.isCacheValid()) {
            console.log('Returning cached news articles');
            return this.filterArticles(this.cache.articles, category, query);
        }

        try {
            let articles = [];

            // Try NewsAPI first
            if (this.config.newsapi.enabled && this.config.newsapi.key) {
                articles = await this.fetchFromNewsAPI(category, pageSize);
            }
            // Try Alpha Vantage as backup
            else if (this.config.alphaVantage.enabled && this.config.alphaVantage.key) {
                articles = await this.fetchFromAlphaVantage(category, pageSize);
            }
            // Use mock data as fallback
            else if (this.config.useMockData) {
                console.log('Using mock financial news data');
                articles = this.getMockNews();
            } else {
                throw new Error('No news sources configured');
            }

            // Update cache
            this.cache.articles = articles;
            this.cache.timestamp = Date.now();

            return this.filterArticles(articles, category, query);

        } catch (error) {
            console.error('Error fetching news:', error);
            
            // Return cached data if available, otherwise mock data
            if (this.cache.articles.length > 0) {
                console.log('Returning stale cached data due to error');
                return this.filterArticles(this.cache.articles, category, query);
            }
            
            return this.getMockNews();
        }
    }

    /**
     * Fetch news from NewsAPI
     * @param {string} category - News category
     * @param {number} pageSize - Number of articles
     * @returns {Promise<Array>} Articles
     */
    async fetchFromNewsAPI(category, pageSize) {
        const keywords = this.categories[category] || this.categories.all;
        const query = keywords.join(' OR ');
        
        const url = `${this.config.newsapi.baseUrl}/everything?` +
            `q=${encodeURIComponent(query)}&` +
            `language=en&` +
            `sortBy=publishedAt&` +
            `pageSize=${pageSize}&` +
            `apiKey=${this.config.newsapi.key}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeNewsAPIArticles(data.articles || []);
    }

    /**
     * Fetch news from Alpha Vantage
     * @param {string} category - News category
     * @param {number} pageSize - Number of articles
     * @returns {Promise<Array>} Articles
     */
    async fetchFromAlphaVantage(category, pageSize) {
        const topics = category === 'all' ? 'financial_markets' : category;
        
        const url = `${this.config.alphaVantage.baseUrl}?` +
            `function=NEWS_SENTIMENT&` +
            `topics=${topics}&` +
            `sort=LATEST&` +
            `limit=${pageSize}&` +
            `apikey=${this.config.alphaVantage.key}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Alpha Vantage error: ${response.status}`);
        }

        const data = await response.json();
        return this.normalizeAlphaVantageArticles(data.feed || []);
    }

    /**
     * Normalize NewsAPI articles to common format
     */
    normalizeNewsAPIArticles(articles) {
        return articles.map(article => ({
            id: this.generateId(article.url),
            title: article.title,
            description: article.description || 'No description available',
            url: article.url,
            source: article.source?.name || 'Unknown',
            author: article.author || 'Unknown',
            publishedAt: new Date(article.publishedAt),
            image: article.urlToImage,
            category: this.detectCategory(article.title + ' ' + article.description)
        }));
    }

    /**
     * Normalize Alpha Vantage articles to common format
     */
    normalizeAlphaVantageArticles(articles) {
        return articles.map(article => ({
            id: this.generateId(article.url),
            title: article.title,
            description: article.summary || 'No description available',
            url: article.url,
            source: article.source || 'Unknown',
            author: article.authors?.join(', ') || 'Unknown',
            publishedAt: new Date(article.time_published),
            image: article.banner_image,
            category: this.detectCategory(article.title + ' ' + article.summary),
            sentiment: article.overall_sentiment_label
        }));
    }

    /**
     * Filter articles by category and search query
     */
    filterArticles(articles, category, query) {
        let filtered = articles;

        // Filter by category
        if (category !== 'all') {
            filtered = filtered.filter(article => 
                article.category === category ||
                this.categories[category]?.some(keyword => 
                    article.title.toLowerCase().includes(keyword.toLowerCase()) ||
                    article.description.toLowerCase().includes(keyword.toLowerCase())
                )
            );
        }

        // Filter by search query
        if (query) {
            const searchLower = query.toLowerCase();
            filtered = filtered.filter(article =>
                article.title.toLowerCase().includes(searchLower) ||
                article.description.toLowerCase().includes(searchLower) ||
                article.source.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }

    /**
     * Detect article category from content
     */
    detectCategory(content) {
        const contentLower = content.toLowerCase();
        
        for (const [category, keywords] of Object.entries(this.categories)) {
            if (category === 'all') continue;
            
            if (keywords.some(keyword => contentLower.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        
        return 'markets';
    }

    /**
     * Check if cache is still valid
     */
    isCacheValid() {
        if (!this.cache.timestamp || this.cache.articles.length === 0) {
            return false;
        }
        
        return (Date.now() - this.cache.timestamp) < this.cache.ttl;
    }

    /**
     * Generate unique ID from URL
     */
    generateId(url) {
        return btoa(url).slice(0, 16);
    }

    /**
     * Get mock financial news data
     */
    getMockNews() {
        const now = new Date();
        
        return [
            {
                id: 'mock-1',
                title: 'S&P 500 Reaches New Record High Amid Strong Earnings',
                description: 'The S&P 500 index closed at a record high today, driven by better-than-expected quarterly earnings from tech giants and positive economic indicators.',
                url: '#',
                source: 'Financial Times',
                author: 'Market Desk',
                publishedAt: new Date(now - 1000 * 60 * 30),
                image: null,
                category: 'markets'
            },
            {
                id: 'mock-2',
                title: 'Federal Reserve Signals Potential Rate Cuts in 2024',
                description: 'Fed Chairman indicates the central bank may consider interest rate reductions if inflation continues its downward trend, boosting market sentiment.',
                url: '#',
                source: 'Reuters',
                author: 'Economic Team',
                publishedAt: new Date(now - 1000 * 60 * 60 * 2),
                image: null,
                category: 'markets'
            },
            {
                id: 'mock-3',
                title: 'Bitcoin Surges Past $70,000 on ETF Approval Hopes',
                description: 'Bitcoin prices rallied to $70,000 as investors anticipate approval of spot Bitcoin ETFs, marking a significant milestone for cryptocurrency adoption.',
                url: '#',
                source: 'CoinDesk',
                author: 'Crypto Analysts',
                publishedAt: new Date(now - 1000 * 60 * 60 * 3),
                image: null,
                category: 'crypto'
            },
            {
                id: 'mock-4',
                title: 'Gold Prices Climb as Dollar Weakens',
                description: 'Gold futures rose 1.8% today as the US dollar weakened against major currencies, making the precious metal more attractive to international buyers.',
                url: '#',
                source: 'Bloomberg',
                author: 'Commodities Team',
                publishedAt: new Date(now - 1000 * 60 * 60 * 4),
                image: null,
                category: 'commodities'
            },
            {
                id: 'mock-5',
                title: 'Crude Oil Prices Stabilize After OPEC+ Production Cuts',
                description: 'Oil prices found support around $90 per barrel following OPEC+ announcement of extended production cuts through Q2 2024.',
                url: '#',
                source: 'CNBC',
                author: 'Energy Desk',
                publishedAt: new Date(now - 1000 * 60 * 60 * 5),
                image: null,
                category: 'commodities'
            },
            {
                id: 'mock-6',
                title: 'EUR/USD Reaches 6-Month High on ECB Policy Divergence',
                description: 'The euro strengthened against the dollar, reaching its highest level in six months as the European Central Bank maintains a hawkish stance.',
                url: '#',
                source: 'Forex.com',
                author: 'FX Team',
                publishedAt: new Date(now - 1000 * 60 * 60 * 6),
                image: null,
                category: 'forex'
            },
            {
                id: 'mock-7',
                title: 'Tech Stocks Lead Market Rally on AI Investment Surge',
                description: 'Major technology companies saw significant gains as investors pour billions into artificial intelligence infrastructure and applications.',
                url: '#',
                source: 'Wall Street Journal',
                author: 'Tech Reporter',
                publishedAt: new Date(now - 1000 * 60 * 60 * 7),
                image: null,
                category: 'markets'
            },
            {
                id: 'mock-8',
                title: 'Ethereum Network Upgrade Improves Transaction Speed',
                description: 'The latest Ethereum protocol upgrade successfully reduced gas fees and improved transaction throughput, strengthening its position in DeFi.',
                url: '#',
                source: 'Decrypt',
                author: 'Blockchain Team',
                publishedAt: new Date(now - 1000 * 60 * 60 * 8),
                image: null,
                category: 'crypto'
            },
            {
                id: 'mock-9',
                title: 'Asian Markets Mixed as China GDP Data Disappoints',
                description: 'Asian stock markets showed mixed results following Chinas GDP report, which came in below analyst expectations at 4.8% growth.',
                url: '#',
                source: 'Nikkei Asia',
                author: 'Asia Bureau',
                publishedAt: new Date(now - 1000 * 60 * 60 * 10),
                image: null,
                category: 'markets'
            },
            {
                id: 'mock-10',
                title: 'Silver Prices Jump on Industrial Demand Forecast',
                description: 'Silver futures gained 2.3% after industry reports forecasted increased demand from solar panel and electric vehicle manufacturers.',
                url: '#',
                source: 'Kitco News',
                author: 'Metals Desk',
                publishedAt: new Date(now - 1000 * 60 * 60 * 12),
                image: null,
                category: 'commodities'
            },
            {
                id: 'mock-11',
                title: 'Bank of Japan Maintains Ultra-Loose Monetary Policy',
                description: 'The Bank of Japan kept its negative interest rate policy unchanged despite global tightening, supporting the yen carry trade.',
                url: '#',
                source: 'Reuters',
                author: 'Tokyo Bureau',
                publishedAt: new Date(now - 1000 * 60 * 60 * 14),
                image: null,
                category: 'forex'
            },
            {
                id: 'mock-12',
                title: 'Nasdaq 100 Futures Rise on Strong Tech Earnings Outlook',
                description: 'Nasdaq 100 index futures climbed in pre-market trading as major tech companies reported robust earnings and optimistic guidance.',
                url: '#',
                source: 'MarketWatch',
                author: 'Markets Team',
                publishedAt: new Date(now - 1000 * 60 * 60 * 16),
                image: null,
                category: 'markets'
            }
        ];
    }

    /**
     * Get trending topics from recent articles
     */
    getTrendingTopics(articles, limit = 10) {
        const words = {};
        const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'to', 'in', 'for', 'of', 'and'];
        
        articles.forEach(article => {
            const text = (article.title + ' ' + article.description).toLowerCase();
            const tokens = text.match(/\b\w{4,}\b/g) || [];
            
            tokens.forEach(word => {
                if (!stopWords.includes(word)) {
                    words[word] = (words[word] || 0) + 1;
                }
            });
        });
        
        return Object.entries(words)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
    }
}

// Export for use in other modules
window.NewsService = NewsService;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsService;
}
