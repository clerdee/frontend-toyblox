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
  const container = document.getElementById('inventoryManagementContainer');
  if (!container.hasChildNodes()) {
    $.get('../admin/inventory.html', function (data) {
      container.innerHTML = data;
      $.getScript('../js/inventory.js');
    });
  } else {
    $.getScript('../js/inventory.js');
  }
}
