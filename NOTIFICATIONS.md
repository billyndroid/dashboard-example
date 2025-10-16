# Notification System Documentation

## Overview
The notification system provides a comprehensive message and alert management interface for the SQU^RE DOFF dashboard. It supports multiple categories, priority levels, and interactive features including filtering, search, and state management.

## Architecture

### Files
- **`scripts/notification-service.js`** - Core service handling notification generation, storage, and management
- **`scripts/messages.js`** - Messages page controller for UI interactions
- **`html/messages.html`** - Messages page with interactive interface
- **`scripts/main.js`** - Updated to show live unread count badge

## Features

### 1. Notification Categories
- **Trade** - Order executions, position updates, trade confirmations
- **Alert** - Price alerts, position limits, margin calls, stop loss triggers
- **Market** - Market updates, daily summaries, volatility alerts, volume spikes
- **System** - Maintenance notices, account updates, security notices, feature updates

### 2. Priority Levels
- **Critical** - Red badge, highest urgency
- **High** - Orange badge, warning level
- **Medium** - Blue badge, standard priority
- **Low** - Green badge, informational

### 3. Notification States
- **Read/Unread** - Visual distinction with background color
- **Starred** - Mark important notifications
- **Archived** - Remove from main view without deleting
- **Deleted** - Permanently remove

### 4. Interactive Features

#### Filtering
- **Category Filter** - Trade, Alert, Market, System
- **Priority Filter** - Critical, High, Medium, Low
- **Quick Filters** - All, Unread, Starred, specific categories
- **Search** - Search in subject, message, and sender fields

#### Actions
- **Toggle Read/Unread** - Mark individual notifications
- **Star/Unstar** - Highlight important messages
- **Archive** - Hide from main view
- **Delete** - Permanently remove with confirmation
- **Mark All Read** - Bulk action for all notifications

#### Pagination
- 10 notifications per page
- Previous/Next navigation
- Page indicator (e.g., "Page 2 of 5")
- Smooth scroll to top on page change

### 5. Statistics Dashboard
Displays real-time counts:
- Total messages
- Unread messages
- High priority alerts
- Critical alerts
- Starred messages
- Archived messages

### 6. Sidebar Integration
- Live unread count badge on Messages link
- Badge auto-hides when count is 0
- Updates across all pages
- Recent notifications panel (5 latest)

## Technical Implementation

### NotificationService API

```javascript
// Get all notifications
const notifications = NotificationService.getNotifications();

// Filter notifications
const filtered = NotificationService.filter(notifications, {
    category: 'trade',
    priority: 'high',
    read: false,
    search: 'order'
});

// Mark as read
NotificationService.markAsRead(notificationId);

// Mark as unread
NotificationService.markAsUnread(notificationId);

// Toggle star
NotificationService.toggleStar(notificationId);

// Archive
NotificationService.archive(notificationId);

// Delete
NotificationService.delete(notificationId);

// Mark all as read
NotificationService.markAllAsRead();

// Get statistics
const stats = NotificationService.getStats();

// Get unread count
const unreadCount = NotificationService.getUnreadCount();

// Format relative time
const timeString = NotificationService.formatRelativeTime(timestamp);

// Get priority CSS class
const cssClass = NotificationService.getPriorityClass('high'); // returns 'warning'

// Get category icon
const icon = NotificationService.getCategoryIcon('trade'); // returns 'receipt_long'
```

### Data Structure

```javascript
{
    id: 'notif_1234567890_abc123',
    category: 'trade',
    priority: 'high',
    from: 'Trading System',
    subject: 'Order #12345 Executed',
    message: 'Your S&P 500 order has been executed at $4,250.50',
    timestamp: 1697500800000,
    read: false,
    archived: false,
    starred: false
}
```

### localStorage Persistence
Notifications are stored in `localStorage` under the key `dashboard_notifications`. State persists across browser sessions.

## Customization

### Adding New Categories
1. Add to `CATEGORIES` in `notification-service.js`
2. Add icon mapping in `getCategoryIcon()`
3. Update filter dropdown in `messages.html`

