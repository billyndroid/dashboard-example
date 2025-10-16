// Data Validation and Formatting Utilities

const DataValidator = {
    // Validate price data
    validatePrice: (price) => {
        if (typeof price !== 'number' || isNaN(price) || price < 0) {
            console.warn('Invalid price data:', price);
            return 0;
        }
        return price;
    },

    // Validate percentage data
    validatePercentage: (percentage) => {
        if (typeof percentage !== 'number' || isNaN(percentage)) {
            console.warn('Invalid percentage data:', percentage);
            return 0;
        }
        return Math.max(-100, Math.min(100, percentage));
    },

    // Validate order data structure
    validateOrder: (order) => {
        const requiredFields = ['id', 'productName', 'entryPrice', 'currentPrice', 'quantity', 'orderType', 'shipping'];
        const missingFields = requiredFields.filter(field => !order.hasOwnProperty(field));
        
        if (missingFields.length > 0) {
            console.warn('Order missing required fields:', missingFields, order);
            return false;
        }

        // Validate numeric fields
        const numericFields = ['entryPrice', 'currentPrice', 'quantity'];
        for (const field of numericFields) {
            if (typeof order[field] !== 'number' || isNaN(order[field])) {
                console.warn(`Invalid ${field} in order:`, order[field], order);
                return false;
            }
        }

        return true;
    },

    // Sanitize string data
    sanitizeString: (str) => {
        if (typeof str !== 'string') {
            return String(str || '');
        }
        return str.trim().replace(/[<>]/g, '');
    }
};

const DataFormatter = {
    // Format currency with proper symbols and localization
    formatCurrency: (amount, currency = 'USD', options = {}) => {
        try {
            const validAmount = DataValidator.validatePrice(amount);
            
            const defaults = {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            };

            // Handle different currency symbols
            const currencySymbols = {
                'USD': '$',
                'GBP': '£',
                'EUR': '€',
                'JPY': '¥'
            };

            if (options.compact && Math.abs(validAmount) >= 1000) {
                const compactAmount = Math.abs(validAmount) >= 1000000 ? 
                    validAmount / 1000000 : validAmount / 1000;
                const suffix = Math.abs(validAmount) >= 1000000 ? 'M' : 'K';
                const sign = validAmount >= 0 ? '' : '-';
                
                return `${sign}${currencySymbols[currency] || '$'}${Math.abs(compactAmount).toFixed(1)}${suffix}`;
            }

            return new Intl.NumberFormat('en-US', { ...defaults, ...options }).format(validAmount);
        } catch (error) {
            console.error('Error formatting currency:', error);
            return `$${amount?.toFixed(2) || '0.00'}`;
        }
    },

    // Format percentage with proper signs and colors
    formatPercentage: (value, options = {}) => {
        try {
            const validValue = DataValidator.validatePercentage(value);
            const decimals = options.decimals || 2;
            const showSign = options.showSign !== false;
            
            const sign = validValue >= 0 ? '+' : '';
            const formatted = `${showSign ? sign : ''}${validValue.toFixed(decimals)}%`;
            
            return {
                text: formatted,
                class: validValue >= 0 ? 'success' : 'danger',
                value: validValue
            };
        } catch (error) {
            console.error('Error formatting percentage:', error);
            return { text: '0.00%', class: 'neutral', value: 0 };
        }
    },

    // Format large numbers with K/M suffixes
    formatNumber: (num, options = {}) => {
        try {
            if (typeof num !== 'number' || isNaN(num)) {
                return '0';
            }

            const { compact = false, decimals = 2 } = options;

            if (compact) {
                if (Math.abs(num) >= 1000000) {
                    return `${(num / 1000000).toFixed(1)}M`;
                } else if (Math.abs(num) >= 1000) {
                    return `${(num / 1000).toFixed(1)}K`;
                }
            }

            return num.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: decimals
            });
        } catch (error) {
            console.error('Error formatting number:', error);
            return num.toString();
        }
    },

    // Format time differences
    formatTimeAgo: (timestamp) => {
        try {
            const now = Date.now();
            const time = new Date(timestamp).getTime();
            const diffMs = now - time;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            return `${diffDays}d ago`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return 'Unknown';
        }
    },

    // Format order status with appropriate styling
    formatOrderStatus: (status) => {
        const statusMap = {
            'Active': { text: 'Active', class: 'success' },
            'Pending': { text: 'Pending', class: 'warning' },
            'Declined': { text: 'Declined', class: 'danger' },
            'Filled': { text: 'Filled', class: 'success' },
            'Cancelled': { text: 'Cancelled', class: 'danger' },
            'Partial': { text: 'Partial', class: 'warning' }
        };

        return statusMap[status] || { text: status, class: 'neutral' };
    }
};

