# Contributing to Dashboard Example

Thank you for considering contributing to the Dashboard Example project! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

## 🤝 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy toward other contributors

### Our Responsibilities
- Maintain code quality and project standards
- Provide helpful feedback on contributions
- Respond to issues and pull requests in a timely manner
- Foster a welcoming and collaborative environment

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ (for build tools)
- Git
- Modern web browser (Chrome, Firefox, Safari, or Edge)
- Code editor (VS Code recommended)

### Fork and Clone
```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR-USERNAME/dashboard-example.git
cd dashboard-example

# Add upstream remote
git remote add upstream https://github.com/billyndroid/dashboard-example.git
```

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm start
# Visit http://localhost:8000
```

## 🔄 Development Workflow

### 1. Create a Branch
```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### Branch Naming Conventions
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `perf/` - Performance improvements
- `test/` - Test additions/updates
- `style/` - UI/styling changes

### 2. Make Changes
- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 3. Test Your Changes
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Manual testing checklist:
# - Test in multiple browsers
# - Test mobile responsiveness
# - Test dark/light themes
# - Check console for errors
# - Verify no broken functionality
```

### 4. Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

### 5. Push and Create PR
```bash
git push origin feature/your-feature-name
# Then create Pull Request on GitHub
```

## 📝 Coding Standards

### JavaScript Style Guide

#### General Rules
- Use ES6+ features (const/let, arrow functions, template literals)
- No `var` declarations
- Use single quotes for strings
- Add semicolons
- 4-space indentation
- Max line length: 100 characters

#### JSDoc Comments
Always add JSDoc comments to functions:

```javascript
/**
 * Calculate the percentage change between two values
 * @param {number} oldValue - The original value
 * @param {number} newValue - The new value
 * @returns {number} The percentage change
 * @throws {Error} If oldValue is zero
 */
function calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) {
        throw new Error('Cannot calculate percentage change from zero');
    }
    return ((newValue - oldValue) / oldValue) * 100;
}
```

#### Error Handling
Always wrap risky operations in try-catch:

```javascript
function fetchData() {
    try {
        // Risky operation
        const data = JSON.parse(response);
        return data;
    } catch (error) {
        console.error('Failed to parse data:', error);
        return null;
    }
}
```

#### Event Listeners
Check for element existence before adding listeners:

```javascript
const button = document.getElementById('myButton');
if (button) {
    button.addEventListener('click', handleClick);
} else {
    console.warn('Button element not found');
}
```

### CSS Style Guide

#### General Rules
- Use CSS custom properties (variables)
- 4-space indentation
- Single quotes for strings
- Lowercase hex colors
- Short hex when possible (#fff vs #ffffff)
- Mobile-first responsive design

#### Custom Properties
Define in `:root` and use throughout:

```css
:root {
    --color-primary: #7380ec;
    --spacing-md: 1rem;
    --border-radius: 0.4rem;
}

.card {
    background: var(--color-primary);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
}
```

#### Naming Conventions
- Use BEM-like naming: `.block__element--modifier`
- Use descriptive class names
- Avoid overly specific selectors

#### Comments
Add section comments for organization:

```css
/* ==================== NAVIGATION ==================== */

/* Sidebar menu styles */
.sidebar {
    /* ... */
}

/* Mobile menu toggle */
#menu-btn {
    /* ... */
}
```

### HTML Style Guide

#### General Rules
- Use semantic HTML5 elements
- 4-space indentation
- Lowercase attributes
- Quote all attribute values
- Close all tags
- Alt text for all images

#### Accessibility
- Use proper heading hierarchy (h1, h2, h3...)
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Minimum 44x44px touch targets

```html
<button 
    class="icon-btn" 
    aria-label="Open navigation menu"
    title="Menu">
    <span class="material-icons-sharp">menu</span>
</button>
```

## 📝 Commit Guidelines

### Commit Message Format
Follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Other changes that don't modify src or test files

### Examples
```bash
# Feature
git commit -m "feat(notifications): add filtering by priority level"

# Bug fix
git commit -m "fix(sidebar): prevent scroll on mobile when sidebar is open"

# Documentation
git commit -m "docs(readme): add installation instructions"

# Performance
git commit -m "perf(charts): implement lazy loading for ApexCharts library"

# Breaking change
git commit -m "feat(api)!: change endpoint structure

BREAKING CHANGE: API endpoints now use /api/v2/ prefix"
```

## 🔍 Pull Request Process

### Before Submitting
1. ✅ Code follows style guidelines
2. ✅ All tests pass
3. ✅ No console errors
4. ✅ Works on Chrome, Firefox, Safari, Edge
5. ✅ Mobile responsive
6. ✅ Dark/light themes work
7. ✅ Documentation updated
8. ✅ Commit messages follow guidelines

### PR Description Template
Use the provided PR template and fill in all sections:
- Description of changes
- Type of change
- Related issues
- Testing performed
- Screenshots (for UI changes)
- Checklist items

### Review Process
1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, PR will be merged
4. Your contribution will be credited

### After Merge
```bash
# Update your fork
git checkout main
git pull upstream main
git push origin main
```

## ✅ Testing Requirements

### Manual Testing Checklist

#### Functionality
- [ ] Feature works as intended
- [ ] No JavaScript errors in console
- [ ] No broken functionality on other pages
- [ ] Data loads correctly
- [ ] Forms validate properly
- [ ] Error handling works

#### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if available)
- [ ] Edge (latest)

#### Responsive Design
- [ ] Desktop (1920x1080+)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

#### Themes
- [ ] Light theme works
- [ ] Dark theme works
- [ ] Theme toggle works
- [ ] Theme persists on reload

#### Performance
- [ ] Page loads in < 3 seconds
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Charts render quickly

### Automated Testing
```bash
# Run linters
npm run lint

# Run build
npm run build
```

## 📚 Documentation

### Code Documentation
- Add JSDoc comments to all functions
- Document complex algorithms inline
- Explain non-obvious code decisions
- Update CSS-VARIABLES.md for new custom properties

### Project Documentation
Update relevant .md files:
- **README.md** - Project overview and setup
- **PERFORMANCE.md** - Performance optimization
- **CODE-QUALITY.md** - Code quality guidelines
- **NOTIFICATIONS.md** - Notification system
- **MOBILE-IMPROVEMENTS.md** - Mobile features
- **CSS-VARIABLES.md** - CSS custom properties

### Examples
When adding new features, include usage examples:

```javascript
/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 * @example
 * formatCurrency(1234.56) // Returns "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // Returns "€1,234.56"
 */
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}
```

## 🎯 Areas for Contribution

### High Priority
- Cross-browser compatibility fixes
- Mobile responsiveness improvements
- Accessibility enhancements
- Performance optimizations
- Documentation improvements

### Feature Ideas
- Real-time WebSocket integration
- User authentication system
- Export functionality (CSV, PDF)
- Advanced filtering options
- Custom dashboard layouts
- More chart types
- Internationalization (i18n)

### Good First Issues
Look for issues labeled `good-first-issue` on GitHub.

## 💬 Communication

### Questions?
- Open a discussion on GitHub
- Comment on relevant issues
- Reach out to maintainers

### Reporting Bugs
Use the bug report template and include:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots/console errors

### Suggesting Features
Use the feature request template and include:
- Clear description
- Use cases
- Benefits
- Implementation ideas

## 🏆 Recognition

Contributors will be:
- Listed in project credits
- Mentioned in release notes
- Appreciated for their efforts!

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Dashboard Example!** 🎉

Your efforts help make this project better for everyone.
