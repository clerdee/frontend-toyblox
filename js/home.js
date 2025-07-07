        // User Modal Functionality
        const userIcon = document.getElementById('userIcon');
        const userModal = document.getElementById('userModal');
        const closeModal = document.getElementById('closeModal');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');

        // Open modal
        userIcon.addEventListener('click', function() {
            userModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        // Close modal
        closeModal.addEventListener('click', function() {
            userModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === userModal) {
                userModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Switch to register form
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
        });

        // Switch to login form
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
        });

        // Handle login form submission
        loginForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simple validation
            if (email && password) {
                alert('Welcome back to Toy Kingdom! 🏰');
                userModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Update user icon to show logged in state
                userIcon.innerHTML = '👑';
                userIcon.title = 'Account Settings';
            }
        });

        // Handle register form submission
        registerForm.querySelector('form').addEventListener('submit', function(e) {
            e.preventDefault();
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const agreeTerms = document.getElementById('agreeTerms').checked;
            
            // Simple validation
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!agreeTerms) {
                alert('Please agree to the Terms & Conditions');
                return;
            }
            
            if (firstName && lastName && email && password) {
                alert(`Welcome to Toy Kingdom, ${firstName}! 🎪`);
                userModal.style.display = 'none';
                document.body.style.overflow = 'auto';
                
                // Update user icon to show logged in state
                userIcon.innerHTML = '👑';
                userIcon.title = 'Account Settings';
            }
        });

        // Simple cart functionality
        let cartCount = 0;
        const cartCountElement = document.querySelector('.cart-count');
        const addToCartButtons = document.querySelectorAll('.btn-small');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function() {
                cartCount++;
                cartCountElement.textContent = cartCount;
                
                // Add animation
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 100);
                
                // Change button text temporarily
                const originalText = this.textContent;
                this.textContent = 'Added!';
                this.style.backgroundColor = '#2ecc71';
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 1000);
            });
        });

        // Newsletter subscription
        const emailInput = document.querySelector('.email-input');
        const subscribeButton = document.querySelector('.newsletter-form .btn-primary');

        subscribeButton.addEventListener('click', function() {
            if (emailInput.value.trim() !== '') {
                alert('Thank you for joining our kingdom! 🏰');
                emailInput.value = '';
            }
        });

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });