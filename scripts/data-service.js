/**
 * Enhanced Data Service
 * Provides historical data generation, time-series utilities, and data sources for charts
 * Supports real API integration with fallback to generated data
 */

const DataService = {
    // Cache for API responses
    _cache: {},
    _cacheTimeout: 600000, // Cache for 10 minutes (600 seconds) - reduces API calls by 10x!
    
    /**
     * Get cached data if available and not expired
     * @param {string} key - Cache key
     * @returns {Object|null} Cached data or null
     */
    _getCached(key) {
        const cached = this._cache[key];
        if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
            console.log('[DataService] Using cached data for:', key);
            return cached.data;
        }
        return null;
    },
    
    /**
     * Store data in cache
     * @param {string} key - Cache key
     * @param {Object} data - Data to cache
     */
    _setCache(key, data) {
        this._cache[key] = {
            data: data,
            timestamp: Date.now()
        };
    },
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
            const cacheKey = 'crypto_' + ids;
            
            // Check cache first
            const cached = this._getCached(cacheKey);
            if (cached) return cached;
            
            const apiUrl = `${config.baseUrl}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
            
            // Try direct API call first
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    this._setCache(cacheKey, data);
                    return data;
                }
            } catch (corsError) {
                console.warn('[DataService] CORS error with direct call, trying proxies...');
            }
            
            // Try multiple CORS proxies in order
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://corsproxy.io/?'
            ];
            
            for (let i = 0; i < proxies.length; i++) {
                try {
                    const proxy = proxies[i];
                    const proxyUrl = proxy + encodeURIComponent(apiUrl);
                    console.log(`[DataService] Trying proxy ${i + 1}/${proxies.length}...`);
                    
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const data = await response.json();
                        console.log('[DataService] ✅ Proxy succeeded!');
                        this._setCache(cacheKey, data);
                        return data;
                    }
                } catch (proxyError) {
                    console.warn(`[DataService] Proxy ${i + 1} failed:`, proxyError.message);
                }
            }
            
            throw new Error('All proxy attempts failed');
        } catch (error) {
            console.error('[DataService] Crypto price fetch error:', error);
            return null;
        }
    },
    
    /**
     * Fetch stock/forex/commodity data from Twelve Data API with Alpha Vantage fallback
     * @param {string} symbol - Asset symbol
     * @returns {Promise<Object>} Quote data
     */
    async fetchAssetQuote(symbol) {
        try {
            // Try Twelve Data FIRST (preferred API)
            const config = window.AppConfig?.thirdPartyApis?.twelveData;
            let shouldFallbackToAlpha = false;
            
            if (config?.enabled && config?.key) {
                const result = await this._fetchTwelveDataQuote(symbol, config);
                if (result.success) {
                    return result.data;
                } else if (result.rateLimitExceeded) {
                    console.warn('[DataService] ⚠️ Twelve Data rate limit exceeded, falling back to Alpha Vantage');
                    shouldFallbackToAlpha = true;
                }
            } else {
                console.log('[DataService] Twelve Data not configured, trying Alpha Vantage');
                shouldFallbackToAlpha = true;
            }
            
            // Fall back to Alpha Vantage if Twelve Data failed or rate limited
            if (shouldFallbackToAlpha) {
                const alphaConfig = window.AppConfig?.thirdPartyApis?.alphaVantage;
                if (alphaConfig?.enabled && alphaConfig?.key && alphaConfig?.key !== 'YOUR_ALPHA_VANTAGE_KEY_HERE') {
                    console.log('[DataService] Trying Alpha Vantage fallback...');
                    const alphaData = await this.fetchAlphaVantageQuote(symbol);
                    if (alphaData) {
                        console.log('[DataService] ✅ Alpha Vantage fallback succeeded!');
                        return alphaData;
                    } else {
                        console.warn('[DataService] Alpha Vantage fallback failed');
                    }
                } else {
                    console.warn('[DataService] ⚠️ Alpha Vantage not configured! Add API key to config.local.js');
                    console.warn('[DataService] Get free key: https://www.alphavantage.co/support/#api-key');
                }
            }
            
            console.log('[DataService] All API attempts failed');
            return null;
        } catch (error) {
            console.error('[DataService] Asset quote fetch error:', error.message);
            return null;
        }
    },
    
    /**
     * Internal method to fetch from Twelve Data
     * @param {string} symbol - Asset symbol
     * @param {Object} config - Twelve Data config
     * @returns {Promise<Object>} {success, data, rateLimitExceeded}
     */
    async _fetchTwelveDataQuote(symbol, config) {
        try {
            const cacheKey = 'quote_' + symbol;
            
            // Check cache first
            const cached = this._getCached(cacheKey);
            if (cached) return { success: true, data: cached };
            
            const apiUrl = `${config.baseUrl}/quote?symbol=${symbol}&apikey=${config.key}`;
            
            // Try direct API call first
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Check for rate limit
                    if (data.code === 429 || (data.status === 'error' && data.message?.includes('run out of API credits'))) {
                        console.error('[DataService] Twelve Data rate limit:', data.message);
                        return { success: false, rateLimitExceeded: true };
                    }
                    
                    if (data.status !== 'error' && data.close) {
                        console.log(`[DataService] ✅ Twelve Data quote for ${symbol}: $${data.close}`);
                        this._setCache(cacheKey, data);
                        return { success: true, data };
                    } else {
                        console.warn('[DataService] Twelve Data API error:', data.message || 'No data');
                        return { success: false, rateLimitExceeded: false };
                    }
                }
            } catch (corsError) {
                console.log('[DataService] CORS error, trying proxies...');
            }
            
            // Try multiple CORS proxies
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://corsproxy.io/?'
            ];
            
            for (let i = 0; i < proxies.length; i++) {
                try {
                    const proxy = proxies[i];
                    const proxyUrl = proxy + encodeURIComponent(apiUrl);
                    console.log(`[DataService] Trying proxy ${i + 1}/${proxies.length}...`);
                    
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check for rate limit
                        if (data.code === 429 || (data.status === 'error' && data.message?.includes('run out of API credits'))) {
                            console.error('[DataService] Twelve Data rate limit via proxy:', data.message);
                            return { success: false, rateLimitExceeded: true };
                        }
                        
                        if (data.status !== 'error' && data.close) {
                            console.log(`[DataService] ✅ Twelve Data proxy succeeded! ${symbol}: $${data.close}`);
                            this._setCache(cacheKey, data);
                            return { success: true, data };
                        }
                    }
                } catch (proxyError) {
                    console.log(`[DataService] Proxy ${i + 1} failed`);
                }
            }
            
            // If all proxies fail, try to use expired cache
            const oldCached = this._cache[cacheKey];
            if (oldCached) {
                console.log('[DataService] Using expired cache for Twelve Data');
                return { success: true, data: oldCached.data };
            }
            
            return { success: false, rateLimitExceeded: false };
        } catch (error) {
            console.error('[DataService] Twelve Data quote error:', error.message);
            return { success: false, rateLimitExceeded: false };
        }
    },
    
    /**
     * Fetch time series data from Twelve Data with Alpha Vantage fallback
     * @param {string} symbol - Asset symbol
     * @param {number} days - Number of days
     * @returns {Promise<Array>} Time series data
     */
    async fetchStockTimeSeries(symbol, days = 30) {
        try {
            // Try Twelve Data FIRST (preferred API)
            const config = window.AppConfig?.thirdPartyApis?.twelveData;
            let shouldFallbackToAlpha = false;
            
            if (config?.enabled && config?.key) {
                const result = await this._fetchTwelveDataTimeSeries(symbol, days, config);
                if (result.success) {
                    return result.data;
                } else if (result.rateLimitExceeded) {
                    console.warn('[DataService] ⚠️ Twelve Data rate limit exceeded, falling back to Alpha Vantage');
                    shouldFallbackToAlpha = true;
                }
            } else {
                console.log('[DataService] Twelve Data not configured, trying Alpha Vantage');
                shouldFallbackToAlpha = true;
            }
            
            // Fall back to Alpha Vantage if Twelve Data failed or rate limited
            if (shouldFallbackToAlpha) {
                const alphaConfig = window.AppConfig?.thirdPartyApis?.alphaVantage;
                if (alphaConfig?.enabled && alphaConfig?.key && alphaConfig?.key !== 'YOUR_ALPHA_VANTAGE_KEY_HERE') {
                    console.log(`[DataService] Trying Alpha Vantage fallback for ${symbol}...`);
                    const alphaData = await this.fetchAlphaVantageTimeSeries(symbol, days);
                    if (alphaData && alphaData.length > 0) {
                        console.log(`[DataService] ✅ Alpha Vantage fallback succeeded! Got ${alphaData.length} days`);
                        return alphaData;
                    } else {
                        console.warn('[DataService] Alpha Vantage fallback failed');
                    }
                } else {
                    console.warn('[DataService] ⚠️ Alpha Vantage not configured! Add API key to config.local.js');
                    console.warn('[DataService] Get free key: https://www.alphavantage.co/support/#api-key');
                }
            }
            
            console.warn('[DataService] Could not fetch time series data from any API');
            return null;
        } catch (error) {
            console.error('[DataService] Time series fetch error:', error.message);
            return null;
        }
    },
    
    /**
     * Internal method to fetch time series from Twelve Data
     * @param {string} symbol - Asset symbol
     * @param {number} days - Number of days
     * @param {Object} config - Twelve Data config
     * @returns {Promise<Object>} {success, data, rateLimitExceeded}
     */
    async _fetchTwelveDataTimeSeries(symbol, days, config) {
        try {
            const cacheKey = `stock_hist_${symbol}_${days}`;
            const cached = this._getCached(cacheKey);
            if (cached) return { success: true, data: cached };
            
            const interval = '1day';
            const outputsize = Math.min(days + 10, 5000);
            const apiUrl = `${config.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${config.key}`;
            
            console.log(`[DataService] Fetching ${days} days from Twelve Data for ${symbol}...`);
            console.log(`[DataService] API Key: ${config.key ? config.key.substring(0, 8) + '...' : 'NONE'}`);
            
            // Try proxies immediately (direct calls often fail due to CORS)
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://api.codetabs.com/v1/proxy?quest=',
                'https://corsproxy.io/?'
            ];
            
            for (let i = 0; i < proxies.length; i++) {
                try {
                    const proxy = proxies[i];
                    const proxyUrl = proxy + encodeURIComponent(apiUrl);
                    console.log(`[DataService] Trying proxy ${i + 1}/${proxies.length} for time series...`);
                    
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Check for rate limit FIRST
                        if (data.code === 429 || (data.status === 'error' && data.message?.includes('run out of API credits'))) {
                            console.error(`[DataService] Twelve Data rate limit: ${data.message}`);
                            return { success: false, rateLimitExceeded: true };
                        }
                        
                        // Check for other API errors
                        if (data.status === 'error') {
                            console.error(`[DataService] Twelve Data API Error: ${data.message || 'Unknown error'}`);
                            continue; // Try next proxy
                        }
                        
                        if (data.values && Array.isArray(data.values)) {
                            console.log(`[DataService] ✅ Twelve Data got ${data.values.length} days for ${symbol}`);
                            const formatted = this._formatTwelveDataTimeSeries(data.values);
                            this._setCache(cacheKey, formatted);
                            return { success: true, data: formatted };
                        } else {
                            console.warn(`[DataService] No values in Twelve Data response for ${symbol}`);
                        }
                    } else {
                        console.warn(`[DataService] HTTP ${response.status} from proxy ${i + 1}`);
                    }
                } catch (proxyError) {
                    console.log(`[DataService] Proxy ${i + 1} failed:`, proxyError.message);
                }
            }
            
            return { success: false, rateLimitExceeded: false };
        } catch (error) {
            console.error('[DataService] Twelve Data time series error:', error.message);
            return { success: false, rateLimitExceeded: false };
        }
    },
    
    /**
     * Format Twelve Data time series
     * @param {Array} values - Raw time series values
     * @returns {Array} Formatted data
     */
    _formatTwelveDataTimeSeries(values) {
        if (!values || !Array.isArray(values)) return [];
        
        return values.reverse().map(item => ({
            time: item.datetime, // TradingView format: 'YYYY-MM-DD' or timestamp
            date: item.datetime,
            timestamp: new Date(item.datetime).getTime(),
            open: parseFloat(item.open),
            high: parseFloat(item.high),
            low: parseFloat(item.low),
            close: parseFloat(item.close),
            price: parseFloat(item.close),
            value: parseFloat(item.close), // For line charts
            volume: parseInt(item.volume) || 0,
            change: 0
        }));
    },
    
    /**
     * Fetch quote from Alpha Vantage
     * @param {string} symbol - Stock symbol
     * @returns {Promise<Object>} Quote data
     */
    async fetchAlphaVantageQuote(symbol) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.alphaVantage;
            const cacheKey = `alpha_quote_${symbol}`;
            
            const cached = this._getCached(cacheKey);
            if (cached) return cached;
            
            const apiUrl = `${config.baseUrl}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${config.key}`;
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                if (data['Global Quote'] && data['Global Quote']['05. price']) {
                    const quote = {
                        close: parseFloat(data['Global Quote']['05. price']),
                        high: parseFloat(data['Global Quote']['03. high']),
                        low: parseFloat(data['Global Quote']['04. low']),
                        open: parseFloat(data['Global Quote']['02. open']),
                        volume: parseInt(data['Global Quote']['06. volume'])
                    };
                    this._setCache(cacheKey, quote);
                    return quote;
                }
            }
            return null;
        } catch (error) {
            console.warn('[DataService] Alpha Vantage quote error:', error.message);
            return null;
        }
    },
    
    /**
     * Fetch time series from Alpha Vantage
     * @param {string} symbol - Stock symbol
     * @param {number} days - Number of days
     * @returns {Promise<Array>} Time series data
     */
    async fetchAlphaVantageTimeSeries(symbol, days = 30) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.alphaVantage;
            
            // Map symbols that Alpha Vantage doesn't support
            const symbolMap = {
                'SPX': 'SPY',  // S&P 500 index → SPDR S&P 500 ETF
                '^GSPC': 'SPY',
                'S&P 500': 'SPY'
            };
            
            const mappedSymbol = symbolMap[symbol] || symbol;
            if (mappedSymbol !== symbol) {
                console.log(`[DataService] Mapping ${symbol} → ${mappedSymbol} for Alpha Vantage`);
            }
            
            const cacheKey = `alpha_ts_${mappedSymbol}_${days}`;
            
            const cached = this._getCached(cacheKey);
            if (cached) return cached;
            
            const outputsize = days > 100 ? 'full' : 'compact';
            const apiUrl = `${config.baseUrl}?function=TIME_SERIES_DAILY&symbol=${mappedSymbol}&outputsize=${outputsize}&apikey=${config.key}`;
            
            console.log(`[DataService] Alpha Vantage API URL: ${config.baseUrl}?function=TIME_SERIES_DAILY&symbol=${mappedSymbol}&outputsize=${outputsize}&apikey=***`);
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const data = await response.json();
                
                if (data['Time Series (Daily)']) {
                    const timeSeries = data['Time Series (Daily)'];
                    const formatted = Object.entries(timeSeries)
                        .slice(0, days)
                        .reverse()
                        .map(([dateStr, values]) => {
                            const date = new Date(dateStr);
                            return {
                                time: dateStr, // TradingView format: 'YYYY-MM-DD'
                                date: dateStr,
                                timestamp: date.getTime(),
                                open: parseFloat(values['1. open']),
                                high: parseFloat(values['2. high']),
                                low: parseFloat(values['3. low']),
                                close: parseFloat(values['4. close']),
                                price: parseFloat(values['4. close']),
                                value: parseFloat(values['4. close']), // For line charts
                                volume: parseInt(values['5. volume']) || 0,
                                change: 0
                            };
                        });
                    
                    this._setCache(cacheKey, formatted);
                    return formatted;
                } else if (data.Note) {
                    console.warn('[DataService] Alpha Vantage rate limit:', data.Note);
                    console.warn('[DataService] ⚠️ Alpha Vantage free tier: 25 calls/day limit reached!');
                    console.warn('[DataService] Your Twelve Data resets at midnight UTC. Wait until then for live data.');
                } else if (data['Error Message']) {
                    console.error('[DataService] Alpha Vantage error:', data['Error Message']);
                } else {
                    console.warn('[DataService] Alpha Vantage unexpected response:', data);
                }
            }
            return null;
        } catch (error) {
            console.warn('[DataService] Alpha Vantage time series error:', error.message);
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
     * Fetch historical data from CoinGecko for crypto assets
     * @param {string} coinId - CoinGecko coin ID
     * @param {number} days - Number of days of historical data
     * @returns {Promise<Array>} Historical data
     */
    async fetchCryptoHistoricalData(coinId, days = 30) {
        try {
            const config = window.AppConfig?.thirdPartyApis?.coingecko;
            if (!config?.enabled) return null;
            
            const cacheKey = `crypto_hist_${coinId}_${days}`;
            const cached = this._getCached(cacheKey);
            if (cached) return cached;
            
            const apiUrl = `${config.baseUrl}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`;
            
            try {
                const response = await fetch(apiUrl);
                if (response.ok) {
                    const data = await response.json();
                    const formatted = this._formatCoinGeckoHistoricalData(data);
                    this._setCache(cacheKey, formatted);
                    return formatted;
                }
            } catch (corsError) {
                console.warn('[DataService] CORS error, trying proxy...');
            }
            
            // Try proxy
            const proxies = [
                'https://api.allorigins.win/raw?url=',
                'https://api.codetabs.com/v1/proxy?quest='
            ];
            
            for (const proxy of proxies) {
                try {
                    const proxyUrl = proxy + encodeURIComponent(apiUrl);
                    const response = await fetch(proxyUrl);
                    if (response.ok) {
                        const data = await response.json();
                        const formatted = this._formatCoinGeckoHistoricalData(data);
                        this._setCache(cacheKey, formatted);
                        return formatted;
                    }
                } catch (proxyError) {
                    console.warn('[DataService] Proxy failed:', proxyError.message);
                }
            }
            
            return null;
        } catch (error) {
            console.error('[DataService] Error fetching crypto historical data:', error);
            return null;
        }
    },
    
    /**
     * Format CoinGecko historical data
     * @param {Object} data - Raw CoinGecko data
     * @returns {Array} Formatted historical data
     */
    _formatCoinGeckoHistoricalData(data) {
        if (!data || !data.prices) return [];
        
        return data.prices.map((price, index) => {
            const date = new Date(price[0]);
            const volume = data.total_volumes?.[index]?.[1] || 0;
            const marketCap = data.market_caps?.[index]?.[1] || 0;
            
            return {
                date: date.toISOString().split('T')[0],
                timestamp: price[0],
                price: parseFloat(price[1].toFixed(2)),
                volume: Math.floor(volume),
                marketCap: Math.floor(marketCap),
                high: parseFloat((price[1] * 1.02).toFixed(2)),
                low: parseFloat((price[1] * 0.98).toFixed(2)),
                open: parseFloat(price[1].toFixed(2)),
                close: parseFloat(price[1].toFixed(2)),
                change: 0
            };
        });
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
     * Get market data for multiple assets (with live API integration)
     * @param {Array} assets - Array of asset names
     * @param {number} days - Number of days of historical data
     * @returns {Promise<Object>} Map of asset -> historical data
     */
    async getMarketData(assets = ['S&P 500', 'NASDAQ', 'Gold', 'Oil', 'Bitcoin'], days = 30) {
        const marketData = {};
        const useMockData = window.AppConfig?.useMockData ?? true;
        
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
        
        // Crypto ID mapping
        const cryptoMap = {
            'Bitcoin': 'bitcoin',
            'Ethereum': 'ethereum',
            'Solana': 'solana',
            'Cardano': 'cardano',
            'XRP': 'ripple'
        };
        
        // Try to fetch real data if not in mock mode
        if (!useMockData) {
            const fetchPromises = assets.map(async (asset) => {
                // Check if it's a crypto asset
                if (cryptoMap[asset]) {
                    try {
                        const historicalData = await this.fetchCryptoHistoricalData(cryptoMap[asset], days);
                        if (historicalData && historicalData.length > 0) {
                            console.log(`[DataService] ✅ Loaded live historical data for ${asset}:`, historicalData.length, 'days');
                            return { asset, data: historicalData };
                        }
                    } catch (error) {
                        console.warn(`[DataService] Failed to fetch live data for ${asset}, using fallback`);
                    }
                }
                
                // Fallback to generated data
                return {
                    asset,
                    data: this.generateHistoricalData(
                        asset,
                        days,
                        basePrices[asset] || 100,
                        volatilities[asset] || 0.02
                    )
                };
            });
            
            const results = await Promise.all(fetchPromises);
            results.forEach(({ asset, data }) => {
                marketData[asset] = data;
            });
        } else {
            // Use generated data only
            assets.forEach(asset => {
                marketData[asset] = this.generateHistoricalData(
                    asset,
                    days,
                    basePrices[asset] || 100,
                    volatilities[asset] || 0.02
                );
            });
        }
        
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
