$(document).ready(function () {
    const baseUrl = 'http://localhost:4000/';

    const table = $('#itemTable').DataTable({
        ajax: {
            url: `${baseUrl}api/v1/items`,
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
                data: 'image',
                render: function (data) {
                    return `<img src="${baseUrl}${data}" width="50" height="60">`;
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
        ]
    });

});

