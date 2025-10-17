/**
 * Position Details Modal
 * Displays comprehensive information about trading positions
 * with smooth animations and accessibility features
 */

class PositionModal {
    constructor() {
        this.modal = document.getElementById('positionModal');
        this.overlay = this.modal?.querySelector('.modal-overlay');
        this.closeBtn = this.modal?.querySelector('.modal-close');
        this.currentPosition = null;
        
        this.init();
    }

    init() {
        if (!this.modal) return;

        // Close button click
        this.closeBtn?.addEventListener('click', () => this.close());

        // Overlay click to close
        this.overlay?.addEventListener('click', () => this.close());

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });

        // Modal action buttons
        const editBtn = document.getElementById('modalEditBtn');
        const closePositionBtn = document.getElementById('modalClosePositionBtn');

        editBtn?.addEventListener('click', () => this.handleEdit());
        closePositionBtn?.addEventListener('click', () => this.handleClosePosition());

        // Prevent modal close when clicking inside container
        this.modal.querySelector('.modal-container')?.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    open(positionData) {
        if (!this.modal) return;

        this.currentPosition = positionData;
        this.populateModal(positionData);
        
        // Show modal with animation
        this.modal.style.display = 'block';
        setTimeout(() => {
            this.modal.classList.add('active');
        }, 10);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Set focus to close button for accessibility
        setTimeout(() => {
            this.closeBtn?.focus();
        }, 300);
    }

    close() {
        if (!this.modal) return;

        this.modal.classList.remove('active');
        
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }

    populateModal(data) {
        // Asset header
        document.getElementById('modalAssetName').textContent = data.asset || '--';
        document.getElementById('modalAssetType').textContent = data.assetType || 'Commodity';

        // Status badge
        const statusBadge = document.getElementById('modalStatus');
        statusBadge.textContent = data.status || '--';
        statusBadge.className = 'status-badge';
        
        if (data.status === 'Active') {
            statusBadge.classList.add('success');
        } else if (data.status === 'Pending') {
            statusBadge.classList.add('warning');
        } else {
            statusBadge.classList.add('danger');
        }

        // Asset icon
        const assetIcon = this.modal.querySelector('.asset-icon span');
        if (data.pnlValue >= 0) {
            assetIcon.textContent = 'trending_up';
            assetIcon.parentElement.style.background = 'linear-gradient(135deg, var(--color-success) 0%, #059669 100%)';
        } else {
            assetIcon.textContent = 'trending_down';
            assetIcon.parentElement.style.background = 'linear-gradient(135deg, var(--color-danger) 0%, #dc2626 100%)';
        }

        // Current Price
        document.getElementById('modalCurrentPrice').textContent = this.formatCurrency(data.currentPrice);
        const priceChange = document.getElementById('modalPriceChange');
        const priceChangePercent = data.priceChangePercent || 0;
        priceChange.textContent = `${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}% today`;
        priceChange.className = priceChangePercent >= 0 ? 'success' : 'danger';

        // Entry Price
        document.getElementById('modalEntryPrice').textContent = this.formatCurrency(data.entryPrice);
        document.getElementById('modalEntryDate').textContent = `Opened ${data.entryDate || 'N/A'}`;

        // Quantity
        document.getElementById('modalQuantity').textContent = data.quantity || '--';
        const positionSize = data.currentPrice && data.quantity 
            ? this.formatCurrency(data.currentPrice * data.quantity)
            : '--';
        document.getElementById('modalPositionSize').textContent = `Position size: ${positionSize}`;

        // P&L
        const pnlElement = document.getElementById('modalPnL');
        const pnlPercent = document.getElementById('modalPnLPercent');
        
        pnlElement.textContent = data.pnl || '--';
        pnlElement.className = data.pnlValue >= 0 ? 'success' : 'danger';
        
        const pnlPercentValue = data.pnlPercent || 0;
        pnlPercent.textContent = `${pnlPercentValue >= 0 ? '+' : ''}${pnlPercentValue}%`;
        pnlPercent.className = pnlPercentValue >= 0 ? 'success' : 'danger';

        // Details
        document.getElementById('modalPositionType').textContent = data.positionType || 'Long';
        document.getElementById('modalStopLoss').textContent = data.stopLoss || 'Not Set';
        document.getElementById('modalTakeProfit').textContent = data.takeProfit || 'Not Set';
        document.getElementById('modalRiskReward').textContent = data.riskReward || '1:2';
        document.getElementById('modalDaysHeld').textContent = data.daysHeld || '0 days';
        document.getElementById('modalTradeId').textContent = data.tradeId || this.generateTradeId();
    }

    formatCurrency(value) {
        if (!value) return '--';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    generateTradeId() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `TRD-${timestamp}-${random}`.toUpperCase();
    }

    handleEdit() {
        console.log('Edit position:', this.currentPosition);
        // Placeholder for edit functionality
        if (window.NotificationService) {
            window.NotificationService.showNotification({
                title: 'Edit Position',
                message: 'Position editing feature coming soon!',
                type: 'info',
                duration: 3000
            });
        }
    }

    handleClosePosition() {
        const confirmed = confirm(`Are you sure you want to close the ${this.currentPosition?.asset} position?`);
        
        if (confirmed) {
            console.log('Closing position:', this.currentPosition);
            
            if (window.NotificationService) {
                window.NotificationService.showNotification({
                    title: 'Position Closed',
                    message: `${this.currentPosition?.asset} position has been closed successfully.`,
                    type: 'success',
                    duration: 4000
                });
            }
            
            this.close();
        }
    }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.positionModal = new PositionModal();
});

/**
 * Helper function to open position modal with data
 * Can be called from anywhere in the application
 * 
 * @param {Object} positionData - Position information object
 */
function showPositionDetails(positionData) {
    if (window.positionModal) {
        window.positionModal.open(positionData);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PositionModal, showPositionDetails };
}
