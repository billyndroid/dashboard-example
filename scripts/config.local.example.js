// Local Configuration Override
// Copy this file from config.local.example.js to config.local.js
// Add your API keys here and keep this file out of Git!
// Load this file AFTER config.js in your HTML files

// Example:
// <script src="scripts/config.js"></script>
// <script src="scripts/config.local.js"></script>

if (typeof AppConfig !== 'undefined') {
    // Add your API keys here
    AppConfig.thirdPartyApis.twelveData.key = 'YOUR_TWELVE_DATA_KEY_HERE';
    AppConfig.thirdPartyApis.newsapi.key = 'YOUR_NEWSAPI_KEY_HERE';
    AppConfig.thirdPartyApis.alphaVantage.key = 'YOUR_ALPHA_VANTAGE_KEY_HERE';
    
    // Toggle mock data mode
    AppConfig.useMockData = false; // Set to false to use real APIs
    
    console.log('[Config] Local configuration loaded');
    console.log('[Config] APIs enabled:', {
        coingecko: AppConfig.thirdPartyApis.coingecko.enabled,
        twelveData: AppConfig.thirdPartyApis.twelveData.enabled && !!AppConfig.thirdPartyApis.twelveData.key,
        newsapi: AppConfig.thirdPartyApis.newsapi.enabled && !!AppConfig.thirdPartyApis.newsapi.key,
        alphaVantage: AppConfig.thirdPartyApis.alphaVantage.enabled && !!AppConfig.thirdPartyApis.alphaVantage.key
    });
}
