/**
 * Google Sheets API Integration
 * Automatically syncs data from private Google Sheets to the Market Analysis page
 */

// Configuration
const GOOGLE_SHEETS_CONFIG = {
    apiKey: window.AppConfig?.googleSheetsApiKey || '',
    spreadsheetId: window.AppConfig?.spreadsheetId || '',
    earningsRange: 'Earnings!A2:G100', // Adjust range as needed
    orderFlowRange: 'InstitutionalFlow!A2:G100', // Adjust range as needed
    refreshInterval: 300000 // Refresh every 5 minutes (300000ms)
};

let refreshTimer = null;

/**
 * Initialize Google Sheets sync
 */
function initGoogleSheetsSync() {
    console.log('[Google Sheets Sync] Initializing...');
    
    if (!GOOGLE_SHEETS_CONFIG.apiKey) {
        console.warn('[Google Sheets Sync] API key not configured. Please add googleSheetsApiKey to config.local.js');
        showSyncError('API key not configured');
        return;
    }
    
    if (!GOOGLE_SHEETS_CONFIG.spreadsheetId) {
        console.warn('[Google Sheets Sync] Spreadsheet ID not configured. Please add spreadsheetId to config.local.js');
        showSyncError('Spreadsheet ID not configured');
        return;
    }
    
    // Initial sync
    syncAllData();
    
    // Set up auto-refresh
    refreshTimer = setInterval(syncAllData, GOOGLE_SHEETS_CONFIG.refreshInterval);
    console.log(`[Google Sheets Sync] Auto-refresh enabled (every ${GOOGLE_SHEETS_CONFIG.refreshInterval / 1000}s)`);
}

/**
 * Sync all data from Google Sheets
 */
async function syncAllData() {
    console.log('[Google Sheets Sync] Syncing data...');
    showSyncIndicator('syncing');
    
    try {
        await Promise.all([
            syncEarningsData(),
            syncOrderFlowData()
        ]);
        
        showSyncIndicator('success');
        updateLastSyncTime();
        console.log('[Google Sheets Sync] ✅ All data synced successfully');
    } catch (error) {
        console.error('[Google Sheets Sync] ❌ Sync failed:', error);
        showSyncIndicator('error');
        showSyncError(error.message);
    }
}

/**
 * Fetch data from Google Sheets
 */
async function fetchSheetData(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${GOOGLE_SHEETS_CONFIG.spreadsheetId}/values/${range}?key=${GOOGLE_SHEETS_CONFIG.apiKey}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch data from Google Sheets');
    }
    
    const data = await response.json();
    return data.values || [];
}

/**
 * Sync earnings data
 */
async function syncEarningsData() {
    try {
        const rows = await fetchSheetData(GOOGLE_SHEETS_CONFIG.earningsRange);
        console.log('[Google Sheets Sync] Earnings data received:', rows.length, 'rows');
        
        if (rows.length === 0) {
            showNoDataMessage('earningsTableBody', 7, 'No earnings data found in Google Sheets');
            return;
        }
        
        const tableBody = document.getElementById('earningsTableBody');
        if (!tableBody) {
            console.warn('[Google Sheets Sync] Earnings table body not found');
            return;
        }
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Populate table
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Company
            const companyCell = document.createElement('td');
            companyCell.textContent = row[0] || '--';
            tr.appendChild(companyCell);
            
            // Symbol
            const symbolCell = document.createElement('td');
            symbolCell.textContent = row[1] || '--';
            tr.appendChild(symbolCell);
            
            // Date
            const dateCell = document.createElement('td');
            dateCell.textContent = row[2] || '--';
            tr.appendChild(dateCell);
            
            // EPS Estimate
            const epsEstCell = document.createElement('td');
            epsEstCell.textContent = row[3] || '--';
            tr.appendChild(epsEstCell);
            
            // EPS Actual
            const epsActualCell = document.createElement('td');
            epsActualCell.textContent = row[4] || '--';
            tr.appendChild(epsActualCell);
            
            // Revenue
            const revenueCell = document.createElement('td');
            revenueCell.textContent = row[5] || '--';
            tr.appendChild(revenueCell);
            
            // Status
            const statusCell = document.createElement('td');
            const status = row[6] || 'Pending';
            const statusClass = getEarningsStatusClass(status);
            statusCell.innerHTML = `<span class="${statusClass}">${status}</span>`;
            tr.appendChild(statusCell);
            
            tableBody.appendChild(tr);
        });
        
        console.log('[Google Sheets Sync] ✅ Earnings data populated:', rows.length, 'entries');
    } catch (error) {
        console.error('[Google Sheets Sync] Error syncing earnings data:', error);
        showNoDataMessage('earningsTableBody', 7, `Error: ${error.message}`);
        throw error;
    }
}

