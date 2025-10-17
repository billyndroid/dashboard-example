# API Integration Guide

This dashboard now supports **real API integration** with multiple free services for live financial data, news, and authentication.

## 🚀 Quick Start

### Step 1: Get Free API Keys

1. **CoinGecko** (Crypto Prices) - **NO KEY NEEDED** ✅
   - Free public API for cryptocurrency prices
   - Already enabled in the dashboard
   - Documentation: https://www.coingecko.com/en/api

2. **Twelve Data** (Stocks, Forex, Commodities)
   - Sign up: https://twelvedata.com/
   - Free tier: 800 requests/day
   - Get API key from dashboard

3. **NewsAPI** (Financial News)
   - Sign up: https://newsapi.org/register
   - Free tier: 100 requests/day
   - Get API key instantly

4. **Alpha Vantage** (Alternative for Stocks & News)
   - Sign up: https://www.alphavantage.co/support/#api-key
   - Free tier: 25 requests/day
   - Get API key instantly

### Step 2: Configure API Keys

Open `scripts/config.js` and add your API keys:

```javascript
thirdPartyApis: {
    // Crypto API - Already working! No key needed
    coingecko: {
        enabled: true,  // ✅ Already enabled
        baseUrl: 'https://api.coingecko.com/api/v3'
    },
    
    // Stock, Forex, Commodities API
    twelveData: {
        enabled: true,
        key: 'YOUR_TWELVE_DATA_KEY_HERE',  // Add your key
        baseUrl: 'https://api.twelvedata.com'
    },
    
    // Financial News API
    newsapi: {
        enabled: true,
        key: 'YOUR_NEWSAPI_KEY_HERE',  // Add your key
        baseUrl: 'https://newsapi.org/v2'
    },
    
    // Alternative API
    alphaVantage: {
        enabled: true,
        key: 'YOUR_ALPHA_VANTAGE_KEY_HERE',  // Add your key
        baseUrl: 'https://www.alphavantage.co/query'
    }
}
```

### Step 3: Enable Real APIs

In `scripts/config.js`, change:

```javascript
useMockData: false  // Changed from true to false
```

## 📊 Supported Data Sources

### 1. Cryptocurrency Prices (CoinGecko)

**Status**: ✅ **Working out of the box** (no API key required)

**Supported Cryptocurrencies**:
- Bitcoin
- Ethereum
- And 10,000+ others

**Features**:
- Real-time prices in USD
- 24-hour price changes
- Market cap data
- Volume data

**Example Usage**:
```javascript
const prices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum']);
console.log(prices.bitcoin.usd); // Current Bitcoin price
```

### 2. Stocks, Forex & Commodities (Twelve Data)

**Status**: ⚙️ Requires API key

**Supported Assets**:
- **Stocks**: S&P 500, NASDAQ, FTSE, etc.
- **Commodities**: Gold, Silver, Oil, Natural Gas
- **Forex**: EUR/USD, GBP/USD, JPY/USD, etc.
- **Indices**: All major global indices

**Free Tier**: 800 requests/day

**Example Usage**:
```javascript
const quote = await DataService.fetchAssetQuote('AAPL');
console.log(quote.close); // Current price
```

### 3. Financial News (NewsAPI)

**Status**: ⚙️ Requires API key

**Features**:
- Top financial headlines
- Search by keyword
- Filter by category (markets, crypto, commodities, forex)
- Source filtering
- Date range queries

**Free Tier**: 100 requests/day

**Example Usage**:
```javascript
const news = await newsService.fetchNews({
    category: 'crypto',
    pageSize: 20
});
```

### 4. Alternative Data (Alpha Vantage)

**Status**: ⚙️ Requires API key

**Features**:
- Stock quotes
- Forex rates
- Cryptocurrency data
- News sentiment
- Economic indicators

**Free Tier**: 25 requests/day

## 🔄 Fallback System

The dashboard has a **smart fallback system**:

1. **Primary**: Try real API calls
2. **Secondary**: Try alternative APIs
3. **Tertiary**: Use cached data
4. **Final**: Generate realistic mock data

This ensures the dashboard **always works** even if:
- API keys are missing
- API rate limits are exceeded
- APIs are temporarily down
- No internet connection

## 🛠️ API Configuration Details

### CoinGecko API (Crypto)

```javascript
coingecko: {
    enabled: true,  // No key needed!
    baseUrl: 'https://api.coingecko.com/api/v3',
    endpoints: {
        prices: '/simple/price',              // Current prices
        markets: '/coins/markets',            // Market data
        historical: '/coins/{id}/market_chart' // Historical data
    }
}
```

**Rate Limits**: 50 calls/minute (free tier)

**Supported Coins**: 10,000+ cryptocurrencies

**Documentation**: https://www.coingecko.com/en/api/documentation

### Twelve Data API (Stocks, Forex, Commodities)

```javascript
twelveData: {
    enabled: true,
    key: 'YOUR_API_KEY',
    baseUrl: 'https://api.twelvedata.com',
    endpoints: {
        quote: '/quote',           // Real-time quotes
        timeseries: '/time_series', // Historical data
        forex: '/forex_pairs',     // Forex pairs
        commodities: '/commodities' // Commodity prices
    }
}
```

**Rate Limits**: 800 API credits/day (free tier)

**Supported Assets**:
- 5,000+ stocks
- 50+ forex pairs
- 20+ commodities
- 100+ indices

**Documentation**: https://twelvedata.com/docs

### NewsAPI (Financial News)

```javascript
newsapi: {
    enabled: true,
    key: 'YOUR_API_KEY',
    baseUrl: 'https://newsapi.org/v2',
    endpoints: {
        everything: '/everything',      // Search all articles
        topHeadlines: '/top-headlines'  // Top headlines
    }
}
```

**Rate Limits**: 100 requests/day (free tier)

**Features**:
- 80,000+ news sources
- Real-time updates
- Full-text search
- Date filtering
- Language support

**Documentation**: https://newsapi.org/docs

### Alpha Vantage API (Alternative)

```javascript
alphaVantage: {
    enabled: true,
    key: 'YOUR_API_KEY',
    baseUrl: 'https://www.alphavantage.co/query',
    functions: {
        quote: 'GLOBAL_QUOTE',              // Stock quotes
        intraday: 'TIME_SERIES_INTRADAY',   // Intraday data
        forex: 'CURRENCY_EXCHANGE_RATE',     // Forex rates
        crypto: 'DIGITAL_CURRENCY_DAILY',    // Crypto data
        news: 'NEWS_SENTIMENT'               // News with sentiment
    }
}
```

**Rate Limits**: 25 requests/day (free tier)

**Premium Options**: Up to 1,200 requests/minute

**Documentation**: https://www.alphavantage.co/documentation/

## 💡 Usage Examples

### Example 1: Fetch Real-Time Crypto Prices

```javascript
// No API key needed!
const cryptoPrices = await DataService.fetchCryptoPrices(['bitcoin', 'ethereum']);

console.log('Bitcoin:', cryptoPrices.bitcoin.usd);
console.log('24h Change:', cryptoPrices.bitcoin.usd_24h_change);
```

### Example 2: Get Stock Quote

```javascript
// Requires Twelve Data API key
const appleStock = await DataService.fetchAssetQuote('AAPL');

console.log('Price:', appleStock.close);
console.log('Change:', appleStock.change);
console.log('Volume:', appleStock.volume);
```

### Example 3: Fetch Financial News

```javascript
// Requires NewsAPI key
const news = await newsService.fetchNews({
    category: 'markets',
    query: 'bitcoin',
    pageSize: 10
});

news.forEach(article => {
    console.log(article.title);
    console.log(article.source);
    console.log(article.publishedAt);
});
```

### Example 4: Get Forex Rate

```javascript
// Requires Alpha Vantage API key
const forexRate = await DataService.fetchForexRate('EUR', 'USD');

console.log('EUR/USD:', forexRate['Realtime Currency Exchange Rate']);
```

## 🔐 Security Best Practices

### 1. Protect API Keys

**⚠️ NEVER commit API keys to Git!**

Add to `.gitignore`:
```
config.local.js
.env
*.key
```

### 2. Use Environment Variables (Recommended)

Create `scripts/config.local.js`:
```javascript
// This file is ignored by Git
AppConfig.thirdPartyApis.twelveData.key = 'YOUR_KEY_HERE';
AppConfig.thirdPartyApis.newsapi.key = 'YOUR_KEY_HERE';
AppConfig.thirdPartyApis.alphaVantage.key = 'YOUR_KEY_HERE';
```

Load it in HTML before other scripts:
```html
<script src="scripts/config.js"></script>
<script src="scripts/config.local.js"></script> <!-- Keys loaded here -->
```

### 3. Server-Side Proxy (Production)

For production, create a backend proxy:

```javascript
// backend/api.js
app.get('/api/crypto-prices', async (req, res) => {
    const prices = await fetch('https://api.coingecko.com/api/v3/simple/price...');
    res.json(await prices.json());
});
```

Update frontend:
```javascript
// Use your own API instead of direct calls
const response = await fetch('/api/crypto-prices');
```

## 📈 Rate Limit Management

### Strategy 1: Caching

The dashboard already implements caching:

```javascript
cache: {
    articles: [],
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes
}
```

### Strategy 2: Request Batching

Batch multiple requests:

```javascript
// Instead of multiple calls:
// fetchPrice('BTC'), fetchPrice('ETH'), fetchPrice('XRP')

// Do one call:
fetchCryptoPrices(['bitcoin', 'ethereum', 'ripple']);
```

### Strategy 3: Update Intervals

Adjust update frequency in `config.js`:

```javascript
ui: {
    updateInterval: 30000, // 30 seconds instead of 5
}
```

## 🧪 Testing APIs

### Test CoinGecko (No Key Needed)

Open browser console and run:

```javascript
fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    .then(r => r.json())
    .then(console.log);
```

Expected result:
```json
{
    "bitcoin": {
        "usd": 43250
    }
}
```

### Test With Your API Keys

In browser console:

```javascript
// Test Twelve Data
const key = 'YOUR_KEY';
fetch(`https://api.twelvedata.com/quote?symbol=AAPL&apikey=${key}`)
    .then(r => r.json())
    .then(console.log);

// Test NewsAPI
fetch(`https://newsapi.org/v2/everything?q=bitcoin&apiKey=${key}`)
    .then(r => r.json())
    .then(console.log);

// Test Alpha Vantage
fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${key}`)
    .then(r => r.json())
    .then(console.log);
```

## 🎯 Feature-Specific Configuration

### Enable Only Crypto (No Keys Needed)

```javascript
AppConfig.useMockData = false;
AppConfig.thirdPartyApis.coingecko.enabled = true;
AppConfig.thirdPartyApis.twelveData.enabled = false;
AppConfig.thirdPartyApis.newsapi.enabled = false;
```

### Enable Everything

```javascript
AppConfig.useMockData = false;
// Add all API keys in config.js
```

### Development Mode (Mock Data)

```javascript
AppConfig.useMockData = true;
// All APIs disabled, using generated data
```

## 🆘 Troubleshooting

### Issue: "API error: 401"

**Solution**: Check your API key is correct and active.

```javascript
console.log('API Key:', AppConfig.thirdPartyApis.twelveData.key);
```

### Issue: "API error: 429" (Rate Limit)

**Solutions**:
1. Enable caching (already enabled)
2. Increase cache TTL
3. Reduce update frequency
4. Upgrade to paid tier

### Issue: CORS Errors

**Solution**: Use a backend proxy or enable CORS on your server.

For development, use a CORS proxy:
```javascript
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = proxyUrl + 'https://api.example.com/data';
```

### Issue: No Data Showing

**Check**:
1. `useMockData` is set to `false`
2. API keys are added correctly
3. `enabled: true` for the API
4. Check browser console for errors

### Issue: Slow Performance

**Solutions**:
1. Increase cache TTL
2. Reduce update frequency
3. Fetch fewer assets
4. Use request batching

## 📚 Additional Resources

- [CoinGecko API Docs](https://www.coingecko.com/en/api/documentation)
- [Twelve Data API Docs](https://twelvedata.com/docs)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [Alpha Vantage Docs](https://www.alphavantage.co/documentation/)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## 🎓 Next Steps

1. **Get API keys** from the free tier services
2. **Add keys** to `config.js`
3. **Set `useMockData: false`**
4. **Test** the dashboard with real data
5. **Monitor** API usage in browser console
6. **Optimize** based on your needs

---

**Note**: This dashboard is designed to work perfectly with or without API keys. The fallback system ensures a smooth experience regardless of API availability.
