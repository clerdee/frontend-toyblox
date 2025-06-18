$(document).ready(function () {
    // const url = 'http://192.168.1.4:3000/';

    // Initialize DataTable with AJAX source and buttons
    const table = $('#itable').DataTable({
        ajax: {
            url: `${url}api/v1/items`,
            dataSrc: "rows"
        },
        dom: 'Bfrtip',
        buttons: [
            'pdf',
            'excel',
            {
                text: 'Add item',
                className: 'btn btn-primary',
                action: function () {
                    $("#iform").trigger("reset");
                    $('#itemModal').modal('show');
                    $('#itemUpdate').hide();
                    $('#itemImage').remove();
                    $('#itemId').remove();
                    $('#itemSubmit').show();
                }
            }
        ],
        columns: [
            { data: 'item_id' },
            {
                data: null,
                render: function (data) {
                    return `<img src="${url}${data.image}" width="50" height="60">`;
                }
            },
            { data: 'description' },
            { data: 'cost_price' },
            { data: 'sell_price' },
            { data: 'quantity' },
            {
                data: null,
                render: function (data) {
                    return `
                        <a href='#' class='editBtn' data-id="${data.item_id}">
                            <i class='fas fa-edit' aria-hidden='true' style='font-size:24px'></i>
                        </a>
                        <a href='#' class='deletebtn' data-id="${data.item_id}">
                            <i class='fas fa-trash-alt' style='font-size:24px; color:red'></i>
                        </a>
                    `;
                }
            }
        ],
    });

    // ADD item
    $("#itemSubmit").on('click', function (e) {
        e.preventDefault();
        let formData = new FormData($('#iform')[0]);
        $.ajax({
            method: "POST",
            url: `${url}api/v1/items`,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "json",
            success: function () {
                $("#itemModal").modal("hide");
                table.ajax.reload();
                $('#iform')[0].reset();
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // EDIT item - Populate modal with item data
    $('#itable tbody').on('click', 'a.editBtn', function (e) {
        e.preventDefault();
        $('#itemImage').remove();
        $('#itemId').remove();
        $("#iform").trigger("reset");
        const id = $(this).data('id');
        $('#itemModal').modal('show');
        $('<input>').attr({ type: 'hidden', id: 'itemId', name: 'item_id', value: id }).appendTo('#iform');
        $('#itemSubmit').hide();
        $('#itemUpdate').show();

        $.ajax({
            method: "GET",
            url: `${url}api/v1/items/${id}`,
            dataType: "json",
            success: function (data) {
                const item = data.result[0];
                $('#desc').val(item.description);
                $('#sell').val(item.sell_price);
                $('#cost').val(item.cost_price);
                $('#qty').val(item.quantity);
                $("#iform").append(`<img src="${url}${item.image}" width='200px' height='200px' id="itemImage" />`);
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // UPDATE item
    $("#itemUpdate").on('click', function (e) {
        e.preventDefault();
        const id = $('#itemId').val();
        let formData = new FormData($('#iform')[0]);

        $.ajax({
            method: "PUT",
            url: `${url}api/v1/items/${id}`,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "json",
            success: function () {
                $('#itemModal').modal("hide");
                table.ajax.reload();
                $('#iform')[0].reset();
                $('#itemSubmit').show();
                $('#itemUpdate').hide();
            },
            error: function (error) {
                console.log(error);
            }
        });
    });

    // DELETE item
    $('#itable tbody').on('click', 'a.deletebtn', function (e) {
        e.preventDefault();
        const id = $(this).data('id');
        const $row = $(this).closest('tr');
        bootbox.confirm({
            message: "Do you want to delete this item?",
            buttons: {
                confirm: {
                    label: 'Yes',
                    className: 'btn-success'
                },
                cancel: {
                    label: 'No',
                    className: 'btn-danger'
                }
            },
            callback: function (result) {
                if (result) {
                    $.ajax({
                        method: "DELETE",
                        url: `${url}api/v1/items/${id}`,
                        dataType: "json",
                        success: function (data) {
                            $row.fadeOut(400, function () {
                                table.row($row).remove().draw();
                            });
                            bootbox.alert(data.message);
                        },
                        error: function (error) {
                            bootbox.alert('Could not delete item.');
                        }
                    });
                }
            }
        });
    });
});