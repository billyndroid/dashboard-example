// API Test Utility
// Run this in the browser console to test API connections

console.log('=== API Configuration Test ===');
console.log('AppConfig available:', typeof AppConfig !== 'undefined');

if (typeof AppConfig !== 'undefined') {
    console.log('useMockData:', AppConfig.useMockData);
    console.log('APIs configured:', AppConfig.thirdPartyApis);
    console.log('');
    
    // Test CoinGecko (no key needed)
    console.log('=== Testing CoinGecko API (Crypto - No Key Needed) ===');
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true')
        .then(r => r.json())
        .then(data => {
            console.log('✅ CoinGecko API Success!');
            console.log('Bitcoin Price:', data.bitcoin.usd);
            console.log('Bitcoin 24h Change:', data.bitcoin.usd_24h_change + '%');
            console.log('Ethereum Price:', data.ethereum.usd);
            console.log('Ethereum 24h Change:', data.ethereum.usd_24h_change + '%');
            console.log('');
        })
        .catch(error => {
            console.error('❌ CoinGecko API Error:', error);
            console.log('');
        });
    
    // Test Twelve Data (needs key)
    if (AppConfig.thirdPartyApis?.twelveData?.key && AppConfig.thirdPartyApis.twelveData.key !== 'YOUR_TWELVE_DATA_KEY_HERE') {
        console.log('=== Testing Twelve Data API (Stocks) ===');
        const twelveKey = AppConfig.thirdPartyApis.twelveData.key;
        fetch(`https://api.twelvedata.com/quote?symbol=AAPL&apikey=${twelveKey}`)
            .then(r => r.json())
            .then(data => {
                if (data.code === 401 || data.status === 'error') {
                    console.error('❌ Twelve Data API Error:', data.message);
                } else {
                    console.log('✅ Twelve Data API Success!');
                    console.log('AAPL Price:', data.close);
                    console.log('AAPL Change:', data.change);
                }
                console.log('');
            })
            .catch(error => {
                console.error('❌ Twelve Data API Error:', error);
                console.log('');
            });
    } else {
        console.log('⏭️ Twelve Data API: No key configured');
        console.log('');
    }
    
    // Test NewsAPI (needs key)
    if (AppConfig.thirdPartyApis?.newsapi?.key && AppConfig.thirdPartyApis.newsapi.key !== 'YOUR_NEWSAPI_KEY_HERE') {
        console.log('=== Testing NewsAPI (News) ===');
        const newsKey = AppConfig.thirdPartyApis.newsapi.key;
        fetch(`https://newsapi.org/v2/everything?q=bitcoin&pageSize=1&apiKey=${newsKey}`)
            .then(r => r.json())
            .then(data => {
                if (data.status === 'error') {
                    console.error('❌ NewsAPI Error:', data.message);
                } else {
                    console.log('✅ NewsAPI Success!');
                    console.log('Articles found:', data.totalResults);
                    if (data.articles && data.articles[0]) {
                        console.log('Latest article:', data.articles[0].title);
                    }
                }
                console.log('');
            })
            .catch(error => {
                console.error('❌ NewsAPI Error:', error);
                console.log('');
            });
    } else {
        console.log('⏭️ NewsAPI: No key configured');
        console.log('');
    }
    
    // Test DataService
    if (typeof DataService !== 'undefined') {
        console.log('=== Testing DataService ===');
        console.log('DataService available: ✅');
        
        // Test crypto fetch
        DataService.fetchCryptoPrices(['bitcoin', 'ethereum'])
            .then(prices => {
                if (prices) {
                    console.log('✅ DataService fetchCryptoPrices works!');
                    console.log('Prices:', prices);
                } else {
                    console.log('⚠️ DataService returned null (check config)');
                }
                console.log('');
            })
            .catch(error => {
                console.error('❌ DataService error:', error);
                console.log('');
            });
    } else {
        console.log('❌ DataService not loaded');
        console.log('');
    }
    
    console.log('=== Test Complete ===');
    console.log('If you see errors above, check:');
    console.log('1. config.local.js is loaded after config.js in HTML');
    console.log('2. useMockData is set to false');
    console.log('3. API keys are correct (no extra spaces)');
    console.log('4. Browser console for CORS errors');
} else {
    console.error('❌ AppConfig not found! Make sure config.js is loaded.');
}
