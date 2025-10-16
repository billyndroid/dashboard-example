/**
 * Messages Page Controller
 * Handles notification display, filtering, and interaction
 */

(function() {
    'use strict';

    // State
    let currentPage = 1;
    const itemsPerPage = 10;
    let currentFilter = 'all';
    let filteredNotifications = [];

    /**
     * Initialize the messages page
     */
    function init() {
        updateStats();
        applyFilters();
        renderRecentNotifications();
    }

    /**
     * Update statistics cards
     */
    function updateStats() {
        const stats = NotificationService.getStats();
        
        document.getElementById('total-count').textContent = stats.total;
        document.getElementById('unread-count').textContent = stats.unread;
        document.getElementById('high-priority-count').textContent = stats.byPriority.high;
        document.getElementById('critical-count').textContent = stats.byPriority.critical;
        document.getElementById('starred-count').textContent = stats.starred;
        document.getElementById('archived-count').textContent = stats.archived;

        // Update message count badge in sidebar
        const messageCountBadge = document.querySelector('.message-count');
        if (messageCountBadge) {
            messageCountBadge.textContent = stats.unread;
        }
    }

    /**
     * Apply current filters
     */
    window.applyFilters = function() {
        const categoryFilter = document.getElementById('category-filter').value;
        const priorityFilter = document.getElementById('priority-filter').value;
        const searchTerm = document.getElementById('search-input').value;

        let notifications = NotificationService.getNotifications();

        // Apply quick filter
        if (currentFilter === 'unread') {
            notifications = notifications.filter(n => !n.read && !n.archived);
        } else if (currentFilter === 'starred') {
            notifications = notifications.filter(n => n.starred && !n.archived);
        } else if (currentFilter === 'trade' || currentFilter === 'alert') {
            notifications = notifications.filter(n => n.category === currentFilter && !n.archived);
        } else {
            // 'all' - exclude archived
            notifications = notifications.filter(n => !n.archived);
        }

        // Apply advanced filters
        notifications = NotificationService.filter(notifications, {
            category: categoryFilter || undefined,
            priority: priorityFilter || undefined,
            search: searchTerm || undefined
        });

        filteredNotifications = notifications;
        currentPage = 1;
        renderNotifications();
    };

    /**
     * Quick filter buttons
     */
    window.filterNotifications = function(filter) {
        currentFilter = filter;
        
        // Update button states
        document.querySelectorAll('.filter-buttons .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
        });
        event.target.classList.remove('btn-secondary');
        event.target.classList.add('btn-primary');

        applyFilters();
    };

    /**
     * Render notifications for current page
     */
    function renderNotifications() {
        const container = document.getElementById('notification-list');
        
        if (filteredNotifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons-sharp" style="font-size: 4rem; color: var(--color-info-light);">inbox</span>
                    <h3>No messages found</h3>
                    <p>Try adjusting your filters</p>
                </div>
            `;
            updatePagination();
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNotifications = filteredNotifications.slice(startIndex, endIndex);

        container.innerHTML = pageNotifications.map(notification => `
            <div class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                <div class="notification-header">
                    <div>
                        <div class="notification-subject">${escapeHtml(notification.subject)}</div>
                        <div class="notification-meta">
                            <span>
                                <span class="material-icons-sharp" style="font-size: 1rem; vertical-align: middle;">
                                    ${NotificationService.getCategoryIcon(notification.category)}
                                </span>
                                ${escapeHtml(notification.from)}
                            </span>
                            <span>${NotificationService.formatRelativeTime(notification.timestamp)}</span>
                        </div>
                    </div>
                    <span class="priority-badge ${NotificationService.getPriorityClass(notification.priority)}">
                        ${notification.priority}
                    </span>
                </div>
                <div class="notification-message">${escapeHtml(notification.message)}</div>
                <div class="notification-actions">
                    <button onclick="toggleRead('${notification.id}')" title="${notification.read ? 'Mark as unread' : 'Mark as read'}">
                        <span class="material-icons-sharp" style="font-size: 1rem; vertical-align: middle;">
                            ${notification.read ? 'mark_email_unread' : 'mark_email_read'}
                        </span>
                        ${notification.read ? 'Unread' : 'Read'}
                    </button>
                    <button class="star-btn ${notification.starred ? 'active' : ''}" onclick="toggleStar('${notification.id}')" title="Star">
                        <span class="material-icons-sharp" style="font-size: 1rem; vertical-align: middle;">
                            ${notification.starred ? 'star' : 'star_border'}
                        </span>
                    </button>
                    <button onclick="archiveNotification('${notification.id}')" title="Archive">
                        <span class="material-icons-sharp" style="font-size: 1rem; vertical-align: middle;">archive</span>
                        Archive
                    </button>
                    <button onclick="deleteNotification('${notification.id}')" title="Delete" style="color: var(--color-danger);">
                        <span class="material-icons-sharp" style="font-size: 1rem; vertical-align: middle;">delete</span>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        updatePagination();
    }

    /**
     * Toggle read status
     */
    window.toggleRead = function(notificationId) {
        const notifications = NotificationService.getNotifications();
        const notification = notifications.find(n => n.id === notificationId);
        
        if (notification.read) {
            NotificationService.markAsUnread(notificationId);
        } else {
            NotificationService.markAsRead(notificationId);
        }

        updateStats();
        applyFilters();
    };

    /**
     * Toggle star status
     */
    window.toggleStar = function(notificationId) {
        NotificationService.toggleStar(notificationId);
        applyFilters();
    };

    /**
     * Archive notification
     */
    window.archiveNotification = function(notificationId) {
        NotificationService.archive(notificationId);
        updateStats();
        applyFilters();
    };

    /**
     * Delete notification
     */
    window.deleteNotification = function(notificationId) {
        if (confirm('Are you sure you want to delete this notification?')) {
            NotificationService.delete(notificationId);
            updateStats();
            applyFilters();
        }
    };

    /**
     * Mark all as read
     */
    window.markAllAsRead = function() {
        NotificationService.markAllAsRead();
        updateStats();
        applyFilters();
    };

    /**
     * Update pagination controls
     */
    function updatePagination() {
        const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
        
        document.getElementById('page-info').textContent = `Page ${currentPage} of ${totalPages || 1}`;
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = currentPage >= totalPages;
    }

    /**
     * Previous page
     */
    window.previousPage = function() {
        if (currentPage > 1) {
            currentPage--;
            renderNotifications();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /**
     * Next page
     */
    window.nextPage = function() {
        const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderNotifications();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    /**
     * Render recent notifications in sidebar
     */
    function renderRecentNotifications() {
        const container = document.getElementById('recent-notifications');
        if (!container) return;

        const notifications = NotificationService.getNotifications();
        const recent = notifications
            .filter(n => !n.archived)
            .slice(0, 5);

        container.innerHTML = recent.map(notification => `
            <div class="update">
                <div class="profile-photo">
                    <span class="material-icons-sharp">${NotificationService.getCategoryIcon(notification.category)}</span>
                </div>
                <div class="message">
                    <p><b>${escapeHtml(notification.subject)}:</b> ${escapeHtml(notification.message.substring(0, 60))}${notification.message.length > 60 ? '...' : ''}</p>
                    <small class="text-muted">${NotificationService.formatRelativeTime(notification.timestamp)}</small>
                </div>
            </div>
        `).join('');
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
