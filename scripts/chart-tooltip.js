/**
 * Chart Tooltip - Live chart preview on hover
 */

(function() {
    'use strict';
    
    var chartTooltip = null;
    var canvas = null;
    var ctx = null;
    var currentAsset = null;
    var hideTimeout = null;
    
    // Chart data cache
    var chartDataCache = {};
    
    /**
     * Initialize chart tooltip
     */
    function init() {
        console.log('[ChartTooltip] Initializing...');
        
        chartTooltip = document.getElementById('chartTooltip');
        canvas = document.getElementById('chartTooltipCanvas');
        
        if (!chartTooltip || !canvas) {
            console.error('[ChartTooltip] Elements not found! chartTooltip:', chartTooltip, 'canvas:', canvas);
            return;
        }
        
        console.log('[ChartTooltip] Elements found successfully');
        
        ctx = canvas.getContext('2d');
        
        // Set canvas size for better rendering
        var dpr = window.devicePixelRatio || 1;
        canvas.width = 280 * dpr;
        canvas.height = 140 * dpr;
        ctx.scale(dpr, dpr);
        
        // Initialize after a delay to ensure DOM and tables are ready
        setTimeout(function() {
            console.log('[ChartTooltip] Attaching event listeners (1500ms delay)');
            attachEventListeners();
        }, 1500);
        
        // Also re-attach after 3 seconds in case tables load late
        setTimeout(function() {
            console.log('[ChartTooltip] Re-attaching event listeners (3000ms delay)');
            attachEventListeners();
        }, 3000);
    }
    
    /**
     * Attach event listeners to asset elements
     */
    function attachEventListeners() {
        console.log('[ChartTooltip] Attaching event listeners to table cells...');
        
        // Find all tables
        var tables = document.querySelectorAll('table');
        console.log('[ChartTooltip] Found', tables.length, 'tables');
        
        var cellCount = 0;
        
        tables.forEach(function(table) {
            var rows = table.querySelectorAll('tbody tr');
            console.log('[ChartTooltip] Table has', rows.length, 'rows');
            
            rows.forEach(function(row) {
                var firstCell = row.querySelector('td:first-child');
                if (!firstCell) return;
                
                cellCount++;
                
                // Add hover class for visual feedback
                firstCell.style.cursor = 'help';
                firstCell.style.position = 'relative';
                
                // Mouse enter event
                firstCell.addEventListener('mouseenter', function(e) {
                    // Cancel any pending hide timeout
                    if (hideTimeout) {
                        clearTimeout(hideTimeout);
                        hideTimeout = null;
                    }
                    
                    // Try to get asset name from <strong> tag first, otherwise use textContent
                    var strongTag = this.querySelector('strong');
                    var assetName = strongTag ? strongTag.textContent.trim() : this.textContent.trim();
                    
                    // Remove any trailing symbols or extra text (like ticker symbols)
                    // For crypto, the format might be "Bitcoin BTC" so we want just "Bitcoin"
                    var firstWord = assetName.split(/\s+/)[0];
                    
                    console.log('[ChartTooltip] Hover detected on:', assetName, '(first word:', firstWord + ')');
                    
                    // Check if this asset exists in any data source
                    var hasData = (window.MarketData && window.MarketData[assetName]) ||
                                (window.marketIndices && window.marketIndices.some(function(idx) { return idx.name === assetName; })) ||
                                (window.commodities && window.commodities.some(function(comm) { return comm.name === assetName; }));
                    
                    // Also try first word if full name doesn't match
                    if (!hasData && firstWord !== assetName) {
                        hasData = (window.MarketData && window.MarketData[firstWord]) ||
                                (window.marketIndices && window.marketIndices.some(function(idx) { return idx.name === firstWord; })) ||
                                (window.commodities && window.commodities.some(function(comm) { return comm.name === firstWord; }));
                        if (hasData) {
                            assetName = firstWord; // Use first word as the asset name
                        }
                    }
                    
                    console.log('[ChartTooltip] Asset has data:', hasData);
                    
                    if (assetName && hasData) {
                        showChartTooltip(assetName, this);
                    }
                });
                
                // Mouse leave event
                firstCell.addEventListener('mouseleave', function() {
                    console.log('[ChartTooltip] Mouse left cell');
                    hideChartTooltip();
                });
            });
        });
        
        console.log('[ChartTooltip] Attached listeners to', cellCount, 'cells');
    }
    
    /**
     * Generate historical price data for chart
     */
    function generateChartData(assetName) {
        // Check cache first
        if (chartDataCache[assetName] && Date.now() - chartDataCache[assetName].timestamp < 60000) {
            return chartDataCache[assetName].data;
        }
        
        // Try to get market data from different sources
        var marketData = null;
        var basePrice = 0;
        var volatility = 0.015;
        
        // Check main MarketData
        if (window.MarketData && window.MarketData[assetName]) {
            marketData = window.MarketData[assetName];
            basePrice = marketData.basePrice;
            volatility = marketData.volatility;
        }
        // Check indices data
        if (!basePrice && window.marketIndices) {
            var index = window.marketIndices.find(function(idx) { return idx.name === assetName; });
            if (index) {
                basePrice = index.price;
                volatility = 0.015;
            }
        }
        // Check commodities data
        if (!basePrice && window.commodities) {
            var commodity = window.commodities.find(function(comm) { return comm.name === assetName; });
            if (commodity) {
                basePrice = commodity.price;
                volatility = 0.025;
            }
        }
        
        if (!basePrice) return null;
        
        var dataPoints = 30;
        var prices = [];
        var currentPrice = basePrice;
        
        // Generate realistic price movement
        for (var i = 0; i < dataPoints; i++) {
            var change = (Math.random() - 0.5) * 2 * volatility;
            currentPrice = currentPrice * (1 + change);
            prices.push(currentPrice);
        }
        
        // Cache the data
        chartDataCache[assetName] = {
            data: prices,
            timestamp: Date.now()
        };
        
        return prices;
    }
    
    /**
     * Draw mini chart on canvas
     */
    function drawChart(assetName, prices) {
        if (!ctx || !prices || prices.length === 0) return;
        
        var width = 280;
        var height = 140;
        var padding = 10;
        var chartWidth = width - padding * 2;
        var chartHeight = height - padding * 2;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Calculate min/max for scaling
        var minPrice = Math.min.apply(null, prices);
        var maxPrice = Math.max.apply(null, prices);
        var priceRange = maxPrice - minPrice;
        
        // Add some padding to the range
        minPrice -= priceRange * 0.1;
        maxPrice += priceRange * 0.1;
        priceRange = maxPrice - minPrice;
        
        // Determine if price is going up or down
        var firstPrice = prices[0];
        var lastPrice = prices[prices.length - 1];
        var isPositive = lastPrice >= firstPrice;
        
        // Colors based on theme
        var isDarkTheme = document.body.classList.contains('dark-theme-variables');
        var lineColor = isPositive ? '#10b981' : '#ef4444';
        var gradientStartColor = isPositive ? 
            (isDarkTheme ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)') :
            (isDarkTheme ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)');
        var gradientEndColor = isPositive ?
            (isDarkTheme ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.02)') :
            (isDarkTheme ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.02)');
        var gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        
        // Draw grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        for (var i = 0; i <= 4; i++) {
            var y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Calculate points
        var points = [];
        var stepX = chartWidth / (prices.length - 1);
        
        for (var i = 0; i < prices.length; i++) {
            var x = padding + i * stepX;
            var normalizedPrice = (prices[i] - minPrice) / priceRange;
            var y = padding + chartHeight - (normalizedPrice * chartHeight);
            points.push({ x: x, y: y });
        }
        
        // Draw gradient fill
        var gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, gradientStartColor);
        gradient.addColorStop(1, gradientEndColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[0].x, height - padding);
        
        for (var i = 0; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.lineTo(points[points.length - 1].x, height - padding);
        ctx.closePath();
        ctx.fill();
        
        // Draw line
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        ctx.stroke();
        
        // Draw last price indicator
        var lastPoint = points[points.length - 1];
        ctx.fillStyle = lineColor;
        ctx.beginPath();
        ctx.arc(lastPoint.x, lastPoint.y, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw white border around indicator
        ctx.strokeStyle = isDarkTheme ? '#1f2937' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * Show chart tooltip
     */
    function showChartTooltip(assetName, element) {
        console.log('[ChartTooltip] Attempting to show tooltip for:', assetName);
        
        if (!chartTooltip) {
            console.error('[ChartTooltip] chartTooltip element not found!');
            return;
        }
        
        currentAsset = assetName;
        clearTimeout(hideTimeout);
        
        // Try to get market data from different sources
        var currentPrice = 0;
        var priceChange = 0;
        var volume = 'N/A';
        
        // Check MarketData first
        if (window.MarketData && window.MarketData[assetName]) {
            var marketData = window.MarketData[assetName];
            currentPrice = window.getCurrentPrice ? window.getCurrentPrice(assetName) : marketData.basePrice;
            priceChange = window.getPriceChange ? window.getPriceChange(assetName) : 0;
            
            // Find order data for volume
            var order = window.Orders ? window.Orders.find(function(o) { return o.productName === assetName; }) : null;
            volume = order ? order.volume.toLocaleString() : 'N/A';
        }
        
        // Check marketIndices if not found
        if (!currentPrice && window.marketIndices) {
            var index = window.marketIndices.find(function(idx) { return idx.name === assetName; });
            if (index) {
                currentPrice = index.price;
                priceChange = index.changePercent;
                volume = index.volume;
            }
        }
        
        // Check commodities if not found
        if (!currentPrice && window.commodities) {
            var commodity = window.commodities.find(function(comm) { return comm.name === assetName; });
            if (commodity) {
                currentPrice = commodity.price;
                priceChange = commodity.changePercent;
                volume = 'N/A';
            }
        }
        
        if (!currentPrice) {
            console.warn('[ChartTooltip] No price data found for:', assetName);
            return;
        }
        
        console.log('[ChartTooltip] Price data found:', currentPrice, 'Change:', priceChange);
        
        // Update tooltip content
        document.getElementById('chartTooltipAsset').textContent = assetName;
        document.getElementById('chartTooltipPrice').textContent = '$' + currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        
        var changeElement = document.getElementById('chartTooltipChange');
        changeElement.textContent = (priceChange >= 0 ? '+' : '') + priceChange.toFixed(2) + '%';
        changeElement.style.color = priceChange >= 0 ? '#10b981' : '#ef4444';
        
        document.getElementById('chartTooltipVolume').textContent = volume;
        
        // Generate and draw chart
        var prices = generateChartData(assetName);
        if (prices) {
            drawChart(assetName, prices);
        } else {
            console.warn('[ChartTooltip] No chart data generated for:', assetName);
        }
        
        // Position tooltip
        var rect = element.getBoundingClientRect();
        var tooltipWidth = 300;
        var tooltipHeight = 240;
        
        var left = rect.right + 15;
        var top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        
        // Adjust if tooltip would go off screen
        if (left + tooltipWidth > window.innerWidth) {
            left = rect.left - tooltipWidth - 15;
        }
        
        if (top < 10) {
            top = 10;
        } else if (top + tooltipHeight > window.innerHeight - 10) {
            top = window.innerHeight - tooltipHeight - 10;
        }
        
        console.log('[ChartTooltip] Positioning at:', left, top);
        
        chartTooltip.style.left = left + 'px';
        chartTooltip.style.top = top + 'px';
        chartTooltip.style.display = 'block';
        
        console.log('[ChartTooltip] Tooltip display set to block, classList before:', chartTooltip.classList.toString());
        
        // Trigger animation
        setTimeout(function() {
            chartTooltip.classList.add('visible');
            console.log('[ChartTooltip] Added visible class, classList now:', chartTooltip.classList.toString());
        }, 10);
    }
    
    /**
     * Hide chart tooltip
     */
    function hideChartTooltip() {
        if (!chartTooltip) return;
        
        // Clear any existing timeout
        if (hideTimeout) {
            clearTimeout(hideTimeout);
        }
        
        // Hide immediately on mouse leave
        chartTooltip.classList.remove('visible');
        hideTimeout = setTimeout(function() {
            if (chartTooltip) {
                chartTooltip.style.display = 'none';
            }
        }, 200); // Wait for fade-out animation
    }
    
    /**
     * Refresh tooltip if still visible
     */
    function refreshTooltip() {
        if (currentAsset && chartTooltip && chartTooltip.classList.contains('visible')) {
            var prices = generateChartData(currentAsset);
            if (prices) {
                drawChart(currentAsset, prices);
            }
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Refresh charts periodically
    setInterval(refreshTooltip, 5000);
    
    // Re-attach listeners when table content changes
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                setTimeout(function() {
                    attachEventListeners();
                }, 100);
            }
        });
    });
    
    // Observe table bodies for changes
    setTimeout(function() {
        var tableBodies = document.querySelectorAll('tbody');
        tableBodies.forEach(function(tbody) {
            observer.observe(tbody, { childList: true, subtree: true });
        });
    }, 1000);
    
    // Export function to reinitialize listeners
    window.initChartTooltips = function() {
        attachEventListeners();
    };
    
})();
