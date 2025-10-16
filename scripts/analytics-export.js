/**
 * Analytics Export Service
 * Handles data export functionality for reports and analytics
 * @version 2.0.0
 */

const AnalyticsExport = {
    
    /**
     * Export data to CSV format
     * @param {Array<object>} data - Array of data objects
     * @param {string} filename - Output filename
     * @param {Array<string>} columns - Column headers (optional)
     * @returns {void}
     */
    exportToCSV(data, filename, columns = null) {
        try {
            if (!data || data.length === 0) {
                throw new Error('No data to export');
            }

            // Get columns from first object if not provided
            const headers = columns || Object.keys(data[0]);
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            data.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    const stringValue = value !== null && value !== undefined ? String(value) : '';
                    return stringValue.includes(',') || stringValue.includes('"') 
                        ? `"${stringValue.replace(/"/g, '""')}"` 
                        : stringValue;
                });
                csvContent += values.join(',') + '\n';
            });
            
            // Create and download file
            this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
            
            console.log('CSV export successful:', filename);
        } catch (error) {
            ErrorHandler.handle(error, 'AnalyticsExport.exportToCSV', 'medium');
        }
    },
    
    /**
     * Export data to JSON format
     * @param {object|Array} data - Data to export
     * @param {string} filename - Output filename
     * @param {boolean} pretty - Whether to format JSON
     * @returns {void}
     */
    exportToJSON(data, filename, pretty = true) {
        try {
            if (!data) {
                throw new Error('No data to export');
            }

            const jsonContent = pretty 
                ? JSON.stringify(data, null, 2)
                : JSON.stringify(data);
            
            this.downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
            
            console.log('JSON export successful:', filename);
        } catch (error) {
            ErrorHandler.handle(error, 'AnalyticsExport.exportToJSON', 'medium');
        }
    },
    
    /**
     * Export chart as image
     * @param {object} chartInstance - ApexCharts instance
     * @param {string} filename - Output filename
     * @param {string} format - Image format (png, svg)
     * @returns {Promise<void>}
     */
    async exportChartAsImage(chartInstance, filename, format = 'png') {
        try {
            if (!chartInstance) {
                throw new Error('No chart instance provided');
            }

            // Use ApexCharts built-in export
            if (format === 'svg') {
                await chartInstance.dataURI().then(({ imgURI }) => {
                    this.downloadDataURI(imgURI, filename);
                });
            } else {
                await chartInstance.dataURI().then(({ imgURI }) => {
                    this.downloadDataURI(imgURI, filename);
                });
            }
            
            console.log('Chart export successful:', filename);
        } catch (error) {
            ErrorHandler.handle(error, 'AnalyticsExport.exportChartAsImage', 'medium');
        }
    },
    
    /**
     * Export table to Excel format (XLSX)
     * Uses CSV with .xlsx extension for Excel compatibility
     * @param {Array<object>} data - Table data
     * @param {string} filename - Output filename
     * @param {string} sheetName - Worksheet name
     * @returns {void}
     */
    exportToExcel(data, filename, sheetName = 'Sheet1') {
        try {
            // For now, use CSV format with .xlsx extension
            // In production, use a library like SheetJS for true XLSX format
            this.exportToCSV(data, filename.replace('.csv', '.xlsx'));
            
            console.log('Excel export successful:', filename);
            console.warn('Note: Using CSV format. For true XLSX, integrate SheetJS library.');
        } catch (error) {
            ErrorHandler.handle(error, 'AnalyticsExport.exportToExcel', 'medium');
        }
    },
    
    /**
     * Generate PDF report
     * @param {object} options - Report options
     * @returns {void}
     */
    exportToPDF(options = {}) {
        try {
            const {
                title = 'Trading Dashboard Report',
                data = [],
                charts = [],
                filename = 'report.pdf'
            } = options;

            // Note: This requires a PDF library like jsPDF
            console.warn('PDF export requires jsPDF library');
            console.log('PDF export options:', { title, dataRows: data.length, charts: charts.length });
            
            // For now, export as formatted HTML that can be printed to PDF
            const htmlContent = this.generatePrintableHTML(title, data, charts);
            
            // Open print dialog
            const printWindow = window.open('', '_blank');
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
            
        } catch (error) {
            ErrorHandler.handle(error, 'AnalyticsExport.exportToPDF', 'medium');
        }
    },
    
    /**
     * Generate printable HTML for reports
     * @param {string} title - Report title
     * @param {Array} data - Report data
     * @param {Array} charts - Chart images
     * @returns {string} HTML content
     */
    generatePrintableHTML(title, data, charts) {
        const date = new Date().toLocaleDateString();
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    .date { color: #666; margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .chart { margin: 20px 0; page-break-inside: avoid; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <h1>${title}</h1>
                <div class="date">Generated: ${date}</div>
                <button class="no-print" onclick="window.print()">Print / Save as PDF</button>
                ${this.generateDataTable(data)}
                ${charts.map(chart => `<div class="chart"><img src="${chart}" /></div>`).join('')}
            </body>
            </html>
        `;
    },
    
    /**
     * Generate HTML table from data
     * @param {Array<object>} data - Table data
     * @returns {string} HTML table
     */
    generateDataTable(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        
        return `
            <table>
                <thead>
                    <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.map(row => `
                        <tr>${headers.map(h => `<td>${row[h]}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },
    
    /**
     * Download file to user's computer
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     * @returns {void}
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        this.downloadURL(url, filename);
        URL.revokeObjectURL(url);
    },
    
    /**
     * Download data URI
     * @param {string} dataURI - Data URI
     * @param {string} filename - File name
     * @returns {void}
     */
    downloadDataURI(dataURI, filename) {
        const link = document.createElement('a');
        link.href = dataURI;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * Download from URL
     * @param {string} url - URL to download
     * @param {string} filename - File name
     * @returns {void}
     */
    downloadURL(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
    
    /**
     * Export current orders to CSV
     * @returns {void}
     */
    exportOrders() {
        if (typeof Orders === 'undefined') {
            console.warn('Orders data not available');
            return;
        }
        
        const filename = `orders_${this.getDateString()}.csv`;
        this.exportToCSV(Orders, filename);
    },
    
    /**
     * Export market data to CSV
     * @param {Array} data - Market data
     * @returns {void}
     */
    exportMarketData(data) {
        if (!data) {
            console.warn('No market data to export');
            return;
        }
        
        const filename = `market_data_${this.getDateString()}.csv`;
        this.exportToCSV(data, filename);
    },
    
    /**
     * Export portfolio summary
     * @param {object} portfolio - Portfolio data
     * @returns {void}
     */
    exportPortfolioSummary(portfolio) {
        if (!portfolio) {
            console.warn('No portfolio data to export');
            return;
        }
        
        const filename = `portfolio_${this.getDateString()}.json`;
        this.exportToJSON(portfolio, filename);
    },
    
    /**
     * Get formatted date string for filenames
     * @returns {string} Date string (YYYYMMDD)
     */
    getDateString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    },
    
    /**
     * Get formatted datetime string for filenames
     * @returns {string} Datetime string (YYYYMMDD_HHMMSS)
     */
    getDateTimeString() {
        const now = new Date();
        const dateStr = this.getDateString();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${dateStr}_${hours}${minutes}${seconds}`;
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsExport;
}
