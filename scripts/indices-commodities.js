/**
 * Indices & Commodities Modal Functions
 */

// Market data
var marketIndices = [
    { name: 'S&P 500', symbol: 'SPX', price: 4247.50, change: 42.75, changePercent: 1.02, volume: '3.2B', status: 'Active', sector: 'US Large Cap' },
    { name: 'NASDAQ', symbol: 'IXIC', price: 13045.25, change: 125.50, changePercent: 0.97, volume: '5.1B', status: 'Active', sector: 'US Technology' },
    { name: 'FTSE 100', symbol: 'FTSE', price: 7512.80, change: -18.30, changePercent: -0.24, volume: '1.8B', status: 'Active', sector: 'UK Large Cap' },
    { name: 'Nikkei 225', symbol: 'N225', price: 32450.15, change: 215.80, changePercent: 0.67, volume: '2.4B', status: 'Closed', sector: 'Japan Large Cap' },
    { name: 'DAX', symbol: 'GDAXI', price: 15780.40, change: 95.20, changePercent: 0.61, volume: '1.5B', status: 'Active', sector: 'German Large Cap' }
];

var commodities = [
    { name: 'Gold', symbol: 'XAU', price: 1980.25, change: 12.50, changePercent: 0.64, unit: 'oz', status: 'Active', category: 'Precious Metals' },
    { name: 'Silver', symbol: 'XAG', price: 23.45, change: -0.35, changePercent: -1.47, unit: 'oz', status: 'Active', category: 'Precious Metals' },
    { name: 'Crude Oil (WTI)', symbol: 'CL', price: 89.45, change: 2.15, changePercent: 2.46, unit: 'barrel', status: 'Active', category: 'Energy' },
    { name: 'Natural Gas', symbol: 'NG', price: 2.87, change: -0.08, changePercent: -2.71, unit: 'MMBtu', status: 'Active', category: 'Energy' },
    { name: 'Copper', symbol: 'HG', price: 3.85, change: 0.05, changePercent: 1.32, unit: 'lb', status: 'Active', category: 'Industrial Metals' },
    { name: 'Wheat', symbol: 'ZW', price: 645.50, change: -12.25, changePercent: -1.86, unit: 'bushel', status: 'Active', category: 'Agriculture' },
    { name: 'Platinum', symbol: 'XPT', price: 925.80, change: 8.45, changePercent: 0.92, unit: 'oz', status: 'Active', category: 'Precious Metals' },
    { name: 'Brent Crude', symbol: 'BZ', price: 94.25, change: 1.85, changePercent: 2.00, unit: 'barrel', status: 'Active', category: 'Energy' }
];

var activeTrades = [
    { asset: 'S&P 500 Index', type: 'Long', size: '10 contracts', entryPrice: 4200.00, currentPrice: 4247.50, pnl: 4750.00, pnlPercent: 1.13, time: '2h 15m' },
    { asset: 'Gold Futures', type: 'Long', size: '5 contracts', entryPrice: 1965.00, currentPrice: 1980.25, pnl: 762.50, pnlPercent: 0.78, time: '4h 30m' },
    { asset: 'Crude Oil WTI', type: 'Long', size: '20 contracts', entryPrice: 87.50, currentPrice: 89.45, pnl: 3900.00, pnlPercent: 2.23, time: '1h 45m' },
    { asset: 'NASDAQ 100', type: 'Long', size: '8 contracts', entryPrice: 12900.00, currentPrice: 13045.25, pnl: 1161.00, pnlPercent: 1.13, time: '3h 20m' },
    { asset: 'Silver Futures', type: 'Long', size: '15 contracts', entryPrice: 23.80, currentPrice: 23.45, pnl: -262.50, pnlPercent: -1.47, time: '5h 10m' },
    { asset: 'Natural Gas', type: 'Short', size: '25 contracts', entryPrice: 2.95, currentPrice: 2.87, pnl: 2000.00, pnlPercent: 2.71, time: '2h 50m' },
    { asset: 'DAX Index', type: 'Long', size: '6 contracts', entryPrice: 15680.00, currentPrice: 15780.40, pnl: 602.40, pnlPercent: 0.64, time: '6h 15m' }
];

