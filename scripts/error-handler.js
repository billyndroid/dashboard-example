/**
 * Global Error Handler
 * Centralized error handling and logging for the dashboard
 */

(function(global) {
    'use strict';

    const ErrorHandler = {
        // Error types
        ERROR_TYPES: {
            NETWORK: 'network',
            VALIDATION: 'validation',
            PERMISSION: 'permission',
            NOT_FOUND: 'not_found',
            SERVER: 'server',
            CLIENT: 'client',
            UNKNOWN: 'unknown'
        },

        // Error severity levels
        SEVERITY: {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        },

        // Error log storage
        errorLog: [],
        maxLogSize: 100,

        /**
         * Handle an error
         * @param {Error|string} error - The error to handle
         * @param {Object} context - Additional context information
         * @param {string} context.type - Error type
         * @param {string} context.severity - Error severity
         * @param {string} context.source - Source of the error
         * @param {boolean} context.showUser - Whether to show error to user
         */
        handle: function(error, context = {}) {
            const errorInfo = this.parseError(error, context);
            
            // Log to console in development
            if (this.isDevelopment()) {
                console.group(`❌ Error [${errorInfo.type}]`);
                console.error('Message:', errorInfo.message);
                console.error('Source:', errorInfo.source);
                console.error('Severity:', errorInfo.severity);
                if (errorInfo.stack) console.error('Stack:', errorInfo.stack);
                console.groupEnd();
            }

            // Store in error log
            this.logError(errorInfo);

            // Show to user if requested
            if (context.showUser !== false) {
                this.showUserError(errorInfo);
            }

            // Send to monitoring service (if configured)
            if (typeof AppConfig !== 'undefined' && AppConfig.monitoring && AppConfig.monitoring.enabled) {
                this.sendToMonitoring(errorInfo);
            }

            return errorInfo;
        },

        /**
         * Parse error into structured format
         */
        parseError: function(error, context) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            
            return {
                message: errorObj.message || 'An unexpected error occurred',
                stack: errorObj.stack,
                type: context.type || this.inferErrorType(errorObj),
                severity: context.severity || this.SEVERITY.MEDIUM,
                source: context.source || 'unknown',
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };
        },

        /**
         * Infer error type from error object
         */
        inferErrorType: function(error) {
            const message = error.message.toLowerCase();
            
            if (message.includes('network') || message.includes('fetch')) {
                return this.ERROR_TYPES.NETWORK;
            }
            if (message.includes('not found') || message.includes('404')) {
                return this.ERROR_TYPES.NOT_FOUND;
            }
            if (message.includes('permission') || message.includes('forbidden')) {
                return this.ERROR_TYPES.PERMISSION;
            }
            if (message.includes('validation') || message.includes('invalid')) {
                return this.ERROR_TYPES.VALIDATION;
            }
            if (message.includes('server') || message.includes('500')) {
                return this.ERROR_TYPES.SERVER;
            }
            
            return this.ERROR_TYPES.UNKNOWN;
        },

        /**
         * Log error to storage
         */
        logError: function(errorInfo) {
            this.errorLog.unshift(errorInfo);
            
            // Trim log if too large
            if (this.errorLog.length > this.maxLogSize) {
                this.errorLog = this.errorLog.slice(0, this.maxLogSize);
            }

            // Store in localStorage for persistence
            try {
                const recentErrors = this.errorLog.slice(0, 10);
                localStorage.setItem('error_log', JSON.stringify(recentErrors));
            } catch (e) {
                // Silently fail if localStorage is unavailable
            }
        },

        /**
         * Show error to user
         */
        showUserError: function(errorInfo) {
            const userMessage = this.getUserFriendlyMessage(errorInfo);
            
            // Use notification system if available
            if (typeof window.showNotification === 'function') {
                window.showNotification(userMessage, 'error');
            } else {
                // Fallback to alert (not ideal, but works)
                console.error(userMessage);
            }
        },

        /**
         * Get user-friendly error message
         */
        getUserFriendlyMessage: function(errorInfo) {
            const messages = {
                [this.ERROR_TYPES.NETWORK]: 'Network connection error. Please check your internet connection and try again.',
                [this.ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
                [this.ERROR_TYPES.PERMISSION]: 'You do not have permission to perform this action.',
                [this.ERROR_TYPES.VALIDATION]: 'Invalid input. Please check your data and try again.',
                [this.ERROR_TYPES.SERVER]: 'Server error. Please try again later.',
                [this.ERROR_TYPES.CLIENT]: 'An error occurred in the application.',
                [this.ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
            };

            return messages[errorInfo.type] || messages[this.ERROR_TYPES.UNKNOWN];
        },

        /**
         * Send error to monitoring service
         */
        sendToMonitoring: function(errorInfo) {
            // Implementation would depend on monitoring service
            // Example for a hypothetical service:
            /*
            fetch(AppConfig.monitoring.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorInfo)
            }).catch(() => {
                // Silently fail if monitoring is unavailable
            });
            */
        },

        /**
         * Get error log
         */
        getErrorLog: function(limit = 10) {
            return this.errorLog.slice(0, limit);
        },

        /**
         * Clear error log
         */
        clearErrorLog: function() {
            this.errorLog = [];
            try {
                localStorage.removeItem('error_log');
            } catch (e) {
                // Silently fail
            }
        },

        /**
         * Check if in development mode
         */
        isDevelopment: function() {
            return window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname.includes('github.io');
        },

        /**
         * Create error boundary for async functions
         */
        async: function(fn, context = {}) {
            return async function(...args) {
                try {
                    return await fn.apply(this, args);
                } catch (error) {
                    ErrorHandler.handle(error, {
                        ...context,
                        source: context.source || fn.name || 'anonymous async function'
                    });
                    throw error; // Re-throw for caller to handle if needed
                }
            };
        },

        /**
         * Create error boundary for sync functions
         */
        wrap: function(fn, context = {}) {
            return function(...args) {
                try {
                    return fn.apply(this, args);
                } catch (error) {
                    ErrorHandler.handle(error, {
                        ...context,
                        source: context.source || fn.name || 'anonymous function'
                    });
                    throw error;
                }
            };
        }
    };

    // Global error handler for uncaught errors
    window.addEventListener('error', function(event) {
        ErrorHandler.handle(event.error || event.message, {
            type: ErrorHandler.ERROR_TYPES.CLIENT,
            severity: ErrorHandler.SEVERITY.HIGH,
            source: 'window.error',
            showUser: false
        });
    });

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        ErrorHandler.handle(event.reason, {
            type: ErrorHandler.ERROR_TYPES.CLIENT,
            severity: ErrorHandler.SEVERITY.HIGH,
            source: 'unhandledrejection',
            showUser: false
        });
    });

    // Export to global scope
    global.ErrorHandler = ErrorHandler;

    // Also support module.exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = ErrorHandler;
    }

})(typeof window !== 'undefined' ? window : global);
