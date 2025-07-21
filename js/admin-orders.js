// admin-orders.js - Handles order-related functionality in the admin panel

// Load recent orders for the dashboard
function loadRecentOrders() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const container = document.getElementById('recentOrdersContainer');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner">Loading recent orders...</div>';

  fetch('http://localhost:4000/api/orders/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    if (!data.recentOrders || data.recentOrders.length === 0) {
      container.innerHTML = '<p class="empty-state">No recent orders found.</p>';
      return;
    }

    let html = '<div class="recent-orders-list">';
    
    data.recentOrders.forEach(order => {
      const statusClass = getStatusClass(order.status);
      html += `
        <div class="order-item">
          <div class="order-details">
            <div class="order-id">#${order.id}</div>
            <div class="order-product">${order.f_name} ${order.l_name}</div>
            <div class="order-meta">
              <span class="order-date">${new Date(order.date_placed).toLocaleDateString()}</span>
              <span class="order-price">$${parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
          <div class="order-status ${statusClass}">${order.status}</div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  })
  .catch(error => {
    console.error('Error loading recent orders:', error);
    container.innerHTML = '<p class="error-state">Failed to load recent orders.</p>';
  });
}

// Helper function to get CSS class based on order status
function getStatusClass(status) {
  switch(status.toLowerCase()) {
    case 'pending': return 'status-pending';
    case 'shipped': return 'status-shipped';
    case 'delivered': return 'status-delivered';
    default: return '';
  }
}

// Load orders DataTable
function loadOrdersDataTable() {
  const container = document.getElementById('ordersTableContainer');
  if (!container) return;

  const token = localStorage.getItem('token');
  if (!token) return;

  // Show loading state
  container.innerHTML = '<div class="loading-spinner">Loading orders data...</div>';

  // Fetch orders data
  fetch('http://localhost:4000/api/orders', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // Create table structure
    container.innerHTML = `
      <table id="ordersTable" class="display responsive nowrap" style="width:100%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Date Placed</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <!-- Data will be populated by DataTables -->
        </tbody>
      </table>
    `;

    // Initialize DataTable
    $('#ordersTable').DataTable({
      data: data,
      columns: [
        { data: 'id' },
        { 
          data: null,
          render: function(data) {
            return `${data.customer_name || 'Customer'} <br><small>${data.customer_email || ''}</small>`;
          }
        },
        { 
          data: null,
          render: function(data) {
            return `${data.item_count} items`;
          }
        },
        { 
          data: 'total_amount',
          render: function(data) {
            return `$${parseFloat(data).toFixed(2)}`;
          }
        },
        { 
          data: 'date_placed',
          render: function(data) {
            return new Date(data).toLocaleDateString();
          }
        },
        { 
          data: 'status',
          render: function(data) {
            const statusClass = getStatusClass(data);
            return `<span class="status-badge ${statusClass}">${data}</span>`;
          }
        },
        { 
          data: null,
          render: function(data) {
            return `
              <div class="order-actions">
                <select class="status-select" data-order-id="${data.id}" data-current="${data.status}">
                  <option value="pending" ${data.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="shipped" ${data.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="delivered" ${data.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn-view" data-order-id="${data.id}">View</button>
              </div>
            `;
          }
        }
      ],
      responsive: true,
      order: [[0, 'desc']],
      pageLength: 10,
      lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "All"]],
      scrollY: '50vh',
      scrollCollapse: true,
      initComplete: function() {
        // Add event listeners to status selects
        $('.status-select').on('change', function() {
          const orderId = $(this).data('order-id');
          const newStatus = $(this).val();
          const currentStatus = $(this).data('current');
          
          if (newStatus !== currentStatus) {
            updateOrderStatus(orderId, newStatus);
          }
        });
        
        // Add event listeners to view buttons
        $('.btn-view').on('click', function() {
          const orderId = $(this).data('order-id');
          viewOrderDetails(orderId);
        });
      }
    });
  })
  .catch(error => {
    console.error('Error loading orders data:', error);
    container.innerHTML = '<p class="error-state">Failed to load orders data.</p>';
  });
}

// Update order status
function updateOrderStatus(orderId, newStatus) {
  const token = localStorage.getItem('token');
  if (!token) return;

  fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: newStatus })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Show success notification
      showNotification(`Order #${orderId} status updated to ${newStatus}`, false);
      
      // Refresh data if needed
      if (document.getElementById('recentOrdersContainer')) {
        loadRecentOrders();
      }
    } else {
      showNotification(`Failed to update order status: ${data.error}`, true);
    }
  })
  .catch(error => {
    console.error('Error updating order status:', error);
    showNotification('Failed to update order status', true);
  });
}

// View order details
function viewOrderDetails(orderId) {
  // Implement order details view
  console.log(`Viewing order details for order #${orderId}`);
  // This could open a modal with detailed order information
}

// Show notification
function showNotification(message, isError = false) {
  let notif = document.createElement('div');
  notif.className = 'admin-notification' + (isError ? ' error' : '');
  notif.textContent = message;
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.classList.add('show');
    
    setTimeout(() => {
      notif.classList.remove('show');
      setTimeout(() => notif.remove(), 300);
    }, 3000);
  }, 10);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  // Load recent orders on dashboard
  if (document.getElementById('recentOrdersContainer')) {
    loadRecentOrders();
  }
});

// Export functions for use in admin-partials.js
window.loadOrdersDataTable = loadOrdersDataTable;