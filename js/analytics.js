// frontend-toyblox/js/analytics.js

let monthlySalesChart;
let orderStatusChart;
let userDistributionChart;

function initializeAnalyticsModule() {
  // Load Chart.js dynamically
  loadChartJs().then(() => {
    // Load analytics data
    loadAnalyticsData();
    
    // Set up event listeners
    $('#timeRangeFilter').on('change', loadAnalyticsData);
  });
}

function loadChartJs() {
  return new Promise((resolve, reject) => {
    if (window.Chart) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadAnalyticsData() {
  const timeRange = $('#timeRangeFilter').val();
  
  // Load order stats
  $.ajax({
    url: 'http://localhost:4000/api/orders/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(data) {
      renderMonthlySalesChart(data.monthlyOrders);
      renderOrderStatusChart(data.ordersByStatus);
      renderSalesSummary(data);
    },
    error: function(xhr) {
      console.error('Failed to load analytics data:', xhr.responseText);
      alert('Failed to load analytics data. Please try again.');
    }
  });
  
  // Load admin stats for user distribution
  $.ajax({
    url: 'http://localhost:4000/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    success: function(data) {
      renderUserDistributionChart(data);
    },
    error: function(xhr) {
      console.error('Failed to load user analytics data:', xhr.responseText);
    }
  });
}

function renderMonthlySalesChart(monthlyData) {
  const ctx = document.getElementById('monthlySalesChart').getContext('2d');
  
  // Format data for chart
  const labels = monthlyData.map(item => {
    const [year, month] = item.month.split('-');
    return new Date(year, month - 1).toLocaleDateString('default', { month: 'short', year: 'numeric' });
  });
  
  const orderCounts = monthlyData.map(item => item.order_count);
  const revenue = monthlyData.map(item => parseFloat(item.revenue));
  
  // Destroy previous chart if it exists
  if (monthlySalesChart) {
    monthlySalesChart.destroy();
  }
  
  // Create new chart
  monthlySalesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Orders',
          data: orderCounts,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Revenue',
          data: revenue,
          type: 'line',
          fill: false,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Order Count'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Revenue ($)'
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
}

function renderOrderStatusChart(statusData) {
  const ctx = document.getElementById('orderStatusChart').getContext('2d');
  
  // Format data for chart
  const labels = statusData.map(item => item.status.toUpperCase());
  const counts = statusData.map(item => item.count);
  
  // Colors for different statuses
  const backgroundColors = {
    'pending': 'rgba(255, 193, 7, 0.5)',
    'processing': 'rgba(23, 162, 184, 0.5)',
    'shipped': 'rgba(0, 123, 255, 0.5)',
    'delivered': 'rgba(40, 167, 69, 0.5)',
    'cancelled': 'rgba(220, 53, 69, 0.5)'
  };
  
  const borderColors = {
    'pending': 'rgba(255, 193, 7, 1)',
    'processing': 'rgba(23, 162, 184, 1)',
    'shipped': 'rgba(0, 123, 255, 1)',
    'delivered': 'rgba(40, 167, 69, 1)',
    'cancelled': 'rgba(220, 53, 69, 1)'
  };
  
  const backgroundColor = statusData.map(item => backgroundColors[item.status] || 'rgba(108, 117, 125, 0.5)');
  const borderColor = statusData.map(item => borderColors[item.status] || 'rgba(108, 117, 125, 1)');
  
  // Destroy previous chart if it exists
  if (orderStatusChart) {
    orderStatusChart.destroy();
  }
  
  // Create new chart
  orderStatusChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
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
}

function renderUserDistributionChart(data) {
  const ctx = document.getElementById('userDistributionChart').getContext('2d');
  
  // Get real user data from the admin stats
  const adminCount = data.totalAdmins;
  const customerCount = data.totalCustomers;
  
  // Destroy previous chart if it exists
  if (userDistributionChart) {
    userDistributionChart.destroy();
  }
  
  // Create new polar area chart
  userDistributionChart = new Chart(ctx, {
    type: 'polarArea',
    data: {
      labels: ['Admins', 'Customers'],
      datasets: [{
        data: [adminCount, customerCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.5)',  // Blue for admins
          'rgba(255, 99, 132, 0.5)'    // Pink for customers
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right'
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
        },
        title: {
          display: true,
          text: 'User Distribution'
        }
      }
    }
  });
}

function renderSalesSummary(data) {
  // Calculate total revenue
  const totalRevenue = data.monthlyOrders.reduce((sum, month) => sum + parseFloat(month.revenue), 0);
  
  // Calculate average order value
  const totalOrders = data.totalOrders;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Set placeholder conversion rate (would need additional data in a real implementation)
  const conversionRate = 3.5; // Example value
  
  // Update the DOM
  $('#totalRevenue').text(`$${totalRevenue.toFixed(2)}`);
  $('#avgOrderValue').text(`$${avgOrderValue.toFixed(2)}`);
  $('#conversionRate').text(`${conversionRate}%`);
}

// Make the initialization function available globally
window.initializeAnalyticsModule = initializeAnalyticsModule;