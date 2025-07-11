$(document).ready(function () {
  const baseUrl = 'http://localhost:4000/';
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || !user.id || user.role !== 'user') {
    window.location.href = 'home.html';
    return;
  }

  const userId = user.id;

  $.ajax({
    url: `${baseUrl}api/v1/users/${userId}`, // Should return JOINED data
    method: 'GET',
    success: function (res) {
      const data = res.data || res.rows || res;

      $('#firstName').val(data.fname || data.f_name || '');
      $('#lastName').val(data.lname || data.l_name || '');
      $('#email').val(data.email || '');
      $('#address').val(data.address || '');
      $('#postalCode').val(data.postal_code || '');
      $('#country').val(data.country || '');
      $('#phone').val(data.phone_number || '');

      if (data.profile_picture) {
        $('#profileImage').attr('src', `${baseUrl}${data.profile_picture}`);
      }
    },
    error: function (xhr) {
      console.error('Profile fetch error:', xhr.responseText);
      alert('❌ Failed to load profile data. You may not be authorized.');
      window.location.href = 'home.html';
    }
  });
});
