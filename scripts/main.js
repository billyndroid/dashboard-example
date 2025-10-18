/**
 * Main Dashboard Script
 * Handles sidebar navigation, theme toggling, and core dashboard functionality
 * @author Dashboard Team
 * @version 2.0.0
 */

// DOM element references
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

/**
 * Load and apply saved theme preference from localStorage
 * Automatically applies dark theme class and updates theme toggle icons
 * @returns {void}
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme-variables');
        if (themeToggler) {
            const lightIcon = themeToggler.querySelector('span:first-child');
            const darkIcon = themeToggler.querySelector('span:last-child');
            if (lightIcon && darkIcon) {
                lightIcon.classList.remove('active');
                darkIcon.classList.add('active');
            }
        }
    }
}

// Show sidebar with error handling
if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            sideMenu.classList.add('show');
            // Add mobile overlay
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
                // Add backdrop
                const backdrop = document.createElement('div');
                backdrop.id = 'sidebar-backdrop';
                backdrop.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999;';
                backdrop.addEventListener('click', () => {
                    sideMenu.classList.remove('show');
                    backdrop.remove();
                    document.body.style.overflow = 'auto';
                });
                document.body.appendChild(backdrop);
            }
        } catch (error) {
            console.error('Error showing sidebar:', error);
        }
    });
} else {
    console.warn('Menu button or sidebar not found');
}

// Close sidebar with error handling
if (closeBtn && sideMenu) {
    closeBtn.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            sideMenu.classList.remove('show');
            const backdrop = document.getElementById('sidebar-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.style.overflow = 'auto';
        } catch (error) {
            console.error('Error hiding sidebar:', error);
        }
    });
}

// Enhanced theme toggler
if (themeToggler) {
    themeToggler.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            document.body.classList.toggle('dark-theme-variables');
            
            const lightIcon = themeToggler.querySelector('span:first-child');
            const darkIcon = themeToggler.querySelector('span:last-child');
            
            if (lightIcon && darkIcon) {
                lightIcon.classList.toggle('active');
                darkIcon.classList.toggle('active');
            }
            
            // Save theme preference
            const isDark = document.body.classList.contains('dark-theme-variables');
            localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
            
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    });
} else {
    console.warn('Theme toggler not found');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sideMenu && !sideMenu.contains(e.target) && menuBtn && !menuBtn.contains(e.target)) {
        if (sideMenu.classList.contains('show')) {
            sideMenu.classList.remove('show');
            const backdrop = document.getElementById('sidebar-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.style.overflow = 'auto';
        }
    }
});

// Handle window resize - close sidebar when switching to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sideMenu) {
        sideMenu.classList.remove('show');
        const backdrop = document.getElementById('sidebar-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.style.overflow = 'auto';
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', loadThemePreference);

/**
 * Update SVG progress circles based on percentage values
 * Calculates stroke-dashoffset to create circular progress effect
 * Applies color coding based on positive/negative values
 * @returns {void}
 */
function updateProgressCircles() {
    try {
        const progressCircles = document.querySelectorAll('.progress circle');
        
        progressCircles.forEach(circle => {
            const numberElement = circle.parentElement.querySelector('.number p');
            if (!numberElement) return;
            
            const percentageText = numberElement.textContent;
            let percentage = 0;
            
            // Extract percentage from different formats (75%, +8.2%, -1.5%)
            if (percentageText.includes('%')) {
                percentage = parseFloat(percentageText.replace('%', ''));
            } else if (percentageText.includes('+') || percentageText.includes('-')) {
                // Handle formats like "+8.2%", "-1.5%"
                percentage = Math.abs(parseFloat(percentageText.replace(/[^0-9.-]/g, '')));
            } else {
                // Default percentage for non-numeric values
                percentage = 75;
            }
            
            // Ensure percentage is within valid range (0-100)
            percentage = Math.max(0, Math.min(100, percentage));
            
            // Calculate circle properties
            // Formula: circumference = 2πr, offset = circumference - (percentage/100) * circumference
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            
            // Apply styles with smooth transition
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
            circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
            
            // Add color based on value (green for positive, red for negative, blue for neutral)
            if (percentageText.includes('+')) {
                circle.style.stroke = 'var(--color-success)';
            } else if (percentageText.includes('-')) {
                circle.style.stroke = 'var(--color-danger)';
            } else {
                circle.style.stroke = 'var(--color-primary)';
            }
        });
        
    } catch (error) {
        console.error('Error updating progress circles:', error);
    }
}

// Update progress circles when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProgressCircles);
} else {
    updateProgressCircles();
}

/**
 * Populate the recent orders table with data
 * Displays order number, product name, and status with color coding
 * @returns {void}
 */
