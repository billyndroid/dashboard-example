// Enhanced Trading Data with Realistic Financial Information

// Market data with real-time price simulation
const MarketData = {
    'S&P 500': { basePrice: 4247.85, volatility: 0.015, sector: 'Index', currency: 'USD' },
    'QQQ': { basePrice: 364.42, volatility: 0.020, sector: 'ETF', currency: 'USD' },
    'FTSE 100': { basePrice: 7543.12, volatility: 0.012, sector: 'Index', currency: 'GBP' },
    'Crude Oil': { basePrice: 89.65, volatility: 0.030, sector: 'Energy', currency: 'USD' },
    'Gold': { basePrice: 1976.45, volatility: 0.018, sector: 'Precious Metals', currency: 'USD' },
    'Natural Gas': { basePrice: 2.87, volatility: 0.045, sector: 'Energy', currency: 'USD' },
    'Bitcoin': { basePrice: 67450.00, volatility: 0.055, sector: 'Cryptocurrency', currency: 'USD' },
    'Ethereum': { basePrice: 2650.30, volatility: 0.060, sector: 'Cryptocurrency', currency: 'USD' },
    'Silver': { basePrice: 23.85, volatility: 0.025, sector: 'Precious Metals', currency: 'USD' },
    'EUR/USD': { basePrice: 1.0875, volatility: 0.008, sector: 'Forex', currency: 'USD' }
};

// Generate current prices with realistic fluctuations
function getCurrentPrice(asset) {
    const data = MarketData[asset];
    if (!data) return 0;
    
    const change = (Math.random() - 0.5) * 2 * data.volatility;
    return data.basePrice * (1 + change);
}

// Generate price change percentage
function getPriceChange(asset) {
    const data = MarketData[asset];
    if (!data) return 0;
    
    return (Math.random() - 0.5) * 2 * data.volatility * 100;
}

// Enhanced Orders with realistic trading data
const Orders = [
    {
        id: 1,
        productName: 'S&P 500',
        productNumber: '$4,247.85',
        paymentStatus: '$4,238.22 (+0.24%)',
        shipping: 'Active',
        orderType: 'Long',
        quantity: 10,
        entryPrice: 4238.22,
        currentPrice: getCurrentPrice('S&P 500'),
        volume: 2450000,
        sector: 'Index',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
        id: 2,
        productName: 'QQQ',
        productNumber: '$364.42',
        paymentStatus: '$362.18 (+0.62%)',
        shipping: 'Pending',
        orderType: 'Long',
        quantity: 25,
        entryPrice: 362.18,
        currentPrice: getCurrentPrice('QQQ'),
        volume: 1850000,
        sector: 'ETF',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
        id: 3,
        productName: 'FTSE 100',
        productNumber: '£7,543.12',
        paymentStatus: '£7,486.75 (+0.75%)',
        shipping: 'Active',
        orderType: 'Long',
        quantity: 5,
        entryPrice: 7486.75,
        currentPrice: getCurrentPrice('FTSE 100'),
        volume: 890000,
        sector: 'Index',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
        id: 4,
        productName: 'Crude Oil',
        productNumber: '$89.65',
        paymentStatus: '$90.59 (-1.04%)',
        shipping: 'Declined',
        orderType: 'Short',
        quantity: 100,
        entryPrice: 90.59,
        currentPrice: getCurrentPrice('Crude Oil'),
        volume: 3200000,
        sector: 'Energy',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
        id: 5,
        productName: 'Gold',
        productNumber: '$1,976.45',
        paymentStatus: '$1,942.70 (+1.74%)',
        shipping: 'Active',
        orderType: 'Long',
        quantity: 2,
        entryPrice: 1942.70,
        currentPrice: getCurrentPrice('Gold'),
        volume: 1650000,
        sector: 'Precious Metals',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
        id: 6,
        productName: 'Natural Gas',
        productNumber: '$2.87',
        paymentStatus: '$2.85 (+0.70%)',
        shipping: 'Active',
        orderType: 'Long',
        quantity: 1000,
        entryPrice: 2.85,
        currentPrice: getCurrentPrice('Natural Gas'),
        volume: 4100000,
        sector: 'Energy',
        timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
        id: 7,
        productName: 'Bitcoin',
        productNumber: '$67,450.00',
        paymentStatus: '$65,230.50 (+3.40%)',
        shipping: 'Pending',
        orderType: 'Long',
        quantity: 0.5,
        entryPrice: 65230.50,
        currentPrice: getCurrentPrice('Bitcoin'),
        volume: 850000,
        sector: 'Cryptocurrency',
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    },
    {
        id: 8,
        productName: 'Silver',
        productNumber: '$23.85',
        paymentStatus: '$23.42 (+1.84%)',
        shipping: 'Active',
        orderType: 'Long',
        quantity: 50,
        entryPrice: 23.42,
        currentPrice: getCurrentPrice('Silver'),
        volume: 2100000,
        sector: 'Precious Metals',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    }
];

