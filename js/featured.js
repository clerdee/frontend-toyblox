// js/featured.js
document.addEventListener("DOMContentLoaded", () => {
  const baseUrl = "http://localhost:4000/";

  fetch(`${baseUrl}api/admin/top-products`)
    .then(response => response.json())
    .then(products => {
      const container = document.getElementById("featuredProductsContainer");
      container.innerHTML = "";

      if (!products || products.length === 0) {
        container.innerHTML = "<p>No featured products available.</p>";
        return;
      }

      products.forEach(product => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        const imageUrl = `${baseUrl}${product.image_url}`;
        productCard.innerHTML = `
          <div class="product-image">
            <img src="${imageUrl}" alt="${product.name}" class="product-thumb">
          </div>
          <div class="product-info">
            <h3>${product.name}</h3>
            <p>${product.description || "No description available."}</p>
            <p class="price">₱${parseFloat(product.sell_price).toFixed(2)}</p>
            <button class="btn btn-small add-to-cart-btn">Add to Cart</button>
          </div>
        `;

        const addToCartBtn = productCard.querySelector(".add-to-cart-btn");
        addToCartBtn.addEventListener("click", () => {
          const itemToAdd = {
            item_id: product.item_id,
            name: product.name,
            description: product.description,
            sell_price: product.sell_price,
            image_url: product.image_url
          };
          addToCart(itemToAdd); // ✅ this will now work
        });

        container.appendChild(productCard);
      });
    })
    .catch(error => {
      console.error("Failed to load featured products:", error);
    });
});

$(document).ready(function () {
  $.ajax({
    url: `${baseUrl}api/products/featured`,
    method: 'GET',
    success: function (products) {
      const container = $('#featuredProductsContainer');
      container.empty();

      products.forEach(product => {
        const productCard = `
          <div class="product-card">
            <img src="${baseUrl}${product.image}" alt="${product.name}" class="product-image">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p><strong>₱${product.sell_price}</strong></p>
            <button class="btn btn-primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
          </div>
        `;
        container.append(productCard);
      });

      // Attach event listener AFTER rendering
      $('.add-to-cart-btn').click(function () {
        const productId = $(this).data('id');
        addToCart(productId);
      });
    },
    error: function () {
      console.error('Failed to fetch featured products');
    }
  });
});
