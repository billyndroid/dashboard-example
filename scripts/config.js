/**
 * Application Configuration
 * Centralized configuration for API endpoints, feature flags, and app settings
 */

const AppConfig = {
    // API Configuration
    api: {
        // Base URL - update this when deploying to production
        baseUrl: (typeof process !== 'undefined' && process.env && process.env.API_BASE_URL) ? process.env.API_BASE_URL : 'https://api.example.com',
        
        // Endpoints
        endpoints: {
            orders: '/api/orders',
            execute: '/api/orders/execute',
            prices: '/api/prices/refresh',
            analytics: '/api/analytics',
            customers: '/api/customers',
            products: '/api/products',
            messages: '/api/messages',
            reports: '/api/reports',
            settings: '/api/settings',
            auth: {
                login: '/api/auth/login',
                logout: '/api/auth/logout',
                refresh: '/api/auth/refresh'
            }
        },
        
        // Request timeout in milliseconds
        timeout: 30000,
        
        // Retry configuration
        retry: {
            maxAttempts: 3,
            delay: 1000 // milliseconds
        }
    },
    
    // Feature Flags
    features: {
        realTimeUpdates: true,
        notifications: true,
        darkMode: true,
        analytics: true,
        authentication: false // Set to true when auth is implemented
    },
    
    // UI Configuration
    ui: {
        // Update interval for real-time data (milliseconds)
        updateInterval: 5000,
        
        // Animation durations
        animationDuration: 300,
        
        // Chart configuration
        charts: {
            defaultHeight: 350,
            defaultColors: ['#2d6cdf', '#10b981', '#f59e0b', '#ef4444']
        },
        
        // Notification duration (milliseconds)
        notificationDuration: 5000
    },
    
    // Environment detection
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1' ||
               window.location.hostname.includes('github.io');
    },
    
    // Get full API URL
    getApiUrl: (endpoint) => {
        // In development, use mock data or local server
        if (AppConfig.isDevelopment()) {
            console.warn(`[Dev Mode] API call to: ${endpoint} (using mock data)`);
            return null; // Return null to trigger mock data usage
        }
        return `${AppConfig.api.baseUrl}${endpoint}`;
    },
    
    // Mock data flag for development
    useMockData: false, // Set to false when real API is available
    
    // Third-party API configuration
    thirdPartyApis: {
        // Free crypto API (no key needed)
        coingecko: {
            enabled: true,
            baseUrl: 'https://api.coingecko.com/api/v3',
            endpoints: {
                prices: '/simple/price',
                markets: '/coins/markets',
                historical: '/coins/{id}/market_chart'
            }
        },
        // Stock, forex, commodities API (requires free key from https://twelvedata.com)
        twelveData: {
            enabled: true,
            key: '', // Add your free API key here
            baseUrl: 'https://api.twelvedata.com',
            endpoints: {
                quote: '/quote',
                timeseries: '/time_series',
                forex: '/forex_pairs',
                commodities: '/commodities'
            }
        },
        // Financial news API (requires free key from https://newsapi.org)
        newsapi: {
            enabled: true,
            key: '', // Add your free API key here
            baseUrl: 'https://newsapi.org/v2',
            endpoints: {
                everything: '/everything',
                topHeadlines: '/top-headlines'
            }
        },
        // Alternative: Alpha Vantage (free key from https://www.alphavantage.co)
        alphaVantage: {
            enabled: true,
            key: '', // Add your free API key here
            baseUrl: 'https://www.alphavantage.co/query',
            functions: {
                quote: 'GLOBAL_QUOTE',
                intraday: 'TIME_SERIES_INTRADAY',
                forex: 'CURRENCY_EXCHANGE_RATE',
                crypto: 'DIGITAL_CURRENCY_DAILY',
                news: 'NEWS_SENTIMENT'
            }
        }
    },
    
    // Error monitoring (optional)
    monitoring: {
        enabled: false,  // Enable in production
        endpoint: '/api/errors/log',
        sampleRate: 1.0  // 100% of errors (adjust as needed)
    },
    
    // Security settings
    security: {
        enableCSP: true,
        rateLimit: {
            enabled: true,
            maxAttempts: 5,
            windowMs: 60000  // 1 minute
        }
    },
    
    // Performance settings
    performance: {
        enableMonitoring: true,  // Enable performance monitoring
        lazyLoadImages: true,    // Lazy load images
        lazyLoadCharts: true,    // Lazy load chart library
        debounceDelay: 300,      // Debounce delay in ms
        throttleDelay: 100,      // Throttle delay in ms
        reportEndpoint: '/api/analytics/performance'  // Performance metrics endpoint
    },

    // Authentication configuration (Section 14)
    auth: {
        enabled: true,
        sessionDuration: 3600000, // 1 hour in milliseconds
        rememberMeDuration: 2592000000, // 30 days in milliseconds
        requireAuthForPages: ['index.html', 'analytics.html', 'orders.html', 'messages.html'],
        loginPage: 'login.html'
    },

    // WebSocket configuration for real-time updates (Section 14)
    websocket: {
        enabled: false, // Set to true when WebSocket server is available
        url: 'ws://localhost:8080/ws',
        reconnectAttempts: 5,
        heartbeatInterval: 15000,
        channels: {
            marketData: 'market-data',
            orders: 'orders',
            notifications: 'notifications',
            priceAlerts: 'price-alerts'
        }
    },

    // Export and analytics features (Section 14)
    analytics: {
        enableExport: true,
        exportFormats: ['csv', 'json', 'pdf'],
        maxExportRows: 10000,
        chartExportEnabled: true
    }
};

// Make config available globally
window.AppConfig = AppConfig;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
