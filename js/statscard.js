// frontend-toyblox/js/statscard.js

$(document).ready(function() {
  loadDashboardStats();
  loadRecentOrders();
  loadTopProducts();
});

function loadDashboardStats() {
  $.ajax({
    url: 'http://localhost:4000/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(data) {
      // Update stats cards with actual data from database
      $('#totalOrders').text(data.totalOrders);
      $('#totalProducts').text(data.totalProducts);
      $('#totalAdmins').text(data.totalAdmins);
      $('#totalCustomers').text(data.totalCustomers);
    },
    error: function(xhr) {
      console.error('Failed to load dashboard stats:', xhr.responseText);
    }
  });
}

function loadRecentOrders() {
  $.ajax({
    url: 'http://localhost:4000/api/orders/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(data) {
      if (!data.recentOrders || !Array.isArray(data.recentOrders)) {
        $('#recentOrdersContainer').html('<p class="no-data">No recent orders data available.</p>');
        return;
      }
      
      const recentOrdersHtml = data.recentOrders.map(order => {
        const date = new Date(order.date_placed).toLocaleDateString();
        const statusClasses = {
          'pending': 'status-pending',
          'processing': 'status-processing',
          'shipped': 'status-shipped',
          'delivered': 'status-delivered',
          'cancelled': 'status-cancelled'
        };
        
        return `
          <div class="order-item">
            <div class="order-info">
              <h4>Order #${order.id}</h4>
              <p>${order.f_name} ${order.l_name} - ${date}</p>
            </div>
            <div class="order-status">
              <span class="status-badge ${statusClasses[order.status] || ''}">${order.status.toUpperCase()}</span>
              <p class="order-total">$${parseFloat(order.total_amount).toFixed(2)}</p>
            </div>
          </div>
        `;
      }).join('');
      
      // Find the card-content div inside the Recent Orders card
      const recentOrdersContainer = $('#recentOrdersContainer');
      
      if (recentOrdersContainer.length) {
        if (data.recentOrders.length > 0) {
          recentOrdersContainer.html(recentOrdersHtml);
        } else {
          recentOrdersContainer.html('<p class="no-data">No recent orders found.</p>');
        }
      }
    },
    error: function(xhr) {
      console.error('Failed to load recent orders:', xhr.responseText);
      $('#recentOrdersContainer').html('<p class="no-data">Failed to load recent orders.</p>');
    }
  });
}

function loadTopProducts() {
  $.ajax({
    url: 'http://localhost:4000/api/admin/top-products',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(data) {
      const topProductsHtml = data.map(product => {
        return `
          <div class="product-item">
            <img src="${product.image_url ? 'http://localhost:4000/' + product.image_url : '../images/default-product.jpg'}" alt="${product.name}" class="product-image">
            <div class="product-info">
              <h4>${product.name}</h4>
            </div>
          </div>
        `;
      }).join('');
      
      // Find the card-content div inside the Top Products card
      const topProductsContainer = $('#topProductsContainer');
      
      if (topProductsContainer.length) {
        if (data.length > 0) {
          topProductsContainer.html(topProductsHtml);
        } else {
          topProductsContainer.html('<p class="no-data">No products found.</p>');
        }
      }
    },
    error: function(xhr) {
      console.error('Failed to load top products:', xhr.responseText);
      $('#topProductsContainer').html('<p class="no-data">Failed to load top products.</p>');
    }
  });
}
