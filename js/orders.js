// frontend-toyblox/js/orders.js

let ordersTable;
let currentOrderId;

function initializeOrdersModule() {
  // Initialize DataTable
  ordersTable = $('#ordersTable').DataTable({
    responsive: true,
    order: [[2, 'desc']], // Sort by date descending
columns: [
  { data: 'id' },
  { 
    data: null,
    render: function(data) {
      return `${data.f_name} ${data.l_name}`;
    }
  },
  { 
    data: 'date_placed',
    render: function(data) {
      return new Date(data).toLocaleString();
    }
  },
  { 
    data: 'status',
    render: function(data) {
      const statusClasses = {
        'pending': 'bg-warning',
        'processing': 'bg-info',
        'shipped': 'bg-primary',
        'delivered': 'bg-success',
        'cancelled': 'bg-danger'
      };
      return `<span class="badge ${statusClasses[data] || 'bg-secondary'}">${data.toUpperCase()}</span>`;
    }
  },
  { data: 'item_count' },
  { 
    data: 'total_amount',
    render: function(data) {
      return `$${parseFloat(data).toFixed(2)}`;
    }
  },
  { 
    data: null,
    orderable: false,
    render: function(data) {
      return `
        <button class="btn btn-sm btn-info view-order" data-id="${data.id}" title="View Details">
          <i class="fas fa-eye"></i>
        </button>
        <button class="btn btn-sm btn-primary update-status" data-id="${data.id}" title="Update Status">
          <i class="fas fa-truck"></i> Update Status
        </button>
      `;
    }
  }
]

  });

  // Load orders
  loadOrders();

  // Event listeners
  $('#ordersTable').on('click', '.view-order', function() {
    const orderId = $(this).data('id');
    viewOrderDetails(orderId);
  });

  $('#ordersTable').on('click', '.update-status', function() {
    const orderId = $(this).data('id');
    showUpdateStatusModal(orderId);
  });

  $('#orderStatusFilter').on('change', function() {
    const status = $(this).val();
    ordersTable.column(3).search(status).draw();
  });

  $('#updateStatusBtn').on('click', function() {
    const status = $('#orderStatusSelect').val();
    updateOrderStatus(currentOrderId, status);
  });

  $('#exportOrdersBtn').on('click', exportOrders);
}

function loadOrders() {
  $.ajax({
    url: 'http://localhost:4000/api/orders',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(orders) {
      ordersTable.clear();
      ordersTable.rows.add(orders).draw();
    },
    error: function(xhr) {
      console.error('Failed to load orders:', xhr.responseText);
      alert('Failed to load orders. Please try again.');
    }
  });
}

function viewOrderDetails(orderId) {
  currentOrderId = orderId;
  
  $.ajax({
    url: `http://localhost:4000/api/orders/${orderId}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(order) {
      const statusOptions = ['pending', 'shipped', 'delivered']
        .map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status.toUpperCase()}</option>`)
        .join('');
      
      const itemsHtml = order.items.map(item => `
        <tr>
          <td>${item.name}</td>
          <td><img src="${item.image_url}" alt="${item.name}" width="50"></td>
          <td>${item.quantity}</td>
          <td>$${parseFloat(item.price_at_order).toFixed(2)}</td>
          <td>$${(item.quantity * item.price_at_order).toFixed(2)}</td>
        </tr>
      `).join('');
      
      const orderDate = new Date(order.date_placed).toLocaleString();
      
      const detailsHtml = `
        <div class="row mb-4">
          <div class="col-md-6">
            <h6>Order Information</h6>
            <p><strong>Order ID:</strong> #${order.id}</p>
            <p><strong>Date Placed:</strong> ${orderDate}</p>
            <p>
              <strong>Status:</strong> 
              <select id="orderStatusSelect" class="form-select form-select-sm d-inline-block w-auto ms-2">
                ${statusOptions}
              </select>
            </p>
          </div>
          <div class="col-md-6">
            <h6>Customer Information</h6>
            <p><strong>Name:</strong> ${order.f_name} ${order.l_name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Phone:</strong> ${order.phone_number}</p>
            <p><strong>Address:</strong> ${order.address}, ${order.postal_code}, ${order.country}</p>
          </div>
        </div>
        
        <h6>Order Items</h6>
        <div class="table-responsive">
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Product</th>
                <th>Image</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <th colspan="4" class="text-end">Total:</th>
                <th>$${order.total_amount.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
      
      $('#orderDetailsContent').html(detailsHtml);
      $('#orderDetailsModal').modal('show');
    },
    error: function(xhr) {
      console.error(`Failed to load order #${orderId}:`, xhr.responseText);
      alert('Failed to load order details. Please try again.');
    }
  });
}

function updateOrderStatus(orderId, status) {
  $.ajax({
    url: `http://localhost:4000/api/orders/${orderId}/status`,
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({ status }),
    success: function() {
      alert('Order status updated successfully!');
      $('#orderDetailsModal').modal('hide');
      loadOrders();
    },
    error: function(xhr) {
      console.error(`Failed to update order #${orderId} status:`, xhr.responseText);
      alert('Failed to update order status. Please try again.');
    }
  });
}

function exportOrders() {
  const filteredData = ordersTable.rows({ search: 'applied' }).data().toArray();
  
  // Convert to CSV
  let csv = 'Order ID,Customer,Date,Status,Items,Total\n';
  
  filteredData.forEach(order => {
    const row = [
      order.id,
      `${order.f_name} ${order.l_name}`,
      new Date(order.date_placed).toLocaleString(),
      order.status,
      order.item_count,
      `$${parseFloat(order.total_amount).toFixed(2)}`
    ];
    csv += row.join(',') + '\n';
  });
  
  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('hidden', '');
  a.setAttribute('href', url);
  a.setAttribute('download', 'orders_export.csv');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Make the initialization function available globally
window.initializeOrdersModule = initializeOrdersModule;