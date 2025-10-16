/**
 * Application Configuration
 * Centralized configuration for API endpoints, feature flags, and app settings
 */

const AppConfig = {
    // API Configuration
    api: {
        // Base URL - update this when deploying to production
        baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
        
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
    useMockData: true // Set to false when real API is available
};

// Make config available globally
window.AppConfig = AppConfig;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}
