// frontend-toyblox/js/admin-partials.js
// =====================
// Section Navigation
// =====================
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');

navLinks.forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();

    // Remove active from all
    navLinks.forEach(nl => nl.classList.remove('active'));
    contentSections.forEach(section => section.classList.remove('active'));

    // Activate current
    this.classList.add('active');
    const targetId = this.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetId === 'products') {
      loadProductManagement();
    } else if (targetId === 'inventory') {
      loadInventorySection();
    } else if (targetId === 'customers') {
      loadCustomerManagement();
    }

    if (targetSection) {
      targetSection.classList.add('active');
    }
  });
});

// =====================
// File Upload Drag & Drop
// =====================
const fileUpload = document.querySelector('.file-upload input');
const uploadArea = document.querySelector('.upload-area');

if (fileUpload && uploadArea) {
  uploadArea.addEventListener('click', () => fileUpload.click());

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ff6b6b';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ddd';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ddd';
    // Optionally assign files: fileUpload.files = e.dataTransfer.files;
  });
}

// =====================
// Add Product Form Submit (Static Form)
// =====================
const productForm = document.querySelector('.product-form');
if (productForm) {
  productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Product added successfully! 🎉');
    productForm.reset();
  });
}

// =====================
// Edit/Delete Button Handlers
// =====================
document.querySelectorAll('.btn-icon.edit').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Edit functionality would be implemented here');
  });
});

document.querySelectorAll('.btn-icon.delete').forEach(btn => {
  btn.addEventListener('click', () => {
    if (confirm('Are you sure you want to delete this product?')) {
      alert('Product deleted successfully');
    }
  });
});

// =====================
// Load Products Section (item.html)
// =====================
function loadProductManagement() {
  fetch('item.html')
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById('productManagementContainer');
      container.innerHTML = html;

      // Run item.js after loading the DOM
      setTimeout(() => {
        $.getScript('../js/item.js')
          .done(() => console.log('Item JS loaded successfully'))
          .fail(() => console.error('Failed to load item.js'));
      }, 100);
    })
    .catch(err => {
      console.error('Failed to load item management:', err);
    });
}

// =====================
// Load Inventory Section
// =====================
function loadInventorySection() {
  console.log('Loading inventory section...');
  
  const container = document.getElementById('inventoryManagementContainer');
  
  // Always reload the content to ensure fresh state
  console.log('Loading fresh inventory content...');
  
  // Load inventory.html
  fetch('../admin/inventory.html')
    .then(response => {
      console.log('Inventory HTML response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(html => {
      console.log('Inventory HTML loaded successfully');
      container.innerHTML = html;
      
      // Wait for DOM to be ready, then initialize inventory
      setTimeout(() => {
        initializeInventoryModule();
      }, 200);
    })
    .catch(error => {
      console.error('Failed to load inventory.html:', error);
      container.innerHTML = `
        <div class="error-message" style="padding: 20px; text-align: center; color: red;">
          <h3>Error Loading Inventory</h3>
          <p>Failed to load inventory.html: ${error.message}</p>
          <p>Please check if the file exists at: ../admin/inventory.html</p>
        </div>
      `;
    });
}

// =====================
// Initialize Inventory Module
// =====================
function initializeInventoryModule() {
  console.log('Initializing inventory module...');
  
  // Check if inventory.js is already loaded and has the initializeInventory function
  if (typeof window.initializeInventory === 'function') {
    console.log('inventory.js already loaded, calling initializeInventory()');
    window.initializeInventory();
    return;
  }
  
  // Load inventory.js if not already loaded
  if (typeof jQuery !== 'undefined') {
    // Remove any existing script to prevent conflicts
    $('script[src*="inventory.js"]').remove();
    
    $.getScript('../js/inventory.js')
      .done(() => {
        console.log('Inventory JS loaded successfully');
        // Call the initialization function after script loads
        setTimeout(() => {
          if (typeof window.initializeInventory === 'function') {
            console.log('Calling initializeInventory() after script load');
            window.initializeInventory();
          } else {
            console.error('initializeInventory function not found after loading script');
          }
        }, 100);
      })
      .fail((jqxhr, settings, exception) => {
        console.error('Failed to load inventory.js:', exception);
        console.error('Status:', jqxhr.status);
        console.error('Response:', jqxhr.responseText);
        
        // Show error message to user
        const container = document.getElementById('inventoryManagementContainer');
        container.innerHTML += `
          <div class="script-error" style="margin-top: 20px; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; color: #721c24;">
            <strong>Script Loading Error:</strong> Failed to load inventory.js
            <br>Please check if the file exists at: ../js/inventory.js
          </div>
        `;
      });
  } else {
    console.error('jQuery not loaded - cannot load inventory.js');
    const container = document.getElementById('inventoryManagementContainer');
    container.innerHTML += `
      <div class="jquery-error" style="margin-top: 20px; padding: 15px; background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 4px; color: #721c24;">
        <strong>jQuery Error:</strong> jQuery is not loaded. Please ensure jQuery is loaded before this script.
      </div>
    `;
  }
}
