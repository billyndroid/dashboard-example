# Code Quality & Security Guide

## Overview
This document outlines code quality standards, security practices, and best practices for the SQU^RE DOFF dashboard project.

## Table of Contents
1. [Code Quality Standards](#code-quality-standards)
2. [Security Best Practices](#security-best-practices)
3. [Error Handling](#error-handling)
4. [Input Validation](#input-validation)
5. [Performance Guidelines](#performance-guidelines)
6. [Testing Recommendations](#testing-recommendations)

---

## Code Quality Standards

### JavaScript

#### 1. Use Strict Mode
Always start JavaScript files with `'use strict';`:

```javascript
(function() {
    'use strict';
    
    // Your code here
})();
```

#### 2. Consistent Naming Conventions

- **Variables/Functions**: camelCase
  ```javascript
  let userName = 'John';
  function getUserData() { }
  ```

- **Constants**: UPPER_SNAKE_CASE
  ```javascript
  const API_ENDPOINT = '/api/data';
  const MAX_RETRY_ATTEMPTS = 3;
  ```

- **Classes/Constructors**: PascalCase
  ```javascript
  class DataService { }
  function NotificationService() { }
  ```

- **Private Methods**: Prefix with underscore
  ```javascript
  _privateMethod() { }
  ```

#### 3. Function Documentation (JSDoc)

```javascript
/**
 * Fetch user data from API
 * @param {string} userId - The user ID
 * @param {Object} options - Optional parameters
 * @param {boolean} options.includeMetadata - Include metadata
 * @returns {Promise<Object>} User data object
 * @throws {Error} If user not found
 */
async function getUserData(userId, options = {}) {
    // Implementation
}
```

#### 4. Error Handling

Always use try-catch for async operations:

```javascript
try {
    const data = await fetchData();
    processData(data);
} catch (error) {
    ErrorHandler.handle(error, {
        source: 'getUserData',
        severity: 'high',
        showUser: true
    });
}
```

#### 5. Avoid Magic Numbers

❌ **Don't:**
```javascript
setTimeout(function() {
    refresh();
}, 300000);
```

✅ **Do:**
```javascript
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
setTimeout(function() {
    refresh();
}, REFRESH_INTERVAL);
```

#### 6. Use Const/Let, Not Var

❌ **Don't:**
```javascript
var count = 0;
```

✅ **Do:**
```javascript
const MAX_COUNT = 100;
let count = 0;
```

---

## Security Best Practices

### 1. Input Sanitization

**Always sanitize user input before displaying:**

```javascript
// Using SecurityUtils
const userInput = document.getElementById('input').value;
const sanitized = SecurityUtils.sanitizeHTML(userInput);
document.getElementById('output').innerHTML = sanitized;
```

### 2. XSS Prevention

❌ **Don't:**
```javascript
element.innerHTML = userInput;  // DANGEROUS!
```

✅ **Do:**
```javascript
element.textContent = userInput;  // Safe
// OR
element.innerHTML = SecurityUtils.escapeHTML(userInput);
```

### 3. SQL Injection Prevention (Backend)

If implementing backend:
- Use parameterized queries
- Never concatenate user input into SQL
- Validate all inputs server-side

### 4. Authentication & Authorization

```javascript
// Check authentication before sensitive operations
function deleteRecord(recordId) {
    if (!isAuthenticated()) {
        throw new Error('User not authenticated');
    }
    
    if (!hasPermission('delete')) {
        throw new Error('Insufficient permissions');
    }
    
    // Proceed with deletion
}
```

### 5. Secure Data Storage

```javascript
// Use SecurityUtils for secure storage
SecurityUtils.secureStore('userData', data, {
    expiresIn: 24 * 60 * 60 * 1000  // 24 hours
});

// Retrieve with expiration check
const userData = SecurityUtils.secureRetrieve('userData');
```

### 6. Rate Limiting

```javascript
function submitForm() {
    if (!SecurityUtils.checkRateLimit('form_submit', 5, 60000)) {
        alert('Too many attempts. Please wait.');
        return;
    }
    
    // Process form
}
```

### 7. HTTPS Only

In production:
- All API calls must use HTTPS
- Set secure cookie flags
- Implement Content Security Policy

### 8. Content Security Policy (CSP)

Add to HTML `<head>`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;">
```

---

## Error Handling

### 1. Global Error Handler

The `ErrorHandler` service provides centralized error management:

```javascript
// Basic usage
try {
    await riskyOperation();
} catch (error) {
    ErrorHandler.handle(error, {
        type: 'network',
        severity: 'high',
        source: 'riskyOperation',
        showUser: true
    });
}
```

### 2. Error Wrapping

Wrap functions with automatic error handling:

```javascript
// Async function wrapper
const safeAsyncFunc = ErrorHandler.async(
    async function fetchData() {
        const response = await fetch('/api/data');
        return response.json();
    },
    { source: 'fetchData', severity: 'medium' }
);

// Sync function wrapper
const safeSyncFunc = ErrorHandler.wrap(
    function processData(data) {
        return data.map(item => item.value);
    },
    { source: 'processData' }
);
```

### 3. Error Types

Use appropriate error types:

```javascript
ErrorHandler.ERROR_TYPES.NETWORK    // Network/fetch errors
ErrorHandler.ERROR_TYPES.VALIDATION // Input validation errors
ErrorHandler.ERROR_TYPES.PERMISSION // Permission denied
ErrorHandler.ERROR_TYPES.NOT_FOUND  // Resource not found
ErrorHandler.ERROR_TYPES.SERVER     // Server errors
ErrorHandler.ERROR_TYPES.CLIENT     // Client-side errors
ErrorHandler.ERROR_TYPES.UNKNOWN    // Unknown errors
```

### 4. User-Friendly Messages

Don't expose technical details to users:

❌ **Don't:**
```javascript
alert(error.stack);  // Technical details
```

✅ **Do:**
```javascript
ErrorHandler.handle(error, {
    showUser: true  // Shows user-friendly message
});
```

---

## Input Validation

### 1. Email Validation

```javascript
const email = document.getElementById('email').value;

if (!SecurityUtils.isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
}
```

### 2. Number Validation

```javascript
const price = document.getElementById('price').value;

if (!SecurityUtils.isValidNumber(price, { min: 0, max: 10000 })) {
    showError('Price must be between 0 and 10,000');
    return;
}
```

### 3. String Validation

```javascript
const username = document.getElementById('username').value;

if (!SecurityUtils.isValidString(username, { 
    minLength: 3, 
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/
})) {
    showError('Username must be 3-20 characters (letters, numbers, underscore)');
    return;
}
```

### 4. Date Validation

```javascript
const date = document.getElementById('date').value;

if (!SecurityUtils.isValidDate(date, {
    minDate: new Date(),
    maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
})) {
    showError('Date must be within the next year');
    return;
}
```

### 5. Sanitize Objects

```javascript
const userInput = {
    name: '<script>alert("xss")</script>',
    age: '25',
    nested: {
        city: 'New York'
    }
};

const sanitized = SecurityUtils.sanitizeObject(userInput);
// All string values are sanitized
```

---

## Performance Guidelines

### 1. Debouncing

For search inputs and frequent events:

```javascript
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Usage
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', debounce(function() {
    performSearch(this.value);
}, 300));
```

### 2. Throttling

For scroll and resize events:

```javascript
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Usage
window.addEventListener('scroll', throttle(function() {
    updateScrollPosition();
}, 100));
```

### 3. Lazy Loading

Defer non-critical resources:

```javascript
// Load charts only when needed
async function loadChartsLibrary() {
    if (!window.ApexCharts) {
        await import('https://cdn.jsdelivr.net/npm/apexcharts');
    }
}
```

### 4. Memory Management

Clean up event listeners and intervals:

```javascript
let updateInterval;

function startUpdates() {
    updateInterval = setInterval(updateData, 5000);
}

function stopUpdates() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Clean up on page unload
window.addEventListener('beforeunload', stopUpdates);
```

### 5. DOM Manipulation

Batch DOM updates:

❌ **Don't:**
```javascript
items.forEach(item => {
    list.appendChild(createListItem(item));  // Multiple reflows
});
```

✅ **Do:**
```javascript
const fragment = document.createDocumentFragment();
items.forEach(item => {
    fragment.appendChild(createListItem(item));
});
list.appendChild(fragment);  // Single reflow
```

---

## Testing Recommendations

### 1. Unit Testing

Test individual functions:

```javascript
// Example test (using Jest syntax)
describe('SecurityUtils', () => {
    test('sanitizeHTML removes script tags', () => {
        const input = '<script>alert("xss")</script>Hello';
        const output = SecurityUtils.sanitizeHTML(input);
        expect(output).not.toContain('<script>');
    });
    
    test('isValidEmail accepts valid emails', () => {
        expect(SecurityUtils.isValidEmail('test@example.com')).toBe(true);
        expect(SecurityUtils.isValidEmail('invalid')).toBe(false);
    });
});
```

### 2. Integration Testing

Test component interactions:

```javascript
describe('Notification System', () => {
    test('creates and displays notification', () => {
        const notification = NotificationService.create({
            message: 'Test notification',
            type: 'success'
        });
        
        expect(notification).toBeDefined();
        expect(notification.message).toBe('Test notification');
    });
});
```

### 3. Manual Testing Checklist

- [ ] Test all user flows
- [ ] Test error states
- [ ] Test with invalid inputs
- [ ] Test on different browsers
- [ ] Test on mobile devices
- [ ] Test with slow network
- [ ] Test with disabled JavaScript (graceful degradation)
- [ ] Test accessibility (keyboard navigation, screen readers)

### 4. Security Testing

- [ ] Test XSS prevention (try injecting scripts)
- [ ] Test SQL injection (if applicable)
- [ ] Test authentication bypass attempts
- [ ] Test CSRF protection
- [ ] Test rate limiting
- [ ] Review all user inputs for sanitization
- [ ] Check for exposed sensitive data in console/network

---

## Code Review Checklist

Before committing code, verify:

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] No console errors

### Security
- [ ] User input sanitized
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization checked
- [ ] Sensitive data not exposed

### Performance
- [ ] No memory leaks
- [ ] Event listeners cleaned up
- [ ] DOM updates optimized
- [ ] Assets optimized

### Code Quality
- [ ] Follows naming conventions
- [ ] Functions documented
- [ ] No magic numbers
- [ ] No commented-out code
- [ ] No TODO/FIXME in production

### Compatibility
- [ ] Works in target browsers
- [ ] Mobile responsive
- [ ] Accessible (keyboard, screen readers)

---

## Common Security Vulnerabilities to Avoid

### 1. Cross-Site Scripting (XSS)
- Always sanitize user input
- Use textContent instead of innerHTML when possible
- Implement CSP headers

### 2. Cross-Site Request Forgery (CSRF)
- Use CSRF tokens for state-changing operations
- Validate origin headers
- Use SameSite cookie attribute

### 3. Sensitive Data Exposure
- Don't log sensitive data
- Don't store passwords client-side
- Use HTTPS for all communications
- Implement proper session management

### 4. Broken Authentication
- Implement proper session timeout
- Use secure password requirements
- Implement account lockout after failed attempts
- Use secure token generation

### 5. Insufficient Logging
- Log security events
- Monitor error patterns
- Track authentication attempts
- Don't log sensitive data

---

## Tools and Resources

### Linting
- **ESLint**: JavaScript linting
- **Stylelint**: CSS linting

### Security Scanning
- **OWASP ZAP**: Security testing
- **npm audit**: Dependency vulnerability scanning

### Performance Testing
- **Lighthouse**: Performance auditing
- **WebPageTest**: Performance analysis

### Browser DevTools
- Network tab for API monitoring
- Performance tab for profiling
- Security tab for certificate validation
- Console for error tracking

---

## Continuous Improvement

### Regular Audits
- Weekly code reviews
- Monthly security audits
- Quarterly dependency updates
- Annual architecture review

### Stay Updated
- Follow security advisories
- Update dependencies regularly
- Review OWASP Top 10
- Attend security webinars

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0  
**Maintainer**: SQU^RE DOFF Team