/**
 * Open market modal with specified content type
 */
function openMarketModal(type) {
    var modal = document.getElementById('marketModal');
    var title = document.getElementById('marketModalTitle');
    var body = document.getElementById('marketModalBody');
    
    if (!modal || !title || !body) return;
    
    // Set title based on type
    var titles = {
        indices: 'Global Indices Overview',
        commodities: 'Commodities Market Analysis',
        trades: 'Active Trades Portfolio'
    };
    title.textContent = titles[type] || 'Market Details';
    
    // Generate content based on type
    var content = '';
    
    if (type === 'indices') {
        content = generateIndicesModalContent();
    } else if (type === 'commodities') {
        content = generateCommoditiesModalContent();
    } else if (type === 'trades') {
        content = generateTradesModalContent();
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
 * Close market modal
 */
function closeMarketModal() {
    var modal = document.getElementById('marketModal');
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
 * Generate Global Indices modal content
 */
function generateIndicesModalContent() {
    // Calculate statistics
    var activeCount = marketIndices.filter(function(idx) { return idx.status === 'Active'; }).length;
    var avgChange = marketIndices.reduce(function(sum, idx) { return sum + idx.changePercent; }, 0) / marketIndices.length;
    var gainers = marketIndices.filter(function(idx) { return idx.change > 0; }).length;
    var losers = marketIndices.filter(function(idx) { return idx.change < 0; }).length;
    
    var html = '<div style="margin-bottom: 2rem;">';
    
    // Stats Grid
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">';
    html += '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Total Indices</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + marketIndices.length + '</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Active Markets</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + activeCount + '</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Avg Change</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + avgChange.toFixed(2) + '%</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Gainers / Losers</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + gainers + ' / ' + losers + '</div>';
    html += '</div>';
    html += '</div>';
    
    // Indices Table
    html += '<h3 style="margin-bottom: 1rem; color: #1f2937; font-size: 1.1rem;">Detailed Index Performance</h3>';
    html += '<div style="overflow-x: auto;">';
    html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
    html += '<thead><tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">';
    html += '<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151;">Index</th>';
    html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Price</th>';
    html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Change</th>';
    html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">% Change</th>';
    html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Volume</th>';
    html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151;">Sector</th>';
    html += '</tr></thead><tbody>';
    
    // Sort by change percent (descending)
    var sortedIndices = marketIndices.slice().sort(function(a, b) { return b.changePercent - a.changePercent; });
    
    sortedIndices.forEach(function(idx, index) {
        var rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        var changeColor = idx.change >= 0 ? '#10b981' : '#ef4444';
        html += '<tr style="background: ' + rowBg + '; border-bottom: 1px solid #e5e7eb;">';
        html += '<td style="padding: 0.75rem; font-weight: 600; color: #1f2937;">' + idx.name + '</td>';
        html += '<td style="padding: 0.75rem; text-align: right; color: #4b5563;">' + idx.price.toLocaleString() + '</td>';
        html += '<td style="padding: 0.75rem; text-align: right; font-weight: 600; color: ' + changeColor + ';">' + (idx.change >= 0 ? '+' : '') + idx.change.toFixed(2) + '</td>';
        html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: ' + changeColor + ';">' + (idx.changePercent >= 0 ? '+' : '') + idx.changePercent.toFixed(2) + '%</td>';
        html += '<td style="padding: 0.75rem; text-align: right; color: #6b7280;">' + idx.volume + '</td>';
        html += '<td style="padding: 0.75rem; text-align: center;"><span style="background: #e0e7ff; color: #4338ca; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">' + idx.sector + '</span></td>';
        html += '</tr>';
    });
    
    html += '</tbody></table></div>';
    html += '</div>';
    
    return html;
}

/**
 * Generate Commodities modal content
 */
function generateCommoditiesModalContent() {
    // Calculate statistics
    var categories = {};
    commodities.forEach(function(comm) {
        if (!categories[comm.category]) categories[comm.category] = [];
        categories[comm.category].push(comm);
    });
    
    var avgChange = commodities.reduce(function(sum, comm) { return sum + comm.changePercent; }, 0) / commodities.length;
    var gainers = commodities.filter(function(comm) { return comm.change > 0; }).length;
    var losers = commodities.filter(function(comm) { return comm.change < 0; }).length;
    
    var html = '<div style="margin-bottom: 2rem;">';
    
    // Stats Grid
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">';
    html += '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Total Commodities</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + commodities.length + '</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Categories</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + Object.keys(categories).length + '</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Avg Change</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + avgChange.toFixed(2) + '%</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Gainers / Losers</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + gainers + ' / ' + losers + '</div>';
    html += '</div>';
    html += '</div>';
    
    // Commodities by Category
    Object.keys(categories).forEach(function(category) {
        html += '<h3 style="margin: 1.5rem 0 1rem; color: #1f2937; font-size: 1.1rem; border-left: 4px solid #7e22ce; padding-left: 0.75rem;">' + category + '</h3>';
        html += '<div style="overflow-x: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1rem;">';
        html += '<thead><tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">';
        html += '<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #374151;">Commodity</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Price</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">Change</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #374151;">% Change</th>';
        html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #374151;">Unit</th>';
        html += '</tr></thead><tbody>';
        
        categories[category].forEach(function(comm, index) {
            var rowBg = index % 2 === 0 ? '#ffffff' : '#f9fafb';
            var changeColor = comm.change >= 0 ? '#10b981' : '#ef4444';
            html += '<tr style="background: ' + rowBg + '; border-bottom: 1px solid #e5e7eb;">';
            html += '<td style="padding: 0.75rem; font-weight: 600; color: #1f2937;">' + comm.name + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; color: #4b5563;">$' + comm.price.toLocaleString() + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 600; color: ' + changeColor + ';">' + (comm.change >= 0 ? '+' : '') + comm.change.toFixed(2) + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: ' + changeColor + ';">' + (comm.changePercent >= 0 ? '+' : '') + comm.changePercent.toFixed(2) + '%</td>';
            html += '<td style="padding: 0.75rem; text-align: center;"><span style="background: #fef3c7; color: #92400e; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.8rem; font-weight: 500;">' + comm.unit + '</span></td>';
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
    });
    
    html += '</div>';
    
    return html;
}

/**
 * Generate Active Trades modal content
 */
function generateTradesModalContent() {
    // Calculate statistics
    var totalPnL = activeTrades.reduce(function(sum, trade) { return sum + trade.pnl; }, 0);
    var winners = activeTrades.filter(function(trade) { return trade.pnl > 0; });
    var losers = activeTrades.filter(function(trade) { return trade.pnl < 0; });
    var avgPnL = totalPnL / activeTrades.length;
    var winRate = (winners.length / activeTrades.length * 100).toFixed(1);
    
    var html = '<div style="margin-bottom: 2rem;">';
    
    // Stats Grid
    html += '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">';
    html += '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Active Trades</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + activeTrades.length + '</div>';
    html += '</div>';
    
    var pnlColor = totalPnL >= 0 ? '#10b981' : '#ef4444';
    html += '<div style="background: linear-gradient(135deg, ' + pnlColor + ' 0%, ' + pnlColor + 'dd 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Total P&L</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + (totalPnL >= 0 ? '+' : '') + '$' + totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Win Rate</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + winRate + '%</div>';
    html += '</div>';
    
    html += '<div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 1rem; border-radius: 10px; color: white; text-align: center;">';
    html += '<div style="font-size: 0.75rem; opacity: 0.9; margin-bottom: 0.25rem;">Winners / Losers</div>';
    html += '<div style="font-size: 1.75rem; font-weight: 700;">' + winners.length + ' / ' + losers.length + '</div>';
    html += '</div>';
    html += '</div>';
    
    // Winners Section
    if (winners.length > 0) {
        html += '<h3 style="margin: 1.5rem 0 1rem; color: #10b981; font-size: 1.1rem; border-left: 4px solid #10b981; padding-left: 0.75rem;">Winning Positions (' + winners.length + ')</h3>';
        html += '<div style="overflow-x: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 1.5rem;">';
        html += '<thead><tr style="background: #d1fae5; border-bottom: 2px solid #10b981;">';
        html += '<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #065f46;">Asset</th>';
        html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #065f46;">Type</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #065f46;">Entry</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #065f46;">Current</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #065f46;">P&L</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #065f46;">% Change</th>';
        html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #065f46;">Duration</th>';
        html += '</tr></thead><tbody>';
        
        winners.sort(function(a, b) { return b.pnl - a.pnl; }).forEach(function(trade, index) {
            var rowBg = index % 2 === 0 ? '#ffffff' : '#f0fdf4';
            html += '<tr style="background: ' + rowBg + '; border-bottom: 1px solid #d1fae5;">';
            html += '<td style="padding: 0.75rem; font-weight: 600; color: #1f2937;">' + trade.asset + '</td>';
            html += '<td style="padding: 0.75rem; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500;">' + trade.type + '</span></td>';
            html += '<td style="padding: 0.75rem; text-align: right; color: #6b7280;">$' + trade.entryPrice.toLocaleString() + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; color: #1f2937; font-weight: 600;">$' + trade.currentPrice.toLocaleString() + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #10b981;">+$' + trade.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #10b981;">+' + trade.pnlPercent.toFixed(2) + '%</td>';
            html += '<td style="padding: 0.75rem; text-align: center; color: #6b7280; font-size: 0.85rem;">' + trade.time + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
    }
    
    // Losers Section
    if (losers.length > 0) {
        html += '<h3 style="margin: 1.5rem 0 1rem; color: #ef4444; font-size: 1.1rem; border-left: 4px solid #ef4444; padding-left: 0.75rem;">Losing Positions (' + losers.length + ')</h3>';
        html += '<div style="overflow-x: auto;">';
        html += '<table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">';
        html += '<thead><tr style="background: #fee2e2; border-bottom: 2px solid #ef4444;">';
        html += '<th style="padding: 0.75rem; text-align: left; font-weight: 600; color: #991b1b;">Asset</th>';
        html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #991b1b;">Type</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #991b1b;">Entry</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #991b1b;">Current</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #991b1b;">P&L</th>';
        html += '<th style="padding: 0.75rem; text-align: right; font-weight: 600; color: #991b1b;">% Change</th>';
        html += '<th style="padding: 0.75rem; text-align: center; font-weight: 600; color: #991b1b;">Duration</th>';
        html += '</tr></thead><tbody>';
        
        losers.sort(function(a, b) { return a.pnl - b.pnl; }).forEach(function(trade, index) {
            var rowBg = index % 2 === 0 ? '#ffffff' : '#fef2f2';
            html += '<tr style="background: ' + rowBg + '; border-bottom: 1px solid #fee2e2;">';
            html += '<td style="padding: 0.75rem; font-weight: 600; color: #1f2937;">' + trade.asset + '</td>';
            html += '<td style="padding: 0.75rem; text-align: center;"><span style="background: #dbeafe; color: #1e40af; padding: 0.25rem 0.5rem; border-radius: 8px; font-size: 0.8rem; font-weight: 500;">' + trade.type + '</span></td>';
            html += '<td style="padding: 0.75rem; text-align: right; color: #6b7280;">$' + trade.entryPrice.toLocaleString() + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; color: #1f2937; font-weight: 600;">$' + trade.currentPrice.toLocaleString() + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #ef4444;">$' + trade.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</td>';
            html += '<td style="padding: 0.75rem; text-align: right; font-weight: 700; color: #ef4444;">' + trade.pnlPercent.toFixed(2) + '%</td>';
            html += '<td style="padding: 0.75rem; text-align: center; color: #6b7280; font-size: 0.85rem;">' + trade.time + '</td>';
            html += '</tr>';
        });
        
        html += '</tbody></table></div>';
    }
    
    // Performance Insights
    html += '<div style="margin-top: 2rem; padding: 1.5rem; background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 12px; border-left: 4px solid #7e22ce;">';
    html += '<h4 style="margin: 0 0 1rem 0; color: #374151; font-size: 1rem;">📊 Performance Insights</h4>';
    html += '<ul style="margin: 0; padding-left: 1.5rem; color: #4b5563; line-height: 1.8;">';
    
    if (winRate >= 70) {
        html += '<li><strong>Excellent win rate!</strong> You\'re successfully managing ' + winRate + '% winning trades.</li>';
    } else if (winRate >= 50) {
        html += '<li>Your win rate of ' + winRate + '% is above average. Focus on increasing position sizes on winners.</li>';
    } else {
        html += '<li>Win rate at ' + winRate + '%. Consider reviewing your entry and exit strategies.</li>';
    }
    
    var avgWinnerPnL = winners.length > 0 ? winners.reduce(function(s, t) { return s + t.pnl; }, 0) / winners.length : 0;
    var avgLoserPnL = losers.length > 0 ? losers.reduce(function(s, t) { return s + Math.abs(t.pnl); }, 0) / losers.length : 0;
    
    if (avgWinnerPnL > avgLoserPnL * 2) {
        html += '<li><strong>Strong risk/reward ratio:</strong> Average winner ($' + avgWinnerPnL.toFixed(2) + ') is more than 2x average loser ($' + avgLoserPnL.toFixed(2) + ').</li>';
    } else if (avgWinnerPnL > avgLoserPnL) {
        html += '<li>Positive risk/reward ratio with average winner at $' + avgWinnerPnL.toFixed(2) + ' vs average loser at $' + avgLoserPnL.toFixed(2) + '.</li>';
    } else {
        html += '<li>⚠️ Average loser ($' + avgLoserPnL.toFixed(2) + ') exceeds average winner ($' + avgWinnerPnL.toFixed(2) + '). Consider tighter stop losses.</li>';
    }
    
    html += '<li>Total exposure across ' + activeTrades.length + ' active positions with combined P&L of ' + (totalPnL >= 0 ? '+' : '') + '$' + totalPnL.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '.</li>';
    html += '</ul></div>';
    
    html += '</div>';
    
    return html;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMarketModal();
        }
    });
});

// Export functions to global scope
window.openMarketModal = openMarketModal;
window.closeMarketModal = closeMarketModal;

// Export data to global scope for chart tooltip
window.marketIndices = marketIndices;
window.commodities = commodities;
window.activeTrades = activeTrades;

console.log('[IndicesCommodities] Data exported to global scope');
console.log('[IndicesCommodities] marketIndices:', marketIndices.length, 'items');
console.log('[IndicesCommodities] commodities:', commodities.length, 'items');
console.log('[IndicesCommodities] Sample asset names:', marketIndices.map(function(i) { return i.name; }));

// Initialize chart tooltips after data is loaded
if (window.initChartTooltips) {
    console.log('[IndicesCommodities] Initializing chart tooltips...');
    setTimeout(function() {
        window.initChartTooltips();
    }, 500);
} else {
    console.log('[IndicesCommodities] Chart tooltip init function not found, will retry...');
    setTimeout(function() {
        if (window.initChartTooltips) {
            console.log('[IndicesCommodities] Retry: Initializing chart tooltips...');
            window.initChartTooltips();
        }
    }, 2000);
}
