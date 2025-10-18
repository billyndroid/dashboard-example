/**
 * Stocks Page JavaScript
 * Manages stock data display, modals, and interactions
 */

// Stock data with realistic information and fundamentals
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
        low: 176.23,
        // Fundamental data
        eps: 6.07,
        beta: 1.28,
        roe: 147.25,
        debtToEquity: 1.98,
        profitMargin: 25.31,
        revenueGrowth: 11.5,
        analystRating: 'Buy',
        targetPrice: 195.50,
        earningsDate: 'Nov 2, 2025',
        description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. Known for innovative products like iPhone, Mac, iPad, and services.'
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
        low: 384.12,
        // Fundamental data
        eps: 11.02,
        beta: 0.91,
        roe: 38.42,
        debtToEquity: 0.45,
        profitMargin: 34.09,
        revenueGrowth: 15.8,
        analystRating: 'Strong Buy',
        targetPrice: 425.00,
        earningsDate: 'Oct 24, 2025',
        description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. Leading provider of cloud computing, Office suite, and enterprise solutions.'
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
        low: 141.23,
        eps: 5.13,
        beta: 1.05,
        roe: 28.15,
        debtToEquity: 0.12,
        profitMargin: 23.54,
        revenueGrowth: 13.2,
        analystRating: 'Buy',
        targetPrice: 165.00,
        earningsDate: 'Oct 29, 2025',
        description: 'Alphabet Inc. offers various products and platforms including search, advertising, operating systems, cloud computing, and hardware. Parent company of Google and YouTube.'
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
        low: 165.89,
        eps: 2.04,
        beta: 1.15,
        roe: 16.83,
        debtToEquity: 0.58,
        profitMargin: 5.67,
        revenueGrowth: 10.9,
        analystRating: 'Buy',
        targetPrice: 185.00,
        earningsDate: 'Nov 1, 2025',
        description: 'Amazon.com, Inc. engages in e-commerce, cloud computing, digital streaming, and artificial intelligence. Leader in online retail and AWS cloud services.'
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
        low: 238.45,
        eps: 3.64,
        beta: 2.01,
        roe: 24.31,
        debtToEquity: 0.19,
        profitMargin: 12.45,
        revenueGrowth: 47.2,
        analystRating: 'Hold',
        targetPrice: 265.00,
        earningsDate: 'Oct 18, 2025',
        description: 'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles, energy storage systems, and solar products. Pioneer in electric vehicle technology and autonomous driving.'
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
        low: 456.78,
        eps: 4.23,
        beta: 1.69,
        roe: 89.76,
        debtToEquity: 0.35,
        profitMargin: 48.82,
        revenueGrowth: 206.3,
        analystRating: 'Strong Buy',
        targetPrice: 550.00,
        earningsDate: 'Nov 21, 2025',
        description: 'NVIDIA Corporation designs graphics processors for gaming, professional markets, and system on a chip units for mobile computing and automotive. Leader in AI computing and data center GPUs.'
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
        low: 185.67,
        eps: 16.74,
        beta: 1.09,
        roe: 15.67,
        debtToEquity: 1.32,
        profitMargin: 31.24,
        revenueGrowth: 8.3,
        analystRating: 'Buy',
        targetPrice: 205.00,
        earningsDate: 'Oct 13, 2025',
        description: 'JPMorgan Chase & Co. operates as a financial services company. Offers investment banking, financial services for consumers and businesses, commercial banking, and asset management.'
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
        low: 265.34,
        eps: 8.24,
        beta: 0.98,
        roe: 42.18,
        debtToEquity: 0.67,
        profitMargin: 53.76,
        revenueGrowth: 11.7,
        analystRating: 'Buy',
        targetPrice: 290.00,
        earningsDate: 'Oct 24, 2025',
        description: 'Visa Inc. operates as a payments technology company. Facilitates digital payments among consumers, merchants, financial institutions, and government entities across the globe.'
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
        low: 155.23,
        eps: 6.51,
        beta: 0.58,
        roe: 22.34,
        debtToEquity: 0.48,
        profitMargin: 18.92,
        revenueGrowth: 6.5,
        analystRating: 'Buy',
        targetPrice: 170.00,
        earningsDate: 'Oct 15, 2025',
        description: 'Johnson & Johnson researches, develops, manufactures, and sells healthcare products worldwide. Operates in pharmaceutical, medical devices, and consumer health segments.'
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
        low: 538.92,
        eps: 18.96,
        beta: 0.76,
        roe: 26.89,
        debtToEquity: 0.69,
        profitMargin: 6.12,
        revenueGrowth: 14.2,
        analystRating: 'Strong Buy',
        targetPrice: 590.00,
        earningsDate: 'Oct 17, 2025',
        description: 'UnitedHealth Group Incorporated operates as a diversified healthcare company. Provides health benefits, healthcare services, and healthcare technology solutions.'
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
        low: 110.23,
        eps: 11.47,
        beta: 0.89,
        roe: 18.45,
        debtToEquity: 0.25,
        profitMargin: 10.34,
        revenueGrowth: 24.1,
        analystRating: 'Buy',
        targetPrice: 125.00,
        earningsDate: 'Oct 27, 2025',
        description: 'Exxon Mobil Corporation explores, produces, and sells crude oil and natural gas. Manufactures and sells petroleum products, and engages in chemical manufacturing.'
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
        low: 156.78,
        eps: 15.26,
        beta: 0.94,
        roe: 14.23,
        debtToEquity: 0.21,
        profitMargin: 9.87,
        revenueGrowth: 18.6,
        analystRating: 'Buy',
        targetPrice: 172.00,
        earningsDate: 'Oct 27, 2025',
        description: 'Chevron Corporation engages in integrated energy and chemicals operations worldwide. Upstream operations include oil and gas exploration, development, and production.'
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
 * Populate watchlist with fundamental data
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
        const ratingColors = {
            'Strong Buy': 'var(--color-success)',
            'Buy': '#10b981',
            'Hold': 'var(--color-warning)',
            'Sell': 'var(--color-danger)'
        };
        
        return `
            <div class="update watchlist-item" onclick="openWatchlistModal('${stock.symbol}')" style="cursor: pointer; transition: all 0.3s ease;" 
                 onmouseenter="this.style.background='var(--color-light)'" 
                 onmouseleave="this.style.background=''">
                <div class="profile-photo">
                    <div style="width: 100%; height: 100%; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-info-dark)); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.1rem;">
                        ${stock.symbol.charAt(0)}
                    </div>
                </div>
                <div class="message" style="flex: 1;">
                    <p style="margin-bottom: 0.25rem;"><b>${stock.symbol}</b> $${stock.price.toFixed(2)}</p>
                    <div style="display: flex; gap: 0.75rem; font-size: 0.75rem; margin-top: 0.25rem;">
                        <span class="text-muted">P/E: ${stock.pe}</span>
                        <span class="text-muted">EPS: $${stock.eps}</span>
                        <span style="color: ${ratingColors[stock.analystRating]}; font-weight: 600;">${stock.analystRating}</span>
                    </div>
                    <small class="text-muted" style="font-size: 0.7rem;">Target: $${stock.targetPrice.toFixed(2)}</small>
                </div>
                <div style="text-align: right;">
                    <div class="${changeClass}" style="font-weight: 700; font-size: 1rem;">
                        ${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%
                    </div>
                    <div style="font-size: 0.7rem; color: var(--color-info-dark); margin-top: 0.25rem;">
                        ${stock.marketCap}
                    </div>
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
 * Open comprehensive watchlist modal with fundamental analysis
 */
function openWatchlistModal(symbol) {
    const stock = stocksData.find(s => s.symbol === symbol);
    if (!stock) return;
    
    const isPositive = stock.changePercent >= 0;
    const changeClass = isPositive ? 'success' : 'danger';
    const upside = ((stock.targetPrice - stock.price) / stock.price * 100).toFixed(2);
    const upsidePositive = upside > 0;
    
    // Valuation assessment
    const peAvg = 25; // Industry average
    const valuation = stock.pe < peAvg ? 'Undervalued' : stock.pe > peAvg * 1.5 ? 'Overvalued' : 'Fairly Valued';
    const valuationColor = stock.pe < peAvg ? 'var(--color-success)' : stock.pe > peAvg * 1.5 ? 'var(--color-danger)' : 'var(--color-warning)';
    
    // Financial health
    const financialHealth = stock.debtToEquity < 0.5 ? 'Excellent' : stock.debtToEquity < 1.0 ? 'Good' : stock.debtToEquity < 2.0 ? 'Fair' : 'Poor';
    const healthColor = stock.debtToEquity < 0.5 ? 'var(--color-success)' : stock.debtToEquity < 1.0 ? '#10b981' : stock.debtToEquity < 2.0 ? 'var(--color-warning)' : 'var(--color-danger)';
    
    // Growth assessment
    const growthAssessment = stock.revenueGrowth > 20 ? 'High Growth' : stock.revenueGrowth > 10 ? 'Moderate Growth' : stock.revenueGrowth > 5 ? 'Stable Growth' : 'Low Growth';
    const growthColor = stock.revenueGrowth > 20 ? 'var(--color-success)' : stock.revenueGrowth > 10 ? '#10b981' : 'var(--color-primary)';
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('watchlist-detail-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'watchlist-detail-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
                <div>
                    <h2>${stock.symbol} - ${stock.name}</h2>
                    <p style="margin: 0.5rem 0 0 0; color: var(--color-info-dark); font-size: 0.9rem;">${stock.sector}</p>
                </div>
                <button class="modal-close" onclick="closeModal('watchlist-detail-modal')">&times;</button>
            </div>
            
            <!-- Price Summary -->
            <div style="background: linear-gradient(135deg, var(--color-primary), var(--color-info-dark)); padding: 2rem; border-radius: 1rem; color: white; margin-bottom: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; align-items: center;">
                    <div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.25rem;">Current Price</div>
                        <div style="font-size: 2.5rem; font-weight: 700;">$${stock.price.toFixed(2)}</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.25rem;">24h Change</div>
                        <div style="font-size: 1.8rem; font-weight: 700; color: ${isPositive ? '#10b981' : '#ef4444'};">
                            ${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.25rem;">Analyst Target</div>
                        <div style="font-size: 1.8rem; font-weight: 700;">$${stock.targetPrice.toFixed(2)}</div>
                        <div style="font-size: 0.8rem; opacity: 0.9;">${upsidePositive ? '+' : ''}${upside}% upside</div>
                    </div>
                    <div>
                        <div style="font-size: 0.85rem; opacity: 0.9; margin-bottom: 0.25rem;">Rating</div>
                        <div style="font-size: 1.3rem; font-weight: 700; background: rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 0.5rem; display: inline-block;">
                            ${stock.analystRating}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Fundamental Metrics Grid -->
            <div class="modal-stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Market Cap</div>
                    <div class="modal-stat-value">${stock.marketCap}</div>
                    <small class="text-muted">Company Size</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">P/E Ratio</div>
                    <div class="modal-stat-value">${stock.pe}</div>
                    <small style="color: ${valuationColor}; font-weight: 600;">${valuation}</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">EPS (TTM)</div>
                    <div class="modal-stat-value">$${stock.eps.toFixed(2)}</div>
                    <small class="text-muted">Earnings/Share</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Beta</div>
                    <div class="modal-stat-value">${stock.beta}</div>
                    <small class="text-muted">${stock.beta > 1 ? 'High' : 'Low'} Volatility</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">ROE</div>
                    <div class="modal-stat-value" style="color: var(--color-success);">${stock.roe.toFixed(2)}%</div>
                    <small class="text-muted">Return on Equity</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Debt/Equity</div>
                    <div class="modal-stat-value">${stock.debtToEquity.toFixed(2)}</div>
                    <small style="color: ${healthColor}; font-weight: 600;">${financialHealth}</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Profit Margin</div>
                    <div class="modal-stat-value">${stock.profitMargin.toFixed(2)}%</div>
                    <small class="text-muted">Net Margin</small>
                </div>
                <div class="modal-stat-card">
                    <div class="modal-stat-label">Revenue Growth</div>
                    <div class="modal-stat-value" style="color: ${growthColor};">${stock.revenueGrowth.toFixed(1)}%</div>
                    <small style="color: ${growthColor}; font-weight: 600;">${growthAssessment}</small>
                </div>
            </div>
            
            <!-- Detailed Information -->
            <div class="modal-section">
                <h3><span class="material-icons-sharp">business</span> Company Overview</h3>
                <p style="line-height: 1.6; color: var(--color-dark-variant);">${stock.description}</p>
            </div>
            
            <div class="modal-section">
                <h3><span class="material-icons-sharp">assessment</span> Financial Details</h3>
                <table class="modal-table">
                    <tbody>
                        <tr>
                            <td><strong>Current Price</strong></td>
                            <td>$${stock.price.toFixed(2)}</td>
                            <td><strong>52W High</strong></td>
                            <td>$${stock.high.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Day's Range</strong></td>
                            <td>$${(stock.price * 0.98).toFixed(2)} - $${(stock.price * 1.02).toFixed(2)}</td>
                            <td><strong>52W Low</strong></td>
                            <td>$${stock.low.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Volume</strong></td>
                            <td>${stock.volume}</td>
                            <td><strong>Avg Volume</strong></td>
                            <td>${(parseFloat(stock.volume) * 0.85).toFixed(1)}M</td>
                        </tr>
                        <tr>
                            <td><strong>Dividend Yield</strong></td>
                            <td>${stock.dividend}%</td>
                            <td><strong>Ex-Dividend Date</strong></td>
                            <td>${stock.dividend > 0 ? 'Nov 15, 2025' : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td><strong>Earnings Date</strong></td>
                            <td colspan="3"><strong>${stock.earningsDate}</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="modal-section">
                <h3><span class="material-icons-sharp">insights</span> Investment Analysis</h3>
                <div style="background: var(--color-light); padding: 1.5rem; border-radius: 1rem; border-left: 4px solid var(--color-primary);">
                    <p style="margin: 0; line-height: 1.6;">
                        <strong>${stock.symbol}</strong> is currently trading at $${stock.price.toFixed(2)} with a market capitalization of ${stock.marketCap}. 
                        The stock shows a <strong style="color: ${changeClass === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}">${isPositive ? 'positive' : 'negative'} momentum</strong> 
                        with ${isPositive ? 'gains' : 'losses'} of ${Math.abs(stock.changePercent).toFixed(2)}% in the last 24 hours.
                    </p>
                    <p style="margin: 1rem 0 0 0; line-height: 1.6;">
                        <strong>Valuation:</strong> With a P/E ratio of ${stock.pe}, the stock appears <strong style="color: ${valuationColor}">${valuation.toLowerCase()}</strong> 
                        compared to industry averages. The company demonstrates <strong style="color: ${healthColor}">${financialHealth.toLowerCase()} financial health</strong> 
                        with a debt-to-equity ratio of ${stock.debtToEquity.toFixed(2)}.
                    </p>
                    <p style="margin: 1rem 0 0 0; line-height: 1.6;">
                        <strong>Growth & Profitability:</strong> ${stock.name} has achieved <strong style="color: ${growthColor}">${stock.revenueGrowth.toFixed(1)}% revenue growth</strong> 
                        with an impressive profit margin of ${stock.profitMargin.toFixed(2)}%. The company's ROE of ${stock.roe.toFixed(2)}% indicates 
                        ${stock.roe > 20 ? 'excellent' : stock.roe > 15 ? 'strong' : 'moderate'} management efficiency.
                    </p>
                    <p style="margin: 1rem 0 0 0; line-height: 1.6;">
                        <strong>Analyst Outlook:</strong> Analysts have a consensus <strong>${stock.analystRating}</strong> rating with a price target of 
                        $${stock.targetPrice.toFixed(2)}, suggesting ${upsidePositive ? 'potential upside' : 'limited upside'} of ${upside}% from current levels.
                        ${stock.dividend > 0 ? `The stock also provides income through dividends with a yield of ${stock.dividend}%.` : ''}
                    </p>
                </div>
            </div>
            
            <!-- Action Buttons -->
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button onclick="alert('Trading feature coming soon!')" 
                        style="flex: 1; padding: 1rem; background: var(--color-success); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span class="material-icons-sharp">add_shopping_cart</span>
                    Buy ${stock.symbol}
                </button>
                <button onclick="alert('Watchlist feature coming soon!')" 
                        style="flex: 1; padding: 1rem; background: var(--color-primary); color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span class="material-icons-sharp">star</span>
                    Add to Watchlist
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
        document.body.style.overflow = 'auto';
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
