/**
 * Stocks Page JavaScript
 * Manages stock data display, modals, and interactions
 */

// Stock data with realistic information
const stocksData = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 178.45,
        change: 2.35,
        changePercent: 1.33,
        volume: '142.5M',
        marketCap: '$2.8T',
        sector: 'Technology',
        pe: 29.4,
        dividend: 0.54,
        high: 179.92,
        low: 176.23
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 387.92,
        change: 4.68,
        changePercent: 1.22,
        volume: '34.8M',
        marketCap: '$2.9T',
        sector: 'Technology',
        pe: 35.2,
        dividend: 0.72,
        high: 389.45,
        low: 384.12
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 142.68,
        change: 1.89,
        changePercent: 1.34,
        volume: '28.9M',
        marketCap: '$1.8T',
        sector: 'Technology',
        pe: 27.8,
        dividend: 0.00,
        high: 143.87,
        low: 141.23
    },
    {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        price: 168.23,
        change: 3.42,
        changePercent: 2.07,
        volume: '52.3M',
        marketCap: '$1.7T',
        sector: 'Technology',
        pe: 82.5,
        dividend: 0.00,
        high: 169.45,
        low: 165.89
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 248.92,
        change: 15.24,
        changePercent: 6.52,
        volume: '198.2M',
        marketCap: '$790B',
        sector: 'Technology',
        pe: 68.4,
        dividend: 0.00,
        high: 251.67,
        low: 238.45
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 487.25,
        change: 37.82,
        changePercent: 8.41,
        volume: '87.2M',
        marketCap: '$1.2T',
        sector: 'Technology',
        pe: 115.3,
        dividend: 0.04,
        high: 492.34,
        low: 456.78
    },
    {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        price: 187.45,
        change: 2.14,
        changePercent: 1.15,
        volume: '12.4M',
        marketCap: '$543B',
        sector: 'Finance',
        pe: 11.2,
        dividend: 3.80,
        high: 188.92,
        low: 185.67
    },
    {
        symbol: 'V',
        name: 'Visa Inc.',
        price: 267.89,
        change: 3.45,
        changePercent: 1.30,
        volume: '8.7M',
        marketCap: '$548B',
        sector: 'Finance',
        pe: 32.5,
        dividend: 1.45,
        high: 269.23,
        low: 265.34
    },
    {
        symbol: 'JNJ',
        name: 'Johnson & Johnson',
        price: 156.78,
        change: 1.23,
        changePercent: 0.79,
        volume: '9.2M',
        marketCap: '$382B',
        sector: 'Healthcare',
        pe: 24.1,
        dividend: 4.35,
        high: 157.45,
        low: 155.23
    },
    {
        symbol: 'UNH',
        name: 'UnitedHealth Group',
        price: 542.34,
        change: 6.78,
        changePercent: 1.27,
        volume: '3.8M',
        marketCap: '$504B',
        sector: 'Healthcare',
        pe: 28.6,
        dividend: 1.88,
        high: 545.67,
        low: 538.92
    },
    {
        symbol: 'XOM',
        name: 'Exxon Mobil Corporation',
        price: 112.45,
        change: 2.34,
        changePercent: 2.12,
        volume: '24.5M',
        marketCap: '$456B',
        sector: 'Energy',
        pe: 9.8,
        dividend: 3.52,
        high: 113.89,
        low: 110.23
    },
    {
        symbol: 'CVX',
        name: 'Chevron Corporation',
        price: 158.67,
        change: 1.89,
        changePercent: 1.21,
        volume: '12.3M',
        marketCap: '$289B',
        sector: 'Energy',
        pe: 10.4,
        dividend: 3.45,
        high: 159.45,
        low: 156.78
    }
];

// Current filter
let currentFilter = 'all';

/**
 * Initialize the stocks page
 */
function initStocksPage() {
    updateMarketStatus();
    populateStocksGrid();
    populateStocksTable();
    populateWatchlist();
    populateMarketNews();
    
    // Update prices every 5 seconds
    setInterval(updateStockPrices, 5000);
    
    // Update market status every minute
    setInterval(updateMarketStatus, 60000);
    
    console.log('[Stocks] Page initialized with', stocksData.length, 'stocks');
}

/**
 * Update market status (open/closed)
 */
function updateMarketStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeInMinutes = hour * 60 + minute;
    
    // Market hours: Monday-Friday, 9:30 AM - 4:00 PM EST
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    
    const isWeekday = day >= 1 && day <= 5;
    const isDuringMarketHours = timeInMinutes >= marketOpen && timeInMinutes < marketClose;
    const isMarketOpen = isWeekday && isDuringMarketHours;
    
    const statusElement = document.getElementById('market-status');
    if (statusElement) {
        if (isMarketOpen) {
            statusElement.innerHTML = '<div class="market-pulse"></div><span>Market Open</span>';
            statusElement.classList.remove('closed');
        } else {
            statusElement.innerHTML = '<div class="market-pulse"></div><span>Market Closed</span>';
            statusElement.classList.add('closed');
        }
    }
}

