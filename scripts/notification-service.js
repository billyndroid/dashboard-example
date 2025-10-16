/**
 * Notification Service
 * Manages notifications, messages, and alerts for the dashboard
 */

(function(global) {
    'use strict';

    const NotificationService = {
        // Notification categories
        CATEGORIES: {
            TRADE: 'trade',
            ALERT: 'alert',
            SYSTEM: 'system',
            MESSAGE: 'message',
            MARKET: 'market'
        },

        // Priority levels
        PRIORITY: {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        },

        // Storage key
        STORAGE_KEY: 'dashboard_notifications',

        /**
         * Generate sample notifications
         */
        generateNotifications: function(count = 50) {
            const notifications = [];
            const now = Date.now();
            
            const templates = [
                // Trade notifications
                {
                    category: this.CATEGORIES.TRADE,
                    priority: this.PRIORITY.MEDIUM,
                    subjects: [
                        'Order #{id} Executed',
                        'Trade Confirmation #{id}',
                        'Position Update #{id}',
                        'Order #{id} Filled'
                    ],
                    messages: [
                        'Your {asset} order has been executed at ${price}',
                        'Successfully traded {quantity} units of {asset}',
                        '{asset} position updated: {quantity} units at ${price}',
                        'Order filled: {quantity} {asset} @ ${price}'
                    ],
                    from: 'Trading System'
                },
                // Alert notifications
                {
                    category: this.CATEGORIES.ALERT,
                    priority: this.PRIORITY.HIGH,
                    subjects: [
                        'Price Alert: {asset}',
                        'Position Limit Warning',
                        'Margin Call Alert',
                        'Stop Loss Triggered'
                    ],
                    messages: [
                        '{asset} has reached your target price of ${price}',
                        'Your {asset} position is at {percent}% of limit',
                        'Margin requirement increased for {asset}',
                        'Stop loss triggered on {asset} at ${price}'
                    ],
                    from: 'Risk Management'
                },
                // Market notifications
                {
                    category: this.CATEGORIES.MARKET,
                    priority: this.PRIORITY.LOW,
                    subjects: [
                        'Market Update: {asset}',
                        'Daily Summary: {asset}',
                        'Volatility Alert: {asset}',
                        'Volume Spike: {asset}'
                    ],
                    messages: [
                        '{asset} is up {percent}% today',
                        'Daily high: ${price} for {asset}',
                        '{asset} volatility increased {percent}%',
                        'Unusual volume detected in {asset}'
                    ],
                    from: 'Market Data'
                },
                // System notifications
                {
                    category: this.CATEGORIES.SYSTEM,
                    priority: this.PRIORITY.LOW,
                    subjects: [
                        'System Maintenance',
                        'Account Update',
                        'Security Notice',
                        'Feature Update'
                    ],
                    messages: [
                        'Scheduled maintenance tonight at 2:00 AM EST',
                        'Your account settings have been updated',
                        'New login detected from {location}',
                        'New features available in analytics dashboard'
                    ],
                    from: 'System Admin'
                }
            ];

            const assets = ['S&P 500', 'Gold', 'Crude Oil', 'EUR/USD', 'Bitcoin', 'NASDAQ', 'Silver', 'Natural Gas'];
            
            for (let i = 0; i < count; i++) {
                const template = templates[Math.floor(Math.random() * templates.length)];
                const asset = assets[Math.floor(Math.random() * assets.length)];
                const price = (Math.random() * 5000 + 100).toFixed(2);
                const quantity = Math.floor(Math.random() * 1000) + 1;
                const percent = (Math.random() * 20).toFixed(1);
                const orderId = Math.floor(Math.random() * 90000) + 10000;
                
                const subjectTemplate = template.subjects[Math.floor(Math.random() * template.subjects.length)];
                const messageTemplate = template.messages[Math.floor(Math.random() * template.messages.length)];
                
                // Replace placeholders
                const subject = subjectTemplate
                    .replace('{asset}', asset)
                    .replace('{id}', orderId);
                
                const message = messageTemplate
                    .replace('{asset}', asset)
                    .replace('{price}', price)
                    .replace('{quantity}', quantity)
                    .replace('{percent}', percent)
                    .replace('{location}', 'New York, USA');
                
                // Generate timestamp (random within last 7 days)
                const timestamp = now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000);
                
                notifications.push({
                    id: this.generateId(),
                    category: template.category,
                    priority: template.priority,
                    from: template.from,
                    subject: subject,
                    message: message,
                    timestamp: timestamp,
                    read: Math.random() > 0.3, // 70% read
                    archived: Math.random() > 0.9, // 10% archived
                    starred: Math.random() > 0.85 // 15% starred
                });
            }

            // Sort by timestamp (newest first)
            notifications.sort((a, b) => b.timestamp - a.timestamp);
            
            return notifications;
        },

        /**
         * Generate unique ID
         */
        generateId: function() {
            return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Get all notifications (from localStorage or generate new)
         */
        getNotifications: function() {
            try {
                const stored = localStorage.getItem(this.STORAGE_KEY);
                if (stored) {
                    return JSON.parse(stored);
                }
            } catch (e) {
                console.error('Error loading notifications:', e);
            }
            
            const notifications = this.generateNotifications(50);
            this.saveNotifications(notifications);
            return notifications;
        },

        /**
         * Save notifications to localStorage
         */
        saveNotifications: function(notifications) {
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications));
            } catch (e) {
                console.error('Error saving notifications:', e);
            }
        },

        /**
         * Filter notifications
         */
        filter: function(notifications, options = {}) {
            let filtered = [...notifications];

            // Filter by category
            if (options.category) {
                filtered = filtered.filter(n => n.category === options.category);
            }

            // Filter by priority
            if (options.priority) {
                filtered = filtered.filter(n => n.priority === options.priority);
            }

            // Filter by read status
            if (options.read !== undefined) {
                filtered = filtered.filter(n => n.read === options.read);
            }

            // Filter by archived status
            if (options.archived !== undefined) {
                filtered = filtered.filter(n => n.archived === options.archived);
            }

            // Filter by starred status
            if (options.starred !== undefined) {
                filtered = filtered.filter(n => n.starred === options.starred);
            }

            // Search in subject and message
            if (options.search) {
                const searchLower = options.search.toLowerCase();
                filtered = filtered.filter(n => 
                    n.subject.toLowerCase().includes(searchLower) ||
                    n.message.toLowerCase().includes(searchLower) ||
                    n.from.toLowerCase().includes(searchLower)
                );
            }

            return filtered;
        },

        /**
         * Mark notification as read
         */
        markAsRead: function(notificationId) {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = true;
                this.saveNotifications(notifications);
            }
            return notification;
        },

        /**
         * Mark notification as unread
         */
        markAsUnread: function(notificationId) {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.read = false;
                this.saveNotifications(notifications);
            }
            return notification;
        },

        /**
         * Toggle starred status
         */
        toggleStar: function(notificationId) {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.starred = !notification.starred;
                this.saveNotifications(notifications);
            }
            return notification;
        },

        /**
         * Archive notification
         */
        archive: function(notificationId) {
            const notifications = this.getNotifications();
            const notification = notifications.find(n => n.id === notificationId);
            if (notification) {
                notification.archived = true;
                this.saveNotifications(notifications);
            }
            return notification;
        },

        /**
         * Delete notification
         */
        delete: function(notificationId) {
            let notifications = this.getNotifications();
            notifications = notifications.filter(n => n.id !== notificationId);
            this.saveNotifications(notifications);
            return true;
        },

        /**
         * Mark all as read
         */
        markAllAsRead: function() {
            const notifications = this.getNotifications();
            notifications.forEach(n => n.read = true);
            this.saveNotifications(notifications);
        },

        /**
         * Get unread count
         */
        getUnreadCount: function() {
            const notifications = this.getNotifications();
            return notifications.filter(n => !n.read && !n.archived).length;
        },

        /**
         * Get statistics
         */
        getStats: function() {
            const notifications = this.getNotifications();
            const unarchived = notifications.filter(n => !n.archived);
            
            return {
                total: notifications.length,
                unread: unarchived.filter(n => !n.read).length,
                starred: unarchived.filter(n => n.starred).length,
                archived: notifications.filter(n => n.archived).length,
                byCategory: {
                    trade: unarchived.filter(n => n.category === this.CATEGORIES.TRADE).length,
                    alert: unarchived.filter(n => n.category === this.CATEGORIES.ALERT).length,
                    system: unarchived.filter(n => n.category === this.CATEGORIES.SYSTEM).length,
                    market: unarchived.filter(n => n.category === this.CATEGORIES.MARKET).length
                },
                byPriority: {
                    critical: unarchived.filter(n => n.priority === this.PRIORITY.CRITICAL).length,
                    high: unarchived.filter(n => n.priority === this.PRIORITY.HIGH).length,
                    medium: unarchived.filter(n => n.priority === this.PRIORITY.MEDIUM).length,
                    low: unarchived.filter(n => n.priority === this.PRIORITY.LOW).length
                }
            };
        },

        /**
         * Format relative time
         */
        formatRelativeTime: function(timestamp) {
            const now = Date.now();
            const diff = now - timestamp;
            const seconds = Math.floor(diff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);

            if (seconds < 60) return 'Just now';
            if (minutes < 60) return `${minutes} min ago`;
            if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
            if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
            
            return new Date(timestamp).toLocaleDateString();
        },

        /**
         * Get priority badge class
         */
        getPriorityClass: function(priority) {
            const classes = {
                critical: 'danger',
                high: 'warning',
                medium: 'primary',
                low: 'success'
            };
            return classes[priority] || 'primary';
        },

        /**
         * Get category icon
         */
        getCategoryIcon: function(category) {
            const icons = {
                trade: 'receipt_long',
                alert: 'warning',
                system: 'settings',
                message: 'mail',
                market: 'trending_up'
            };
            return icons[category] || 'notifications';
        }
    };

    // Export to global scope
    global.NotificationService = NotificationService;

    // Also support module.exports for potential Node.js usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = NotificationService;
    }

})(typeof window !== 'undefined' ? window : global);
