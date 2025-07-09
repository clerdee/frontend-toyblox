document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:4000/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('Login successful! Redirecting...');
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('token', result.token); // If your backend returns a token
      setTimeout(() => {
        // Redirect based on role
        if (result.user.role === 'admin') {
          window.location.href = 'admin/admin.html';
        } else {
          window.location.href = 'home.html';
        }
      }, 1500);
    } else {
      showNotification(result.error || 'Invalid credentials!', true);
    }
  } catch (error) {
    showNotification('Network error: ' + error.message, true);
  }
});

function showNotification(message, isError = false) {
  let notif = document.createElement('div');
  notif.className = 'custom-notification' + (isError ? ' error' : '');
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 2000);
}