/**
 * Populate featured stocks grid
 */
function populateStocksGrid() {
    const grid = document.getElementById('stocks-grid');
    if (!grid) return;
    
    // Show first 6 stocks in grid
    const featuredStocks = stocksData.slice(0, 6);
    
    grid.innerHTML = featuredStocks.map(stock => {
        const isPositive = stock.changePercent >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const arrow = isPositive ? 'arrow_upward' : 'arrow_downward';
        
        return `
            <div class="stock-card" onclick="openStockModal('${stock.symbol}')">
                <div class="stock-card-header">
                    <div class="stock-info">
                        <div class="stock-symbol">${stock.symbol}</div>
                        <div class="stock-name">${stock.name}</div>
                        <span class="stock-sector">${stock.sector}</span>
                    </div>
                </div>
                <div class="stock-price-section">
                    <div class="stock-price">$${stock.price.toFixed(2)}</div>
                    <div class="stock-change ${changeClass}">
                        <span class="material-icons-sharp" style="font-size: 1.2rem;">${arrow}</span>
                        <span>${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
                    </div>
                </div>
                <div class="stock-stats">
                    <div class="stat-item">
                        <span class="stat-label">Market Cap</span>
                        <span class="stat-value">${stock.marketCap}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Volume</span>
                        <span class="stat-value">${stock.volume}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">P/E Ratio</span>
                        <span class="stat-value">${stock.pe}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Dividend</span>
                        <span class="stat-value">${stock.dividend}%</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Populate stocks table
 */
function populateStocksTable() {
    const tbody = document.getElementById('stocks-table-body');
    if (!tbody) return;
    
    const filteredStocks = currentFilter === 'all' 
        ? stocksData 
        : stocksData.filter(s => s.sector.toLowerCase() === currentFilter.toLowerCase());
    
    tbody.innerHTML = filteredStocks.map(stock => {
        const isPositive = stock.changePercent >= 0;
        const changeClass = isPositive ? 'positive' : 'negative';
        const arrow = isPositive ? 'arrow_upward' : 'arrow_downward';
        const firstLetter = stock.symbol.charAt(0);
        
        return `
            <tr>
                <td>
                    <div class="stock-name-cell">
                        <div class="stock-logo">${firstLetter}</div>
                        <div class="stock-name-info">
                            <strong>${stock.symbol}</strong>
                            <small>${stock.name}</small>
                        </div>
                    </div>
                </td>
                <td><strong>$${stock.price.toFixed(2)}</strong></td>
                <td>
                    <div class="stock-change ${changeClass}">
                        <span class="material-icons-sharp" style="font-size: 1rem;">${arrow}</span>
                        <span>${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>
                    </div>
                </td>
                <td>${stock.marketCap}</td>
                <td>${stock.volume}</td>
                <td>
                    <button class="btn btn-primary" onclick="openStockModal('${stock.symbol}')" style="padding: 0.5rem 1rem; border: none; background: var(--color-primary); color: white; border-radius: 0.5rem; cursor: pointer; font-weight: 600;">
                        Details
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    // Re-attach chart tooltip listeners
    if (window.initChartTooltips) {
        setTimeout(() => {
            window.initChartTooltips();
        }, 100);
    }
}

/**
 * Filter stocks by sector
 */
function filterStocks(sector) {
    currentFilter = sector;
    
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Repopulate table
    populateStocksTable();
}

/**
 * Update stock prices with simulation
 */
function updateStockPrices() {
    stocksData.forEach(stock => {
        // Simulate small price changes
        const volatility = 0.002; // 0.2% max change
        const change = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = stock.price * (1 + change);
        const priceChange = newPrice - stock.price;
        
        stock.price = newPrice;
        stock.change = priceChange;
        stock.changePercent = (priceChange / (newPrice - priceChange)) * 100;
    });
    
    // Refresh displays
    populateStocksGrid();
    populateStocksTable();
    populateWatchlist();
}

/**
 * Populate watchlist
 */
function populateWatchlist() {
    const watchlist = document.getElementById('watchlist');
    if (!watchlist) return;
    
    // Show top 5 performing stocks
    const topStocks = [...stocksData]
        .sort((a, b) => b.changePercent - a.changePercent)
        .slice(0, 5);
    
    watchlist.innerHTML = topStocks.map(stock => {
        const isPositive = stock.changePercent >= 0;
        const changeClass = isPositive ? 'success' : 'danger';
        
        return `
            <div class="update" onclick="openStockModal('${stock.symbol}')">
                <div class="profile-photo">
                    <div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-info-dark)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700;">
                        ${stock.symbol.charAt(0)}
                    </div>
                </div>
                <div class="message">
                    <p><b>${stock.symbol}</b> ${stock.name}</p>
                    <small class="text-muted">$${stock.price.toFixed(2)}</small>
                </div>
                <div class="${changeClass}" style="font-weight: 700;">
                    ${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Populate market news
 */
function populateMarketNews() {
    const newsContainer = document.getElementById('market-news');
    if (!newsContainer) return;
    
    const newsItems = [
        {
            title: 'Tech Stocks Rally',
            description: 'Major technology stocks surge as AI optimism continues',
            category: 'Technology',
            icon: 'trending_up',
            color: 'var(--color-success)'
        },
        {
            title: 'Fed Holds Rates',
            description: 'Federal Reserve maintains current interest rates',
            category: 'Economy',
            icon: 'account_balance',
            color: 'var(--color-primary)'
        },
        {
            title: 'Energy Sector Gains',
            description: 'Oil prices climb amid supply concerns',
            category: 'Energy',
            icon: 'bolt',
            color: 'var(--color-warning)'
        }
    ];
    
    newsContainer.innerHTML = newsItems.map(item => `
        <div class="item online">
            <div class="icon" style="background: ${item.color};">
                <span class="material-icons-sharp">${item.icon}</span>
            </div>
            <div class="right">
                <div class="info">
                    <h3>${item.title}</h3>
                    <small class="text-muted">${item.description}</small>
                </div>
                <small class="text-muted">${item.category}</small>
            </div>
        </div>
    `).join('');
}

/**
 * Open stock detail modal
 */
function openStockModal(symbol) {
    const stock = stocksData.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const isPositive = stock.changePercent >= 0;
    const changeClass = isPositive ? 'success' : 'danger';
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('stock-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'stock-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${stock.symbol} - ${stock.name}</h2>
                <button class="modal-close" onclick="closeModal('stock-detail-modal')">&times;</button>
            </div>
            <div class="modal-stats-grid">
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Current Price</div>
                    <div class="modal-stat-value">$${stock.price.toFixed(2)}</div>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">24h Change</div>
                    <div class="modal-stat-value" style="color: var(--color-${changeClass});">
                        ${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </div>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Market Cap</div>
                    <div class="modal-stat-value">${stock.marketCap}</div>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Volume</div>
                    <div class="modal-stat-value">${stock.volume}</div>
                </div>
            </div>
            <div class="modal-section">
                <h3><span class="material-icons-sharp">info</span> Stock Information</h3>
                <table class="modal-table">
                    <tbody>
                        <tr>
                            <td><strong>Sector</strong></td>
                            <td>${stock.sector}</td>
                        </tr>
                        <tr>
                            <td><strong>P/E Ratio</strong></td>
                            <td>${stock.pe}</td>
                        </tr>
                        <tr>
                            <td><strong>Dividend Yield</strong></td>
                            <td>${stock.dividend}%</td>
                        </tr>
                        <tr>
                            <td><strong>52W High</strong></td>
                            <td>$${stock.high.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>52W Low</strong></td>
                            <td>$${stock.low.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="modal-section">
                <h3><span class="material-icons-sharp">insights</span> Performance Insights</h3>
                <p>
                    ${stock.symbol} is currently trading at $${stock.price.toFixed(2)}, 
                    ${isPositive ? 'up' : 'down'} ${Math.abs(stock.changePercent).toFixed(2)}% 
                    in the last 24 hours. The stock has a P/E ratio of ${stock.pe}, 
                    ${stock.dividend > 0 ? `with a dividend yield of ${stock.dividend}%` : 'and does not currently pay dividends'}.
                    Trading volume is ${stock.volume}, indicating ${parseFloat(stock.volume) > 50 ? 'high' : 'moderate'} market activity.
                </p>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
}

/**
 * Open market cap modal
 */
function openMarketCapModal() {
    const modal = document.getElementById('market-cap-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Open volume modal
 */
function openVolumeModal() {
    const modal = document.getElementById('volume-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Open gainers modal
 */
function openGainersModal() {
    const modal = document.getElementById('gainers-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Open losers modal
 */
function openLosersModal() {
    const modal = document.getElementById('losers-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

/**
 * Close modal
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStocksPage);
} else {
    initStocksPage();
}

// Export for chart tooltip integration
window.stocksData = stocksData;
