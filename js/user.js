// =====================
// user.js - Customer Management
// =====================

function initializeUserModule() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  if (!token || role !== "admin") {
    console.error("Unauthorized: Token missing or role is not admin");
    return;
  }

  const table = $("#userTable").DataTable({
    ajax: {
      url: `${baseUrl}api/v1/users`,
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      dataSrc: function (json) {
        console.log("User API response:", json);
        return json.users || [];
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch users:", error);
      },
    },
    columns: [
      { data: "id" },
      {
        data: "profile_picture",
        render: function (data) {
        return `<img src="http://localhost:4000/images/${data}" alt="Profile" width="40" height="40" class="rounded-circle">`;
        }
      },
      {
        data: null,
        render: function (data) {
          return `${data.f_name} ${data.l_name}`;
        },
      },
      { data: "email" },
      { data: "role" },
      {
        data: "created_at",
        render: function (data) {
          const date = new Date(data);
          return date.toLocaleDateString();
        },
      },
        {
        data: null,
        render: function (data) {
            const isDeactivated = data.deleted_at !== null;

            if (isDeactivated) {
            return `
                <button class="btn btn-sm btn-success reactivateBtn" data-id="${data.id}">Reactivate</button>
            `;
            }

            return `
            <button class="btn btn-sm btn-info editBtn" data-id="${data.id}" data-bs-toggle="modal" data-bs-target="#userModal">Edit</button>
            <button class="btn btn-sm btn-danger deleteBtn" data-id="${data.id}" data-name="${data.f_name} ${data.l_name}" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">Deactivate</button>
            `;
        }
        },
    ],
    destroy: true,
  });

  // Search Filter
  $("#userSearch").on("keyup", function () {
    table.search(this.value).draw();
  });

  // Role Filter
//   $("#roleFilter").on("change", function () {
//     table.column(4).search(this.value).draw();
//   });
}

// edit functionality
$(document).on("click", ".editBtn", function () {
  const id = $(this).data("id");
  console.log("Edit user ID clicked:", id);
  if (id) {
    viewUser(id); 
  } else {
    alert("Invalid user ID!");
  }
});

$("#userForm").on("submit", function (e) {
  e.preventDefault();

  const id = $("#editUserId").val();
  const token = localStorage.getItem("token");

  const updatedUser = {
    f_name: $("#editFName").val().trim(),
    l_name: $("#editLName").val().trim(),
    email: $("#editEmail").val().trim(),
    role: $("#editRole").val()
  };

  $.ajax({
    url: `${baseUrl}api/v1/users/${id}`,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(updatedUser),
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function () {
      $("#userModal").modal("hide");
      $("#userTable").DataTable().ajax.reload(null, false);
    },
    error: function (xhr) {
      alert("Failed to update user role: " + xhr.responseText);
    }
  });
});

// deactivate functionality
// Open Delete Modal and set user ID
$(document).on("click", ".deleteBtn", function () {
  deleteUserId = $(this).data("id"); // save to global
  const name = $(this).data("name");
  $("#confirmDeleteModal .modal-body").html(`
    Are you sure you want to delete <strong>${name}</strong>?
    <input type="hidden" id="deleteUserId" value="${deleteUserId}">
  `);
  $("#confirmDeleteModal").modal("show");
});

// Confirm deletion
$("#confirmDeleteBtn").on("click", function () {
  const token = localStorage.getItem("token");

  if (!deleteUserId) return;

  $.ajax({
    url: `${baseUrl}api/v1/users/${deleteUserId}`,
    method: "DELETE",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function () {
      $("#confirmDeleteModal").modal("hide");
      $("#userTable").DataTable().ajax.reload(null, false);
      showToast("User deactivated successfully.");
    },
    error: function () {
      alert("Failed to deactivate user.");
    }
  });
});


// reactivate functionality
$(document).on("click", ".reactivateBtn", function () {
  const id = $(this).data("id");
  const token = localStorage.getItem("token");

  if (confirm("Are you sure you want to reactivate this user?")) {
    $.ajax({
      url: `${baseUrl}api/v1/users/${id}/reactivate`,
      method: "PUT",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: function () {
        $("#userTable").DataTable().ajax.reload(null, false);
      },
      error: function () {
        alert("Failed to reactivate user.");
      }
    });
  }
});

function viewUser(id) {
  const token = localStorage.getItem("token");

  $.ajax({
    url: `${baseUrl}api/v1/users/${id}`,
    method: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function (user) {
      $("#editUserId").val(user.id);
      $("#editFName").val(user.f_name);
      $("#editLName").val(user.l_name);
      $("#editEmail").val(user.email);
      $("#editRole").val(user.role);
      $("#userModal").modal("show");
    },
    error: function (xhr) {
      alert("Failed to load user: " + xhr.responseText);
    }
  });
}

// Preview image for add/edit user
  function previewAddImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('addImagePreview');
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  }

  function previewEditImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('editImagePreview');
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  }