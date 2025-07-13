$(document).ready(function () {
  const baseUrl = 'http://localhost:4000/';
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id || user.role !== 'user') {
    window.location.href = 'home.html';
    return;
  }

  const userId = user.id;

  $.ajax({
    url: `${baseUrl}api/v1/users/${userId}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    },
    success: function (res) {
      const data = res.data;

      $('#firstName').val(data.f_name);
      $('#lastName').val(data.l_name);
      $('#email').val(data.email);
      $('#address').val(data.address || '');
      $('#postalCode').val(data.postal_code || '');
      $('#country').val(data.country || '');
      $('#phone').val(data.phone_number || '');

      if (data.profile_picture) {
        $('#profileImage').attr('src', `${baseUrl}images/${data.profile_picture}`);
      }
    },
    error: function (xhr) {
      console.error('Profile fetch error:', xhr.responseText);
      alert('❌ Failed to load profile data. You may not be authorized.');
      window.location.href = 'home.html';
    }
  });
});
