# JavaScript Functions Documentation

This document provides detailed documentation for all JavaScript functions in the Dashboard Example project.

## 📁 File Structure

### Core Scripts
- **main.js** - Dashboard initialization and core functionality
- **config.js** - Configuration management
- **data-service.js** - Data generation and management
- **notification-service.js** - Notification system
- **error-handler.js** - Global error handling
- **security-utils.js** - Security utilities
- **performance-utils.js** - Performance monitoring

### Page-Specific Scripts
- **messages.js** - Notification center functionality
- **orders.js** - Order management
- **candlechart.js** - Candlestick chart implementation
- **linechart.js** - Line chart implementation

### Utility Scripts
- **utils.js** - General utility functions
- **data-utils.js** - Data validation utilities
- **countup-enhanced.js** - Number animation utilities

---

## 🎯 main.js

### Theme Management

#### `loadThemePreference()`
Loads and applies saved theme preference from localStorage.

**Parameters:** None

**Returns:** `void`

**Description:**
- Retrieves theme from localStorage
- Applies 'dark-theme-variables' class if needed
- Updates theme toggle icon states

**Example:**
```javascript
document.addEventListener('DOMContentLoaded', loadThemePreference);
```

---

### Progress Circles

#### `updateProgressCircles()`
Updates SVG progress circles based on percentage values in the DOM.

**Parameters:** None

**Returns:** `void`

**Description:**
- Selects all `.progress circle` elements
- Extracts percentage from adjacent text (supports +8.2%, -1.5%, 75% formats)
- Calculates stroke-dashoffset using formula: `offset = circumference - (percentage/100) * circumference`
- Applies color coding: green (+), red (-), blue (neutral)
- Uses smooth 1s ease-in-out transition

**Formula:**
```
circumference = 2πr (where r = 36)
offset = circumference - (percentage / 100) × circumference
```

**Example:**
```html
<div class="progress">
    <svg>
        <circle cx="38" cy="38" r="36"></circle>
    </svg>
    <div class="number">
        <p>+8.2%</p>
    </div>
</div>
```

---

### Orders Table

#### `populateOrdersTable()`
Populates the recent orders table with data from Orders array.

**Parameters:** None

**Returns:** `void`

**Description:**
- Checks if Orders data is available
- Selects table body element
- Creates table rows with order details
- Applies status color coding
- Limits to 5 most recent orders

**Status Classes:**
- `warning` - Pending
- `primary` - Shipped  
- `danger` - Declined

**Example:**
```javascript
// Orders data structure
const Orders = [
    {
        productNumber: '85631',
        productName: 'Gold Futures',
        paymentStatus: 'Completed'
    }
];
```

---

### Live Data Updates

#### `updateLiveData()`
Updates market data, prices, and statistics in real-time.

**Parameters:** None

**Returns:** `void`

**Description:**
- Simulates price changes (-2% to +2%)
- Updates top gainer/loser cards
- Refreshes portfolio metrics
- Updates chart data
- Runs every 30 seconds via setInterval

**Price Change Calculation:**
```javascript
const change = (Math.random() - 0.5) * 0.04; // -2% to +2%
newPrice = oldPrice * (1 + change);
```

---

## 🔧 config.js

### Configuration Object

#### `AppConfig`
Centralized configuration object for the entire application.

**Structure:**
```javascript
const AppConfig = {
    api: {
        baseUrl: string,
        endpoints: object,
        timeout: number,
        retryAttempts: number,
        useMockData: boolean
    },
    ui: {
        updateInterval: number,
        chartRefreshRate: number,
        animationDuration: number,
        theme: string
    },
    notifications: {
        maxVisible: number,
        autoHideDelay: number,
        position: string
    },
    performance: {
        enableMonitoring: boolean,
        lazyLoadImages: boolean,
        debounceDelay: number
    }
}
```

**Usage:**
```javascript
// Get API endpoint
const url = `${AppConfig.api.baseUrl}${AppConfig.api.endpoints.orders}`;

// Get update interval
setInterval(updateData, AppConfig.ui.updateInterval);
```

---

## 📊 data-service.js

### Historical Data Generation

#### `DataService.generateHistoricalPrices(asset, days, startPrice)`
Generates historical price data using random walk algorithm.

**Parameters:**
- `asset` (string) - Asset symbol (e.g., 'GOLD', 'SP500')
- `days` (number) - Number of days of historical data
- `startPrice` (number) - Starting price

**Returns:** `Array<{date: Date, price: number, asset: string}>`

**Algorithm:**
Uses geometric Brownian motion for realistic price movement:
```javascript
drift = 0.0001 (0.01% daily drift)
volatility = 0.02 (2% daily volatility)
change = drift + volatility * randomNormal()
price[t] = price[t-1] * (1 + change)
```

