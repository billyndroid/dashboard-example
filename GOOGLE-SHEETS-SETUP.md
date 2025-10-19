# Google Sheets Integration Setup Guide

This guide will help you set up automatic syncing between your private Google Sheets and the Market Analysis page.

## Prerequisites

1. A Google account
2. A Google Sheets spreadsheet with your data
3. Google Sheets API enabled in Google Cloud Console

## Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

## Step 2: Create API Key

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key (you'll need this later)
4. **Optional but recommended:** Restrict the API key:
   - Click "Edit API key"
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Application restrictions", you can restrict by HTTP referrer if deploying to a specific domain

## Step 3: Prepare Your Google Sheet

### Sheet Structure

Your Google Sheets document should have two sheets:

#### Sheet 1: "Earnings"
Columns (A-G):
- **A:** Company Name (e.g., "Apple Inc.")
- **B:** Symbol (e.g., "AAPL")
- **C:** Date (e.g., "2024-10-25")
- **D:** EPS Estimate (e.g., "$1.25")
- **E:** EPS Actual (e.g., "$1.30")
- **F:** Revenue (e.g., "$89.5B")
- **G:** Status (e.g., "Beat", "Miss", "Met", "Pending")

Example:
```
Company Name    | Symbol | Date       | EPS Est. | EPS Actual | Revenue  | Status
Apple Inc.      | AAPL   | 2024-10-25 | $1.25    | $1.30      | $89.5B   | Beat
Microsoft Corp. | MSFT   | 2024-10-28 | $2.45    | $2.40      | $52.1B   | Miss
```

#### Sheet 2: "InstitutionalFlow"
Columns (A-G):
- **A:** Date (e.g., "2024-10-18")
- **B:** Institution (e.g., "BlackRock", "Vanguard")
- **C:** Symbol (e.g., "NVDA")
- **D:** Action (e.g., "Buy", "Sell", "Accumulate")
- **E:** Shares (e.g., "1500000")
- **F:** Value (e.g., "$75000000")
- **G:** Impact (e.g., "High", "Medium", "Low")

Example:
```
Date       | Institution | Symbol | Action     | Shares   | Value      | Impact
2024-10-18 | BlackRock   | NVDA   | Buy        | 1500000  | $75000000  | High
2024-10-17 | Vanguard    | AAPL   | Accumulate | 2000000  | $340000000 | Medium
```

### Make Your Sheet Accessible

1. Open your Google Sheet
2. Click "Share" in the top right
3. Under "General access", select "Anyone with the link" (Viewer access is sufficient)
4. Click "Copy link"
5. From the URL, extract the Spreadsheet ID:
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Copy the `SPREADSHEET_ID` portion

## Step 4: Configure Your Dashboard

1. Open `scripts/config.local.js` (create it from `config.local.example.js` if it doesn't exist)
2. Add your credentials:

```javascript
if (typeof AppConfig !== 'undefined') {
    // Google Sheets API Configuration
    AppConfig.googleSheetsApiKey = 'YOUR_GOOGLE_SHEETS_API_KEY';
    AppConfig.spreadsheetId = 'YOUR_SPREADSHEET_ID';
}
```

3. Replace:
   - `YOUR_GOOGLE_SHEETS_API_KEY` with the API key from Step 2
   - `YOUR_SPREADSHEET_ID` with the ID from Step 3

## Step 5: Customize Sheet Names (Optional)

If your sheets have different names, update the ranges in `scripts/google-sheets-sync.js`:

```javascript
const GOOGLE_SHEETS_CONFIG = {
    earningsRange: 'YourEarningsSheetName!A2:G100',
    orderFlowRange: 'YourFlowSheetName!A2:G100',
    // ... rest of config
};
```

## Step 6: Test the Integration

1. Open `html/market-analysis.html` in your browser
2. Check the browser console (F12) for sync messages
3. Data should automatically populate in both tables
4. Click the "Refresh" button to manually trigger a sync

## Features

### Auto-Sync
- Data automatically syncs every **5 minutes**
- You can change the interval in `google-sheets-sync.js`:
  ```javascript
  refreshInterval: 300000 // milliseconds (300000 = 5 minutes)
  ```

### Manual Refresh
- Click the "Refresh" button in the top bar to immediately sync data

### Sync Indicator
- **Blue "Syncing..."**: Currently fetching data
- **Green "Synced"**: Data successfully updated
- **Red "Sync Failed"**: Error occurred (check console)

### Status Formatting
Automatic color coding based on values:

**Earnings Status:**
- 🟢 Green: "Beat", "Exceeded"
- 🔴 Red: "Miss", "Below"
- 🔵 Blue: "Met", "Inline"
- 🟡 Yellow: "Pending"

**Institutional Actions:**
- 🟢 Green: "Buy", "Accumulate"
- 🔴 Red: "Sell", "Distribute"

**Impact Level:**
- 🔴 Red: "High", "Significant"
- 🟡 Yellow: "Medium", "Moderate"
- 🟢 Green: "Low", "Minimal"

## Troubleshooting

### "API key not configured" error
- Verify `config.local.js` exists and contains your API key
- Ensure the script is loaded in the HTML file

### "Failed to fetch data" error
- Check that Google Sheets API is enabled in Google Cloud Console
- Verify your API key is correct
- Ensure the spreadsheet is shared with "Anyone with the link"

### No data appears
- Check sheet names match the configuration
- Verify column order matches the expected format
- Open browser console (F12) to see detailed error messages

### Data not updating
- Check that auto-sync interval is set
- Manually click "Refresh" to force an update
- Verify your Google Sheet has been updated

## Security Notes

⚠️ **Important:**
- Keep `config.local.js` out of version control (it should be in `.gitignore`)
- Never commit your API key to a public repository
- Consider restricting your API key to specific domains if hosting publicly
- Use "Viewer" access only for the Google Sheet

## Advanced Configuration

### Different Number of Rows
Change the range in `google-sheets-sync.js`:
```javascript
earningsRange: 'Earnings!A2:G500', // Fetch up to row 500
```

### Custom Formatting
Modify the formatting functions in `google-sheets-sync.js`:
- `formatCurrency()`: Change how money values are displayed
- `formatNumber()`: Change how numbers are formatted
- `getEarningsStatusClass()`: Customize status colors

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all setup steps were completed
3. Test the Google Sheets API key using [Google's API Explorer](https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/get)
