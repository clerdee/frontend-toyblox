        const navLinks = document.querySelectorAll('.nav-link');
        const contentSections = document.querySelectorAll('.content-section');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                navLinks.forEach(nl => nl.classList.remove('active'));
                contentSections.forEach(section => section.classList.remove('active'));
                
                link.classList.add('active');
                
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });

        // File upload functionality
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
            });
        }

        // Form submission
        const productForm = document.querySelector('.product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Product added successfully! 🎉');
                productForm.reset();
            });
        }

        // Action buttons
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

        // Load item.html into the #products section dynamically
    function loadProductManagement() {
        fetch('item.html')
            .then(res => res.text())
            .then(html => {
                const container = document.getElementById('productManagementContainer');
                container.innerHTML = html;

                // Wait for DOM update before running DataTable init
                setTimeout(() => {
                    // Now load and run the item.js logic AFTER DOM has updated
                    $.getScript('../js/item.js')
                        .done(() => {
                            console.log('Item JS loaded successfully');
                        })
                        .fail(() => {
                            console.error('Failed to load item.js');
                        });
                }, 100);
            })
            .catch(err => {
                console.error('Failed to load item management:', err);
            });
    }

        document.querySelector('a[href="#products"]').addEventListener('click', () => {
    loadProductManagement();
    }); 
