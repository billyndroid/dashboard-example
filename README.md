# SQU^RE DOFF - Financial Trading Dashboard

Live Demo: https://billyndroid.github.io/dashboard-example/

## 🚀 Overview
A modern, responsive financial trading dashboard with real-time data visualization, comprehensive notification system, and professional UI designed for commodity and index trading.

## ✨ Features

### 📊 Dashboard & Analytics
- **Real-time Portfolio Metrics** - Live position values, P&L tracking, win rate statistics
- **Dynamic Charts** - Interactive ApexCharts with zoom, download, and responsive breakpoints
- **Historical Data** - Date range filtering with preset options (7/30/90 days)
- **Market Data** - 9 commodities and indices with live price simulation
- **Top Performers** - Auto-updating top gainers and losers

### 📨 Notification System
- **50+ Sample Notifications** - Categorized by Trade, Alert, Market, and System
- **Priority Levels** - Critical, High, Medium, Low with color-coded badges
- **Interactive Management** - Read/unread, star, archive, delete actions
- **Advanced Filtering** - Category, priority, read status, and text search
- **Statistics Dashboard** - Real-time counts and analytics
- **localStorage Persistence** - State saved across sessions
- **Live Badge Updates** - Unread count in sidebar navigation

See [NOTIFICATIONS.md](NOTIFICATIONS.md) for detailed documentation.

### 📱 Mobile Responsive
- **Optimized Layouts** - Proper stacking and spacing on small screens
- **Slide-in Sidebar** - Smooth animation with backdrop overlay
- **Touch-friendly** - 44px minimum touch targets
- **Responsive Charts** - ApexCharts breakpoints for mobile devices
- **Horizontal Tables** - Scrollable tables on narrow viewports

See [MOBILE-IMPROVEMENTS.md](MOBILE-IMPROVEMENTS.md) for mobile optimization details.

### 🎨 Professional Design
- **Modern Typography** - Inter font with tabular numbers for financial data
- **Finance Palette** - Carefully selected colors for professional appearance
- **Dark/Light Themes** - Theme toggle with localStorage persistence
- **Glass-morphism Cards** - Modern UI components with depth
- **Smooth Animations** - CSS transitions and loading states

### 🔧 Data Management
- **DataService** - Historical price generation with random walk algorithm
- **NotificationService** - Comprehensive notification management
- **Config System** - Centralized configuration for API endpoints
- **Mock Data Mode** - Client-side simulation without backend
- **Error Handling** - Robust error handling throughout

## 📁 Project Structure

```
dashboard-example/
├── index.html              # Main dashboard
├── html/
│   ├── analytics.html      # Charts and data visualization
│   ├── messages.html       # Notification center
│   ├── orders.html         # Order execution
│   ├── products.html       # Product management
│   ├── customers.html      # Customer management
│   ├── indecescommodities.html  # Market indices & commodities
│   ├── reports.html        # Reports page
│   └── settings.html       # Settings page
├── scripts/
│   ├── main.js             # Core dashboard logic
│   ├── data-service.js     # Historical data generation
│   ├── notification-service.js  # Notification management
│   ├── messages.js         # Messages page controller
│   ├── orders.js           # Orders functionality
│   ├── config.js           # Configuration management
│   ├── utils.js            # Utility functions
│   ├── data-utils.js       # Data validation utilities
│   └── countup-enhanced.js # Number animations
├── styles/
│   ├── style.css           # Main stylesheet
│   └── glass-card.css      # Glass-morphism effects
├── assets/
│   ├── logo-temp.png       # Logo
│   └── profile-pic-*.png   # Profile images
├── TODO.md                 # Project roadmap
├── NOTIFICATIONS.md        # Notification system docs
├── MOBILE-IMPROVEMENTS.md  # Mobile optimization docs
└── README.md               # This file
```

