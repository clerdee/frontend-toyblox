$(document).ready(function () {
  const baseUrl = 'http://localhost:4000/';
  let stockData = [];
  let itemsPerLoad = 10;
  let currentIndex = 0;

  // Fetch all stocks initially
  $.ajax({
    url: `${baseUrl}api/v1/stocks`,
    method: 'GET',
    success: function (res) {
      stockData = res.data || [];
      renderNextBatch();
      setupInfiniteScroll(stockData);
    },
    error: function (err) {
      console.error('Error fetching stocks:', err);
    }
  });

  // Render a batch of rows
  function renderNextBatch(dataSet = stockData) {
    const nextBatch = dataSet.slice(currentIndex, currentIndex + itemsPerLoad);
    nextBatch.forEach(row => {
      $('#stockTable tbody').append(`
        <tr>
          <td>${row.stock_id}</td>
          <td>${row.item_id}</td>
          <td>${row.quantity}</td>
        </tr>
      `);
    });
    currentIndex += itemsPerLoad;
  }

  // Infinite scrolling
  function setupInfiniteScroll(dataSet) {
    $('#stockTable').parent().off('scroll').on('scroll', function () {
      const container = $(this);
      if (container.scrollTop() + container.innerHeight() >= container[0].scrollHeight - 10) {
        renderNextBatch(dataSet);
      }
    });
  }

  // Search functionality
  $('#stockSearch').on('input', function () {
    const keyword = $(this).val().toLowerCase();
    const filtered = stockData.filter(stock =>
      stock.stock_id.toString().includes(keyword) ||
      stock.item_id.toString().includes(keyword) ||
      stock.quantity.toString().includes(keyword)
    );

    $('#stockTable tbody').empty();
    currentIndex = 0;
    renderNextBatch(filtered);
    setupInfiniteScroll(filtered);
  });
});
