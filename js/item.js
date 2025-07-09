$(document).ready(function () {
    const baseUrl = 'http://localhost:4000/';
    let allData = [];
    let itemsPerLoad = 10;
    let currentIndex = 0;

    // Fetch data once
    $.ajax({
        url: `${baseUrl}api/v1/items`,
        method: 'GET',
        success: function (res) {
            allData = res.rows;
            renderNextBatch(); // Initial load
            setupInfiniteScroll(allData); // Setup scroll
        }
    });

    // Render next batch of items
    function renderNextBatch(dataSet = allData) {
        const nextBatch = dataSet.slice(currentIndex, currentIndex + itemsPerLoad);
        nextBatch.forEach(renderRow);
        currentIndex += itemsPerLoad;
    }

    // Helper to render a row
    function renderRow(row) {
        let imageHtml = '';

        if (Array.isArray(row.images)) {
            imageHtml = row.images.map(img => {
                const src = `${baseUrl}${img}`;
                return `<img src="${src}" style="max-height: 50px;" class="me-1 mb-1 rounded border" onerror="this.onerror=null;this.src='default.jpg';">`;
            }).join('');
        }

        $('#itemTable tbody').append(`
        <tr>
            <td>${row.item_id}</td>
            <td>${imageHtml}</td>
            <td>${row.description}</td>
            <td>${row.cost_price}</td>
            <td>${row.sell_price}</td>
            <td>${row.quantity}</td>
                <td>
                <a href="#" class="editBtn me-2" data-id="${row.item_id}" style="cursor:pointer;">
                    <i class="fas fa-edit" style="font-size:24px; pointer-events: auto;"></i>
                </a>
                <a href="#" class="deleteBtn" data-id="${row.item_id}" style="cursor:pointer;">
                    <i class="fas fa-trash-alt" style="font-size:24px; color:red; pointer-events: auto;"></i>
                </a>
                </td>
        </tr>
    `);
}

    // Infinite scroll setup
    function setupInfiniteScroll(dataSet) {
        $('#itemTable').parent().off('scroll').on('scroll', function () {
            const container = $(this);
            if (container.scrollTop() + container.innerHeight() >= container[0].scrollHeight - 10) {
                renderNextBatch(dataSet);
            }
        });
    }

    // Search functionality
    $('#itemSearch').on('input', function () {
        const keyword = $(this).val().toLowerCase();
        const filtered = allData.filter(item =>
            item.description.toLowerCase().includes(keyword) ||
            item.item_id.toString().includes(keyword) ||
            item.cost_price.toString().includes(keyword) ||
            item.sell_price.toString().includes(keyword) ||
            item.quantity.toString().includes(keyword)
        );

        $('#itemTable tbody').empty();
        currentIndex = 0;
        renderNextBatch(filtered);
        setupInfiniteScroll(filtered);
    });

    // Edit icon click
    $(document).on('click', '.editBtn', function (e) {
        e.preventDefault();
        const id = $(this).data('id');
        const item = allData.find(i => i.item_id === id);
        if (!item) return;

        $('#itemId').val(item.item_id);
        $('#description').val(item.description);
        $('#cost_price').val(item.cost_price);
        $('#sell_price').val(item.sell_price);
        $('#quantity').val(item.quantity);

    // Show current image previews (multiple)
    if (Array.isArray(item.images) && item.images.length > 0) {
        const previews = item.images.map(img =>
            `<img src="${baseUrl}${img}" width="80" class="me-2 mb-2 rounded border">`
        ).join('');

        $('#currentImagePreview')
            .html(previews)
            .show();
    } else {
        $('#currentImagePreview').hide();
    }
        $('#itemModal').modal('show');
    });

    // Submit form (edit)
    $('#itemForm').on('submit', function (e) {
    e.preventDefault();
    const id = $('#itemId').val();

    const form = document.getElementById('itemForm');
    const formData = new FormData(form);

    $.ajax({
        url: `${baseUrl}api/v1/items/${id}`,
        method: 'PUT',
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            showToast('Item updated successfully.', 'success');
            $('#itemModal').modal('hide');
            reloadTable();
        },
        error: function () {
            showToast('Error updating item.', 'danger');
        }
    });
    });

// delete functionality
let deleteId = null;

$(document).on('click', '.deleteBtn', function (e) {
    e.preventDefault();
    deleteId = $(this).data('id');
    $('#deleteItemId').val(deleteId);
    $('#confirmDeleteModal').modal('show');
});

$('#confirmDeleteBtn').on('click', function () {
    const id = $('#deleteItemId').val();

    $.ajax({
        url: `${baseUrl}api/v1/items/${id}`,
        method: 'DELETE',
        success: function () {
            $('#confirmDeleteModal').modal('hide');
            showToast('Item deleted successfully.', 'success');
            reloadTable();
        },
        error: function () {
            $('#confirmDeleteModal').modal('hide');
            showToast('Failed to delete item.', 'danger');
        }
    });
});

    // Show toast notification
    function showToast(message, type = 'success') {
        const toastEl = $('#notificationToast');
        const toastBody = $('#toastMessage');

        // Update message and color
        toastBody.text(message);
        toastEl.removeClass('bg-success bg-danger bg-info bg-warning')
                .addClass(`bg-${type}`);

        // Bootstrap 5 toast init and show
        const toast = new bootstrap.Toast(toastEl[0]);
        toast.show();
    }

    // Reload table data
    function reloadTable() {
        $.get(`${baseUrl}api/v1/items`, function (res) {
            allData = res.rows;
            $('#itemTable tbody').empty();
            currentIndex = 0;
            renderNextBatch();
            setupInfiniteScroll(allData);
        });
    }
});
