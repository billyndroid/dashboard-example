/**
 * Security Utilities
 * Input validation, sanitization, and security helpers
 */

(function(global) {
    'use strict';

    const SecurityUtils = {
        /**
         * Sanitize HTML to prevent XSS attacks
         * @param {string} input - The HTML string to sanitize
         * @returns {string} Sanitized HTML
         */
        sanitizeHTML: function(input) {
            if (typeof input !== 'string') {
                return '';
            }

            const div = document.createElement('div');
            div.textContent = input;
            return div.innerHTML;
        },

        /**
         * Escape HTML entities
         * @param {string} text - Text to escape
         * @returns {string} Escaped text
         */
        escapeHTML: function(text) {
            if (typeof text !== 'string') {
                return '';
            }

            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
                '/': '&#x2F;'
            };

            return text.replace(/[&<>"'/]/g, function(char) {
                return map[char];
            });
        },

        /**
         * Validate email format
         * @param {string} email - Email to validate
         * @returns {boolean} True if valid
         */
        isValidEmail: function(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },

        /**
         * Validate numeric input
         * @param {*} value - Value to validate
         * @param {Object} options - Validation options
         * @returns {boolean} True if valid
         */
        isValidNumber: function(value, options = {}) {
            const num = parseFloat(value);
            
            if (isNaN(num)) {
                return false;
            }

            if (options.min !== undefined && num < options.min) {
                return false;
            }

            if (options.max !== undefined && num > options.max) {
                return false;
            }

            if (options.integer && !Number.isInteger(num)) {
                return false;
            }

            return true;
        },

        /**
         * Validate string input
         * @param {string} value - String to validate
         * @param {Object} options - Validation options
         * @returns {boolean} True if valid
         */
        isValidString: function(value, options = {}) {
            if (typeof value !== 'string') {
                return false;
            }

            if (options.minLength && value.length < options.minLength) {
                return false;
            }

            if (options.maxLength && value.length > options.maxLength) {
                return false;
            }

            if (options.pattern && !options.pattern.test(value)) {
                return false;
            }

            return true;
        },

        /**
         * Validate date input
         * @param {*} value - Date to validate
         * @param {Object} options - Validation options
         * @returns {boolean} True if valid
         */
        isValidDate: function(value, options = {}) {
            const date = new Date(value);
            
            if (isNaN(date.getTime())) {
                return false;
            }

            if (options.minDate && date < new Date(options.minDate)) {
                return false;
            }

            if (options.maxDate && date > new Date(options.maxDate)) {
                return false;
            }

            return true;
        },

        /**
         * Sanitize object keys and values
         * @param {Object} obj - Object to sanitize
         * @returns {Object} Sanitized object
         */
        sanitizeObject: function(obj) {
            if (typeof obj !== 'object' || obj === null) {
                return {};
            }

            const sanitized = {};
            
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const sanitizedKey = this.sanitizeHTML(String(key));
                    const value = obj[key];
                    
                    if (typeof value === 'string') {
                        sanitized[sanitizedKey] = this.sanitizeHTML(value);
                    } else if (typeof value === 'object' && value !== null) {
                        sanitized[sanitizedKey] = this.sanitizeObject(value);
                    } else {
                        sanitized[sanitizedKey] = value;
                    }
                }
            }

            return sanitized;
        },

        /**
         * Generate a random token
         * @param {number} length - Token length
         * @returns {string} Random token
         */
        generateToken: function(length = 32) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let token = '';
            
            for (let i = 0; i < length; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            return token;
        },

        /**
         * Validate URL format
         * @param {string} url - URL to validate
         * @returns {boolean} True if valid
         */
        isValidURL: function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        },

        /**
         * Check if content contains potentially malicious code
         * @param {string} content - Content to check
         * @returns {boolean} True if suspicious
         */
        isSuspicious: function(content) {
            if (typeof content !== 'string') {
                return false;
            }

            const suspiciousPatterns = [
                /<script/i,
                /javascript:/i,
                /on\w+\s*=/i,  // Event handlers like onclick=
                /<iframe/i,
                /eval\(/i,
                /document\.cookie/i,
                /document\.write/i
            ];

            return suspiciousPatterns.some(pattern => pattern.test(content));
        },

        /**
         * Rate limiting helper
         * @param {string} key - Unique key for the action
         * @param {number} maxAttempts - Maximum attempts allowed
         * @param {number} windowMs - Time window in milliseconds
         * @returns {boolean} True if action is allowed
         */
        checkRateLimit: function(key, maxAttempts = 5, windowMs = 60000) {
            const now = Date.now();
            const storageKey = `ratelimit_${key}`;
            
            try {
                let attempts = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                // Remove old attempts outside the window
                attempts = attempts.filter(timestamp => now - timestamp < windowMs);
                
                // Check if limit exceeded
                if (attempts.length >= maxAttempts) {
                    return false;
                }
                
                // Add new attempt
                attempts.push(now);
                localStorage.setItem(storageKey, JSON.stringify(attempts));
                
                return true;
            } catch (e) {
                // If localStorage fails, allow the action
                return true;
            }
        },

        /**
         * Clear rate limit for a key
         * @param {string} key - Rate limit key to clear
         */
        clearRateLimit: function(key) {
            try {
                localStorage.removeItem(`ratelimit_${key}`);
            } catch (e) {
                // Silently fail
            }
        },

        /**
         * Validate JSON Web Token format (basic check)
         * @param {string} token - JWT to validate
         * @returns {boolean} True if valid format
         */
        isValidJWT: function(token) {
            if (typeof token !== 'string') {
                return false;
            }

            const parts = token.split('.');
            return parts.length === 3;
        },

        /**
         * Secure localStorage wrapper
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         * @param {Object} options - Options
         */
        secureStore: function(key, value, options = {}) {
            try {
                const data = {
                    value: value,
                    timestamp: Date.now(),
                    expiresIn: options.expiresIn || null
                };

                localStorage.setItem(key, JSON.stringify(data));
                return true;
            } catch (e) {
                console.error('Secure store failed:', e);
                return false;
            }
        },

        /**
         * Secure localStorage retrieval
         * @param {string} key - Storage key
         * @returns {*} Stored value or null
         */
        secureRetrieve: function(key) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return null;

                const data = JSON.parse(item);
                
                // Check expiration
                if (data.expiresIn && Date.now() - data.timestamp > data.expiresIn) {
                    localStorage.removeItem(key);
                    return null;
                }

                return data.value;
            } catch (e) {
                console.error('Secure retrieve failed:', e);
                return null;
            }
        },

        /**
         * Content Security Policy violation reporter
         */
        setupCSPReporting: function() {
            document.addEventListener('securitypolicyviolation', function(e) {
                console.error('CSP Violation:', {
                    blockedURI: e.blockedURI,
                    violatedDirective: e.violatedDirective,
                    originalPolicy: e.originalPolicy
                });

                // Report to monitoring service if configured
                if (typeof ErrorHandler !== 'undefined') {
                    ErrorHandler.handle(new Error('CSP Violation'), {
                        type: 'security',
                        severity: 'high',
                        source: 'CSP',
                        showUser: false
                    });
                }
            });
        }
    };

    // Export to global scope
    global.SecurityUtils = SecurityUtils;

    // Also support module.exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SecurityUtils;
    }

    // Setup CSP reporting on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', SecurityUtils.setupCSPReporting);
    } else {
        SecurityUtils.setupCSPReporting();
    }

})(typeof window !== 'undefined' ? window : global);
