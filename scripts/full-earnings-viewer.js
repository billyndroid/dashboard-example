/**
 * Full Earnings CSV Viewer
 * Loads and displays the complete earnings CSV data
 */

let fullEarningsCSVData = [];

/**
 * Open full earnings modal and load CSV data
 */
async function openFullEarningsModal() {
    const modal = document.getElementById('fullEarningsModal');
    const loadingMessage = document.getElementById('earningsLoadingMessage');
    const tableContainer = document.getElementById('fullEarningsContent');
    
    if (!modal) return;
    
    // Show modal
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.style.overflow = 'hidden';
    
    // Show loading state
    if (loadingMessage) loadingMessage.style.display = 'block';
    if (tableContainer) tableContainer.style.display = 'none';
    
    // Load CSV data if not already loaded
    if (fullEarningsCSVData.length === 0) {
        try {
            await loadEarningsCSV();
        } catch (error) {
            console.error('[Full Earnings] Error loading CSV:', error);
            if (loadingMessage) {
                loadingMessage.innerHTML = `
                    <span class="material-icons-sharp" style="font-size: 3rem; color: var(--color-danger);">error</span>
                    <p style="margin-top: 1rem; color: var(--color-danger);">Failed to load earnings data</p>
                    <p style="font-size: 0.9rem; color: var(--color-info-dark);">${error.message}</p>
                `;
            }
            return;
        }
    }
    
    // Display data
    displayFullEarningsData();
    
    // Hide loading, show table
    if (loadingMessage) loadingMessage.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'block';
}

/**
 * Load earnings CSV file
 */
