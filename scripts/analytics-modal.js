/**
 * Analytics Modal Handler
 * Manages modal interactions for analytics page
 */

function closeAnalyticsModal() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function openAnalyticsModal(type, data) {
    const modal = document.getElementById('analyticsModal');
    const title = document.getElementById('analyticsModalTitle');
    const body = document.getElementById('analyticsModalBody');
    
    if (!modal || !title || !body) return;
    
    // Set title based on type
    const titles = {
        volume: 'Trading Volume Details',
        price: 'Price Movement Analysis',
        historical: 'Historical Trends',
        performance: 'Performance Metrics'
    };
    
    title.textContent = titles[type] || 'Analytics Details';
    
    // Generate modal content
    let content = '<div class="modal-section">';
    
    if (type === 'volume') {
        content += `
            <h3>Volume Analysis</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Total Volume</p>
                    <h3>${data?.totalVolume || '$342M'}</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Average Daily</p>
                    <h3>${data?.avgDaily || '$48.8M'}</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Peak Volume</p>
                    <h3>${data?.peak || '$89.2M'}</h3>
                </div>
            </div>
            <p style="margin-top: 1rem; color: var(--color-dark-variant);">
                Trading volume has increased by 15.8% compared to the previous period. 
                This indicates strong market participation and liquidity.
            </p>
        `;
    } else if (type === 'price') {
        content += `
            <h3>Price Movement Analysis</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Avg Change</p>
                    <h3 style="color: var(--color-success);">+2.4%</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Volatility</p>
                    <h3>Medium</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">Trend</p>
                    <h3 style="color: var(--color-success);">Bullish</h3>
                </div>
            </div>
            <p style="margin-top: 1rem; color: var(--color-dark-variant);">
                Overall market sentiment is bullish with consistent upward price movements. 
                Technical indicators suggest continuation of the current trend.
            </p>
        `;
    } else if (type === 'historical') {
        content += `
            <h3>Historical Performance</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0;">
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">7 Days</p>
                    <h3 style="color: var(--color-success);">+5.2%</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">30 Days</p>
                    <h3 style="color: var(--color-success);">+12.8%</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">90 Days</p>
                    <h3 style="color: var(--color-success);">+24.3%</h3>
                </div>
                <div style="background: var(--color-light); padding: 1rem; border-radius: 0.5rem;">
                    <p style="color: var(--color-info-dark); font-size: 0.85rem; margin-bottom: 0.5rem;">YTD</p>
                    <h3 style="color: var(--color-success);">+38.7%</h3>
                </div>
            </div>
            <p style="margin-top: 1rem; color: var(--color-dark-variant);">
                Portfolio has shown consistent growth across all time periods. 
                Year-to-date performance is significantly above market benchmarks.
            </p>
        `;
    }
    
    content += '</div>';
    body.innerHTML = content;
    
    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close modal when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                closeAnalyticsModal();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAnalyticsModal();
        }
    });
});
