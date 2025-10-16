# CSS Custom Properties Documentation

## Overview
This document describes all CSS custom properties (CSS variables) used throughout the SQU^RE DOFF dashboard for consistent theming and styling.

## Table of Contents
1. [Color Variables](#color-variables)
2. [Layout Variables](#layout-variables)
3. [Shadow Variables](#shadow-variables)
4. [Dark Theme Overrides](#dark-theme-overrides)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)

---

## Color Variables

### Primary Colors
Located in `:root` selector, these are the main colors used throughout the application.

```css
--color-primary: #2d6cdf;
```
**Usage**: Primary actions, links, active states  
**Examples**: Buttons, chart highlights, active navigation items

```css
--color-danger: #ef4444;
```
**Usage**: Errors, warnings, destructive actions  
**Examples**: Delete buttons, error messages, critical alerts

```css
--color-success: #10b981;
```
**Usage**: Success states, positive values, confirmations  
**Examples**: Success messages, profit indicators, completed states

```css
--color-warning: #f59e0b;
```
**Usage**: Warnings, caution states, medium priority  
**Examples**: Warning messages, pending states, medium priority badges

### Neutral Colors

```css
--color-white: #ffffff;
```
**Usage**: Card backgrounds, input backgrounds (light theme)  
**Examples**: Cards, modals, dropdowns

```css
--color-dark: #111827;
```
**Usage**: Primary text color, headings (light theme)  
**Examples**: Body text, h1-h6 elements

```css
--color-dark-variant: #374151;
```
**Usage**: Secondary text, less important content  
**Examples**: Descriptions, timestamps, helper text

```css
--color-info-dark: #6b7280;
```
**Usage**: Muted text, icons, subtle elements  
**Examples**: Icons, placeholders, disabled states

```css
--color-info-light: #e5e7eb;
```
**Usage**: Borders, dividers, subtle backgrounds  
**Examples**: Table borders, hr elements, input borders

```css
--color-light: rgba(17, 24, 39, 0.06);
```
**Usage**: Hover states, subtle backgrounds  
**Examples**: Hover overlays, section backgrounds

```css
--color-background: #f5f7fb;
```
**Usage**: Page background  
**Examples**: Body background, main container background

---

## Layout Variables

### Border Radius

```css
--card-border-radius: 1rem;
```
**Usage**: Main card container rounding  
**Examples**: Dashboard cards, stat cards

```css
--border-radius-1: 0.5rem;
```
**Usage**: Small elements rounding  
**Examples**: Buttons, badges, small cards

```css
--border-radius-2: 0.75rem;
```
**Usage**: Medium elements rounding  
**Examples**: Input fields, dropdowns

```css
--border-radius-3: 1rem;
```
**Usage**: Large elements rounding  
**Examples**: Modals, large containers

### Padding

```css
--card-padding: 1.25rem;
```
**Usage**: Internal padding for cards  
**Examples**: Card content padding

```css
--padding: 1rem;
```
**Usage**: General padding for various elements  
**Examples**: Section padding, container padding

---

## Shadow Variables

```css
--shadow-color: rgba(17, 24, 39, 0.08);
```
**Usage**: Shadow color for depth  
**Examples**: Used in box-shadow calculations

```css
--box-shadow: 0 8px 24px var(--shadow-color);
```
**Usage**: Standard shadow for elevated elements  
**Examples**: Cards, dropdowns, modals, tooltips

### Usage Example:
```css
.card {
    box-shadow: var(--box-shadow);
}

.elevated-element {
    box-shadow: 0 12px 32px var(--shadow-color);
}
```

---

## Dark Theme Overrides

Dark theme variables are scoped within `.dark-theme-variables` class. When dark mode is active, this class is added to the `<body>` element.

### Dark Theme Colors

```css
.dark-theme-variables {
    --color-background: #0b1220;
    --color-white: #0f172a;
    --color-dark: #e5e7eb;
    --color-dark-variant: #94a3b8;
    --color-info-dark: #94a3b8;
    --color-info-light: rgba(148,163,184,0.2);
    --color-light: rgba(255,255,255,0.06);
    --box-shadow: 0 8px 24px rgba(2, 6, 23, 0.6);
}
```

### Key Differences:
- **Background**: Deep navy (#0b1220) instead of light gray
- **White**: Dark slate (#0f172a) for panels instead of pure white
- **Dark**: Light gray (#e5e7eb) for text instead of dark gray
- **Shadows**: Darker, more pronounced shadows for depth

---

## Usage Examples

### 1. Using Color Variables

```css
/* Button styling */
.btn-primary {
    background: var(--color-primary);
    color: var(--color-white);
}

/* Error message */
.error {
    color: var(--color-danger);
    border-left: 4px solid var(--color-danger);
}

/* Success state */
.success-badge {
    background: var(--color-success);
    color: var(--color-white);
}
```

### 2. Using Layout Variables

```css
/* Card component */
.card {
    padding: var(--card-padding);
    border-radius: var(--card-border-radius);
    box-shadow: var(--box-shadow);
    background: var(--color-white);
}

/* Button */
.btn {
    padding: var(--padding);
    border-radius: var(--border-radius-1);
}
```

### 3. Creating Hover States

```css
.clickable-item {
    background: var(--color-white);
    transition: background 0.3s ease;
}

.clickable-item:hover {
    background: var(--color-light);
}
```

### 4. Theme-Aware Components

```css
/* This element automatically adapts to dark theme */
.adaptive-card {
    background: var(--color-white);
    color: var(--color-dark);
    border: 1px solid var(--color-info-light);
}

/* In dark theme, these variables are automatically overridden */
```

---

## Best Practices

### 1. Always Use Variables
❌ **Don't:**
```css
.element {
    background: #ffffff;
    color: #111827;
}
```

✅ **Do:**
```css
.element {
    background: var(--color-white);
    color: var(--color-dark);
}
```

### 2. Use Semantic Colors
❌ **Don't:**
```css
.delete-button {
    background: var(--color-primary);  /* Wrong semantic meaning */
}
```

✅ **Do:**
```css
.delete-button {
    background: var(--color-danger);  /* Correct semantic meaning */
}
```

### 3. Consistent Border Radius
❌ **Don't:**
```css
.card {
    border-radius: 12px;  /* Hardcoded value */
}
```

✅ **Do:**
```css
.card {
    border-radius: var(--card-border-radius);
}
```

### 4. Use Box Shadow Variable
❌ **Don't:**
```css
.elevated {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}
```

✅ **Do:**
```css
.elevated {
    box-shadow: var(--box-shadow);
}

/* Or customize with shadow-color */
.more-elevated {
    box-shadow: 0 12px 32px var(--shadow-color);
}
```

### 5. Fallback Values
When using variables, provide fallbacks for older browsers:

```css
.element {
    color: #111827;  /* Fallback */
    color: var(--color-dark);
}
```

---

## Adding New Variables

When adding new custom properties:

1. **Define in `:root`** for light theme
2. **Override in `.dark-theme-variables`** if different in dark theme
3. **Use semantic naming** (describe purpose, not appearance)
4. **Document here** with description and usage examples

### Example:
```css
/* In :root */
:root {
    --color-accent: #8b5cf6;  /* New accent color */
}

/* In dark theme (if different) */
.dark-theme-variables {
    --color-accent: #a78bfa;  /* Lighter shade for dark theme */
}
```

---

## Variable Scope

### Global Variables (`:root`)
Available everywhere in the application. Use for:
- Colors
- Typography
- Spacing
- Layout values
- Shadows

### Component-Specific Variables
Define within component scope for local customization:

```css
.special-card {
    --card-padding: 2rem;  /* Override for this component */
    padding: var(--card-padding);
}
```

---

## Debugging Variables

To see all active custom properties in DevTools:
1. Open browser DevTools
2. Inspect an element
3. View "Computed" tab
4. Check "Show All" or filter by "--"

Or use JavaScript:
```javascript
// Get computed value of a variable
const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary');
```

---

## Browser Support

CSS Custom Properties are supported in all modern browsers:
- ✅ Chrome 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ Edge 15+

For older browsers, consider using a CSS preprocessor fallback or PostCSS plugin.

---

## Related Documentation
- [Main README](README.md)
- [Mobile Improvements](MOBILE-IMPROVEMENTS.md)
- [Notification System](NOTIFICATIONS.md)

---

**Last Updated**: October 16, 2025  
**Version**: 1.0.0
