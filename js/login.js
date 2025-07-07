async function login(email, password) {
    try {
        const response = await fetch('YOUR_API_ENDPOINT/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Update UI elements
            const userIcon = document.querySelector('.user-icon');
            userIcon.innerHTML = `<img src="assets/user-logged-in.png" alt="Profile">`;
            userIcon.href = 'profile.html';
            
            // Show success message (using a toast or custom notification)
            showNotification('Login successful!', 'success');
            
            // Redirect to previous page or home
            window.location.href = document.referrer || 'index.html';
        } else {
            showNotification(data.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('An error occurred. Please try again.', 'error');
    }
}

// Add this notification function
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Add this to check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        const userIcon = document.querySelector('.user-icon');
        userIcon.innerHTML = `<img src="assets/user-logged-in.png" alt="Profile">`;
        userIcon.href = 'profile.html';
    }
});