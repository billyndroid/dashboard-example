/**
 * Performance Utilities
 * Monitoring, optimization, and performance helpers
 */

(function(global) {
    'use strict';

    const PerformanceUtils = {
        // Performance marks storage
        marks: {},
        measures: [],

        /**
         * Start performance timing
         * @param {string} name - Mark name
         */
        mark: function(name) {
            if (typeof performance !== 'undefined' && performance.mark) {
                performance.mark(name);
            }
            this.marks[name] = Date.now();
        },

        /**
         * Measure performance between marks
         * @param {string} name - Measure name
         * @param {string} startMark - Start mark name
         * @param {string} endMark - End mark name (optional, uses current time if not provided)
         * @returns {number} Duration in milliseconds
         */
        measure: function(name, startMark, endMark) {
            let duration;

            if (typeof performance !== 'undefined' && performance.measure) {
                try {
                    if (endMark) {
                        performance.measure(name, startMark, endMark);
                        const entries = performance.getEntriesByName(name);
                        duration = entries[entries.length - 1].duration;
                    } else {
                        performance.measure(name, startMark);
                        const entries = performance.getEntriesByName(name);
                        duration = entries[entries.length - 1].duration;
                    }
                } catch (e) {
                    // Fallback to manual calculation
                    duration = this._manualMeasure(startMark, endMark);
                }
            } else {
                duration = this._manualMeasure(startMark, endMark);
            }

            this.measures.push({
                name: name,
                duration: duration,
                timestamp: Date.now()
            });

            return duration;
        },

        /**
         * Manual measure fallback
         */
        _manualMeasure: function(startMark, endMark) {
            const startTime = this.marks[startMark];
            const endTime = endMark ? this.marks[endMark] : Date.now();
            return endTime - startTime;
        },

        /**
         * Get all measures
         * @returns {Array} Array of measure objects
         */
        getMeasures: function() {
            return this.measures;
        },

        /**
         * Clear all marks and measures
         */
        clearMarks: function() {
            if (typeof performance !== 'undefined' && performance.clearMarks) {
                performance.clearMarks();
                performance.clearMeasures();
            }
            this.marks = {};
            this.measures = [];
        },

        /**
         * Debounce function execution
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in milliseconds
         * @param {boolean} immediate - Execute on leading edge
         * @returns {Function} Debounced function
         */
        debounce: function(func, wait, immediate) {
            let timeout;
            return function(...args) {
                const context = this;
                const later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
                const callNow = immediate && !timeout;
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
                if (callNow) func.apply(context, args);
            };
        },

        /**
         * Throttle function execution
         * @param {Function} func - Function to throttle
         * @param {number} limit - Time limit in milliseconds
         * @returns {Function} Throttled function
         */
        throttle: function(func, limit) {
            let inThrottle;
            return function(...args) {
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Lazy load images
         * @param {string} selector - Image selector
         */
        lazyLoadImages: function(selector = 'img[data-src]') {
            const images = document.querySelectorAll(selector);
            
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                });

                images.forEach(img => imageObserver.observe(img));
            } else {
                // Fallback for browsers without IntersectionObserver
                images.forEach(img => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                });
            }
        },

        /**
         * Lazy load scripts
         * @param {string} src - Script source
         * @param {Object} options - Load options
         * @returns {Promise} Promise that resolves when script loads
         */
        lazyLoadScript: function(src, options = {}) {
            return new Promise((resolve, reject) => {
                // Check if already loaded
                if (document.querySelector(`script[src="${src}"]`)) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = src;
                script.async = options.async !== false;
                script.defer = options.defer || false;

                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

                document.head.appendChild(script);
            });
        },

        /**
         * Preload critical resources
         * @param {string} href - Resource URL
         * @param {string} as - Resource type (script, style, image, font)
         */
        preload: function(href, as) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = as;
            document.head.appendChild(link);
        },

        /**
         * Get page load metrics
         * @returns {Object} Load metrics
         */
        getLoadMetrics: function() {
            if (typeof performance === 'undefined' || !performance.timing) {
                return null;
            }

            const timing = performance.timing;
            const navigation = performance.navigation;

            return {
                // Navigation timing
                redirect: timing.redirectEnd - timing.redirectStart,
                dns: timing.domainLookupEnd - timing.domainLookupStart,
                tcp: timing.connectEnd - timing.connectStart,
                request: timing.responseStart - timing.requestStart,
                response: timing.responseEnd - timing.responseStart,
                dom: timing.domComplete - timing.domLoading,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                load: timing.loadEventEnd - timing.navigationStart,
                
                // Calculated metrics
                total: timing.loadEventEnd - timing.navigationStart,
                ttfb: timing.responseStart - timing.navigationStart, // Time to First Byte
                domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
                
                // Navigation type
                navigationType: navigation.type,
                redirectCount: navigation.redirectCount
            };
        },

        /**
         * Get resource timing
         * @returns {Array} Array of resource timing objects
         */
        getResourceTiming: function() {
            if (typeof performance === 'undefined' || !performance.getEntriesByType) {
                return [];
            }

            return performance.getEntriesByType('resource').map(resource => ({
                name: resource.name,
                type: resource.initiatorType,
                duration: resource.duration,
                size: resource.transferSize || 0,
                cached: resource.transferSize === 0
            }));
        },

        /**
         * Get First Contentful Paint
         * @returns {number|null} FCP time in milliseconds
         */
        getFCP: function() {
            if (typeof performance === 'undefined' || !performance.getEntriesByType) {
                return null;
            }

            const fcpEntry = performance.getEntriesByType('paint')
                .find(entry => entry.name === 'first-contentful-paint');
            
            return fcpEntry ? fcpEntry.startTime : null;
        },

        /**
         * Monitor long tasks
         * @param {Function} callback - Callback for long tasks
         */
        monitorLongTasks: function(callback) {
            if (typeof PerformanceObserver === 'undefined') {
                console.warn('PerformanceObserver not supported');
                return;
            }

            try {
                const observer = new PerformanceObserver(list => {
                    list.getEntries().forEach(entry => {
                        callback({
                            name: entry.name,
                            duration: entry.duration,
                            startTime: entry.startTime
                        });
                    });
                });

                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.warn('Long task monitoring not supported');
            }
        },

        /**
         * Get memory usage (Chrome only)
         * @returns {Object|null} Memory info
         */
        getMemoryUsage: function() {
            if (performance.memory) {
                return {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit * 100).toFixed(2)
                };
            }
            return null;
        },

        /**
         * Request idle callback wrapper
         * @param {Function} callback - Function to execute when idle
         * @param {Object} options - Options object
         */
        runWhenIdle: function(callback, options = {}) {
            if (typeof requestIdleCallback !== 'undefined') {
                requestIdleCallback(callback, options);
            } else {
                // Fallback to setTimeout
                setTimeout(callback, 1);
            }
        },

        /**
         * Optimize DOM batch updates
         * @param {Function} callback - Function containing DOM updates
         */
        batchDOMUpdates: function(callback) {
            if (typeof requestAnimationFrame !== 'undefined') {
                requestAnimationFrame(callback);
            } else {
                callback();
            }
        },

        /**
         * Create performance report
         * @returns {Object} Performance report
         */
        generateReport: function() {
            return {
                loadMetrics: this.getLoadMetrics(),
                resources: this.getResourceTiming(),
                fcp: this.getFCP(),
                memory: this.getMemoryUsage(),
                customMeasures: this.getMeasures(),
                timestamp: new Date().toISOString()
            };
        },

        /**
         * Log performance report to console
         */
        logReport: function() {
            const report = this.generateReport();
            console.group('📊 Performance Report');
            console.log('Load Metrics:', report.loadMetrics);
            console.log('Resources:', report.resources);
            console.log('FCP:', report.fcp);
            console.log('Memory:', report.memory);
            console.log('Custom Measures:', report.customMeasures);
            console.groupEnd();
        },

        /**
         * Send performance report to analytics
         * @param {string} endpoint - Analytics endpoint
         */
        sendReport: function(endpoint) {
            const report = this.generateReport();
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon(endpoint, JSON.stringify(report));
            } else {
                fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(report)
                }).catch(() => {
                    // Silently fail
                });
            }
        }
    };

    // Auto-log performance on load (development only)
    if (typeof AppConfig !== 'undefined' && AppConfig.isDevelopment && AppConfig.isDevelopment()) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                PerformanceUtils.logReport();
            }, 1000);
        });
    }

    // Export to global scope
    global.PerformanceUtils = PerformanceUtils;

    // Also support module.exports
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = PerformanceUtils;
    }

})(typeof window !== 'undefined' ? window : global);
