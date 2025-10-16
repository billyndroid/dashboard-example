// Enhanced main.js with error handling and improved functionality

// Safely get DOM elements
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Load theme preference
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
            sideMenu.style.display = 'block';
            // Add mobile overlay
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
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
            sideMenu.style.display = 'none';
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
    if (window.innerWidth <= 768 && sideMenu && !sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        if (sideMenu.style.display === 'block') {
            sideMenu.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sideMenu) {
        sideMenu.style.display = '';
        document.body.style.overflow = 'auto';
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', loadThemePreference);

// Enhanced Progress Circle Calculations
function updateProgressCircles() {
    try {
        const progressCircles = document.querySelectorAll('.progress circle');
        
        progressCircles.forEach(circle => {
            const numberElement = circle.parentElement.querySelector('.number p');
            if (!numberElement) return;
            
            const percentageText = numberElement.textContent;
            let percentage = 0;
            
            // Extract percentage from different formats
            if (percentageText.includes('%')) {
                percentage = parseFloat(percentageText.replace('%', ''));
            } else if (percentageText.includes('+') || percentageText.includes('-')) {
                // Handle formats like "+8.2%", "-1.5%"
                percentage = Math.abs(parseFloat(percentageText.replace(/[^0-9.-]/g, '')));
            } else {
                // Default percentage for non-numeric values
                percentage = 75;
            }
            
            // Ensure percentage is within valid range
            percentage = Math.max(0, Math.min(100, percentage));
            
            // Calculate circle properties
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            
            // Apply styles
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
            circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
            
            // Add color based on value
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

// Enhanced orders table population with error handling
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
                    <td><button class="primary" onclick="showOrderDetails(${index})">Details</button></td>
                `;
                
                tableBody.appendChild(tr);
            } catch (error) {
                console.error('Error creating table row for order:', order, error);
            }
        });
        
        console.info(`Successfully populated ${Orders.length} orders in table.`);
        
    } catch (error) {
        console.error('Error populating orders table:', error);
    }
}

// Show order details function with enhanced information
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
            
        } catch (error) {
            console.error('Error in real-time updates:', error);
        }
    }, 5000); // Update every 5 seconds
}

// Initialize dashboard data when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        updateDashboardMetrics();
        startRealTimeUpdates();
    });
} else {
    updateDashboardMetrics();
    startRealTimeUpdates();
}

// Make functions globally available
window.showOrderDetails = showOrderDetails;
window.updateDashboardMetrics = updateDashboardMetrics;
window.startRealTimeUpdates = startRealTimeUpdates;