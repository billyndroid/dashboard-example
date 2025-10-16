// Global Error Handling and Utility Functions

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
});

// Promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    event.preventDefault();
});

// Utility functions for common dashboard operations
const DashboardUtils = {
    // Safe DOM query selector
    safeQuery: (selector, context = document) => {
        try {
            return context.querySelector(selector);
        } catch (error) {
            console.warn(`Error querying selector "${selector}":`, error);
            return null;
        }
    },

    // Safe DOM query selector all
    safeQueryAll: (selector, context = document) => {
        try {
            return context.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Error querying selector "${selector}":`, error);
            return [];
        }
    },

    // Safe number formatting
    formatNumber: (num, options = {}) => {
        try {
            if (typeof num !== 'number' || isNaN(num)) {
                return '0';
            }
            
            const defaults = {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            };
            
            return num.toLocaleString(undefined, { ...defaults, ...options });
        } catch (error) {
            console.warn('Error formatting number:', error);
            return num.toString();
        }
    },

    // Safe currency formatting
    formatCurrency: (amount, currency = 'USD') => {
        try {
            if (typeof amount !== 'number' || isNaN(amount)) {
                return '$0.00';
            }
            
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency
            }).format(amount);
        } catch (error) {
            console.warn('Error formatting currency:', error);
            return `$${amount.toFixed(2)}`;
        }
    },

    // Safe percentage formatting
    formatPercentage: (value, decimals = 1) => {
        try {
            if (typeof value !== 'number' || isNaN(value)) {
                return '0%';
            }
            return `${value.toFixed(decimals)}%`;
        } catch (error) {
            console.warn('Error formatting percentage:', error);
            return `${value}%`;
        }
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function
    throttle: (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // Show notification
    showNotification: (message, type = 'info', duration = 5000) => {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.textContent = message;
            
            // Style the notification
            Object.assign(notification.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '4px',
                color: 'white',
                fontWeight: '500',
                zIndex: '10000',
                opacity: '0',
                transform: 'translateX(100%)',
                transition: 'all 0.3s ease'
            });

            // Set background color based on type
            const colors = {
                success: '#41f1b6',
                error: '#ff7782',
                warning: '#ffbb55',
                info: '#7380cc'
            };
            notification.style.backgroundColor = colors[type] || colors.info;

            // Add to page
            document.body.appendChild(notification);

            // Animate in
            setTimeout(() => {
                notification.style.opacity = '1';
                notification.style.transform = 'translateX(0)';
            }, 100);

            // Remove after duration
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, duration);

        } catch (error) {
            console.error('Error showing notification:', error);
        }
    },

    // Safe local storage operations
    storage: {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Error setting localStorage:', error);
                return false;
            }
        },

        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Error getting localStorage:', error);
                return defaultValue;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Error removing localStorage:', error);
                return false;
            }
        }
    },

    // API request wrapper with error handling
    apiRequest: async (url, options = {}) => {
        try {
            const defaults = {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            };

            const config = { ...defaults, ...options };
            
            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }
};

// Make utilities globally available
window.DashboardUtils = DashboardUtils;

// Initialize dashboard-wide features
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add loading states to buttons
        const buttons = DashboardUtils.safeQueryAll('button');
        buttons.forEach(button => {
            const originalClick = button.onclick;
            button.addEventListener('click', function(e) {
                if (this.disabled) return;
                
                // Add loading state
                const originalText = this.textContent;
                this.dataset.originalText = originalText;
                this.disabled = true;
                this.textContent = 'Loading...';
                
                // Restore after 2 seconds if not manually restored
                setTimeout(() => {
                    if (this.textContent === 'Loading...') {
                        this.textContent = this.dataset.originalText || originalText;
                        this.disabled = false;
                    }
                }, 2000);
            });
        });

        console.info('Dashboard utilities initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard utilities:', error);
    }
});