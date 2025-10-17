/**
 * Enhanced Data Service
 * Provides historical data generation, time-series utilities, and data sources for charts
 * Supports real API integration with fallback to generated data
 */

const DataService = {
    /**
     * Fetch real-time crypto prices from CoinGecko API
     * @param {Array} symbols - Array of crypto symbols
     * @returns {Promise<Object>} Price data
     */
    async fetchCryptoPrices(symbols = ['bitcoin', 'ethereum']) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.coingecko;
            if (!config?.enabled) return null;
            
            const ids = symbols.join(',');
            const url = `${config.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.error('[DataService] Crypto price fetch error:', error);
            return null;
        }
    },
    
    /**
     * Fetch stock/forex/commodity data from Twelve Data API
     * @param {string} symbol - Asset symbol
     * @returns {Promise<Object>} Quote data
     */
    async fetchAssetQuote(symbol) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.twelveData;
            if (!config?.enabled || !config?.key) return null;
            
            const url = `${config.baseUrl}/quote?symbol=${symbol}&apikey=${config.key}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Twelve Data API error: ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.error('[DataService] Asset quote fetch error:', error);
            return null;
        }
    },
    
    /**
     * Fetch forex rate from Alpha Vantage
     * @param {string} from - From currency
     * @param {string} to - To currency
     * @returns {Promise<Object>} Exchange rate data
     */
    async fetchForexRate(from, to) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.alphaVantage;
            if (!config?.enabled || !config?.key) return null;
            
            const url = `${config.baseUrl}?function=${config.functions.forex}&from_currency=${from}&to_currency=${to}&apikey=${config.key}`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Alpha Vantage API error: ${response.status}`);
            
            return await response.json();
        } catch (error) {
            console.error('[DataService] Forex fetch error:', error);
            return null;
        }
    },
    
    /**
     * Get real-time price for an asset with API integration
     * @param {string} asset - Asset name
     * @returns {Promise<number>} Current price
     */
    async getRealTimePrice(asset) {
        const useMockData = window.AppConfig?.useMockData ?? true;
        
        if (useMockData) {
            // Use generated data
            return this.generateCurrentPrice(asset);
        }
        
        try {
            // Map asset names to API symbols
            const cryptoMap = {
                'Bitcoin': 'bitcoin',
                'Ethereum': 'ethereum'
            };
            
            const stockMap = {
                'S&P 500': 'SPY',
                'NASDAQ': 'QQQ',
                'FTSE': 'ISF.LON'
            };
            
            const commodityMap = {
                'Gold': 'XAUUSD',
                'Silver': 'XAGUSD',
                'Oil': 'USOIL',
                'Crude Oil': 'USOIL',
                'Natural Gas': 'NATGAS'
            };
            
            // Try crypto API
            if (cryptoMap[asset]) {
                const data = await this.fetchCryptoPrices([cryptoMap[asset]]);
                if (data && data[cryptoMap[asset]]) {
                    return data[cryptoMap[asset]].usd;
                }
            }
            
            // Try stock/commodity API
            if (stockMap[asset] || commodityMap[asset]) {
                const symbol = stockMap[asset] || commodityMap[asset];
                const data = await this.fetchAssetQuote(symbol);
                if (data && data.close) {
                    return parseFloat(data.close);
                }
            }
            
            // Fallback to generated data
            return this.generateCurrentPrice(asset);
            
        } catch (error) {
            console.error('[DataService] Real-time price error:', error);
            return this.generateCurrentPrice(asset);
        }
    },
    
    /**
     * Generate current price (fallback method)
     * @param {string} asset - Asset name
     * @returns {number} Generated price
     */
    generateCurrentPrice(asset) {
        const basePrices = {
            'S&P 500': 4200,
            'NASDAQ': 13000,
            'FTSE': 7500,
            'Gold': 1950,
            'Silver': 23,
            'Oil': 85,
            'Crude Oil': 85,
            'Natural Gas': 2.8,
            'Bitcoin': 65000,
            'Ethereum': 3200,
            'QQQ': 350
        };
        
        const basePrice = basePrices[asset] || 100;
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility;
        
        return basePrice * (1 + change);
    },
    
    /**
     * Generate historical price data for an asset
     * @param {string} asset - Asset name
     * @param {number} days - Number of days of historical data
     * @param {number} basePrice - Starting price
     * @param {number} volatility - Price volatility (0-1)
     * @returns {Array} Array of {date, price, volume, change}
     */
    generateHistoricalData(asset, days = 30, basePrice = 100, volatility = 0.02) {
        const data = [];
        const today = new Date();
        let currentPrice = basePrice;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Random walk with drift
            const drift = (Math.random() - 0.48) * volatility;
            currentPrice = currentPrice * (1 + drift);
            
            // Generate volume (higher on recent days)
            const volumeBase = 50000 + Math.random() * 50000;
            const recencyMultiplier = 1 + (days - i) / days * 0.5;
            const volume = Math.floor(volumeBase * recencyMultiplier);
            
            // Calculate daily change
            const prevPrice = i === days - 1 ? basePrice : data[data.length - 1]?.price || basePrice;
            const change = ((currentPrice - prevPrice) / prevPrice) * 100;
            
            data.push({
                date: date.toISOString().split('T')[0],
                price: parseFloat(currentPrice.toFixed(2)),
                volume: volume,
                change: parseFloat(change.toFixed(2)),
                high: parseFloat((currentPrice * (1 + Math.random() * volatility)).toFixed(2)),
                low: parseFloat((currentPrice * (1 - Math.random() * volatility)).toFixed(2)),
                open: parseFloat((prevPrice * (1 + (Math.random() - 0.5) * volatility * 0.5)).toFixed(2)),
                close: parseFloat(currentPrice.toFixed(2))
            });
        }
        
        return data;
    },

    /**
     * Filter data by date range
     * @param {Array} data - Historical data array
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @returns {Array} Filtered data
     */
    filterByDateRange(data, startDate, endDate) {
        if (!startDate && !endDate) return data;
        
        return data.filter(item => {
            const itemDate = new Date(item.date);
            const start = startDate ? new Date(startDate) : new Date(0);
            const end = endDate ? new Date(endDate) : new Date();
            
            return itemDate >= start && itemDate <= end;
        });
    },

    /**
     * Get market data for multiple assets
     * @param {Array} assets - Array of asset names
     * @param {number} days - Number of days of historical data
     * @returns {Object} Map of asset -> historical data
     */
    getMarketData(assets = ['S&P 500', 'NASDAQ', 'Gold', 'Oil', 'Bitcoin'], days = 30) {
        const marketData = {};
        
        const basePrices = {
            'S&P 500': 4200,
            'NASDAQ': 13000,
            'FTSE': 7500,
            'Gold': 1950,
            'Silver': 23,
            'Oil': 85,
            'Natural Gas': 2.8,
            'Bitcoin': 65000,
            'Ethereum': 3200,
            'QQQ': 350
        };
        
        const volatilities = {
            'S&P 500': 0.015,
            'NASDAQ': 0.02,
            'FTSE': 0.012,
            'Gold': 0.01,
            'Silver': 0.025,
            'Oil': 0.03,
            'Natural Gas': 0.04,
            'Bitcoin': 0.05,
            'Ethereum': 0.06,
            'QQQ': 0.022
        };
        
        assets.forEach(asset => {
            marketData[asset] = this.generateHistoricalData(
                asset,
                days,
                basePrices[asset] || 100,
                volatilities[asset] || 0.02
            );
        });
        
        return marketData;
    },

    /**
     * Calculate aggregate statistics for a dataset
     * @param {Array} data - Historical data array
     * @returns {Object} Statistics (avg, min, max, total, change)
     */
    calculateStats(data) {
        if (!data || data.length === 0) return null;
        
        const prices = data.map(d => d.price);
        const volumes = data.map(d => d.volume);
        
        return {
            avgPrice: parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)),
            minPrice: Math.min(...prices),
            maxPrice: Math.max(...prices),
            totalVolume: volumes.reduce((a, b) => a + b, 0),
            priceChange: data.length > 1 ? 
                parseFloat((((data[data.length - 1].price - data[0].price) / data[0].price) * 100).toFixed(2)) : 0,
            currentPrice: data[data.length - 1].price,
            trend: data[data.length - 1].price > data[0].price ? 'up' : 'down'
        };
    },

    /**
     * Get top performers (gainers/losers)
     * @param {Object} marketData - Market data map
     * @returns {Object} {gainers: [], losers: []}
     */
    getTopPerformers(marketData) {
        const performance = Object.entries(marketData).map(([asset, data]) => {
            const stats = this.calculateStats(data);
            return {
                asset,
                change: stats.priceChange,
                price: stats.currentPrice
            };
        });
        
        performance.sort((a, b) => b.change - a.change);
        
        return {
            gainers: performance.slice(0, 3),
            losers: performance.slice(-3).reverse()
        };
    },

    /**
     * Aggregate volume data for chart
     * @param {Object} marketData - Market data map
     * @returns {Object} {categories: [], data: []}
     */
    aggregateVolumeData(marketData) {
        const volumeData = Object.entries(marketData).map(([asset, data]) => {
            const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
            return {
                asset,
                volume: totalVolume
            };
        });
        
        volumeData.sort((a, b) => b.volume - a.volume);
        
        return {
            categories: volumeData.map(d => d.asset),
            data: volumeData.map(d => d.volume)
        };
    },

    /**
     * Get price changes for chart
     * @param {Object} marketData - Market data map
     * @returns {Object} {categories: [], data: []}
     */
    getPriceChanges(marketData) {
        const changes = Object.entries(marketData).map(([asset, data]) => {
            const stats = this.calculateStats(data);
            return {
                asset,
                change: stats.priceChange
            };
        });
        
        return {
            categories: changes.map(d => d.asset),
            data: changes.map(d => d.change)
        };
    },

    /**
     * Format date for display
     * @param {string} dateStr - ISO date string
     * @param {string} format - 'short' | 'long'
     * @returns {string} Formatted date
     */
    formatDate(dateStr, format = 'short') {
        const date = new Date(dateStr);
        if (format === 'short') {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },

    /**
     * Get preset date ranges
     * @returns {Object} Map of range name -> {start, end}
     */
    getPresetRanges() {
        const today = new Date();
        const ranges = {};
        
        // Today
        ranges['Today'] = {
            start: today.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
        
        // Last 7 days
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        ranges['Last 7 Days'] = {
            start: last7.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
        
        // Last 30 days
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        ranges['Last 30 Days'] = {
            start: last30.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
        
        // Last 90 days
        const last90 = new Date(today);
        last90.setDate(last90.getDate() - 90);
        ranges['Last 90 Days'] = {
            start: last90.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
        
        // This month
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        ranges['This Month'] = {
            start: monthStart.toISOString().split('T')[0],
            end: today.toISOString().split('T')[0]
        };
        
        return ranges;
    }
};

// Make available globally
window.DataService = DataService;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataService;
}
