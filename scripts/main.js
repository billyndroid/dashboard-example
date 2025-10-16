// Enhanced main.js with error handling and improved functionality

// Safely get DOM elements
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Load theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('dashboard-theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme-variables');
        if (themeToggler) {
            const lightIcon = themeToggler.querySelector('span:first-child');
            const darkIcon = themeToggler.querySelector('span:last-child');
            if (lightIcon && darkIcon) {
                lightIcon.classList.remove('active');
                darkIcon.classList.add('active');
            }
        }
    }
}

// Show sidebar with error handling
if (menuBtn && sideMenu) {
    menuBtn.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            sideMenu.style.display = 'block';
            // Add mobile overlay
            if (window.innerWidth <= 768) {
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Error showing sidebar:', error);
        }
    });
} else {
    console.warn('Menu button or sidebar not found');
}

// Close sidebar with error handling
if (closeBtn && sideMenu) {
    closeBtn.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            sideMenu.style.display = 'none';
            document.body.style.overflow = 'auto';
        } catch (error) {
            console.error('Error hiding sidebar:', error);
        }
    });
}

// Enhanced theme toggler
if (themeToggler) {
    themeToggler.addEventListener('click', (e) => {
        try {
            e.preventDefault();
            document.body.classList.toggle('dark-theme-variables');
            
            const lightIcon = themeToggler.querySelector('span:first-child');
            const darkIcon = themeToggler.querySelector('span:last-child');
            
            if (lightIcon && darkIcon) {
                lightIcon.classList.toggle('active');
                darkIcon.classList.toggle('active');
            }
            
            // Save theme preference
            const isDark = document.body.classList.contains('dark-theme-variables');
            localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
            
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    });
} else {
    console.warn('Theme toggler not found');
}

// Close sidebar when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sideMenu && !sideMenu.contains(e.target) && !menuBtn.contains(e.target)) {
        if (sideMenu.style.display === 'block') {
            sideMenu.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && sideMenu) {
        sideMenu.style.display = '';
        document.body.style.overflow = 'auto';
    }
});

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', loadThemePreference);

// Enhanced Progress Circle Calculations
function updateProgressCircles() {
    try {
        const progressCircles = document.querySelectorAll('.progress circle');
        
        progressCircles.forEach(circle => {
            const numberElement = circle.parentElement.querySelector('.number p');
            if (!numberElement) return;
            
            const percentageText = numberElement.textContent;
            let percentage = 0;
            
            // Extract percentage from different formats
            if (percentageText.includes('%')) {
                percentage = parseFloat(percentageText.replace('%', ''));
            } else if (percentageText.includes('+') || percentageText.includes('-')) {
                // Handle formats like "+8.2%", "-1.5%"
                percentage = Math.abs(parseFloat(percentageText.replace(/[^0-9.-]/g, '')));
            } else {
                // Default percentage for non-numeric values
                percentage = 75;
            }
            
            // Ensure percentage is within valid range
            percentage = Math.max(0, Math.min(100, percentage));
            
            // Calculate circle properties
            const radius = 36;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (percentage / 100) * circumference;
            
            // Apply styles
            circle.style.strokeDasharray = circumference;
            circle.style.strokeDashoffset = offset;
            circle.style.transition = 'stroke-dashoffset 1s ease-in-out';
            
            // Add color based on value
            if (percentageText.includes('+')) {
                circle.style.stroke = 'var(--color-success)';
            } else if (percentageText.includes('-')) {
                circle.style.stroke = 'var(--color-danger)';
            } else {
                circle.style.stroke = 'var(--color-primary)';
            }
        });
        
    } catch (error) {
        console.error('Error updating progress circles:', error);
    }
}

// Update progress circles when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProgressCircles);
} else {
    updateProgressCircles();
}

// Enhanced orders table population with error handling
function populateOrdersTable() {
    try {
        if (typeof Orders === 'undefined') {
            console.warn('Orders data not found. Please ensure orders.js is loaded.');
            return;
        }

        const tableBody = document.querySelector('#ordersTableBody') || document.querySelector('table tbody');
        
        if (!tableBody) {
            console.warn('Orders table not found on this page.');
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        Orders.forEach((order, index) => {
            try {
                const tr = document.createElement('tr');
                const statusClass = 
                    order.shipping === 'Declined' ? 'danger' : 
                    order.shipping === 'Pending' ? 'warning' : 'success';
                
                tr.innerHTML = `
                    <td>${order.productName || 'N/A'}</td>
                    <td>${order.productNumber || 'N/A'}</td>
                    <td>${order.paymentStatus || 'N/A'}</td>
                    <td class="${statusClass}">${order.shipping || 'Unknown'}</td>
                    <td><button class="primary" onclick="showOrderDetails(${index})">Details</button></td>
                `;
                
                tableBody.appendChild(tr);
            } catch (error) {
                console.error('Error creating table row for order:', order, error);
            }
        });
        
        console.info(`Successfully populated ${Orders.length} orders in table.`);
        
    } catch (error) {
        console.error('Error populating orders table:', error);
    }
}

// Show order details function
function showOrderDetails(orderIndex) {
    try {
        if (typeof Orders === 'undefined' || !Orders[orderIndex]) {
            alert('Order details not available.');
            return;
        }
        
        const order = Orders[orderIndex];
        const details = `
Order Details:

Asset: ${order.productName}
Price: ${order.productNumber}
Status: ${order.paymentStatus}
Shipping: ${order.shipping}
        `;
        
        alert(details);
    } catch (error) {
        console.error('Error showing order details:', error);
        alert('Error loading order details.');
    }
}

// Initialize orders table when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', populateOrdersTable);
} else {
    populateOrdersTable();
}

// Make function globally available
window.showOrderDetails = showOrderDetails;