// Dashboard Analytics Data
const DashboardData = {
    // Calculate total portfolio value
    getTotalPortfolioValue: () => {
        return Orders.reduce((total, order) => {
            if (order.shipping === 'Active') {
                return total + (order.currentPrice * order.quantity);
            }
            return total;
        }, 0);
    },
    
    // Calculate total P&L
    getTotalPnL: () => {
        return Orders.reduce((total, order) => {
            if (order.shipping === 'Active') {
                const pnl = (order.currentPrice - order.entryPrice) * order.quantity;
                return total + (order.orderType === 'Long' ? pnl : -pnl);
            }
            return total;
        }, 0);
    },
    
    // Get active orders count
    getActiveOrdersCount: () => {
        return Orders.filter(order => order.shipping === 'Active').length;
    },
    
    // Get pending orders count
    getPendingOrdersCount: () => {
        return Orders.filter(order => order.shipping === 'Pending').length;
    },
    
    // Get win rate
    getWinRate: () => {
        const activeOrders = Orders.filter(order => order.shipping === 'Active');
        if (activeOrders.length === 0) return 0;
        
        const profitable = activeOrders.filter(order => {
            const pnl = (order.currentPrice - order.entryPrice) * order.quantity;
            return order.orderType === 'Long' ? pnl > 0 : pnl < 0;
        }).length;
        
        return (profitable / activeOrders.length) * 100;
    },
    
    // Get total volume
    getTotalVolume: () => {
        return Orders.reduce((total, order) => total + order.volume, 0);
    },
    
    // Get best performer
    getBestPerformer: () => {
        let bestOrder = null;
        let bestPercentage = -Infinity;
        
        Orders.filter(order => order.shipping === 'Active').forEach(order => {
            const percentage = ((order.currentPrice - order.entryPrice) / order.entryPrice) * 100;
            const actualPercentage = order.orderType === 'Long' ? percentage : -percentage;
            
            if (actualPercentage > bestPercentage) {
                bestPercentage = actualPercentage;
                bestOrder = order;
            }
        });
        
        return { order: bestOrder, percentage: bestPercentage };
    },
    
    // Get worst performer
    getWorstPerformer: () => {
        let worstOrder = null;
        let worstPercentage = Infinity;
        
        Orders.filter(order => order.shipping === 'Active').forEach(order => {
            const percentage = ((order.currentPrice - order.entryPrice) / order.entryPrice) * 100;
            const actualPercentage = order.orderType === 'Long' ? percentage : -percentage;
            
            if (actualPercentage < worstPercentage) {
                worstPercentage = actualPercentage;
                worstOrder = order;
            }
        });
        
        return { order: worstOrder, percentage: worstPercentage };
    }
};

// Export data for global use
window.MarketData = MarketData;
window.DashboardData = DashboardData;
window.getCurrentPrice = getCurrentPrice;
window.getPriceChange = getPriceChange;

/**
 * Generate detailed position data for modal display
 * @param {Object} order - Order object from Orders array
 * @returns {Object} Formatted position data for modal
 */
function generatePositionData(order) {
    const currentPrice = getCurrentPrice(order.productName);
    const pnlValue = (currentPrice - order.entryPrice) * order.quantity;
    const actualPnL = order.orderType === 'Long' ? pnlValue : -pnlValue;
    const pnlPercent = ((currentPrice - order.entryPrice) / order.entryPrice) * 100;
    const actualPnLPercent = order.orderType === 'Long' ? pnlPercent : -pnlPercent;
    
    // Calculate days held
    const entryDate = new Date(order.timestamp);
    const today = new Date();
    const daysHeld = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
    
    // Calculate risk/reward (simplified)
    const riskPercent = 2; // 2% stop loss
    const rewardPercent = Math.abs(actualPnLPercent);
    const riskReward = `1:${(rewardPercent / riskPercent).toFixed(1)}`;
    
    // Calculate stop loss and take profit
    const stopLossPrice = order.orderType === 'Long' 
        ? order.entryPrice * 0.98 
        : order.entryPrice * 1.02;
    const takeProfitPrice = order.orderType === 'Long'
        ? order.entryPrice * 1.05
        : order.entryPrice * 0.95;
    
    return {
        asset: order.productName,
        assetType: MarketData[order.productName]?.sector || 'Commodity',
        status: order.shipping,
        currentPrice: currentPrice,
        priceChangePercent: getPriceChange(order.productName),
        entryPrice: order.entryPrice,
        entryDate: entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        quantity: order.quantity,
        positionType: order.orderType,
        pnl: actualPnL >= 0 ? `+$${actualPnL.toFixed(2)}` : `-$${Math.abs(actualPnL).toFixed(2)}`,
        pnlValue: actualPnL,
        pnlPercent: actualPnLPercent.toFixed(2),
        stopLoss: `$${stopLossPrice.toFixed(2)}`,
        takeProfit: `$${takeProfitPrice.toFixed(2)}`,
        riskReward: riskReward,
        daysHeld: `${daysHeld} ${daysHeld === 1 ? 'day' : 'days'}`,
        tradeId: `TRD-${order.id}-${Date.now().toString().slice(-6)}`
    };
}

// Export for global use
window.generatePositionData = generatePositionData;