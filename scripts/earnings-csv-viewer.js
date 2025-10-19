/**
 * Earnings CSV Viewer with Rainbow CSV column coloring
 */
class EarningsCSVViewer {
    constructor() {
        this.csvData = null;
        this.parsedData = null;
    }

    async loadCSVData() {
        try {
            const response = await fetch('../EARNINGS - Sheet20.csv');
            if (!response.ok) throw new Error('Failed to load CSV file');
            const csvText = await response.text();
            this.csvData = csvText;
            this.parsedData = this.parseCSV(csvText);
            return this.parsedData;
        } catch (error) {
            console.error('Error loading CSV:', error);
            throw error;
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        // Use first non-empty line as header
        let headerLineIdx = 0;
        while (headerLineIdx < lines.length && lines[headerLineIdx].replace(/,/g, '').trim() === '') headerLineIdx++;
        const headers = lines[headerLineIdx].split(',').map(h => h.trim());
        const dataRows = [];
        for (let i = headerLineIdx + 1; i < lines.length; i++) {
            const row = this.parseCSVLine(lines[i]);
            if (row.length > 0 && row.some(cell => cell)) dataRows.push(row);
        }
        return { headers, rows: dataRows };
    }

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

    formatCellValue(value, columnIndex) {
        if (!value || value === '') {
            return '<span style="color: var(--color-info-dark);">—</span>';
        }
        // Try to parse as number
        const numValue = parseFloat(value.replace(/[^\d.-]/g, ''));
        if (!isNaN(numValue)) {
            let color = 'var(--color-dark)';
            let indicator = '';
            if (numValue > 0) {
                color = 'var(--color-success)';
                indicator = '▲';
            } else if (numValue < 0) {
                color = 'var(--color-danger)';
                indicator = '▼';
            }
            return `<span style="color: ${color}; font-weight: 600;">${indicator} ${Math.abs(numValue).toFixed(2)}</span>`;
        }
        if (value === '#DIV/0!' || value === '#VALUE!') {
            return `<span style="color: var(--color-danger); font-weight: 600;">${this.escapeHtml(value)}</span>`;
        }
        return this.escapeHtml(value);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateTableHTML() {
        if (!this.parsedData) {
            return '<p style="text-align: center; padding: 2rem; color: var(--color-danger);">No data available</p>';
        }
        const { headers, rows } = this.parsedData;
        const rainbowColors = [
            '#ffe4e1', '#e0ffff', '#fffacd', '#e6e6fa', '#f0fff0', '#f5f5dc', '#f0f8ff', '#ffe4b5', '#e0ebeb', '#f8f8ff',
            '#f5e6ff', '#e1ffe4', '#e1e4ff', '#fff0f5', '#e4ffe1', '#e1fff4', '#f4e1ff', '#e1f4ff', '#f4ffe1', '#e1fff4',
            '#f4e1e1', '#e1f4e1', '#e1e1f4', '#f4f4e1', '#e1f4f4', '#f4e1f4', '#e1f4e1', '#f4e1e1', '#e1e1f4', '#f4f4e1',
        ];
        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">';
        html += '<thead style="position: sticky; top: 0; z-index: 10;">';
        html += '<tr>';
        headers.forEach((header, index) => {
            html += `<th style="padding: 0.75rem 0.5rem; text-align: left; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; font-size: 0.8rem; min-width: 90px; background: ${rainbowColors[index % rainbowColors.length]};">${this.escapeHtml(header)}</th>`;
        });
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        rows.forEach((row, rowIndex) => {
            html += `<tr>`;
            row.forEach((cell, colIndex) => {
                html += `<td style="padding: 0.75rem 0.5rem; border: 1px solid var(--color-light); white-space: nowrap; text-align: center; background: ${rainbowColors[colIndex % rainbowColors.length]};">${this.formatCellValue(cell, colIndex)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        html += '</table>';
        return html;
    }

    filterTable(searchQuery) {
        if (!this.parsedData) return;
        const tbody = document.querySelector('#earningsCSVModal tbody');
        if (!tbody) return;
        const query = searchQuery.toLowerCase().trim();
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(query) ? '' : 'none';
        });
    }
}
window.earningsCSVViewer = new EarningsCSVViewer();
async function openEarningsCSVModal() {
    const modal = document.getElementById('earningsCSVModal');
    const content = document.getElementById('earningsCSVContent');
    const loadingMessage = document.getElementById('earningsCSVLoadingMessage');
    if (!modal) return;
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
    if (loadingMessage) loadingMessage.style.display = 'block';
    if (content) content.style.display = 'none';
    try {
        if (!window.earningsCSVViewer.parsedData) {
            await window.earningsCSVViewer.loadCSVData();
        }
        const tableHTML = window.earningsCSVViewer.generateTableHTML();
        if (content) {
            content.innerHTML = tableHTML;
            content.style.display = 'block';
        }
        if (loadingMessage) loadingMessage.style.display = 'none';
    } catch (error) {
        console.error('Error loading earnings CSV:', error);
        if (content) {
            content.innerHTML = `<div style=\"text-align: center; padding: 3rem; color: var(--color-danger);\"><span class=\"material-icons-sharp\" style=\"font-size: 3rem;\">error_outline</span><p style=\"margin-top: 1rem;\">Failed to load earnings data</p><small>${error.message}</small></div>`;
            content.style.display = 'block';
        }
        if (loadingMessage) loadingMessage.style.display = 'none';
    }
}
function closeEarningsCSVModal() {
    const modal = document.getElementById('earningsCSVModal');
    if (!modal) return;
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        const searchInput = document.getElementById('earningsCSVSearch');
        if (searchInput) searchInput.value = '';
    }, 300);
}
function filterEarningsCSVTable(searchQuery) {
    window.earningsCSVViewer.filterTable(searchQuery);
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('earningsCSVModal');
        if (modal && modal.classList.contains('active')) {
            closeEarningsCSVModal();
        }
    }
});
