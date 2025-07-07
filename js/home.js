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

        document.addEventListener('DOMContentLoaded', function() {
          // Show user name and logout if logged in
          const user = JSON.parse(localStorage.getItem('user'));
          const userNameDisplay = document.getElementById('userNameDisplay');
          const logoutBtn = document.getElementById('logoutBtn');
          const userIcon = document.getElementById('userIcon');
          const profileModal = document.getElementById('profileModal');
          const closeProfileModal = document.getElementById('closeProfileModal');

          if (user && user.f_name) {
            userNameDisplay.textContent = user.f_name;
            userNameDisplay.style.display = 'inline';
            logoutBtn.style.display = 'inline-block';
            userIcon.style.cursor = 'pointer';
            userIcon.onclick = function() {
              showProfileModal(user);
            };
          } else {
            userNameDisplay.style.display = 'none';
            logoutBtn.style.display = 'none';
            userIcon.style.cursor = 'default';
            userIcon.onclick = null;
          }

          logoutBtn && logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('user');
            window.location.reload();
          });

          // Login form logic
          const loginForm = document.querySelector('#loginForm form');
          if (loginForm) {
            loginForm.addEventListener('submit', async function(e) {
              e.preventDefault();
              const email = document.getElementById('loginEmail').value;
              const password = document.getElementById('loginPassword').value;
              try {
                const response = await fetch('http://localhost:4000/api/v1/users/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password })
                });
                const result = await response.json();
                if (response.ok) {
                  showNotification('Login successful!');
                  localStorage.setItem('user', JSON.stringify(result.user || { f_name: result.f_name, l_name: result.l_name, email: result.email }));
                  setTimeout(() => { window.location.reload(); }, 1200);
                } else {
                  showNotification(result.error || 'Login failed!', true);
                }
              } catch (error) {
                showNotification('Network error: ' + error.message, true);
              }
            });
          }

          // Update user icon click to go to profile.html if logged in
          if (user && user.f_name) {
            userIcon.style.cursor = 'pointer';
            userIcon.onclick = function() {
              window.location.href = 'profile.html';
            };
          } else {
            userIcon.style.cursor = 'default';
            userIcon.onclick = function() {
              userModal.style.display = 'block';
              document.body.style.overflow = 'hidden';
            };
          }
        });