## 🛠️ Setup & Installation

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/billyndroid/dashboard-example.git
   cd dashboard-example
   ```

2. Open in browser:
   - Option 1: Double-click `index.html`
   - Option 2: Use a local server (recommended)

### Local Development Server
Using Python:
```bash
python -m http.server 8000
```

Using Node.js (http-server):
```bash
npx http-server -p 8000
```

Using VS Code Live Server:
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

### Configuration
Edit `scripts/config.js` to customize:
- API endpoints
- Update intervals
- Mock data mode
- Feature flags

```javascript
const AppConfig = {
    api: {
        baseUrl: 'https://your-api.com',
        endpoints: {
            orders: '/api/orders',
            marketData: '/api/market'
        },
        timeout: 10000,
        useMockData: true  // Set false for real API
    },
    ui: {
        updateInterval: 300000,  // 5 minutes
        chartRefreshRate: 60000  // 1 minute
    }
};
```

## 📊 Data Sources

### Mock Data (Default)
- **DataService** generates historical price data using random walk algorithm
- **NotificationService** creates 50+ sample notifications
- No backend required - fully client-side

### Real API Integration
1. Set `useMockData: false` in `config.js`
2. Configure API endpoints
3. Implement authentication if needed
4. Update service files to use fetch instead of mock data

Example:
```javascript
async function getMarketData() {
    const response = await fetch(`${AppConfig.api.baseUrl}/market`);
    return await response.json();
}
```

## 🎯 Key Features in Detail

### Dashboard (index.html)
- Portfolio position tracking
- P&L calculation with win rate
- Recent orders table with execution controls
- Top gainer/loser cards with live updates
- Progress circles with SVG animations

### Analytics (analytics.html)
- Volume chart (bar chart by asset)
- Price change chart (line chart over time)
- Historical comparison (multi-line for top 5 assets)
- Date range picker with presets
- Auto-refresh every 5 minutes

### Messages (messages.html)
- Statistics cards (total, unread, priorities)
- Advanced filtering (category, priority, search)
- Pagination (10 items per page)
- Notification actions (read, star, archive, delete)
- Recent notifications sidebar

### Orders (orders.html)
- Order execution with live market data
- Success/error handling
- Order history table
- Execution confirmations

## 🎨 Theming

### Dark/Light Mode
Toggle between themes using the theme switcher in the navigation bar. Preference is saved to localStorage.

### Custom Colors
Edit CSS custom properties in `styles/style.css`:

```css
:root {
    --color-primary: #7380ec;
    --color-danger: #ff6b6b;
    --color-success: #28a745;
    --color-warning: #ffc107;
    /* Add custom colors */
}
```

## 📱 Mobile Support

### Breakpoints
- **Desktop**: 1200px+
- **Tablet**: 768px - 1199px
- **Mobile**: < 768px

### Mobile Features
- Hamburger menu with slide-in sidebar
- Backdrop overlay for focus
- Touch-optimized controls
- Responsive chart sizing
- Scrollable tables

## 🧪 Testing

### Manual Testing Checklist
- [ ] All pages load without errors
- [ ] Navigation works across pages
- [ ] Theme toggle persists
- [ ] Charts render and update
- [ ] Notifications filter correctly
- [ ] Mobile menu opens/closes
- [ ] Dark mode works on all pages
- [ ] Forms validate properly

### Browser Testing
Tested on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📚 Documentation

- **[TODO.md](TODO.md)** - Development roadmap and completed tasks
- **[NOTIFICATIONS.md](NOTIFICATIONS.md)** - Notification system documentation
- **[MOBILE-IMPROVEMENTS.md](MOBILE-IMPROVEMENTS.md)** - Mobile optimization guide

## 🤝 Contributing

This is a demonstration project. For improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is available for demonstration and educational purposes.

## 🙏 Acknowledgments

- **ApexCharts** - Chart library
- **Google Material Icons** - Icon set
- **Inter Font** - Typography

---

**Last Updated**: October 16, 2025  
**Version**: 2.0.0  
**Status**: Production Ready

For questions or issues, please open an issue on GitHub.
