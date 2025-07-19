$(document).ready(function () {
  const token = localStorage.getItem("token");

  if (!token) {
    console.error("Unauthorized: No token found");
    return;
  }

  // STATS FETCH
  $.ajax({
    url: `${baseUrl}api/admin/stats`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      $("#totalOrders").text(data.totalOrders);
      $("#orderChange").text(`${formatChange(data.orderChange)}`);

      $("#totalProducts").text(data.totalProducts);
      $("#productChange").text(`${formatChange(data.productChange)}`);

      $("#totalAdmins").text(data.totalAdmins);
      $("#adminChange").text(`${formatChange(data.adminChange)}`);

      $("#totalCustomers").text(data.totalCustomers);
      $("#customerChange").text(`${formatChange(data.customerChange)}`);
    },
    error: function (err) {
      console.error("Failed to fetch stats:", err.responseText || err);
    }
  });

  function formatChange(value) {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  }

  // TOP PRODUCTS FETCH
  $.ajax({
    url: `${baseUrl}api/admin/top-products`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    success: function (response) {
      const container = $("#topProductsContainer");
      container.empty();

      if (response.length === 0) {
        container.append("<p>No top products available.</p>");
        return;
      }

      response.forEach(product => {
        const imageUrl = `${baseUrl}${product.image_url}`; // ✅ FIXED URL
        const productHtml = `
        <div class="product-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
            <img src="${imageUrl}" alt="${product.name}" class="product-thumb" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div class="product-info" style="flex-grow: 1;">
            <span class="product-name" style="font-weight: bold;">${product.name}</span>
            </div>
            <span class="product-revenue" style="font-weight: bold; color: #28a745;">₱${parseFloat(product.sell_price).toFixed(2)}</span>
        </div>
        `;
        container.append(productHtml);
      });
    },
    error: function (xhr) {
      console.error("Failed to load top products:", xhr.responseText);
    }
  });
});
