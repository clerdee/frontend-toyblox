document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        window.location.href = 'home.html';
        return;
    }

    document.getElementById('userName').textContent = user.username;
    document.getElementById('userEmail').textContent = user.email;

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'home.html';
    });
});