**Example:**
```javascript
const goldPrices = DataService.generateHistoricalPrices('GOLD', 30, 1850);
// Returns 30 days of price data starting at $1850
```

---

#### `DataService.calculatePriceChange(data, days)`
Calculates price change percentage over specified period.

**Parameters:**
- `data` (Array) - Array of price objects
- `days` (number) - Period for calculation

**Returns:** `number` - Percentage change

**Formula:**
```
change% = ((currentPrice - oldPrice) / oldPrice) × 100
```

**Example:**
```javascript
const change = DataService.calculatePriceChange(goldPrices, 7);
console.log(`7-day change: ${change.toFixed(2)}%`);
```

---

#### `DataService.aggregateVolume(data, groupBy)`
Aggregates trading volume by time period.

**Parameters:**
- `data` (Array) - Array of volume data
- `groupBy` (string) - 'daily', 'weekly', 'monthly'

**Returns:** `Array<{period: string, volume: number}>`

**Example:**
```javascript
const weeklyVolume = DataService.aggregateVolume(volumeData, 'weekly');
```

---

## 📬 notification-service.js

### Notification Management

#### `NotificationService.create(notification)`
Creates a new notification.

**Parameters:**
- `notification` (object) - Notification data
  - `title` (string) - Notification title
  - `message` (string) - Notification body
  - `category` (string) - 'trade', 'alert', 'market', 'system'
  - `priority` (string) - 'critical', 'high', 'medium', 'low'
  - `actionLabel` (string, optional) - Action button text
  - `actionUrl` (string, optional) - Action URL

**Returns:** `object` - Created notification with ID and timestamp

**Example:**
```javascript
const notification = NotificationService.create({
    title: 'Order Executed',
    message: 'Your gold futures order has been filled',
    category: 'trade',
    priority: 'high',
    actionLabel: 'View Order',
    actionUrl: '/orders.html'
});
```

---

#### `NotificationService.getAll(filters)`
Retrieves notifications with optional filtering.

**Parameters:**
- `filters` (object, optional)
  - `category` (string) - Filter by category
  - `priority` (string) - Filter by priority
  - `isRead` (boolean) - Filter by read status
  - `search` (string) - Search in title/message

**Returns:** `Array<object>` - Filtered notifications

**Example:**
```javascript
// Get unread critical notifications
const critical = NotificationService.getAll({
    priority: 'critical',
    isRead: false
});
```

---

#### `NotificationService.markAsRead(id)`
Marks notification as read.

**Parameters:**
- `id` (string) - Notification ID

**Returns:** `boolean` - Success status

---

#### `NotificationService.markAllAsRead()`
Marks all notifications as read.

**Returns:** `number` - Count of notifications marked

---

#### `NotificationService.toggleStar(id)`
Toggles star/favorite status.

**Parameters:**
- `id` (string) - Notification ID

**Returns:** `boolean` - New star status

---

#### `NotificationService.archive(id)`
Archives a notification.

**Parameters:**
- `id` (string) - Notification ID

**Returns:** `boolean` - Success status

---

#### `NotificationService.delete(id)`
Permanently deletes a notification.

**Parameters:**
- `id` (string) - Notification ID

**Returns:** `boolean` - Success status

---

#### `NotificationService.getStatistics()`
Gets notification statistics.

**Returns:** `object` - Statistics object
```javascript
{
    total: number,
    unread: number,
    critical: number,
    high: number,
    starred: number,
    archived: number,
    byCategory: {
        trade: number,
        alert: number,
        market: number,
        system: number
    }
}
```

---

## 🛡️ error-handler.js

### Error Handling

#### `ErrorHandler.handle(error, context, severity)`
Centralized error handling function.

**Parameters:**
- `error` (Error) - Error object
- `context` (string) - Context where error occurred
- `severity` (string) - 'low', 'medium', 'high', 'critical'

**Returns:** `void`

**Features:**
- Logs to console in development
- Stores in errorLog array
- Sends to monitoring service
- Displays user-friendly message
- Categorizes error type

**Example:**
```javascript
try {
    const data = JSON.parse(response);
} catch (error) {
    ErrorHandler.handle(error, 'parseJSON', 'medium');
}
```

---

#### `ErrorHandler.wrap(fn, context)`
Wraps function with error handling.

**Parameters:**
- `fn` (Function) - Function to wrap
- `context` (string) - Context description

**Returns:** `Function` - Wrapped function

**Example:**
```javascript
const safeFetch = ErrorHandler.wrap(fetchData, 'API fetch');
safeFetch().then(data => console.log(data));
```