async function loadEarningsCSV() {
    try {
        const response = await fetch('../EARNINGS - Sheet20.csv');
        if (!response.ok) {
            throw new Error('Failed to fetch CSV file');
        }
        
        const csvText = await response.text();
        fullEarningsCSVData = parseCSV(csvText);
        console.log('[Full Earnings] CSV loaded:', fullEarningsCSVData.length, 'rows');
    } catch (error) {
        console.error('[Full Earnings] Error loading CSV:', error);
        throw error;
    }
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const data = [];
    
    // Skip first 3 header rows (metadata), use row 4 as column headers
    const headerLine = lines[3];
    if (!headerLine) return data;
    
    const headers = parseCSVLine(headerLine);
    
    // Parse data rows (starting from line 5)
    for (let i = 4; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = parseCSVLine(line);
        if (values.length < headers.length) continue;
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        // Only include rows with stock symbols
        if (row.STOCK && row.STOCK.trim() !== '') {
            data.push(row);
        }
    }
    
    return data;
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Display full earnings data in table
 */
function displayFullEarningsData() {
    const tbody = document.getElementById('fullEarningsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    fullEarningsCSVData.forEach(row => {
        const tr = document.createElement('tr');
        
        // Key columns to display
        const columns = ['Sector', 'Industry', 'DATE', 'STOCK', 'Country', 'Quarter', 'CEO', 'Market Cap', 'Upgrades Downgrades', 'Stock price', 'Forward EPS', 'Current PE RATIO', 'EPS', 'Rev', 'Future Guidance', 'ROE'];
        
        columns.forEach(col => {
            const td = document.createElement('td');
            let value = row[col] || '--';
            
            // Clean up display values
            if (value === '#DIV/0!' || value === '#VALUE!') {
                value = '--';
            }
            
            // Add tooltip/modal for cells with detailed notes
            let hasNote = false;
            let noteContent = '';
            
            // Check for Upgrades/Downgrades notes
            if (col === 'Upgrades Downgrades' && value !== '--' && value !== '') {
                hasNote = true;
                noteContent = `<strong>Analyst Ratings & Price Targets:</strong><br>${value}`;
            }
            
            // Check for Future Guidance notes
            if (col === 'Future Guidance' && value !== '--' && value !== '' && value.length > 50) {
                hasNote = true;
                noteContent = `<strong>Company Forward Guidance:</strong><br>${value}`;
            }
            
            // Highlight certain values
            if (col === 'STOCK') {
                td.innerHTML = `<strong style="color: var(--color-primary);">${value}</strong>`;
            } else if (col === 'EPS' && value !== '--') {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                    const color = numValue >= 0 ? 'var(--color-success)' : 'var(--color-danger)';
                    td.innerHTML = `<span style="color: ${color}; font-weight: 600;">${value}</span>`;
                } else {
                    td.textContent = value;
                }
            } else if (hasNote) {
                // Add hover functionality for cells with notes
                const displayValue = value.length > 30 ? value.substring(0, 30) + '...' : value;
                td.innerHTML = `
                    <div class="cell-with-note" style="position: relative; cursor: help; padding: 0.25rem; border-radius: 0.25rem; transition: background 0.2s;">
                        <span style="display: inline-flex; align-items: center; gap: 0.25rem;">
                            ${displayValue}
                            <span class="material-icons-sharp" style="font-size: 0.9rem; color: var(--color-info-dark);">info</span>
                        </span>
                        <div class="note-tooltip" style="display: none; position: absolute; left: 50%; transform: translateX(-50%); bottom: 100%; margin-bottom: 0.5rem; background: white; border: 2px solid var(--color-primary); border-radius: 0.5rem; padding: 1rem; min-width: 300px; max-width: 500px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; text-align: left; white-space: normal;">
                            <div style="font-size: 0.9rem; line-height: 1.5; color: var(--color-dark);">
                                ${noteContent}
                            </div>
                            <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid var(--color-primary);"></div>
                        </div>
                    </div>
                `;
            } else {
                td.textContent = value;
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    // Add hover event listeners for notes
    addNoteHoverListeners();
    
    console.log('[Full Earnings] Displayed', fullEarningsCSVData.length, 'rows');
}

/**
 * Add hover event listeners for note tooltips
 */
function addNoteHoverListeners() {
    const noteCells = document.querySelectorAll('.cell-with-note');
    
    noteCells.forEach(cell => {
        cell.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(45, 108, 223, 0.1)';
            const tooltip = this.querySelector('.note-tooltip');
            if (tooltip) {
                tooltip.style.display = 'block';
                
                // Adjust position if tooltip goes off screen
                const rect = tooltip.getBoundingClientRect();
                if (rect.left < 0) {
                    tooltip.style.left = '0';
                    tooltip.style.transform = 'none';
                } else if (rect.right > window.innerWidth) {
                    tooltip.style.left = 'auto';
                    tooltip.style.right = '0';
                    tooltip.style.transform = 'none';
                }
            }
        });
        
        cell.addEventListener('mouseleave', function() {
            this.style.background = '';
            const tooltip = this.querySelector('.note-tooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        });
    });
    
    console.log('[Full Earnings] Added hover listeners to', noteCells.length, 'note cells');
}

/**
 * Filter earnings table by search term
 */
function filterEarningsTable(searchTerm) {
    const tbody = document.getElementById('fullEarningsTableBody');
    if (!tbody) return;
    
    const term = searchTerm.toLowerCase();
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        if (text.includes(term)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    }
}

/**
 * Close full earnings modal
 */
function closeFullEarningsModal() {
    const modal = document.getElementById('fullEarningsModal');
    const searchInput = document.getElementById('earningsSearch');
    
    if (!modal) return;
    
    // Clear search
    if (searchInput) {
        searchInput.value = '';
        filterEarningsTable('');
    }
    
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Make functions globally available
window.openFullEarningsModal = openFullEarningsModal;
window.closeFullEarningsModal = closeFullEarningsModal;
window.filterEarningsTable = filterEarningsTable;

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('fullEarningsModal');
        if (modal && modal.style.display === 'block') {
            closeFullEarningsModal();
        }
    }
});
