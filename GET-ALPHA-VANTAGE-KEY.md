AppConfig.thirdPartyApis.alphaVantage.key = 'NPO8RI3REBKWXOPVAppConfig.thirdPartyApis.alphaVantage.key = 'NPO8RI3REBKWXOPV';';# 🔑 Get FREE Alpha Vantage API Key (500 calls/day)

## ⚠️ Your Twelve Data limit exceeded!

You've used **5,131 API calls today** (limit: 800/day)

## ✅ QUICK FIX - Use Alpha Vantage Instead

### 1. Get FREE API Key (Takes 30 seconds)

**Visit**: https://www.alphavantage.co/support/#api-key

1. Enter your email
2. Click "GET FREE API KEY"
3. Copy the key they show you

### 2. Add to config.local.js

Open `scripts/config.local.js` and replace this line:

```javascript
AppConfig.thirdPartyApis.alphaVantage.key = 'YOUR_ALPHA_VANTAGE_KEY_HERE';
```

With your actual key:

```javascript
AppConfig.thirdPartyApis.alphaVantage.key = 'YOUR_ACTUAL_KEY_FROM_ALPHAVANTAGE';
```

### 3. Refresh Page

That's it! The system will now:
- ✅ Try Alpha Vantage FIRST (500 calls/day)
- 🔄 Fall back to Twelve Data if needed (resets tomorrow)
- 🎯 Show live AAPL and S&P 500 data immediately!

---

## 📊 What You Get

**Alpha Vantage FREE:**
- 500 API calls per day
- US Stocks, Forex, Cryptocurrencies
- Real-time quotes
- Historical time series

**With our smart fallback:**
- Alpha Vantage tried first
- Twelve Data as backup (resets midnight UTC)
- Bitcoin from CoinGecko (unlimited)

---

## 🚀 Alternative: Wait Until Tomorrow

Your Twelve Data limit resets at **midnight UTC**.

Current time: Check https://time.is/UTC

Once it resets, you'll have 800 calls again and everything will work!

---

## 💡 Pro Tip: Reduce API Usage

Our caching is already aggressive (60 seconds), but to use even fewer calls:

1. Don't refresh the page unnecessarily
2. Each page load = ~6 API calls (2 stocks × 3 proxies max)
3. Real-time updates use cached data (smart!)

With Alpha Vantage, you get **500 calls/day = ~80 page refreshes!**
