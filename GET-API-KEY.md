# 🔑 Get Your FREE API Key for Live Stock Data

## ✅ IMMEDIATE STEPS - Takes 2 Minutes!

### 1. Get Twelve Data API Key (FREE - 800 calls/day)

1. **Visit**: https://twelvedata.com/pricing
2. **Click**: "Start Free" button
3. **Sign up** with email (no credit card required)
4. **Copy** your API key from dashboard

### 2. Add API Key to Config

Open `scripts/config.js` and replace the demo key:

```javascript
twelveData: {
    enabled: true,
    key: 'YOUR_ACTUAL_API_KEY_HERE',  // ← Replace 'demo' with your real key
    baseUrl: 'https://api.twelvedata.com',
    cacheDuration: 60000
}
```

### 3. Refresh Page

That's it! All charts will now show 100% LIVE data:
- ✅ AAPL (Apple Stock)
- ✅ Bitcoin (via CoinGecko - already working)
- ✅ S&P 500 Index

---

## 📊 What You Get

**FREE TIER:**
- 800 API calls per day
- Real-time stock quotes
- Historical time series data
- US Stocks, Forex, Cryptocurrencies, Indices

**With our caching system:**
- Each symbol cached for 60 seconds
- Smart real-time updates only every 5 seconds
- You can display dozens of charts without hitting limits!

---

## 🚨 Current Status

**Without API Key:**
- ❌ AAPL shows "API NOT CONFIGURED"
- ❌ S&P 500 shows "API NOT CONFIGURED"
- ✅ Bitcoin works (uses CoinGecko, no key needed)

**With API Key:**
- 🔴 AAPL shows LIVE data
- 🔴 S&P 500 shows LIVE data
- 🔴 Bitcoin shows LIVE data

---

## 💡 Alternative: Alpha Vantage (Backup)

If Twelve Data doesn't work, you can use Alpha Vantage:

1. **Visit**: https://www.alphavantage.co/support/#api-key
2. **Get free key** (500 calls/day)
3. **Add to** `scripts/config.js`:

```javascript
alphaVantage: {
    enabled: true,
    key: 'YOUR_ALPHAVANTAGE_KEY',
    baseUrl: 'https://www.alphavantage.co',
    cacheDuration: 60000
}
```

---

## 🔍 Verify It's Working

Open browser console and look for:
```
[AAPL] 🔍 Fetching live stock data from Twelve Data API...
[AAPL] ✅ Loaded 365 days of LIVE stock data!
[SPX] 🔍 Fetching live index data from Twelve Data API...
[SPX] ✅ Loaded 365 days of LIVE index data!
```

Chart headers should show:
- 🔴 Live from Twelve Data API (not 🔵 Simulated)

---

## ⚡ Technical Details

**Current Implementation:**
- ✅ NO random/mock data anywhere
- ✅ NO fallbacks to simulated data
- ✅ Clear error messages if API not configured
- ✅ Persistent data across all timeframes (1D, 1W, 1M, 3M, 1Y)
- ✅ Active button states maintained
- ✅ Real-time updates every 5 seconds (only for live charts)
- ✅ Smart caching to avoid rate limits

**Files Modified:**
- `scripts/config.js` - API configuration
- `scripts/data-service.js` - Added `fetchStockTimeSeries()` method
- `tradingview-example.html` - Removed ALL fallbacks, shows errors instead

---

## 🎯 Why You Need This

Without the API key, you'll see:
- "API NOT CONFIGURED" error messages
- Red ❌ indicators in console
- No chart data displayed

With the API key (takes 2 minutes to get):
- 📈 100% LIVE stock prices
- 🔴 Real-time updates
- 📊 365 days of historical data per chart
- ⚡ Professional trading dashboard experience

**Get your key now**: https://twelvedata.com/pricing
