/**
 * CSV Parser for Earnings Data
 * Parses the earnings CSV file and populates the market-analysis page
 */

// Sample earnings data extracted from CSV
const earningsData = [
    // Semiconductors - XLK
    { company: "NVIDIA", symbol: "NVDA", date: "27/8/25", quarter: "Q2", epsEst: "$5.98", epsActual: "$1.04", revenue: "$46.74B", consensus: "$46.05B", status: "Beat", sector: "Semiconductors" },
    { company: "Micron Technology", symbol: "MU", date: "23/9/25", quarter: "Q4", epsEst: "$14.94", epsActual: "$3.03", revenue: "$11.32B", consensus: "$10.65B", status: "Beat", sector: "Semiconductors" },
    { company: "AMD", symbol: "AMD", date: "5/8/25", quarter: "Q2", epsEst: "$3.66", epsActual: "$1.74", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Semiconductors" },
    { company: "Intel", symbol: "INTC", date: "23/10/25", quarter: "Q3", epsEst: "-$0.16", epsActual: "-$4.76", revenue: "TBD", consensus: "TBD", status: "Miss", sector: "Semiconductors" },
    { company: "Qualcomm", symbol: "QCOM", date: "29/10/25", quarter: "Q4", epsEst: "$10.48", epsActual: "$10.37", revenue: "TBD", consensus: "TBD", status: "Met", sector: "Semiconductors" },
    { company: "ASML", symbol: "ASML", date: "20/10/25", quarter: "Q3", epsEst: "$28.83", epsActual: "$26.10", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Semiconductors" },
    { company: "ARM Holdings", symbol: "ARM", date: "29/10/25", quarter: "Q2", epsEst: "$1.44", epsActual: "$2.25", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Semiconductors" },
    { company: "TSMC", symbol: "TSM", date: "17/10/25", quarter: "Q3", epsEst: "$11.06", epsActual: "$8.78", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Semiconductors" },
    { company: "Broadcom", symbol: "AVGO", date: "4/12/25", quarter: "Q4", epsEst: "$6.46", epsActual: "$1.23", revenue: "$51.57B", consensus: "TBD", status: "Pending", sector: "Semiconductors" },
    { company: "Marvell Technology", symbol: "MRVL", date: "28/8/25", quarter: "Q2", epsEst: "$1.77", epsActual: "$0.67", revenue: "$2.01B", consensus: "$2.01B", status: "Met", sector: "Semiconductors" },
    
    // Software - XLK
    { company: "Microsoft", symbol: "MSFT", date: "29/10/25", quarter: "Q1", epsEst: "$15.51", epsActual: "$13.64", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Software Infrastructure" },
    { company: "Oracle", symbol: "ORCL", date: "9/9/25", quarter: "Q1", epsEst: "$6.54", epsActual: "$1.47", revenue: "$15.04B", consensus: "$13.30B", status: "Beat", sector: "Software Infrastructure" },
    { company: "Adobe", symbol: "ADBE", date: "11/12/25", quarter: "Q4", epsEst: "$18.70", epsActual: "$5.31", revenue: "$5.99B", consensus: "$5.91B", status: "Beat", sector: "Software Infrastructure" },
    { company: "CrowdStrike", symbol: "CRWD", date: "27/8/25", quarter: "Q2", epsEst: "$0.41", epsActual: "$0.93", revenue: "$1.17B", consensus: "$1.15B", status: "Beat", sector: "Software Application" },
    { company: "Palantir", symbol: "PLTR", date: "3/11/25", quarter: "Q3", epsEst: "$0.59", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Software Application" },
    { company: "ServiceNow", symbol: "NOW", date: "22/10/25", quarter: "Q3", epsEst: "$10.89", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Software Application" },
    { company: "Salesforce", symbol: "CRM", date: "3/9/25", quarter: "Q2", epsEst: "$8.41", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Software Application" },
    { company: "Snowflake", symbol: "SNOW", date: "26/11/25", quarter: "Q3", epsEst: "-$3.69", epsActual: "$0.35", revenue: "$1.14B", consensus: "$1.09B", status: "Beat", sector: "Software Application" },
    
    // Communication Services - XLC
    { company: "Alphabet (Google)", symbol: "GOOG", date: "22/10/25", quarter: "Q3", epsEst: "$10.64", epsActual: "$2.31", revenue: "$96.43B", consensus: "$94.04B", status: "Beat", sector: "Internet Content" },
    { company: "Meta Platforms", symbol: "META", date: "TBD", quarter: "Q2", epsEst: "TBD", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Internet Content" },
    { company: "Netflix", symbol: "NFLX", date: "16/10/25", quarter: "Q3", epsEst: "$32.28", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Entertainment" },
    
    // Consumer Electronics - XLY
    { company: "Apple", symbol: "AAPL", date: "30/10/25", quarter: "Q4", epsEst: "$7.95", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Consumer Electronics" },
    { company: "Dell Technologies", symbol: "DELL", date: "28/8/25", quarter: "Q2", epsEst: "$7.53", epsActual: "$2.32", revenue: "$29.78B", consensus: "$29.02B", status: "Beat", sector: "Computer Hardware" },
    { company: "Cisco Systems", symbol: "CSCO", date: "13/8/25", quarter: "Q4", epsEst: "$2.91", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Computer Equipment" },
    { company: "IBM", symbol: "IBM", date: "21/10/25", quarter: "Q3", epsEst: "$10.36", epsActual: "TBD", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "IT Services" },
    
    // Healthcare - XLV
    { company: "Johnson & Johnson", symbol: "JNJ", date: "15/10/25", quarter: "Q3", epsEst: "$10.04", epsActual: "$2.29", revenue: "$23.74B", consensus: "$22.85B", status: "Beat", sector: "Drug Manufacturers" },
    { company: "AbbVie", symbol: "ABBV", date: "30/10/25", quarter: "Q3", epsEst: "$9.05", epsActual: "$0.52", revenue: "$15.42B", consensus: "$15.03B", status: "Beat", sector: "Drug Manufacturers" },
    
    // Financials - XLF
    { company: "JPMorgan Chase", symbol: "JPM", date: "14/10/25", quarter: "Q3", epsEst: "$20.13", epsActual: "$5.07", revenue: "$46.43B", consensus: "$45.47B", status: "Beat", sector: "Bank Diversified" },
    { company: "Goldman Sachs", symbol: "GS", date: "15/10/25", quarter: "Q3", epsEst: "$52.91", epsActual: "$10.91", revenue: "$14.58B", consensus: "$13.51B", status: "Beat", sector: "Capital Markets" },
    { company: "Morgan Stanley", symbol: "MS", date: "15/10/25", quarter: "Q3", epsEst: "$9.64", epsActual: "$7.95", revenue: "$61.76B", consensus: "$60.48B", status: "Beat", sector: "Capital Markets" },
    
    // Industrials - XLI
    { company: "General Electric", symbol: "GE", date: "16/10/25", quarter: "Q3", epsEst: "$7.34", epsActual: "$1.01", revenue: "$11.14B", consensus: "$11.09B", status: "Beat", sector: "Aerospace" },
    { company: "Delta Air Lines", symbol: "DAL", date: "9/10/25", quarter: "Q3", epsEst: "$6.99", epsActual: "$3.27", revenue: "$15.51B", consensus: "$15.46B", status: "Beat", sector: "Airline" },
    
    // Consumer Staples - XLP
    { company: "Costco", symbol: "COST", date: "TBD", quarter: "Q1", epsEst: "$20.21", epsActual: "$5.87", revenue: "$86.16B", consensus: "$58.84B", status: "Beat", sector: "Discount Stores" },
    
    // Materials - XLB
    { company: "Linde", symbol: "LIN", date: "31/10/25", quarter: "Q3", epsEst: "$16.61", epsActual: "$14.07", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Specialty Chemicals" },
    { company: "Air Products", symbol: "APD", date: "30/10/25", quarter: "Q4", epsEst: "$12.82", epsActual: "$6.96", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Specialty Chemicals" },
    { company: "Ecolab", symbol: "ECL", date: "28/10/25", quarter: "Q3", epsEst: "$8.36", epsActual: "$7.48", revenue: "TBD", consensus: "TBD", status: "Pending", sector: "Specialty Chemicals" },
];

/**
 * Parse date string (format: DD/MM/YY or similar)
 */
function parseEarningsDate(dateStr) {
    if (!dateStr || dateStr === 'TBD') return 'TBD';
    
    // Try to parse various date formats
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        let year = parts[2];
        
        // Handle 2-digit year
        if (year.length === 2) {
            year = '20' + year;
        }
        
        return `${year}-${month}-${day}`;
    }
    
    return dateStr;
}

/**
 * Get status class for styling
 */
function getStatusClass(status) {
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
 * Populate earnings table
 */
function populateEarningsTable() {
    const tableBody = document.getElementById('earningsTableBody');
    if (!tableBody) {
        console.warn('[Earnings] Table body not found');
        return;
    }
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Sort by date (most recent first)
    const sortedData = [...earningsData].sort((a, b) => {
        const dateA = new Date(parseEarningsDate(a.date));
        const dateB = new Date(parseEarningsDate(b.date));
        return dateB - dateA;
    });
    
    // Populate table
    sortedData.forEach(earning => {
        const tr = document.createElement('tr');
        
        // Company
        const companyCell = document.createElement('td');
        companyCell.textContent = earning.company;
        tr.appendChild(companyCell);
        
        // Symbol
        const symbolCell = document.createElement('td');
        symbolCell.innerHTML = `<strong>${earning.symbol}</strong>`;
        tr.appendChild(symbolCell);
        
        // Date
        const dateCell = document.createElement('td');
        const parsedDate = parseEarningsDate(earning.date);
        if (parsedDate !== 'TBD') {
            const date = new Date(parsedDate);
            dateCell.textContent = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            dateCell.textContent = 'TBD';
        }
        tr.appendChild(dateCell);
        
        // EPS Estimate
        const epsEstCell = document.createElement('td');
        epsEstCell.textContent = earning.epsEst;
        tr.appendChild(epsEstCell);
        
        // EPS Actual
        const epsActualCell = document.createElement('td');
        epsActualCell.textContent = earning.epsActual;
        tr.appendChild(epsActualCell);
        
        // Revenue
        const revenueCell = document.createElement('td');
        revenueCell.textContent = earning.revenue;
        tr.appendChild(revenueCell);
        
        // Status
        const statusCell = document.createElement('td');
        const statusClass = getStatusClass(earning.status);
        statusCell.innerHTML = `<span class="${statusClass}">${earning.status}</span>`;
        tr.appendChild(statusCell);
        
        tableBody.appendChild(tr);
    });
    
    console.log('[Earnings] Table populated with', sortedData.length, 'entries');
}

/**
 * Get upcoming earnings count
 */
function getUpcomingEarningsCount() {
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return earningsData.filter(earning => {
        if (earning.status !== 'Pending') return false;
        const parsedDate = parseEarningsDate(earning.date);
        if (parsedDate === 'TBD') return false;
        
        const earningDate = new Date(parsedDate);
        return earningDate >= today && earningDate <= oneWeekFromNow;
    }).length;
}

/**
 * Update earnings stats in sidebar
 */
function updateEarningsStats() {
    const upcomingCount = getUpcomingEarningsCount();
    
    // Update the upcoming earnings stat by ID
    const countElement = document.getElementById('upcomingEarningsCount');
    if (countElement) {
        countElement.textContent = upcomingCount;
        console.log('[Earnings] Updated upcoming earnings count to:', upcomingCount);
    }
    
    // Also get total pending earnings for additional context
    const totalPending = earningsData.filter(e => e.status === 'Pending').length;
    console.log('[Earnings] Total pending earnings:', totalPending);
}

/**
 * Initialize earnings data
 */
function initEarningsData() {
    console.log('[Earnings] Initializing with', earningsData.length, 'entries');
    populateEarningsTable();
    updateEarningsStats();
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEarningsData);
} else {
    initEarningsData();
}

/**
 * Get upcoming earnings with details
 */
function getUpcomingEarningsDetails() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = earningsData.filter(earning => {
        if (earning.status !== 'Pending') return false;
        const parsedDate = parseEarningsDate(earning.date);
        if (parsedDate === 'TBD') return false;
        
        const earningDate = new Date(parsedDate);
        earningDate.setHours(0, 0, 0, 0);
        return earningDate >= today && earningDate <= oneWeekFromNow;
    });
    
    // Sort by date
    return upcoming.sort((a, b) => {
        const dateA = new Date(parseEarningsDate(a.date));
        const dateB = new Date(parseEarningsDate(b.date));
        return dateA - dateB;
    });
}

/**
 * Open upcoming earnings modal
 */
function openUpcomingEarningsModal() {
    const modal = document.getElementById('upcomingEarningsModal');
    const content = document.getElementById('upcomingEarningsContent');
    
    if (!modal || !content) return;
    
    const upcomingEarnings = getUpcomingEarningsDetails();
    
    if (upcomingEarnings.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--color-info-dark);">
                <span class="material-icons-sharp" style="font-size: 4rem; opacity: 0.3;">event_busy</span>
                <h3 style="margin-top: 1rem;">No Upcoming Earnings This Week</h3>
                <p>Check back later for updates on upcoming earnings reports.</p>
            </div>
        `;
    } else {
        // Group by date
        const groupedByDate = {};
        upcomingEarnings.forEach(earning => {
            const parsedDate = parseEarningsDate(earning.date);
            const dateObj = new Date(parsedDate);
            const dateKey = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
            
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = [];
            }
            groupedByDate[dateKey].push(earning);
        });
        
        let html = `
            <div style="margin-bottom: 1rem; padding: 1rem; background: var(--color-light); border-radius: 0.5rem;">
                <h3 style="margin: 0; color: var(--color-primary);">
                    <span class="material-icons-sharp" style="vertical-align: middle; font-size: 1.2rem;">info</span>
                    ${upcomingEarnings.length} companies reporting this week
                </h3>
            </div>
        `;
        
        Object.keys(groupedByDate).forEach(dateKey => {
            const earnings = groupedByDate[dateKey];
            
            html += `
                <div style="margin-bottom: 2rem;">
                    <h3 style="padding: 0.75rem 1rem; background: var(--color-primary); color: white; border-radius: 0.5rem; margin-bottom: 1rem;">
                        <span class="material-icons-sharp" style="vertical-align: middle; margin-right: 0.5rem;">calendar_today</span>
                        ${dateKey}
                    </h3>
                    <div style="display: grid; gap: 1rem;">
            `;
            
            earnings.forEach(earning => {
                html += `
                    <div style="border: 1px solid var(--color-light); border-radius: 0.5rem; padding: 1rem; background: var(--color-white); transition: transform 0.2s, box-shadow 0.2s;" 
                         onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)';"
                         onmouseout="this.style.transform=''; this.style.boxShadow='';">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                            <div style="flex: 1;">
                                <h4 style="margin: 0 0 0.25rem 0; font-size: 1.1rem; color: var(--color-dark);">
                                    ${earning.company}
                                </h4>
                                <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
                                    <span style="font-weight: 600; color: var(--color-primary); font-size: 1rem;">
                                        ${earning.symbol}
                                    </span>
                                    <span class="text-muted" style="font-size: 0.9rem;">
                                        ${earning.sector}
                                    </span>
                                    <span style="background: var(--color-light); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.85rem;">
                                        ${earning.quarter}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-light);">
                            <div>
                                <small class="text-muted" style="display: block; margin-bottom: 0.25rem;">EPS Estimate</small>
                                <strong style="font-size: 1.1rem; color: var(--color-dark);">${earning.epsEst}</strong>
                            </div>
                            <div>
                                <small class="text-muted" style="display: block; margin-bottom: 0.25rem;">Expected Revenue</small>
                                <strong style="font-size: 1.1rem; color: var(--color-dark);">${earning.revenue !== 'TBD' ? earning.revenue : 'To Be Determined'}</strong>
                            </div>
                            <div>
                                <small class="text-muted" style="display: block; margin-bottom: 0.25rem;">Consensus</small>
                                <strong style="font-size: 1.1rem; color: var(--color-dark);">${earning.consensus !== 'TBD' ? earning.consensus : 'N/A'}</strong>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        content.innerHTML = html;
    }
    
    // Show modal
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
}

/**
 * Close upcoming earnings modal
 */
function closeUpcomingEarningsModal() {
    const modal = document.getElementById('upcomingEarningsModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Make functions globally available
window.openUpcomingEarningsModal = openUpcomingEarningsModal;
window.closeUpcomingEarningsModal = closeUpcomingEarningsModal;

// Export for external use
window.EarningsData = {
    data: earningsData,
    populate: populateEarningsTable,
    updateStats: updateEarningsStats,
    getUpcoming: getUpcomingEarningsCount,
    getUpcomingDetails: getUpcomingEarningsDetails
};
