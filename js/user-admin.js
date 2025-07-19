// =====================
// user-admin.js - Admin Management
// =====================

function initializeAdminModule() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  if (!token || role !== "admin") {
    console.error("Unauthorized: Token missing or role is not admin");
    return;
  }

  const table = $("#adminTable").DataTable({
    ajax: {
      url: `${baseUrl}api/v1/users`,
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      dataSrc: function (json) {
        console.log("Admin API response:", json);
        return (json.users || []).filter(user => user.role === "admin");
      },
      error: function (xhr, status, error) {
        console.error("Failed to fetch admins:", error);
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
    const role = data.role;
    let roleHtml = `<span class="badge bg-primary">${role}</span>`;

    // Only show demote button if role is 'admin' and user is not deactivated
    if (role === "admin" && data.deleted_at === null) {
      roleHtml += ` <button class="btn btn-sm btn-warning demoteBtn" data-id="${data.id}" data-name="${data.f_name} ${data.l_name}">Demote</button>`;
    }

    return roleHtml;
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
            <button class="btn btn-sm btn-danger deleteBtn" data-id="${data.id}" data-name="${data.f_name} ${data.l_name}" data-bs-toggle="modal" data-bs-target="#confirmDeleteModal">Deactivate</button>
          `;
        }
      },
    ],
    destroy: true,
  });

  // Search Filter
  $("#adminSearch").on("keyup", function () {
    table.search(this.value).draw();
  });
}

$(document).on("click", ".demoteBtn", function () {
  const userId = $(this).data("id");
  const name = $(this).data("name");
  const token = localStorage.getItem("token");

  if (confirm(`Are you sure you want to demote admin ${name} to a user?`)) {
    $.ajax({
      url: `${baseUrl}api/v1/users/${userId}/role`,
      method: "PUT",
      contentType: "application/json",
      data: JSON.stringify({ role: "user" }),
      beforeSend: function (xhr) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      },
      success: function () {
        showToast("Admin successfully demoted to user.");
        $("#adminTable").DataTable().ajax.reload(null, false);
      },
      error: function () {
        alert("Failed to demote admin.");
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