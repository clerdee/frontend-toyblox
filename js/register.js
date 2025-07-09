document.getElementById('register-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch('http://localhost:4000/api/v1/users', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      showNotification('Registration successful! Logging you in...');
      localStorage.setItem('user', JSON.stringify(result.user || { f_name: formData.get('f_name'), l_name: formData.get('l_name'), email: formData.get('email') }));
      setTimeout(() => {
        window.location.reload();
      }, 1500);
      form.reset();
    } else {
      showNotification(result.error || 'Registration failed!', true);
    }
  } catch (error) {
    showNotification('Network error: ' + error.message, true);
  }
});

// Custom notification function
function showNotification(message, isError = false) {
  let notif = document.createElement('div');
  notif.className = 'custom-notification' + (isError ? ' error' : '');
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.remove();
  }, 2000);
}