// MANUAL PAGINATION EXAMPLE
//     $(document).ready(function () {
//         const baseUrl = 'http://localhost:4000/';

//     const table = $('#itemTable').DataTable({
//     paging: false,   // ❌ Disable built-in pagination
//     searching: false,
//     info: false,
//     ajax: {
//         url: `${baseUrl}api/v1/items`,
//         dataSrc: "rows"
//     },
//     columns: [
//         { data: 'item_id' },
//         {
//             data: 'image',
//             render: function (data) {
//                 return `<img src="${baseUrl}${data}" width="50" height="60">`;
//             }
//         },
//         { data: 'description' },
//         { data: 'cost_price' },
//         { data: 'sell_price' },
//         { data: 'quantity' },
//         {
//             data: null,
//             render: function (data) {
//                 return `
//                     <a href='#' class='editBtn' data-id="${data.item_id}">
//                         <i class='fas fa-edit' aria-hidden='true' style='font-size:24px'></i>
//                     </a>
//                     <a href='#' class='deletebtn' data-id="${data.item_id}">
//                         <i class='fas fa-trash-alt' style='font-size:24px; color:red'></i>
//                     </a>
//                 `;
//             }
//         }
//     ],
//     initComplete: function(settings, json) {
//         buildManualPagination(json.rows); // ✅ Create custom pagination
//     }
//     });
// });

// function buildManualPagination(data) {
//     const itemsPerPage = 5;
//     const totalPages = Math.ceil(data.length / itemsPerPage);

//     const $pagination = $('<div id="customPagination" class="pagination"></div>');
//     for (let i = 1; i <= totalPages; i++) {
//         $pagination.append(`<button class="page-btn" data-page="${i}">${i}</button>`);
//     }

//     $('#itemTable').after($pagination);

//     // Show only page 1 by default
//     showPage(1, data, itemsPerPage);

//     $('.page-btn').on('click', function () {
//         const page = parseInt($(this).data('page'));
//         showPage(page, data, itemsPerPage);
//     });
// }

// function showPage(page, data, itemsPerPage) {
//     const start = (page - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     const pageData = data.slice(start, end);

//     const table = $('#itemTable').DataTable();
//     table.clear();
//     table.rows.add(pageData).draw();
// }

// DEFAULT DATATABLE EXAMPLE
    //     const table = $('#itemTable').DataTable({
    //         ajax: {
    //             url: `${baseUrl}api/v1/items`,
    //             dataSrc: "rows"
    //         },
    //         dom: 'Bfrtip',
    //         buttons: [
    //             'pdf',
    //             'excel',
    //             {
    //                 text: 'Add item',
    //                 className: 'btn btn-primary',
    //                 action: function () {
    //                     $("#iform").trigger("reset");
    //                     $('#itemModal').modal('show');
    //                     $('#itemUpdate').hide();
    //                     $('#itemImage').remove();
    //                     $('#itemId').remove();
    //                     $('#itemSubmit').show();
    //                 }
    //             }
    //         ],
    //         columns: [
    //             { data: 'item_id' },
    //             {
    //                 data: 'image',
    //                 render: function (data) {
    //                     return `<img src="${baseUrl}${data}" width="50" height="60">`;
    //                 }
    //             },
    //             { data: 'description' },
    //             { data: 'cost_price' },
    //             { data: 'sell_price' },
    //             { data: 'quantity' },
    //             {
    //                 data: null,
    //                 render: function (data) {
    //                     return `
    //                         <a href='#' class='editBtn' data-id="${data.item_id}">
    //                             <i class='fas fa-edit' aria-hidden='true' style='font-size:24px'></i>
    //                         </a>
    //                         <a href='#' class='deletebtn' data-id="${data.item_id}">
    //                             <i class='fas fa-trash-alt' style='font-size:24px; color:red'></i>
    //                         </a>
    //                     `;
    //                 }
    //             }
    //         ]
    //     });

    // });