/**
 * Sync institutional order flow data
 */
async function syncOrderFlowData() {
    try {
        const rows = await fetchSheetData(GOOGLE_SHEETS_CONFIG.orderFlowRange);
        console.log('[Google Sheets Sync] Order flow data received:', rows.length, 'rows');
        
        if (rows.length === 0) {
            showNoDataMessage('orderFlowTableBody', 7, 'No institutional order flow data found in Google Sheets');
            return;
        }
        
        const tableBody = document.getElementById('orderFlowTableBody');
        if (!tableBody) {
            console.warn('[Google Sheets Sync] Order flow table body not found');
            return;
        }
        
        // Clear existing rows
        tableBody.innerHTML = '';
        
        // Populate table
        rows.forEach(row => {
            const tr = document.createElement('tr');
            
            // Date
            const dateCell = document.createElement('td');
            dateCell.textContent = row[0] || '--';
            tr.appendChild(dateCell);
            
            // Institution
            const institutionCell = document.createElement('td');
            institutionCell.textContent = row[1] || '--';
            tr.appendChild(institutionCell);
            
            // Symbol
            const symbolCell = document.createElement('td');
            symbolCell.textContent = row[2] || '--';
            tr.appendChild(symbolCell);
            
            // Action
            const actionCell = document.createElement('td');
            const action = row[3] || '--';
            const actionClass = getActionClass(action);
            actionCell.innerHTML = `<span class="${actionClass}">${action}</span>`;
            tr.appendChild(actionCell);
            
            // Shares
            const sharesCell = document.createElement('td');
            const shares = row[4] || '--';
            sharesCell.textContent = shares !== '--' ? formatNumber(shares) : '--';
            tr.appendChild(sharesCell);
            
            // Value
            const valueCell = document.createElement('td');
            const value = row[5] || '--';
            valueCell.textContent = value !== '--' ? formatCurrency(value) : '--';
            tr.appendChild(valueCell);
            
            // Impact
            const impactCell = document.createElement('td');
            const impact = row[6] || '--';
            const impactClass = getImpactClass(impact);
            impactCell.innerHTML = `<span class="${impactClass}">${impact}</span>`;
            tr.appendChild(impactCell);
            
            tableBody.appendChild(tr);
        });
        
        console.log('[Google Sheets Sync] ✅ Order flow data populated:', rows.length, 'entries');
    } catch (error) {
        console.error('[Google Sheets Sync] Error syncing order flow data:', error);
        showNoDataMessage('orderFlowTableBody', 7, `Error: ${error.message}`);
        throw error;
    }
}

/**
 * Get status class for earnings
 */
function getEarningsStatusClass(status) {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('beat') || statusLower.includes('exceeded')) {
        return 'success';
    } else if (statusLower.includes('miss') || statusLower.includes('below')) {
        return 'danger';
    } else if (statusLower.includes('met') || statusLower.includes('inline')) {
        return 'primary';
    }
    return 'warning';
}

/**
 * Get action class
 */
function getActionClass(action) {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('buy') || actionLower.includes('accumulate')) {
        return 'success';
    } else if (actionLower.includes('sell') || actionLower.includes('distribute')) {
        return 'danger';
    }
    return 'primary';
}

/**
 * Get impact class
 */