// Market data calculations
const MarketCalculations = {
    // Calculate portfolio metrics
    calculatePortfolioMetrics: (orders) => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return {
                totalValue: 0,
                totalPnL: 0,
                totalPnLPercentage: 0,
                activePositions: 0,
                winRate: 0,
                bestPerformer: null,
                worstPerformer: null
            };
        }

        const activeOrders = orders.filter(order => 
            DataValidator.validateOrder(order) && order.shipping === 'Active'
        );

        let totalValue = 0;
        let totalPnL = 0;
        let totalInvested = 0;
        let winners = 0;

        let bestPnL = -Infinity;
        let worstPnL = Infinity;
        let bestPerformer = null;
        let worstPerformer = null;

        activeOrders.forEach(order => {
            const position = order.entryPrice * order.quantity;
            const currentValue = order.currentPrice * order.quantity;
            const pnl = order.orderType === 'Long' ? 
                (currentValue - position) : (position - currentValue);
            
            totalValue += currentValue;
            totalPnL += pnl;
            totalInvested += position;

            if (pnl > 0) winners++;

            // Track best and worst performers
            const pnlPercentage = (pnl / position) * 100;
            if (pnlPercentage > bestPnL) {
                bestPnL = pnlPercentage;
                bestPerformer = { ...order, pnl, pnlPercentage };
            }
            if (pnlPercentage < worstPnL) {
                worstPnL = pnlPercentage;
                worstPerformer = { ...order, pnl, pnlPercentage };
            }
        });

        const totalPnLPercentage = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
        const winRate = activeOrders.length > 0 ? (winners / activeOrders.length) * 100 : 0;

        return {
            totalValue,
            totalPnL,
            totalPnLPercentage,
            activePositions: activeOrders.length,
            winRate,
            bestPerformer,
            worstPerformer,
            totalInvested
        };
    },

    // Calculate risk metrics
    calculateRiskMetrics: (orders) => {
        if (!Array.isArray(orders) || orders.length === 0) {
            return { totalRisk: 0, riskPercentage: 0, maxDrawdown: 0 };
        }

        let totalRisk = 0;
        let maxDrawdown = 0;

        orders.forEach(order => {
            if (DataValidator.validateOrder(order) && order.shipping === 'Active') {
                const position = order.entryPrice * order.quantity;
                const currentValue = order.currentPrice * order.quantity;
                const risk = Math.abs(position - currentValue);
                
                totalRisk += risk;
                
                const drawdown = order.orderType === 'Long' ? 
                    Math.max(0, order.entryPrice - order.currentPrice) :
                    Math.max(0, order.currentPrice - order.entryPrice);
                
                maxDrawdown = Math.max(maxDrawdown, drawdown);
            }
        });

        const metrics = MarketCalculations.calculatePortfolioMetrics(orders);
        const riskPercentage = metrics.totalInvested > 0 ? (totalRisk / metrics.totalInvested) * 100 : 0;

        return { totalRisk, riskPercentage, maxDrawdown };
    }
};

// Export utilities
window.DataValidator = DataValidator;
window.DataFormatter = DataFormatter;
window.MarketCalculations = MarketCalculations;

console.info('Data validation and formatting utilities loaded successfully');