async function populateOrdersTable() {
    try {
        if (typeof Orders === 'undefined') {
            console.warn('Orders data not found. Please ensure orders.js is loaded.');
            return;
        }

        const tableBody = document.querySelector('#ordersTableBody') || document.querySelector('table tbody');
        
        if (!tableBody) {
            console.warn('Orders table not found on this page.');
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        // Fetch live prices if available
        let livePrices = {};
        if (!window.AppConfig?.useMockData && window.DataService) {
            try {
                // Fetch crypto prices
                const cryptoPrices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum']);
                if (cryptoPrices) {
                    if (cryptoPrices.bitcoin) livePrices['Bitcoin'] = cryptoPrices.bitcoin.usd;
                    if (cryptoPrices.ethereum) livePrices['Ethereum'] = cryptoPrices.ethereum.usd;
                }
                
                // Fetch Gold and SPY prices
                const tdKey = window.AppConfig?.thirdPartyApis?.twelveData?.key;
                if (tdKey && tdKey !== 'YOUR_TWELVE_DATA_KEY_HERE' && tdKey !== '') {
                    const goldData = await DataService.fetchAssetQuote('XAU/USD');
                    if (goldData && goldData.close) {
                        livePrices['Gold'] = parseFloat(goldData.close);
                    }
                    
                    const spyData = await DataService.fetchAssetQuote('SPY');
                    if (spyData && spyData.close) {
                        livePrices['S&P 500'] = parseFloat(spyData.close);
                    }
                }
                
                console.log('[Dashboard] Live prices for table:', livePrices);
            } catch (error) {
                console.warn('[Dashboard] Could not fetch live prices for table:', error);
            }
        }

        Orders.forEach((order, index) => {
            try {
                const tr = document.createElement('tr');
                const statusClass = 
                    order.shipping === 'Declined' ? 'danger' : 
                    order.shipping === 'Pending' ? 'warning' : 'success';
                
                // Use live price if available, otherwise use current price from order
                const currentPrice = livePrices[order.productName] || order.currentPrice || getCurrentPrice(order.productName);
                
                // Calculate P&L for display
                const pnl = currentPrice && order.entryPrice ? 
                    (currentPrice - order.entryPrice) * order.quantity : 0;
                const pnlPercentage = order.entryPrice ? 
                    ((currentPrice - order.entryPrice) / order.entryPrice * 100) : 0;
                const actualPnL = order.orderType === 'Long' ? pnl : -pnl;
                const actualPercentage = order.orderType === 'Long' ? pnlPercentage : -pnlPercentage;
                
                const pnlClass = actualPnL >= 0 ? 'success' : 'danger';
                const pnlSign = actualPnL >= 0 ? '+' : '';
                
                // Format current price with appropriate currency symbol
                let priceDisplay = '';
                if (order.productName === 'FTSE 100') {
                    priceDisplay = `£${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                } else {
                    priceDisplay = `$${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                }
                
                tr.innerHTML = `
                    <td><strong>${order.productName || 'N/A'}</strong><br><small>${order.sector || ''}</small></td>
                    <td>${priceDisplay}<br><small>Qty: ${order.quantity || 0}</small></td>
                    <td class="${pnlClass}">${pnlSign}$${Math.abs(actualPnL).toFixed(2)}<br><small>(${pnlSign}${actualPercentage.toFixed(2)}%)</small></td>
                    <td class="${statusClass}">${order.shipping || 'Unknown'}<br><small>${order.orderType || 'N/A'}</small></td>
                    <td><button class="primary details-btn" data-order-index="${index}">Details</button></td>
                `;
                
                tableBody.appendChild(tr);
            } catch (error) {
                console.error('Error creating table row for order:', order, error);
            }
        });
        
        // Add event listeners to all Details buttons
        const detailsButtons = tableBody.querySelectorAll('.details-btn');
        detailsButtons.forEach(button => {
            button.addEventListener('click', function() {
                const orderIndex = parseInt(this.getAttribute('data-order-index'));
                showOrderDetailsModal(orderIndex);
            });
        });
        
        console.info(`Successfully populated ${Orders.length} orders in table.`);
        
        // Initialize chart tooltips after table is populated
        if (window.initChartTooltips) {
            setTimeout(function() {
                window.initChartTooltips();
            }, 100);
        }
        
    } catch (error) {
        console.error('Error populating orders table:', error);
    }
}

// Show order details in modal
function showOrderDetailsModal(orderIndex) {
    try {
        if (typeof Orders === 'undefined' || !Orders[orderIndex]) {
            console.error('Order not found at index:', orderIndex);
            return;
        }
        
        const order = Orders[orderIndex];
        
        // Generate detailed position data
        const positionData = typeof generatePositionData !== 'undefined' 
            ? generatePositionData(order)
            : createFallbackPositionData(order);
        
        // Show modal if available
        if (typeof showPositionDetails !== 'undefined') {
            showPositionDetails(positionData);
        } else {
            console.warn('Position modal not loaded. Showing alert instead.');
            showOrderDetails(orderIndex);
        }
        
    } catch (error) {
        console.error('Error showing order details modal:', error);
    }
}

// Fallback function to create position data if generatePositionData is not available
function createFallbackPositionData(order) {
    const currentPrice = order.currentPrice || order.entryPrice;
    const pnlValue = (currentPrice - order.entryPrice) * order.quantity;
    const actualPnL = order.orderType === 'Long' ? pnlValue : -pnlValue;
    const pnlPercent = ((currentPrice - order.entryPrice) / order.entryPrice) * 100;
    const actualPnLPercent = order.orderType === 'Long' ? pnlPercent : -pnlPercent;
    
    return {
        asset: order.productName,
        assetType: order.sector || 'Commodity',
        status: order.shipping,
        currentPrice: currentPrice,
        priceChangePercent: 0,
        entryPrice: order.entryPrice,
        entryDate: 'N/A',
        quantity: order.quantity,
        positionType: order.orderType,
        pnl: actualPnL >= 0 ? `+$${actualPnL.toFixed(2)}` : `-$${Math.abs(actualPnL).toFixed(2)}`,
        pnlValue: actualPnL,
        pnlPercent: actualPnLPercent.toFixed(2),
        stopLoss: 'Not Set',
        takeProfit: 'Not Set',
        riskReward: '1:2',
        daysHeld: '0 days',
        tradeId: `TRD-${order.id || Date.now()}`
    };
}

// Show order details function with enhanced information (legacy fallback)
function showOrderDetails(orderIndex) {
    try {
        if (typeof Orders === 'undefined' || !Orders[orderIndex]) {
            if (typeof DashboardUtils !== 'undefined') {
                DashboardUtils.showNotification('Order details not available.', 'error');
            } else {
                alert('Order details not available.');
            }
            return;
        }
        
        const order = Orders[orderIndex];
        const pnl = order.currentPrice && order.entryPrice ? 
            (order.currentPrice - order.entryPrice) * order.quantity : 0;
        const pnlPercentage = order.entryPrice ? 
            ((order.currentPrice - order.entryPrice) / order.entryPrice * 100) : 0;
        const actualPnL = order.orderType === 'Long' ? pnl : -pnl;
        const actualPercentage = order.orderType === 'Long' ? pnlPercentage : -pnlPercentage;
        
        const orderAge = order.timestamp ? 
            Math.floor((Date.now() - new Date(order.timestamp).getTime()) / (1000 * 60)) : 'Unknown';
        
        const details = `
═══════════════════════════════════
           ORDER DETAILS
═══════════════════════════════════

🏷️  Asset: ${order.productName}
📊  Sector: ${order.sector || 'N/A'}
💰  Current Price: ${order.productNumber}
📈  Order Type: ${order.orderType || 'N/A'}
📊  Quantity: ${order.quantity || 0}

💵  Entry Price: $${order.entryPrice?.toFixed(2) || 'N/A'}
💵  Current Price: $${order.currentPrice?.toFixed(2) || 'N/A'}

📈  P&L: ${actualPnL >= 0 ? '+' : ''}$${actualPnL.toFixed(2)}
📊  P&L %: ${actualPercentage >= 0 ? '+' : ''}${actualPercentage.toFixed(2)}%

🔄  Status: ${order.shipping}
📊  Volume: ${order.volume?.toLocaleString() || 'N/A'}
⏰  Age: ${orderAge} minutes

🆔  Order ID: ${order.id || 'N/A'}
        `;
        
        alert(details);
    } catch (error) {
        console.error('Error showing order details:', error);
        if (typeof DashboardUtils !== 'undefined') {
            DashboardUtils.showNotification('Error loading order details.', 'error');
        } else {
            alert('Error loading order details.');
        }
    }
}

// Initialize orders table when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateOrdersTable);
} else {
    populateOrdersTable();
}

/**
 * Update circular progress animations based on metric values
 */
function updateProgressCircles() {
    try {
        if (typeof DashboardData === 'undefined') return;
        
        const circumference = 226; // 2 * π * r (where r = 36)
        
        // Get the portfolio growth percentage from the card
        const portfolioProgress = document.querySelector('.sales .number p');
        if (portfolioProgress) {
            const percentText = portfolioProgress.textContent.replace(/[+%]/g, '');
            const percent = parseFloat(percentText);
            // Map growth percentage to circle fill (0-10% growth = 70-100% fill)
            const fillPercent = Math.min(100, 70 + (percent * 3));
            const offset = circumference - (circumference * fillPercent / 100);
            const circle = document.querySelector('.sales svg circle');
            if (circle) {
                circle.style.strokeDashoffset = offset;
            }
        }
        
        // Get the P&L percentage from the card
        const pnlProgress = document.querySelector('.expenses .number p');
        if (pnlProgress) {
            const percentText = pnlProgress.textContent.replace(/[+\-%]/g, '');
            const percent = parseFloat(percentText);
            // Map P&L percentage to circle fill (0-10% = 70-100% fill)
            const fillPercent = Math.min(100, 70 + (percent * 3));
            const offset = circumference - (circumference * fillPercent / 100);
            const circle = document.querySelector('.expenses svg circle');
            if (circle) {
                circle.style.strokeDashoffset = offset;
            }
        }
        
        // Get the win rate percentage from the card
        const winRateProgress = document.querySelector('.income .number p');
        if (winRateProgress) {
            const percentText = winRateProgress.textContent.replace(/%/g, '');
            const percent = parseFloat(percentText);
            // Win rate directly maps to circle fill
            const fillPercent = percent;
            const offset = circumference - (circumference * fillPercent / 100);
            const circle = document.querySelector('.income svg circle');
            if (circle) {
                circle.style.strokeDashoffset = offset;
            }
        }
    } catch (error) {
        console.error('Error updating progress circles:', error);
    }
}

// Update dashboard metrics with real calculated data
function updateDashboardMetrics() {
    try {
        if (typeof DashboardData === 'undefined') {
            console.warn('DashboardData not available');
            return;
        }
        
        // Update portfolio value
        const portfolioElement = document.querySelector('.sales h1');
        let portfolioGrowth = 2.4; // default
        if (portfolioElement) {
            const totalValue = DashboardData.getTotalPortfolioValue();
            portfolioElement.textContent = `$${(totalValue / 1000).toFixed(1)}K`;
            
            // Calculate growth percentage (assuming base value)
            const baseValue = parseFloat(portfolioElement.getAttribute('data-base-value')) || 247850;
            portfolioGrowth = ((totalValue - baseValue) / baseValue * 100);
            
            // Update progress indicator
            const portfolioProgress = portfolioElement.closest('.sales')?.querySelector('.number p');
            if (portfolioProgress) {
                portfolioProgress.textContent = `${portfolioGrowth >= 0 ? '+' : ''}${portfolioGrowth.toFixed(1)}%`;
            }
        }
        
        // Update total P&L
        const pnlElement = document.querySelector('.expenses h1');
        if (pnlElement) {
            const totalPnL = DashboardData.getTotalPnL();
            pnlElement.textContent = `${totalPnL >= 0 ? '+' : ''}$${(totalPnL / 1000).toFixed(1)}K`;
            
            // Update progress indicator
            const pnlProgress = pnlElement.closest('.expenses')?.querySelector('.number p');
            if (pnlProgress) {
                const totalValue = DashboardData.getTotalPortfolioValue();
                const percentage = totalValue > 0 ? Math.abs(totalPnL / totalValue * 100) : 0;
                pnlProgress.textContent = `${totalPnL >= 0 ? '+' : '-'}${percentage.toFixed(1)}%`;
            }
        }
        
        // Update win rate
        const winRateH1Element = document.querySelector('.income h1');
        const winRateElement = document.querySelector('.income .number p');
        if (winRateElement && winRateH1Element) {
            const winRate = DashboardData.getWinRate();
            winRateH1Element.textContent = `${winRate.toFixed(0)}%`;
            winRateElement.textContent = `${winRate.toFixed(0)}%`;
        }
        
        // Update counts
        const activeCountElement = document.querySelector('#ordersTableBody')?.closest('.recent-orders')?.querySelector('h2');
        if (activeCountElement) {
            const activeCount = DashboardData.getActiveOrdersCount();
            const pendingCount = DashboardData.getPendingOrdersCount();
            activeCountElement.textContent = `Active Positions (${activeCount}) • Pending (${pendingCount})`;
        }
        
        console.info('Dashboard metrics updated successfully');
        
        // Update progress circles to reflect new values
        updateProgressCircles();
        
    } catch (error) {
        console.error('Error updating dashboard metrics:', error);
    }
}

// Real-time price updates simulation
function startRealTimeUpdates() {
    if (typeof Orders === 'undefined') return;
    
    // Use config interval if available
    const updateInterval = window.AppConfig?.ui?.updateInterval || 5000;
    
    setInterval(() => {
        try {
            // Update prices for active orders
            Orders.forEach(order => {
                if (order.shipping === 'Active' && MarketData[order.productName]) {
                    order.currentPrice = getCurrentPrice(order.productName);
                }
            });
            
            // Update dashboard metrics
            updateDashboardMetrics();
            
            // Update progress circles
            updateProgressCircles();
            
            // Refresh table if visible
            if (document.querySelector('#ordersTableBody')) {
                populateOrdersTable();
            }
            
            // Log update time for debugging
            if (window.AppConfig?.isDevelopment()) {
                console.debug('Real-time update:', new Date().toLocaleTimeString());
            }
            
        } catch (error) {
            console.error('Error in real-time updates:', error);
        }
    }, updateInterval);
}

// Enhanced data refresh with DataService
async function refreshDashboardData() {
    try {
        if (window.DataService) {
            // Get latest market data with real-time prices if available
            const assets = ['S&P 500', 'NASDAQ', 'Gold', 'Oil', 'Bitcoin'];
            
            // Try to get real-time prices
            const useMockData = window.AppConfig?.useMockData ?? true;
            
            if (!useMockData) {
                console.log('[Dashboard] Fetching real-time data...');
                
                // Fetch real crypto prices
                try {
                    const cryptoPrices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum']);
                    if (cryptoPrices) {
                        console.log('[Dashboard] Real crypto prices:', cryptoPrices);
                    }
                } catch (error) {
                    console.warn('[Dashboard] Crypto API error:', error);
                }
            }
            
            const marketData = DataService.getMarketData(assets, 1);
            
            // Calculate top performers
            const performers = DataService.getTopPerformers(marketData);
            
            // Update best/worst performer cards if they exist
            const bestPerformer = document.querySelector('.sales-analytics .item.online .info');
            if (bestPerformer && performers.gainers.length > 0) {
                const top = performers.gainers[0];
                bestPerformer.querySelector('h3').textContent = 'Top Gainer';
                bestPerformer.querySelector('small').textContent = `${top.asset} +${top.change.toFixed(2)}%`;
            }
            
            const worstPerformer = document.querySelector('.sales-analytics .item.offline .info');
            if (worstPerformer && performers.losers.length > 0) {
                const bottom = performers.losers[0];
                worstPerformer.querySelector('h3').textContent = 'Top Loser';
                worstPerformer.querySelector('small').textContent = `${bottom.asset} ${bottom.change.toFixed(2)}%`;
            }
            
            console.info('[Dashboard] Data refreshed');
        }
    } catch (error) {
        console.error('Error refreshing dashboard data:', error);
    }
}

// Update recent updates with real-time prices from multiple sources
async function updateRecentUpdatesWithRealPrices() {
    console.log('[Dashboard] === Starting updateRecentUpdatesWithRealPrices ===');
    
    try {
        const useMockData = window.AppConfig?.useMockData ?? true;
        console.log('[Dashboard] useMockData:', useMockData);
        console.log('[Dashboard] AppConfig exists:', typeof window.AppConfig !== 'undefined');
        console.log('[Dashboard] DataService exists:', typeof window.DataService !== 'undefined');
        
        const apiStatus = document.getElementById('apiStatus');
        
        if (!useMockData && window.DataService) {
            console.log('[Dashboard] Fetching live crypto prices...');
            // Fetch crypto prices
            const cryptoPrices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum', 'solana']);
            console.log('[Dashboard] Crypto prices received:', cryptoPrices);
            
            // Fetch stock/commodity prices
            let goldPrice = null;
            let spyPrice = null;
            
            try {
                // Fetch Gold (XAU/USD) from Twelve Data if key is available
                const tdKey = window.AppConfig?.thirdPartyApis?.twelveData?.key;
                console.log('[Dashboard] Twelve Data key exists:', !!tdKey);
                
                if (tdKey && tdKey !== 'YOUR_TWELVE_DATA_KEY_HERE' && tdKey !== '') {
                    console.log('[Dashboard] Fetching Gold price...');
                    const goldData = await DataService.fetchAssetQuote('XAU/USD');
                    console.log('[Dashboard] Gold data received:', goldData);
                    
                    if (goldData && goldData.close) {
                        goldPrice = {
                            price: parseFloat(goldData.close),
                            change: parseFloat(goldData.percent_change || 0)
                        };
                        console.log('[Dashboard] Gold price parsed:', goldPrice);
                    }
                    
                    console.log('[Dashboard] Fetching S&P 500 price...');
                    const spyData = await DataService.fetchAssetQuote('SPY');
                    console.log('[Dashboard] SPY data received:', spyData);
                    
                    if (spyData && spyData.close) {
                        spyPrice = {
                            price: parseFloat(spyData.close),
                            change: parseFloat(spyData.percent_change || 0)
                        };
                        console.log('[Dashboard] SPY price parsed:', spyPrice);
                    }
                }
            } catch (error) {
                console.warn('[Dashboard] Could not fetch stock/commodity data:', error);
            }
            
            if (cryptoPrices && cryptoPrices.bitcoin) {
                // Show API status indicator
                if (apiStatus) {
                    apiStatus.style.display = 'flex';
                    apiStatus.style.alignItems = 'center';
                    apiStatus.style.gap = '0.5rem';
                }
                
                // Update all entries in recent updates
                const updates = document.querySelectorAll('.recent-updates .update');
                console.log('[Dashboard] Found', updates.length, 'update entries to process');
                console.log('[Dashboard] cryptoPrices object:', cryptoPrices);
                updates.forEach((update, index) => {
                    const message = update.querySelector('.message p');
                    const timestamp = update.querySelector('.message small');
                    
                    if (!message) {
                        console.warn('[Dashboard] Update', index, 'has no message element');
                        return;
                    }
                    
                    const messageText = message.textContent;
                    console.log('[Dashboard] Processing update', index, ':', messageText);
                    
                    if (messageText.includes('Bitcoin') && cryptoPrices.bitcoin) {
                        const price = cryptoPrices.bitcoin.usd;
                        const change = cryptoPrices.bitcoin.usd_24h_change || 0;
                        const changeSymbol = change >= 0 ? '+' : '';
                        message.innerHTML = `<b>Bitcoin</b> trading at $${price.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${change.toFixed(2)}% 24h)`;
                        if (timestamp) timestamp.textContent = 'Just now (live data)';
                        console.log('[Dashboard] ✅ Updated Bitcoin price:', price);
                    }
                    
                    if (messageText.includes('Ethereum') && cryptoPrices.ethereum) {
                        const ethPrice = cryptoPrices.ethereum.usd;
                        const ethChange = cryptoPrices.ethereum.usd_24h_change || 0;
                        const changeSymbol = ethChange >= 0 ? '+' : '';
                        message.innerHTML = `<b>Ethereum</b> trading at $${ethPrice.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${ethChange.toFixed(2)}% 24h)`;
                        if (timestamp) timestamp.textContent = 'Just now (live data)';
                        console.log('[Dashboard] ✅ Updated Ethereum price:', ethPrice);
                    }
                    
                    if (messageText.includes('Gold') && goldPrice) {
                        const changeSymbol = goldPrice.change >= 0 ? '+' : '';
                        message.innerHTML = `<b>Gold</b> trading at $${goldPrice.price.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${goldPrice.change.toFixed(2)}% today)`;
                        if (timestamp) timestamp.textContent = 'Just now (live data)';
                        console.log('[Dashboard] ✅ Updated Gold price:', goldPrice.price);
                    }
                    
                    if (messageText.includes('S&P 500') && spyPrice) {
                        const changeSymbol = spyPrice.change >= 0 ? '+' : '';
                        message.innerHTML = `<b>S&P 500</b> at $${spyPrice.price.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${spyPrice.change.toFixed(2)}% today)`;
                        if (timestamp) timestamp.textContent = 'Just now (live data)';
                        console.log('[Dashboard] ✅ Updated S&P 500 price:', spyPrice.price);
                    }
                });
                
                // Update Market Analytics cards
                const allPrices = [];
                
                if (cryptoPrices.bitcoin) {
                    allPrices.push({
                        name: 'Bitcoin',
                        price: cryptoPrices.bitcoin.usd,
                        change: cryptoPrices.bitcoin.usd_24h_change || 0
                    });
                }
                
                if (cryptoPrices.ethereum) {
                    allPrices.push({
                        name: 'Ethereum',
                        price: cryptoPrices.ethereum.usd,
                        change: cryptoPrices.ethereum.usd_24h_change || 0
                    });
                }
                
                if (cryptoPrices.solana) {
                    allPrices.push({
                        name: 'Solana',
                        price: cryptoPrices.solana.usd,
                        change: cryptoPrices.solana.usd_24h_change || 0
                    });
                }
                
                if (goldPrice) {
                    allPrices.push({
                        name: 'Gold',
                        price: goldPrice.price,
                        change: goldPrice.change
                    });
                }
                
                if (spyPrice) {
                    allPrices.push({
                        name: 'S&P 500',
                        price: spyPrice.price,
                        change: spyPrice.change
                    });
                }
                
                // Find best and worst performers
                if (allPrices.length > 0) {
                    allPrices.sort((a, b) => b.change - a.change);
                    
                    const bestPerformer = allPrices[0];
                    const worstPerformer = allPrices[allPrices.length - 1];
                    
                    // Update best performer
                    const bestCard = document.querySelector('#bestPerformer');
                    if (bestCard) {
                        const nameEl = bestCard.querySelector('.info small');
                        const changeEl = bestCard.querySelector('h5');
                        const priceEl = bestCard.querySelector('.right h3');
                        
                        if (nameEl) nameEl.textContent = bestPerformer.name;
                        if (changeEl) {
                            changeEl.textContent = `${bestPerformer.change >= 0 ? '+' : ''}${bestPerformer.change.toFixed(2)}%`;
                            changeEl.className = bestPerformer.change >= 0 ? 'success' : 'danger';
                        }
                        if (priceEl) priceEl.textContent = `$${bestPerformer.price.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
                    }
                    
                    // Update worst performer
                    const worstCard = document.querySelector('#worstPerformer');
                    if (worstCard) {
                        const nameEl = worstCard.querySelector('.info small');
                        const changeEl = worstCard.querySelector('h5');
                        const priceEl = worstCard.querySelector('.right h3');
                        
                        if (nameEl) nameEl.textContent = worstPerformer.name;
                        if (changeEl) {
                            changeEl.textContent = `${worstPerformer.change >= 0 ? '+' : ''}${worstPerformer.change.toFixed(2)}%`;
                            changeEl.className = worstPerformer.change >= 0 ? 'success' : 'danger';
                        }
                        if (priceEl) priceEl.textContent = `$${worstPerformer.price.toLocaleString('en-US', {maximumFractionDigits: 2})}`;
                    }
                    
                    console.log('[Dashboard] Updated Market Analytics - Best:', bestPerformer.name, 'Worst:', worstPerformer.name);
                }
            } else {
                console.warn('[Dashboard] No crypto prices received from API');
            }
        } else {
            console.log('[Dashboard] Skipping live data update - useMockData:', useMockData, 'DataService exists:', !!window.DataService);
        }
    } catch (error) {
        console.error('[Dashboard] Error updating real-time prices:', error);
        console.error('[Dashboard] Error stack:', error.stack);
    }
    
    console.log('[Dashboard] === Finished updateRecentUpdatesWithRealPrices ===');
}

// Update notification badge count
function updateNotificationBadge() {
    if (typeof NotificationService !== 'undefined') {
        const unreadCount = NotificationService.getUnreadCount();
        const badge = document.querySelector('.message-count');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }
    }
}

// Initialize dashboard data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateDashboardMetrics();
        startRealTimeUpdates();
        refreshDashboardData();
        updateNotificationBadge();
        // Update real-time crypto prices
        updateRecentUpdatesWithRealPrices();
        // Refresh crypto prices every 90 seconds (to avoid rate limits)
        setInterval(updateRecentUpdatesWithRealPrices, 90000);
        // Refresh orders table every 90 seconds for live prices
        setInterval(populateOrdersTable, 90000);
    });
} else {
    updateDashboardMetrics();
    startRealTimeUpdates();
    refreshDashboardData();
    updateNotificationBadge();
    // Update real-time crypto prices
    updateRecentUpdatesWithRealPrices();
    // Refresh crypto prices every 90 seconds (to avoid rate limits)
    setInterval(updateRecentUpdatesWithRealPrices, 90000);
}

/**
 * Open metrics modal with detailed information
 * @param {string} type - Type of metric: 'portfolio', 'pnl', or 'winrate'
 */
function openMetricsModal(type) {
    var modal = document.getElementById('metricsModal');
    var title = document.getElementById('metricsModalTitle');
    var body = document.getElementById('metricsModalBody');
    
    if (!modal || !title || !body) return;
    
    // Set title based on type
    var titles = {
        portfolio: 'Total Position Breakdown',
        pnl: 'Profit & Loss Analysis',
        winrate: 'Win Rate Analytics'
    };
    title.textContent = titles[type] || 'Metrics';
    
    // Generate content based on type
    var content = '';
    
    if (type === 'portfolio') {
        content = generatePortfolioModalContent();
    } else if (type === 'pnl') {
        content = generatePnLModalContent();
    } else if (type === 'winrate') {
        content = generateWinRateModalContent();
    }
    
    body.innerHTML = content;
    modal.style.display = 'block';
    // Add active class after a small delay for animation
    setTimeout(function() {
        modal.classList.add('active');
    }, 10);
    document.body.style.overflow = 'hidden';
}

/**
 * Close metrics modal
 */
function closeMetricsModal() {
    var modal = document.getElementById('metricsModal');
    if (modal) {
        modal.classList.remove('active');
        // Wait for animation before hiding
        setTimeout(function() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

/**
 * Generate portfolio breakdown content
 */
function generatePortfolioModalContent() {
    if (typeof DashboardData === 'undefined' || typeof Orders === 'undefined') {
        return '<p>Data not available</p>';
    }
    
    var totalValue = DashboardData.getTotalPortfolioValue();
    var activeOrders = Orders.filter(function(o) { return o.shipping === 'Active'; });
    
    var html = '<div class="modal-stats-grid">';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Total Portfolio Value</div><div class="modal-stat-value">$' + totalValue.toLocaleString('en-US', {minimumFractionDigits: 2}) + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Active Positions</div><div class="modal-stat-value">' + activeOrders.length + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Pending Orders</div><div class="modal-stat-value">' + DashboardData.getPendingOrdersCount() + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Total Volume</div><div class="modal-stat-value">' + (DashboardData.getTotalVolume() / 1000000).toFixed(1) + 'M</div></div>';
    html += '</div>';
    
    html += '<h3 style="margin: 2rem 0 1rem 0; color: var(--color-dark);">Position Breakdown</h3>';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr><th style="text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">Asset</th>';
    html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">Quantity</th>';
    html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">Current Value</th>';
    html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">% of Portfolio</th></tr></thead><tbody>';
    
    activeOrders.forEach(function(order) {
        var currentPrice = order.currentPrice || getCurrentPrice(order.productName);
        var value = currentPrice * order.quantity;
        var percentage = (value / totalValue * 100).toFixed(1);
        
        html += '<tr>';
        html += '<td style="padding: 0.75rem; border-bottom: 1px solid var(--color-light);"><strong>' + order.productName + '</strong></td>';
        html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light);">' + order.quantity + '</td>';
        html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light);">$' + value.toLocaleString('en-US', {minimumFractionDigits: 2}) + '</td>';
        html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light);">' + percentage + '%</td>';
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    return html;
}

/**
 * Generate P&L analysis content
 */
function generatePnLModalContent() {
    if (typeof DashboardData === 'undefined' || typeof Orders === 'undefined') {
        return '<p>Data not available</p>';
    }
    
    var totalPnL = DashboardData.getTotalPnL();
    var totalValue = DashboardData.getTotalPortfolioValue();
    var pnlPercentage = (totalPnL / totalValue * 100).toFixed(2);
    
    var winners = [];
    var losers = [];
    
    Orders.filter(function(o) { return o.shipping === 'Active'; }).forEach(function(order) {
        var currentPrice = order.currentPrice || getCurrentPrice(order.productName);
        var pnl = (currentPrice - order.entryPrice) * order.quantity;
        var actualPnL = order.orderType === 'Long' ? pnl : -pnl;
        var percentage = ((currentPrice - order.entryPrice) / order.entryPrice * 100);
        var actualPercentage = order.orderType === 'Long' ? percentage : -percentage;
        
        if (actualPnL >= 0) {
            winners.push({ name: order.productName, pnl: actualPnL, percentage: actualPercentage });
        } else {
            losers.push({ name: order.productName, pnl: actualPnL, percentage: actualPercentage });
        }
    });
    
    var html = '<div class="modal-stats-grid">';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Total P&L</div><div class="modal-stat-value" style="color: ' + (totalPnL >= 0 ? 'var(--color-success)' : 'var(--color-danger)') + ';">' + (totalPnL >= 0 ? '+' : '') + '$' + totalPnL.toLocaleString('en-US', {minimumFractionDigits: 2}) + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">P&L Percentage</div><div class="modal-stat-value" style="color: ' + (totalPnL >= 0 ? 'var(--color-success)' : 'var(--color-danger)') + ';">' + (totalPnL >= 0 ? '+' : '') + pnlPercentage + '%</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Winning Positions</div><div class="modal-stat-value">' + winners.length + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Losing Positions</div><div class="modal-stat-value">' + losers.length + '</div></div>';
    html += '</div>';
    
    if (winners.length > 0) {
        html += '<h3 style="margin: 2rem 0 1rem 0; color: var(--color-success);">Winning Positions</h3>';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr><th style="text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">Asset</th>';
        html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">P&L</th>';
        html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">% Change</th></tr></thead><tbody>';
        
        winners.sort(function(a, b) { return b.pnl - a.pnl; }).forEach(function(w) {
            html += '<tr>';
            html += '<td style="padding: 0.75rem; border-bottom: 1px solid var(--color-light);"><strong>' + w.name + '</strong></td>';
            html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light); color: var(--color-success);">+$' + w.pnl.toLocaleString('en-US', {minimumFractionDigits: 2}) + '</td>';
            html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light); color: var(--color-success);">+' + w.percentage.toFixed(2) + '%</td>';
            html += '</tr>';
        });
        html += '</tbody></table>';
    }
    
    if (losers.length > 0) {
        html += '<h3 style="margin: 2rem 0 1rem 0; color: var(--color-danger);">Losing Positions</h3>';
        html += '<table style="width: 100%; border-collapse: collapse;">';
        html += '<thead><tr><th style="text-align: left; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">Asset</th>';
        html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">P&L</th>';
        html += '<th style="text-align: right; padding: 0.75rem; border-bottom: 2px solid var(--color-light);">% Change</th></tr></thead><tbody>';
        
        losers.sort(function(a, b) { return a.pnl - b.pnl; }).forEach(function(l) {
            html += '<tr>';
            html += '<td style="padding: 0.75rem; border-bottom: 1px solid var(--color-light);"><strong>' + l.name + '</strong></td>';
            html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light); color: var(--color-danger);">$' + l.pnl.toLocaleString('en-US', {minimumFractionDigits: 2}) + '</td>';
            html += '<td style="text-align: right; padding: 0.75rem; border-bottom: 1px solid var(--color-light); color: var(--color-danger);">' + l.percentage.toFixed(2) + '%</td>';
            html += '</tr>';
        });
        html += '</tbody></table>';
    }
    
    return html;
}

/**
 * Generate win rate analytics content
 */
function generateWinRateModalContent() {
    if (typeof DashboardData === 'undefined' || typeof Orders === 'undefined') {
        return '<p>Data not available</p>';
    }
    
    var winRate = DashboardData.getWinRate();
    var activeOrders = Orders.filter(function(o) { return o.shipping === 'Active'; });
    var totalOrders = Orders.length;
    
    var profitable = 0;
    var unprofitable = 0;
    
    activeOrders.forEach(function(order) {
        var currentPrice = order.currentPrice || getCurrentPrice(order.productName);
        var pnl = (currentPrice - order.entryPrice) * order.quantity;
        var actualPnL = order.orderType === 'Long' ? pnl : -pnl;
        
        if (actualPnL > 0) profitable++;
        else if (actualPnL < 0) unprofitable++;
    });
    
    var html = '<div class="modal-stats-grid">';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Overall Win Rate</div><div class="modal-stat-value">' + winRate.toFixed(1) + '%</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Winning Trades</div><div class="modal-stat-value" style="color: var(--color-success);">' + profitable + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Losing Trades</div><div class="modal-stat-value" style="color: var(--color-danger);">' + unprofitable + '</div></div>';
    html += '<div class="modal-stat-card"><div class="modal-stat-label">Total Trades</div><div class="modal-stat-value">' + totalOrders + '</div></div>';
    html += '</div>';
    
    html += '<div style="margin-top: 2rem; padding: 1.5rem; background: var(--color-light); border-radius: 1rem;">';
    html += '<h3 style="margin-top: 0; color: var(--color-dark);">Performance Insights</h3>';
    html += '<div style="margin: 1rem 0;"><strong>Win Rate Analysis:</strong> ';
    
    if (winRate >= 70) {
        html += 'Excellent performance! Your win rate is above 70%, indicating strong trading decisions and risk management.';
    } else if (winRate >= 50) {
        html += 'Good performance. Your win rate is above 50%, showing profitable trading overall. Consider optimizing entry and exit strategies.';
    } else {
        html += 'Below average performance. Focus on improving your trading strategy, risk management, and market analysis.';
    }
    
    html += '</div>';
    html += '<div style="margin: 1rem 0;"><strong>Risk/Reward Ratio:</strong> ';
    
    var avgWinSize = profitable > 0 ? DashboardData.getTotalPnL() / profitable : 0;
    html += 'Average winning trade: $' + Math.abs(avgWinSize).toLocaleString('en-US', {minimumFractionDigits: 2});
    html += '</div>';
    
    html += '<div style="margin: 1rem 0;"><strong>Recommendation:</strong> ';
    if (winRate >= 60 && profitable > unprofitable) {
        html += 'Continue with your current strategy. Consider increasing position sizes for high-confidence trades.';
    } else {
        html += 'Review losing positions to identify patterns. Focus on cutting losses early and letting winners run.';
    }
    html += '</div>';
    html += '</div>';
    
    return html;
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    var modal = document.getElementById('metricsModal');
    if (modal && e.target === modal) {
        closeMetricsModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMetricsModal();
    }
});

// Make functions globally available
window.showOrderDetails = showOrderDetails;
window.updateDashboardMetrics = updateDashboardMetrics;
window.startRealTimeUpdates = startRealTimeUpdates;
window.refreshDashboardData = refreshDashboardData;
window.updateRecentUpdatesWithRealPrices = updateRecentUpdatesWithRealPrices;
window.updateNotificationBadge = updateNotificationBadge;
window.openMetricsModal = openMetricsModal;
window.closeMetricsModal = closeMetricsModal;