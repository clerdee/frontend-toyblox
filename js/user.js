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
        return (json.users || []).filter(user => user.role === "user");
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
        {
          data: null,
          render: function (data) {
            const isAdmin = data.role === 'admin';
            return `
              <span class="badge bg-${isAdmin ? 'primary' : 'secondary'}">${data.role}</span>
              ${!isAdmin ? `<button class="btn btn-sm btn-warning ms-2 promoteBtn" data-id="${data.id}">Promote to Admin</button>` : ''}
            `;
          }
        },
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
          <button class="btn btn-sm btn-danger deleteBtn" data-id="${data.id}" data-name="${data.f_name} ${data.l_name}" data-bs-toggle="modal" data-target="#confirmDeleteModal">Deactivate</button>
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
}

// promote to admin functionality
$(document).on("click", ".promoteBtn", function () {
  const userId = $(this).data("id");
  const token = localStorage.getItem("token");

  if (!token || !userId) return;

  const rowData = $("#userTable").DataTable().row($(this).closest("tr")).data();

  if (!rowData) {
    alert("User data not found in table.");
    return;
  }

  if (confirm(`Are you sure you want to promote ${rowData.f_name} ${rowData.l_name} to admin?`)) {
    const updatedUser = {
      f_name: rowData.f_name,
      l_name: rowData.l_name,
      email: rowData.email,
      role: "admin"
    };

    $.ajax({
      url: `${baseUrl}api/v1/users/${userId}`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify(updatedUser),
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: function () {
        $("#userTable").DataTable().ajax.reload(null, false);
        showToast("User promoted to admin successfully.");
      },
      error: function (xhr) {
        alert("Failed to promote user: " + xhr.responseText);
      }
    });
  }
});

// deactivate functionality
$(document).on("click", ".deleteBtn", function () {
  deleteUserId = $(this).data("id");
  const name = $(this).data("name");
  $("#confirmDeleteModal .modal-body").html(`
    Are you sure you want to delete <strong>${name}</strong>?
    <input type="hidden" id="deleteUserId" value="${deleteUserId}">
  `);
  $("#confirmDeleteModal").modal("show");
});

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
      if (!user || !user.id) {
        alert("User not found.");
        return;
      }

      $("#editUserId").val(user.id);
      $("#editFName").val(user.f_name || '');
      $("#editLName").val(user.l_name || '');
      $("#editEmail").val(user.email || '');
      $("#editRole").val(user.role || 'user');

      // Load and preview profile picture
      if (user.profile_picture) {
        $("#editImagePreview").attr("src", `http://localhost:4000/images/${user.profile_picture}`);
        $("#editImagePreview").show();
      } else {
        $("#editImagePreview").hide();
      }

      $("#userModal").modal("show");
    },
    error: function (xhr) {
      alert("Failed to load user: " + xhr.responseText);
    }
  });
}

// image preview
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

// optional toast helper
function showToast(message) {
  alert(message);
}

function showCustomDialog(message) {
  const modalHtml = `
    <div class="modal fade" id="customDialogModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">System Notice</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${message}
          </div>
        </div>
      </div>
    </div>
  `;
  $("body").append(modalHtml);
  const modal = new bootstrap.Modal(document.getElementById("customDialogModal"));
  modal.show();

  // Remove modal HTML from DOM after hidden
  $('#customDialogModal').on('hidden.bs.modal', function () {
    $(this).remove();
  });
}

// Handle Add User Form Submission
$("#addUserForm").on("submit", function (e) {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) {
    alert("Unauthorized. Please log in again.");
    return;
  }

  const formData = new FormData(this);

  $.ajax({
    url: `${baseUrl}api/v1/users`,
    method: "POST",
    data: formData,
    processData: false,
    contentType: false,
    beforeSend: function (xhr) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    },
    success: function (response) {
      $("#addUserModal").modal("hide");
      $("#addUserForm")[0].reset();
      $("#addImagePreview").hide();
      $("#userTable").DataTable().ajax.reload(null, false);
      showToast("User added successfully!");
    },
    error: function (xhr) {
      const errorMsg = xhr.responseJSON?.error || "Something went wrong.";
      alert("Failed to add user: " + errorMsg);
    }
  });
});
