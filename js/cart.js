// cart.js

/**
 * Adds a product to the cart. If already in the cart, increases quantity.
 * @param {Object} product - Must include: id, name, price, emoji (optional)
 */
function addToCart(product) {
  const cart = getCart();

  // Normalize the product structure
  const item = {
    id: product.id || product.item_id, 
    name: product.name,
    price: parseFloat(product.price || product.sell_price || 0), 
    image: product.image || product.image_url || '', 
    emoji: product.emoji || '🧸', 
    quantity: 1
  };

  const existingItem = cart.find(cartItem => cartItem.id === item.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  setCart(cart);
  updateCartCount();
  alert(`🧸 Added "${item.name}" to cart!`);
}


/**
 * Retrieves the cart array from localStorage.
 * @returns {Array}
 */
function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

/**
 * Saves the updated cart array to localStorage.
 * @param {Array} cart
 */
function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/**
 * Updates the visible cart count in the header.
 * Expects an element with class `.cart-count` or `#headerCartCount`.
 */
function updateCartCount() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Try both class-based and ID-based cart counters
  const countEl = document.querySelector(".cart-count") || document.getElementById("headerCartCount");
  if (countEl) countEl.textContent = total;
}

/**
 * Loads cart items into the cart page (cart.html).
 */
function loadCartItems() {
  const cartContainer = document.getElementById("cartContainer");
  const cart = getCart();

  if (cart.length === 0) {
    cartContainer.innerHTML = `
      <div class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added any toys to your cart yet.</p>
        <button class="btn-primary" onclick="window.location.href='home.html'">
          <i class="fas fa-shopping-bag"></i> Start Shopping
        </button>
      </div>`;
    updateCartSummary(0);
    return;
  }

  let cartHTML = '';
  let subtotal = 0;

  cart.forEach((item, index) => {
    console.log("Item in cart:", item);
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    cartHTML += `
      <div class="cart-item" data-index="${index}">
<div class="item-image">
  ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:50px;height:50px;">` : (item.emoji || '🧸')}
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

  cartContainer.innerHTML = cartHTML;
  updateCartSummary(subtotal);
}

/**
 * Adjusts the quantity of a cart item.
 * Removes the item if quantity falls below 1.
 * @param {number} index - Index of the item in the cart
 * @param {number} change - Quantity change (+1 or -1)
 */
function updateQuantity(index, change) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    setCart(cart);
    loadCartItems();
    updateCartCount();
  }
}

/**
 * Removes an item completely from the cart.
 * @param {number} index
 */
function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  loadCartItems();
  updateCartCount();
}

/**
 * Updates the summary section (subtotal, shipping, tax, total).
 * @param {number} subtotal
 */
function updateCartSummary(subtotal) {
  const shipping = subtotal > 0 ? 50 : 0;
  const tax = subtotal * 0.12;
  const total = subtotal + shipping + tax;

  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("shipping").textContent = shipping.toFixed(2);
  document.getElementById("tax").textContent = tax.toFixed(2);
  document.getElementById("cartTotal").textContent = total.toFixed(2);

  const summary = document.getElementById("cartSummary");
  summary.style.display = subtotal === 0 ? 'none' : 'block';
}

/**
 * Simulates the checkout process.
 * Clears the cart and redirects.
 */
function checkout() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  alert("🎉 Thank you for your purchase!");
  localStorage.removeItem("cart");
  window.location.href = "home.html";
}

// Initial setup after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();

  // For cart.html
  if (document.getElementById("cartContainer")) {
    setTimeout(() => {
      const loading = document.querySelector(".loading");
      if (loading) loading.style.display = "none";
      loadCartItems();
    }, 1000);
  }

  const checkoutBtn = document.getElementById("checkoutBtn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", checkout);
  }
});
