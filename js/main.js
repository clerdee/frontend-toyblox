// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize app
$(document).ready(function() {
    loadProducts();
    updateCartDisplay();
    
    // Search functionality
    $('#search-input').on('input', function() {
        filterProducts();
    });
    
    // Category filter
    $('#category-filter').on('change', function() {
        filterProducts();
    });
});

// Load products from API
function loadProducts() {
    $.ajax({
        url: `${API_BASE_URL}/products`,
        method: 'GET',
        success: function(products) {
            displayProducts(products);
        },
        error: function(xhr, status, error) {
            console.error('Error loading products:', error);
        }
    });
}
