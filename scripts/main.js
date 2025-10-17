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
function populateOrdersTable() {
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

        Orders.forEach((order, index) => {
            try {
                const tr = document.createElement('tr');
                const statusClass = 
                    order.shipping === 'Declined' ? 'danger' : 
                    order.shipping === 'Pending' ? 'warning' : 'success';
                
                // Calculate P&L for display
                const pnl = order.currentPrice && order.entryPrice ? 
                    (order.currentPrice - order.entryPrice) * order.quantity : 0;
                const pnlPercentage = order.entryPrice ? 
                    ((order.currentPrice - order.entryPrice) / order.entryPrice * 100) : 0;
                const actualPnL = order.orderType === 'Long' ? pnl : -pnl;
                const actualPercentage = order.orderType === 'Long' ? pnlPercentage : -pnlPercentage;
                
                const pnlClass = actualPnL >= 0 ? 'success' : 'danger';
                const pnlSign = actualPnL >= 0 ? '+' : '';
                
                tr.innerHTML = `
                    <td><strong>${order.productName || 'N/A'}</strong><br><small>${order.sector || ''}</small></td>
                    <td>${order.productNumber || 'N/A'}<br><small>Qty: ${order.quantity || 0}</small></td>
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

// Update dashboard metrics with real calculated data
function updateDashboardMetrics() {
    try {
        if (typeof DashboardData === 'undefined') {
            console.warn('DashboardData not available');
            return;
        }
        
        // Update portfolio value
        const portfolioElement = document.querySelector('.sales h1');
        if (portfolioElement) {
            const totalValue = DashboardData.getTotalPortfolioValue();
            portfolioElement.textContent = `$${(totalValue / 1000).toFixed(1)}K`;
        }
        
        // Update total P&L
        const pnlElement = document.querySelector('.expenses h1');
        if (pnlElement) {
            const totalPnL = DashboardData.getTotalPnL();
            pnlElement.textContent = `${totalPnL >= 0 ? '+' : ''}$${(totalPnL / 1000).toFixed(1)}K`;
            
            // Update progress indicator
            const pnlProgress = pnlElement.closest('.expenses')?.querySelector('.number p');
            if (pnlProgress) {
                const percentage = Math.abs(totalPnL / DashboardData.getTotalPortfolioValue() * 100);
                pnlProgress.textContent = `${totalPnL >= 0 ? '+' : '-'}${percentage.toFixed(1)}%`;
            }
        }
        
        // Update win rate
        const winRateElement = document.querySelector('.income .number p');
        if (winRateElement) {
            const winRate = DashboardData.getWinRate();
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

// Update recent updates with real-time crypto prices
async function updateRecentUpdatesWithRealPrices() {
    try {
        const useMockData = window.AppConfig?.useMockData ?? true;
        const apiStatus = document.getElementById('apiStatus');
        
        if (!useMockData && window.DataService) {
            // Fetch real crypto prices
            const cryptoPrices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum']);
            
            if (cryptoPrices && cryptoPrices.bitcoin) {
                // Show API status indicator
                if (apiStatus) {
                    apiStatus.style.display = 'flex';
                    apiStatus.style.alignItems = 'center';
                    apiStatus.style.gap = '0.5rem';
                }
                
                // Update Bitcoin message in recent updates
                const updates = document.querySelectorAll('.recent-updates .update');
                updates.forEach(update => {
                    const message = update.querySelector('.message p');
                    if (message && message.textContent.includes('Bitcoin')) {
                        const price = cryptoPrices.bitcoin.usd;
                        const change = cryptoPrices.bitcoin.usd_24h_change || 0;
                        const changeSymbol = change >= 0 ? '+' : '';
                        message.innerHTML = `<b>Bitcoin</b> trading at $${price.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${change.toFixed(2)}% 24h)`;
                        
                        // Update timestamp
                        const timestamp = update.querySelector('.message small');
                        if (timestamp) {
                            timestamp.textContent = 'Just now (live data)';
                        }
                        
                        console.log('[Dashboard] Updated Bitcoin price:', price);
                    }
                    
                    if (message && message.textContent.includes('Ethereum')) {
                        const ethPrice = cryptoPrices.ethereum?.usd;
                        if (ethPrice) {
                            const ethChange = cryptoPrices.ethereum.usd_24h_change || 0;
                            const changeSymbol = ethChange >= 0 ? '+' : '';
                            message.innerHTML = `<b>Ethereum</b> trading at $${ethPrice.toLocaleString('en-US', {maximumFractionDigits: 2})} (${changeSymbol}${ethChange.toFixed(2)}% 24h)`;
                            
                            const timestamp = update.querySelector('.message small');
                            if (timestamp) {
                                timestamp.textContent = 'Just now (live data)';
                            }
                            
                            console.log('[Dashboard] Updated Ethereum price:', ethPrice);
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('[Dashboard] Error updating real-time prices:', error);
    }
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
        // Refresh crypto prices every 30 seconds
        setInterval(updateRecentUpdatesWithRealPrices, 30000);
    });
} else {
    updateDashboardMetrics();
    startRealTimeUpdates();
    refreshDashboardData();
    updateNotificationBadge();
    // Update real-time crypto prices
    updateRecentUpdatesWithRealPrices();
    // Refresh crypto prices every 30 seconds
    setInterval(updateRecentUpdatesWithRealPrices, 30000);
}

// Make functions globally available
window.showOrderDetails = showOrderDetails;
window.updateDashboardMetrics = updateDashboardMetrics;
window.startRealTimeUpdates = startRealTimeUpdates;
window.refreshDashboardData = refreshDashboardData;
window.updateRecentUpdatesWithRealPrices = updateRecentUpdatesWithRealPrices;
window.updateNotificationBadge = updateNotificationBadge;