### Modifying Notification Templates
Edit the `templates` array in `generateNotifications()`:

```javascript
{
    category: this.CATEGORIES.CUSTOM,
    priority: this.PRIORITY.MEDIUM,
    subjects: ['Template Subject {placeholder}'],
    messages: ['Template message with {placeholder}'],
    from: 'System Name'
}
```

### Changing Items Per Page
Modify `itemsPerPage` constant in `messages.js`:

```javascript
const itemsPerPage = 20; // Change from 10 to 20
```

### Styling
Notification styles are in `messages.html` `<style>` section:
- `.notification-item` - Individual notification container
- `.notification-item.unread` - Unread state styling
- `.priority-badge` - Priority badge styling
- `.filter-bar` - Filter controls layout

## Usage Examples

### User Workflow
1. Navigate to Messages page
2. View statistics at top (total, unread, priorities)
3. Use quick filters or advanced filters to narrow results
4. Search for specific notifications
5. Click notification to expand/read
6. Use action buttons to manage:
   - Mark read/unread
   - Star important items
   - Archive completed items
   - Delete unwanted notifications
7. Navigate pages using pagination
8. Check sidebar for recent notifications
9. See unread count badge on Messages link

### Integration with Other Pages
The notification system is designed to work across all pages:

```javascript
// Update badge count after user action
if (typeof window.updateNotificationBadge === 'function') {
    window.updateNotificationBadge();
}
```

## Performance Considerations

### Optimization Features
- **Pagination** - Only renders 10 items at a time
- **localStorage** - Client-side persistence, no server calls
- **Lazy Loading** - Notifications generated once and cached
- **Efficient Filtering** - Array methods with early returns

### Memory Management
- Maximum 50 notifications by default
- Archived messages kept in storage but hidden from UI
- Deleted messages removed from localStorage
- Consider implementing cleanup for very old notifications

## Future Enhancements

### Potential Additions
- [ ] Real-time notifications via WebSocket
- [ ] Email/SMS notification integration
- [ ] Notification preferences/settings
- [ ] Custom notification rules
- [ ] Notification templates editor
- [ ] Export/import notifications
- [ ] Notification analytics
- [ ] Desktop notifications API
- [ ] Sound alerts for critical notifications
- [ ] Snooze functionality

### Backend Integration
To connect to a real API:

1. Replace `generateNotifications()` with API call:
```javascript
async getNotifications() {
    const response = await fetch('/api/notifications');
    return await response.json();
}
```

2. Add API methods for actions:
```javascript
async markAsRead(id) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
}
```

3. Implement polling or WebSocket for real-time updates

## Browser Compatibility
- **localStorage** - All modern browsers
- **ES6 Features** - Arrow functions, template literals, destructuring
- **CSS** - Custom properties, flexbox, grid
- **Minimum Support** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Accessibility
- Keyboard navigation supported
- ARIA labels on interactive elements
- High contrast mode compatible
- Screen reader friendly
- Focus indicators on all controls

## Security
- **XSS Protection** - All user content escaped via `escapeHtml()`
- **No eval()** - No dynamic code execution
- **localStorage** - Client-side only, no sensitive data
- **Confirmation Dialogs** - For destructive actions (delete)

## Testing
Recommended test cases:
- [ ] Generate notifications successfully
- [ ] Filter by category, priority, status
- [ ] Search functionality
- [ ] Pagination navigation
- [ ] Read/unread toggle
- [ ] Star/unstar functionality
- [ ] Archive/delete operations
- [ ] localStorage persistence
- [ ] Badge count updates
- [ ] Recent notifications display
- [ ] Mobile responsive design
- [ ] Dark mode compatibility

## Support
For issues or questions:
1. Check console for errors
2. Verify localStorage is enabled
3. Clear browser cache if notifications appear stale
4. Regenerate notifications by clearing localStorage key `dashboard_notifications`

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Maintainer**: SQU^RE DOFF Team