---

#### `ErrorHandler.getErrors(filter)`
Retrieves logged errors.

**Parameters:**
- `filter` (object, optional)
  - `severity` (string) - Filter by severity
  - `type` (string) - Filter by error type

**Returns:** `Array<object>` - Error log entries

---

## 🔒 security-utils.js

### Input Sanitization

#### `SecurityUtils.sanitizeHTML(html)`
Sanitizes HTML string to prevent XSS attacks.

**Parameters:**
- `html` (string) - HTML string to sanitize

**Returns:** `string` - Sanitized HTML

**Removes:**
- `<script>` tags
- `<iframe>` tags
- `onclick`, `onerror`, `onload` attributes
- `javascript:` URLs

**Example:**
```javascript
const userInput = '<script>alert("XSS")</script>Hello';
const safe = SecurityUtils.sanitizeHTML(userInput);
// Returns: 'Hello'
```

---

#### `SecurityUtils.validateEmail(email)`
Validates email format.

**Parameters:**
- `email` (string) - Email to validate

**Returns:** `boolean` - Validity

**Pattern:** `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

#### `SecurityUtils.validateNumber(value, min, max)`
Validates numeric input with optional range.

**Parameters:**
- `value` (any) - Value to validate
- `min` (number, optional) - Minimum value
- `max` (number, optional) - Maximum value

**Returns:** `boolean` - Validity

**Example:**
```javascript
SecurityUtils.validateNumber(50, 0, 100); // true
SecurityUtils.validateNumber(150, 0, 100); // false
```

---

#### `SecurityUtils.rateLimit(key, limit, window)`
Implements rate limiting for actions.

**Parameters:**
- `key` (string) - Unique key for action
- `limit` (number) - Max attempts
- `window` (number) - Time window in ms

**Returns:** `boolean` - Whether action is allowed

**Example:**
```javascript
if (SecurityUtils.rateLimit('login', 5, 60000)) {
    // Proceed with login
} else {
    // Show "too many attempts" error
}
```

---

## ⚡ performance-utils.js

### Performance Monitoring

#### `PerformanceUtils.mark(name)`
Creates a performance mark.

**Parameters:**
- `name` (string) - Mark name

**Returns:** `void`

**Example:**
```javascript
PerformanceUtils.mark('data-fetch-start');
await fetchData();
PerformanceUtils.mark('data-fetch-end');
```

---

#### `PerformanceUtils.measure(name, start, end)`
Measures duration between marks.

**Parameters:**
- `name` (string) - Measurement name
- `start` (string) - Start mark name
- `end` (string, optional) - End mark name

**Returns:** `number` - Duration in milliseconds

**Example:**
```javascript
const duration = PerformanceUtils.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
console.log(`Fetch took ${duration}ms`);
```

---

#### `PerformanceUtils.debounce(func, wait, immediate)`
Creates a debounced function.

**Parameters:**
- `func` (Function) - Function to debounce
- `wait` (number) - Wait time in ms
- `immediate` (boolean, optional) - Execute immediately

**Returns:** `Function` - Debounced function

**Example:**
```javascript
const debouncedSearch = PerformanceUtils.debounce(search, 300);
searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
```

---

#### `PerformanceUtils.throttle(func, limit)`
Creates a throttled function.

**Parameters:**
- `func` (Function) - Function to throttle
- `limit` (number) - Time limit in ms

**Returns:** `Function` - Throttled function

**Example:**
```javascript
const throttledScroll = PerformanceUtils.throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);
```

---

#### `PerformanceUtils.lazyLoadImages(selector)`
Lazy loads images using IntersectionObserver.

**Parameters:**
- `selector` (string) - CSS selector for images

**Returns:** `void`

**Example:**
```html
<img data-src="large-image.jpg" alt="Description">
```
```javascript
PerformanceUtils.lazyLoadImages('img[data-src]');
```

---

#### `PerformanceUtils.getLoadMetrics()`
Gets page load performance metrics.

**Returns:** `object` - Load metrics
```javascript
{
    ttfb: number,      // Time to First Byte
    domReady: number,  // DOM Ready time
    load: number,      // Total load time
    fcp: number        // First Contentful Paint
}
```

---

## 📚 Additional Resources

- [CODE-QUALITY.md](CODE-QUALITY.md) - Code quality guidelines
- [PERFORMANCE.md](PERFORMANCE.md) - Performance optimization
- [CSS-VARIABLES.md](CSS-VARIABLES.md) - CSS custom properties
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines

---

**Last Updated:** October 16, 2025  
**Version:** 2.0.0