function getImpactClass(impact) {
    const impactLower = impact.toLowerCase();
    if (impactLower.includes('high') || impactLower.includes('significant')) {
        return 'danger';
    } else if (impactLower.includes('medium') || impactLower.includes('moderate')) {
        return 'warning';
    } else if (impactLower.includes('low') || impactLower.includes('minimal')) {
        return 'success';
    }
    return 'primary';
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    if (typeof num === 'string') {
        num = parseFloat(num.replace(/,/g, ''));
    }
    if (isNaN(num)) return '--';
    return num.toLocaleString('en-US');
}

/**
 * Format currency
 */
function formatCurrency(value) {
    if (typeof value === 'string') {
        // Remove currency symbols and commas
        value = parseFloat(value.replace(/[$,]/g, ''));
    }
    if (isNaN(value)) return '--';
    
    // Format large numbers
    if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
        return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
        return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Show no data message
 */
function showNoDataMessage(tableBodyId, colSpan, message) {
    const tableBody = document.getElementById(tableBodyId);
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" style="text-align: center; padding: 2rem; color: var(--color-info-dark);">
                    ${message}
                </td>
            </tr>
        `;
    }
}

/**
 * Show sync indicator
 */
function showSyncIndicator(status) {
    let indicator = document.getElementById('syncIndicator');
    
    if (!indicator) {
        // Create indicator if it doesn't exist
        const topBar = document.querySelector('.right .top');
        if (topBar) {
            indicator = document.createElement('div');
            indicator.id = 'syncIndicator';
            indicator.style.cssText = 'padding: 0.5rem 1rem; background: #10b981; color: white; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; margin-left: 1rem; display: flex; align-items: center; gap: 0.5rem;';
            topBar.insertBefore(indicator, topBar.querySelector('.profile'));
        }
    }
    
    if (!indicator) return;
    
    switch (status) {
        case 'syncing':
            indicator.style.background = '#3b82f6';
            indicator.innerHTML = '<span class="material-icons-sharp" style="font-size: 1rem; animation: spin 1s linear infinite;">sync</span>Syncing...';
            indicator.style.display = 'flex';
            break;
        case 'success':
            indicator.style.background = '#10b981';
            indicator.innerHTML = '<span class="material-icons-sharp" style="font-size: 1rem;">cloud_done</span>Synced';
            indicator.style.display = 'flex';
            setTimeout(() => {
                if (indicator) indicator.style.display = 'none';
            }, 3000);
            break;
        case 'error':
            indicator.style.background = '#ef4444';
            indicator.innerHTML = '<span class="material-icons-sharp" style="font-size: 1rem;">cloud_off</span>Sync Failed';
            indicator.style.display = 'flex';
            setTimeout(() => {
                if (indicator) indicator.style.display = 'none';
            }, 5000);
            break;
    }
}

/**
 * Update last sync time
 */
function updateLastSyncTime() {
    let syncTime = document.getElementById('lastSyncTime');
    
    if (!syncTime) {
        const updates = document.querySelector('.recent-updates');
        if (updates) {
            syncTime = document.createElement('small');
            syncTime.id = 'lastSyncTime';
            syncTime.className = 'text-muted';
            syncTime.style.cssText = 'display: block; text-align: center; margin-top: 1rem; font-size: 0.75rem;';
            updates.appendChild(syncTime);
        }
    }
    
    if (syncTime) {
        const now = new Date();
        syncTime.textContent = `Last synced: ${now.toLocaleTimeString()}`;
    }
}

/**
 * Show sync error
 */
function showSyncError(message) {
    console.error('[Google Sheets Sync] Error:', message);
    // You can add UI notification here if needed
}

/**
 * Manual refresh trigger
 */
function manualRefresh() {
    console.log('[Google Sheets Sync] Manual refresh triggered');
    syncAllData();
}

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});

// Add spin animation for sync icon
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGoogleSheetsSync);
} else {
    initGoogleSheetsSync();
}

// Export functions for external use
window.GoogleSheetsSync = {
    init: initGoogleSheetsSync,
    syncAll: syncAllData,
    syncEarnings: syncEarningsData,
    syncOrderFlow: syncOrderFlowData,
    manualRefresh: manualRefresh
};
