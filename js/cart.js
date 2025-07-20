// frontend/js/cart.js

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  fetchCustomerInfo();

  if (document.getElementById("cartContainer")) {
    setTimeout(() => {
      hideLoading();
      loadCartItems();
    }, 800);
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }
});

// ==============================
// Customer Logic
// ==============================

function fetchCustomerInfo() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (!token || !user?.id) {
    console.warn("Cannot fetch customer info: token or user missing.");
    // Don't try to update customer info elements if we're not on the cart page
    if (!document.getElementById("custName")) return;
    return;
  }

  $.ajax({
    url: `http://localhost:4000/api/customer/me?user_id=${user.id}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    },
    success: function (data) {
      // Save to localStorage if needed
      localStorage.setItem("customer", JSON.stringify(data));
      console.log("Customer info saved to localStorage:", data);

      // Only try to populate HTML fields if they exist
      if (document.getElementById("custName")) {
        document.getElementById("custName").textContent = `${data.f_name} ${data.l_name}`;
        document.getElementById("custEmail").textContent = data.email;
        document.getElementById("custPhone").textContent = data.phone_number || "N/A";
        document.getElementById("custCountry").textContent = data.country || "N/A";
        document.getElementById("custAddress").textContent = data.address || "N/A";
        document.getElementById("custPostal").textContent = data.postal_code || "N/A";

        const now = new Date();
        const formatted = now.toLocaleString('en-PH', { 
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        document.getElementById("custDatePlaced").textContent = formatted;
      }
    },
    error: function (xhr) {
      console.error("Failed to fetch customer info:", xhr.responseText);
    }
  });
}


// ==============================
// Cart Logic
// ==============================

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.querySelector(".cart-count") || document.getElementById("headerCartCount");
  if (countEl) countEl.textContent = totalItems;
}

function addToCart(product) {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || !user.id) {
    showNotification("Please log in first before adding to cart.", true);
    return;
  }
  
  const cart = getCart();
  const item = {
    id: product.id || product.item_id,
    name: product.name,
    price: parseFloat(product.price || product.sell_price || 0),
    image: product.image || product.image_url || "",
    emoji: product.emoji || "🧸",
    quantity: 1,
  };

  const existing = cart.find((i) => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }

  setCart(cart);
  updateCartCount();
  showNotification(`🛒 "${item.name}" added to cart!`);
}

// Add this notification function if it doesn't exist elsewhere in your code
function showNotification(message, isError = false) {
  let notif = document.createElement('div');
  notif.className = 'custom-notification' + (isError ? ' error' : '');
  notif.textContent = message;
  document.body.appendChild(notif);
  
  // Add some basic styles if they don't exist in your CSS
  notif.style.position = 'fixed';
  notif.style.top = '20px';
  notif.style.right = '20px';
  notif.style.padding = '10px 20px';
  notif.style.borderRadius = '5px';
  notif.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
  notif.style.color = 'white';
  notif.style.zIndex = '1000';
  notif.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
  
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.5s';
    setTimeout(() => notif.remove(), 500);
  }, 2000);
}

function loadCartItems() {
  const container = document.getElementById("cartContainer");
  const cart = getCart();

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any toys to your cart yet.</p>
        <button class="btn-primary" onclick="redirectToHome()">
          <i class="fas fa-shopping-bag"></i> Start Shopping
        </button>
      </div>`;
    updateCartSummary(0);
    return;
  }

  let html = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    html += `
      <div class="cart-item" data-index="${index}">
        <div class="item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;">` : item.emoji}
        </div>
        <div class="item-details">
          <div class="item-name">${item.name}</div>
          <div class="item-price">₱${item.price.toFixed(2)} each</div>
        </div>
        <div class="quantity-controls">
          <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">−</button>
          <span class="quantity-display">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <div class="item-total">₱${itemTotal.toFixed(2)}</div>
        <button class="remove-btn" onclick="removeItem(${index})">
          <i class="fas fa-trash"></i>
        </button>
      </div>`;
  });

  container.innerHTML = html;
  updateCartSummary(subtotal);
}

function updateQuantity(index, change) {
  const cart = getCart();
  if (!cart[index]) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  setCart(cart);
  loadCartItems();
  updateCartCount();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  loadCartItems();
  updateCartCount();
}

function updateCartSummary(subtotal) {
  const shipping = subtotal > 0 ? 50 : 0;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("shipping").textContent = shipping.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("cartTotal").textContent = total.toFixed(2);

  const summary = document.getElementById("cartSummary");
  if (summary) summary.style.display = subtotal > 0 ? "block" : "none";
}

function checkout() {
  const cart = getCart();
  const customer = JSON.parse(localStorage.getItem("customer"));
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!cart.length) return alert("Your cart is empty!");

  const datePlaced = new Date().toISOString().slice(0, 19).replace("T", " ");

  const orderData = {
    user_id: user.id,
    customer_id: customer.id,
    items: cart.map(item => ({
      item_id: item.id,
      quantity: item.quantity,
      price: item.price
    })),
    date_placed: datePlaced
  };

  // Show loading state
  const checkoutBtn = document.getElementById("checkoutBtn");
  checkoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
  checkoutBtn.disabled = true;

  $.ajax({
    url: "http://localhost:4000/api/orders",
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    data: JSON.stringify(orderData),
    success: function (response) {
      // Show success message
      alert("🎉 Order placed successfully! Check your email for confirmation.");
      localStorage.removeItem("cart");
      window.location.href = "home.html";
    },
    error: function (xhr) {
      console.error("Order submission failed:", xhr.responseText);
      alert("Failed to submit order.");
      
      // Reset button state
      checkoutBtn.innerHTML = '<i class="fas fa-credit-card"></i> Proceed to Checkout';
      checkoutBtn.disabled = false;
    }
  });
}

// ==============================
// Optional Utilities
// ==============================

function redirectToHome() {
  window.location.href = "home.html";
}

function hideLoading() {
  const loader = document.querySelector(".loading");
  if (loader) loader.style.display = "none";
}
