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
            return `${data.f_name} ${data.l_name} <br><small>${data.email}</small>`;
          }
        },
        { 
          data: 'items_detail',
          render: function(data, type, row) {
            return data || 'No items';
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
          render: function(data, type, row) {
            return `
              <div class="order-actions">
                <select class="status-select form-control" data-order-id="${row.id}" data-current="${row.status}">
                  <option value="pending" ${row.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="shipped" ${row.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="delivered" ${row.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn btn-sm btn-info view-order" title="View Details" data-order-id="${row.id}">
                  <i class="fas fa-eye"></i>
                </button>
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
        $('#ordersTable tbody').on('click', '.view-order', function() {
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
// function updateOrderStatus(orderId, newStatus) {
//   const token = localStorage.getItem('token');
//   if (!token) return;

//   fetch(`http://localhost:4000/api/orders/${orderId}/status`, {
//     method: 'PUT',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ status: newStatus })
//   })
//   .then(response => response.json())
//   .then(data => {
//     showNotification(`Order #${orderId} status updated to ${newStatus}`, false);
//     $('#ordersTable').DataTable().ajax.reload();
//   })
//   .catch(error => {
//     console.error('Error updating order status:', error);
//     showNotification('Failed to update order status', true);
//   });
// }

// View order details
// function viewOrderDetails(orderId) {
//   const token = localStorage.getItem('token');
//   if (!token) return;

//   fetch(`http://localhost:4000/api/orders/${orderId}`, {
//     headers: {
//       'Authorization': `Bearer ${token}`
//     }
//   })
//   .then(response => response.json())
//   .then(order => {
//     const modalBody = document.getElementById('orderDetailsContent');
//     let itemsHtml = order.items.map(item => `
//       <tr>
//         <td>${item.name}</td>
//         <td>${item.quantity}</td>
//         <td>$${parseFloat(item.price_at_order).toFixed(2)}</td>
//       </tr>
//     `).join('');

//     modalBody.innerHTML = `
//     <img src="/images/${order.image_filename}" class="img-fluid mb-3" alt="Order Image">
//       <h5>Customer Information</h5>
//       <p><strong>Name:</strong> ${order.f_name} ${order.l_name}</p>
//       <p><strong>Email:</strong> ${order.email}</p>
//       <p><strong>Address:</strong> ${order.address}, ${order.postal_code}, ${order.country}</p>
//       <p><strong>Phone:</strong> ${order.phone_number}</p>
//       <hr>
//       <h5>Order Items</h5>
//       <table class="table">
//         <thead>
//           <tr>
//             <th>Product</th>
//             <th>Quantity</th>
//             <th>Price</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${itemsHtml}
//         </tbody>
//       </table>
//       <p><strong>Total:</strong> $${parseFloat(order.total_amount).toFixed(2)}</p>
//     `;

//     $('#orderDetailsModal').modal('show');
//   })
//   .catch(error => {
//     console.error('Error fetching order details:', error);
//     showNotification('Failed to load order details.', true);
//   });
// }

function showOrderDetailsModal(order) {
  currentOrderId = order.id;

  $('#orderDetailsContent').html(`
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Customer:</strong> ${order.customer}</p>
    <p><strong>Total:</strong> ${order.total}</p>
    <label for="modalStatusSelect">Change Status:</label>
    <select id="modalStatusSelect" class="form-control mb-3">
      <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
      <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
      <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
    </select>
    <p><strong>Items:</strong><br>${order.items_detail}</p>
  `);

  $('#orderDetailsModal').modal('show');
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