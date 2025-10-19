/**
 * Institutional Order Flow CSV Viewer
 * Handles loading and displaying institutional order flow data from CSV
 */

class InstitutionalOrderFlowViewer {
    constructor() {
        this.csvData = null;
        this.parsedData = null;
    }

    /**
     * Load and parse the CSV file
     */
    async loadCSVData() {
        try {
            const response = await fetch('../INSTITUTIONAL ORDERFLOW 2024 - INUSTRY 2025.csv');
            if (!response.ok) {
                throw new Error('Failed to load CSV file');
            }
            const csvText = await response.text();
            this.csvData = csvText;
            this.parsedData = this.parseCSV(csvText);
            return this.parsedData;
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    /**
     * Parse CSV text into structured data
     */
    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        
        // First two rows contain header information
        const sectorRow = lines[0].split(',');
        const categoryRow = lines[1].split(',');
        
        // Get headers starting from row 2 (index 1)
        const headers = categoryRow.map((header, index) => {
            const sector = sectorRow[index]?.trim() || '';
            const category = header?.trim() || '';
            return {
                sector,
                category,
                fullName: category || sector || `Column ${index}`
            };
        });

        // Parse data rows (starting from row 3, index 2)
        const dataRows = [];
        for (let i = 2; i < lines.length; i++) {
            const row = this.parseCSVLine(lines[i]);
            if (row.length > 0 && row[0]) {
                dataRows.push(row);
            }
        }

        return {
            headers,
            rows: dataRows
        };
    }

    /**
     * Parse a single CSV line, handling quoted values
     */
    parseCSVLine(line) {
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
     * Format cell value with appropriate styling
     */
    formatCellValue(value, columnIndex) {
        if (!value || value === '') {
            return '<span style="color: var(--color-info-dark);">—</span>';
        }

        // First column is date
        if (columnIndex === 0) {
            return `<strong>${this.escapeHtml(value)}</strong>`;
        }

        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            // Determine color based on value
            let color = 'var(--color-dark)';
            let indicator = '';
            
            if (numValue > 0) {
                color = 'var(--color-success)';
                indicator = '▲';
            } else if (numValue < 0) {
                color = 'var(--color-danger)';
                indicator = '▼';
            }

            return `<span style="color: ${color}; font-weight: 600;">
                ${indicator} ${Math.abs(numValue).toFixed(2)}%
            </span>`;
        }

        return this.escapeHtml(value);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate HTML table from parsed data
     */
    generateTableHTML() {
        if (!this.parsedData) {
            return '<p style="text-align: center; padding: 2rem; color: var(--color-danger);">No data available</p>';
        }

        const { headers, rows } = this.parsedData;

        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">';
        
        // Generate header with sectors and categories
        html += '<thead style="position: sticky; top: 0; z-index: 10;">';
        
        // Sector row
        html += '<tr style="background: var(--color-primary); color: white;">';
        let currentSector = '';
        let sectorColspan = 0;
        
        headers.forEach((header, index) => {
            if (header.sector && header.sector !== currentSector) {
                if (sectorColspan > 0) {
                    html += `<th colspan="${sectorColspan}" style="padding: 0.5rem; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 700;">${this.escapeHtml(currentSector)}</th>`;
                }
                currentSector = header.sector;
                sectorColspan = 1;
            } else {
                sectorColspan++;
            }
            
            // Last column
            if (index === headers.length - 1 && sectorColspan > 0) {
                html += `<th colspan="${sectorColspan}" style="padding: 0.5rem; text-align: center; border: 1px solid rgba(255,255,255,0.2); font-weight: 700;">${this.escapeHtml(currentSector || 'Data')}</th>`;
            }
        });
        html += '</tr>';
        
        // Category row
        html += '<tr style="background: var(--color-primary-variant); color: white;">';
        headers.forEach((header, index) => {
            const title = header.category || header.sector || `Col ${index}`;
            html += `<th style="padding: 0.75rem 0.5rem; text-align: left; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; font-size: 0.8rem; min-width: ${index === 0 ? '120px' : '90px'};">
                ${this.escapeHtml(title)}
            </th>`;
        });
        html += '</tr>';
        
        html += '</thead>';
        
        // Generate body rows
        html += '<tbody>';
        rows.forEach((row, rowIndex) => {
            const bgColor = rowIndex % 2 === 0 ? 'var(--color-light)' : 'transparent';
            html += `<tr style="background: ${bgColor};" onmouseover="this.style.background='rgba(45, 108, 223, 0.1)'" onmouseout="this.style.background='${bgColor}'">`;
            
            row.forEach((cell, colIndex) => {
                html += `<td style="padding: 0.75rem 0.5rem; border: 1px solid var(--color-light); white-space: nowrap; text-align: ${colIndex === 0 ? 'left' : 'center'};">
                    ${this.formatCellValue(cell, colIndex)}
                </td>`;
            });
            
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
        return html;
    }

    /**
     * Filter table based on search query
     */
    filterTable(searchQuery) {
        if (!this.parsedData) return;

        const tbody = document.querySelector('#orderFlowModal tbody');
        if (!tbody) return;

        const query = searchQuery.toLowerCase().trim();
        const rows = tbody.querySelectorAll('tr');

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
}

// Create global instance
window.orderFlowViewer = new InstitutionalOrderFlowViewer();

/**
 * Open the institutional order flow modal
 */
async function openOrderFlowModal() {
    const modal = document.getElementById('orderFlowModal');
    const content = document.getElementById('orderFlowContent');
    const loadingMessage = document.getElementById('orderFlowLoadingMessage');

    if (!modal) return;

    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);

    // Show loading state
    if (loadingMessage) loadingMessage.style.display = 'block';
    if (content) content.style.display = 'none';

    try {
        // Load data if not already loaded
        if (!window.orderFlowViewer.parsedData) {
            await window.orderFlowViewer.loadCSVData();
        }

        // Generate and display table
        const tableHTML = window.orderFlowViewer.generateTableHTML();
        if (content) {
            content.innerHTML = tableHTML;
            content.style.display = 'block';
        }
        if (loadingMessage) loadingMessage.style.display = 'none';

    } catch (error) {
        console.error('Error loading order flow data:', error);
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--color-danger);">
                    <span class="material-icons-sharp" style="font-size: 3rem;">error_outline</span>
                    <p style="margin-top: 1rem;">Failed to load order flow data</p>
                    <small>${error.message}</small>
                </div>
            `;
            content.style.display = 'block';
        }
        if (loadingMessage) loadingMessage.style.display = 'none';
    }
}

/**
 * Close the institutional order flow modal
 */
function closeOrderFlowModal() {
    const modal = document.getElementById('orderFlowModal');
    if (!modal) return;

    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        // Clear search
        const searchInput = document.getElementById('orderFlowSearch');
        if (searchInput) searchInput.value = '';
    }, 300);
}

/**
 * Filter the order flow table based on search input
 */
function filterOrderFlowTable(searchQuery) {
    window.orderFlowViewer.filterTable(searchQuery);
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('orderFlowModal');
        if (modal && modal.classList.contains('active')) {
            closeOrderFlowModal();
        }
    }
});
