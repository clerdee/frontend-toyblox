// admin-analytics.js - Handles analytics charts in the admin panel

// Initialize all analytics charts
function initializeAnalyticsCharts() {
  const days = $('#analyticsDateFilter').val() || 30;
  loadOrdersChart(days);
  loadUsersChart();
  loadProductSalesChart(days);
}

// Load orders chart
function loadOrdersChart(days) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const ctx = document.getElementById('ordersChart');
  if (!ctx) return;

  // Clear any existing chart
  if (window.ordersChart instanceof Chart) {
    window.ordersChart.destroy();
  }

  // Show loading state
  ctx.style.opacity = 0.5;

  // Fetch orders data
  fetch(`http://localhost:4000/api/analytics/orders?days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    ctx.style.opacity = 1;

    // Create chart
    window.ordersChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Pending', 'Shipped', 'Delivered'],
        datasets: [{
          data: [
            data.pending || 0,
            data.shipped || 0,
            data.delivered || 0
          ],
          backgroundColor: [
            'rgba(255, 206, 86, 0.7)',  // Yellow for pending
            'rgba(54, 162, 235, 0.7)',   // Blue for shipped
            'rgba(75, 192, 192, 0.7)'    // Green for delivered
          ],
          borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: `Order Status Distribution (Last ${days} days)`
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error('Error loading orders chart data:', error);
    ctx.style.opacity = 1;
  });
}

// Load users chart
function loadUsersChart() {
  const token = localStorage.getItem('token');
  if (!token) return;

  const ctx = document.getElementById('usersChart');
  if (!ctx) return;

  // Clear any existing chart
  if (window.usersChart instanceof Chart) {
    window.usersChart.destroy();
  }

  // Show loading state
  ctx.style.opacity = 0.5;

  // Fetch users data
  fetch('http://localhost:4000/api/analytics/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    ctx.style.opacity = 1;

    // Create chart
    window.usersChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Admins', 'Regular Users'],
        datasets: [{
          data: [
            data.admins || 0,
            data.users || 0
          ],
          backgroundColor: [
            'rgba(153, 102, 255, 0.7)',  // Purple for admins
            'rgba(255, 159, 64, 0.7)'    // Orange for users
          ],
          borderColor: [
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'User Role Distribution'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  })
  .catch(error => {
    console.error('Error loading users chart data:', error);
    ctx.style.opacity = 1;
  });
}

// Load product sales chart
function loadProductSalesChart(days) {
  const token = localStorage.getItem('token');
  if (!token) return;

  const ctx = document.getElementById('productSalesChart');
  if (!ctx) return;

  // Clear any existing chart
  if (window.productSalesChart instanceof Chart) {
    window.productSalesChart.destroy();
  }

  // Show loading state
  ctx.style.opacity = 0.5;

  // Fetch product sales data
  fetch(`http://localhost:4000/api/analytics/products?days=${days}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  .then(response => response.json())
  .then(data => {
    ctx.style.opacity = 1;

    // Sort products by sales
    data.sort((a, b) => b.quantity - a.quantity);
    
    // Take top 5 products
    const topProducts = data.slice(0, 5);

    // Create chart
    window.productSalesChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topProducts.map(p => p.description || `Product #${p.item_id}`),
        datasets: [{
          label: 'Units Sold',
          data: topProducts.map(p => p.quantity),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units Sold'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Product'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: `Top 5 Products by Sales (Last ${days} days)`
          }
        }
      }
    });
  })
  .catch(error => {
    console.error('Error loading product sales chart data:', error);
    ctx.style.opacity = 1;
  });
}

// Export functions for use in admin-partials.js
window.initializeAnalyticsCharts = initializeAnalyticsCharts;