// profile.js 
$(document).ready(function() {
    const baseUrl = 'http://localhost:4000/';
    const user = JSON.parse(localStorage.getItem('user'));

    if (!user || !user.id || user.role !== 'user') {
        window.location.href = 'home.html';
        return;
    }

    const userId = user.id;

    // Load profile data
    function loadProfileData() {
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
    }

    // Load profile data on page load
    loadProfileData();

    // Handle form submission
    $('.profile-form').on('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData();
        formData.append('f_name', $('#firstName').val().trim());
        formData.append('l_name', $('#lastName').val().trim());
        formData.append('email', $('#email').val().trim());
        formData.append('address', $('#address').val().trim());
        formData.append('postal_code', $('#postalCode').val().trim());
        formData.append('country', $('#country').val());
        formData.append('phone_number', $('#phone').val().trim());

        // Handle password update
        const currentPassword = $('#currentPassword').val().trim();
        const newPassword = $('#newPassword').val().trim();
        const confirmPassword = $('#confirmPassword').val().trim();

        // Password validation
        if (newPassword || currentPassword) {
            if (!currentPassword) {
                alert('❌ Current password is required to change password');
                return;
            }
            if (!newPassword) {
                alert('❌ New password is required');
                return;
            }
            if (newPassword.length < 3) {
                alert('❌ New password must be at least 3 characters long');
                return;
            }
            if (newPassword !== confirmPassword) {
                alert('❌ New passwords do not match');
                return;
            }
            
            formData.append('current_password', currentPassword);
            formData.append('new_password', newPassword);
        }

        // Add profile picture if selected
        const profilePicture = $('#profilePictureInput')[0].files[0];
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        // Validate required fields
        if (!$('#firstName').val().trim() || !$('#lastName').val().trim() || !$('#email').val().trim()) {
            alert('❌ Please fill in all required fields (First Name, Last Name, Email)');
            return;
        }

        // Show loading state
        const submitBtn = $('.submit-btn');
        const originalText = submitBtn.text();
        submitBtn.text('Updating...').prop('disabled', true);

        // Send update request
        $.ajax({
            url: `${baseUrl}api/v1/users/${userId}/profile`,
            method: 'PUT',
            data: formData,
            processData: false,
            contentType: false,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            success: function (res) {
                alert('✅ ' + res.message);
                
                // Clear password fields after successful update
                $('#currentPassword').val('');
                $('#newPassword').val('');
                $('#confirmPassword').val('');
                
                // Update localStorage user data if needed
                const updatedUser = {
                    ...user,
                    f_name: $('#firstName').val().trim(),
                    l_name: $('#lastName').val().trim(),
                    email: $('#email').val().trim()
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                // Reload profile data to reflect changes
                loadProfileData();
            },
            error: function (xhr) {
                console.error('Profile update error:', xhr.responseText);
                const errorMsg = xhr.responseJSON?.error || 'Failed to update profile';
                alert(`❌ ${errorMsg}`);
            },
            complete: function () {
                // Reset button state
                submitBtn.text(originalText).prop('disabled', false);
            }
        });
    });

    // Handle profile picture preview
    window.loadProfileImage = function(event) {
        const output = document.getElementById('profileImage');
        output.src = URL.createObjectURL(event.target.files[0]);
        output.onload = function () {
            URL.revokeObjectURL(output.src);
        };
    };
});