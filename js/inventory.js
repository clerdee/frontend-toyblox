// frontend-toyblox/js/inventory.js
// Remove the immediate $(document).ready() wrapper
// Instead, export a function that can be called when needed

let inventoryInitialized = false;

function initializeInventory() {
  if (inventoryInitialized) {
    console.log('📋 Inventory already initialized, skipping...');
    return;
  }
  
  console.log('🔄 Initializing Inventory module...');
  
  const baseUrl = 'http://localhost:4000/';
  let stockData = [];
  let itemsPerLoad = 10;
  let currentIndex = 0;

  // Check if required elements exist
  const stockTable = $('#stockTable');
  const stockSearch = $('#stockSearch');
  
  if (stockTable.length === 0) {
    console.error('❌ #stockTable element not found');
    return;
  }
  
  if (stockSearch.length === 0) {
    console.error('❌ #stockSearch element not found');
    return;
  }
  
  console.log('✅ Required elements found');
  console.log('📡 Making API request to:', `${baseUrl}api/v1/stocks`);

  // Fetch all stocks initially
  $.ajax({
    url: `${baseUrl}api/v1/stocks`,
    method: 'GET',
    beforeSend: function() {
      console.log('⏳ Sending request...');
      // Show loading message
      $('#stockTable tbody').html('<tr><td colspan="3" style="text-align: center; padding: 20px;">Loading stock data...</td></tr>');
    },
    success: function (res) {
      console.log('✅ API Response received:', res);
      console.log('📊 Response type:', typeof res);
      console.log('📊 Response keys:', Object.keys(res));
      
      // Handle different response formats with better debugging
      if (res && Array.isArray(res.data)) {
        stockData = res.data;
        console.log('📊 Stock data from res.data (array):', stockData);
      } else if (res && res.data && typeof res.data === 'object') {
        // If res.data is an object, check if it has array properties
        console.log('📊 res.data is object:', res.data);
        const possibleArrays = Object.keys(res.data).filter(key => Array.isArray(res.data[key]));
        console.log('📊 Possible array keys:', possibleArrays);
        
        if (possibleArrays.length > 0) {
          stockData = res.data[possibleArrays[0]];
          console.log('📊 Using first array found:', possibleArrays[0], stockData);
        } else {
          // If res.data is an object but not an array, convert to array
          stockData = Object.values(res.data);
          console.log('📊 Converted object to array:', stockData);
        }
      } else if (Array.isArray(res)) {
        stockData = res;
        console.log('📊 Stock data from direct array:', stockData);
      } else if (res && typeof res === 'object') {
        // Check if the response object has properties that look like stock data
        console.log('📊 Response is object, checking for stock properties...');
        const possibleKeys = ['stocks', 'items', 'inventory', 'results'];
        let found = false;
        
        for (let key of possibleKeys) {
          if (res[key] && Array.isArray(res[key])) {
            stockData = res[key];
            console.log(`📊 Found stock data in res.${key}:`, stockData);
            found = true;
            break;
          }
        }
        
        if (!found) {
          // If no standard keys found, check all keys for arrays
          const arrayKeys = Object.keys(res).filter(key => Array.isArray(res[key]));
          if (arrayKeys.length > 0) {
            stockData = res[arrayKeys[0]];
            console.log(`📊 Using first array found in res.${arrayKeys[0]}:`, stockData);
          } else {
            console.error('❌ No arrays found in response object');
            console.error('❌ Response structure:', res);
            stockData = [];
          }
        }
      } else {
        console.error('❌ Unexpected response format:', res);
        console.error('❌ Response type:', typeof res);
        stockData = [];
      }
      
      console.log('📈 Final stock data:', stockData);
      console.log('📈 Number of records:', stockData.length);
      
      // Clear loading message
      $('#stockTable tbody').empty();
      
      if (stockData.length > 0) {
        console.log('🚀 Rendering initial batch...');
        renderNextBatch();
        setupInfiniteScroll(stockData);
      } else {
        console.log('⚠️ No stock data found');
        $('#stockTable tbody').html('<tr><td colspan="3" style="text-align: center; padding: 20px; color: #666;">No stock data available</td></tr>');
      }
    },
    error: function (xhr, status, error) {
      console.error('❌ Error fetching stocks:');
      console.error('  Status:', status);
      console.error('  Error:', error);
      console.error('  Response:', xhr.responseText);
      console.error('  Status Code:', xhr.status);
      
      let errorMessage = 'Error loading data';
      if (xhr.status === 0) {
        errorMessage = 'Cannot connect to server. Is it running on port 4000?';
      } else if (xhr.status === 404) {
        errorMessage = 'API endpoint not found (404)';
      } else if (xhr.status === 500) {
        errorMessage = 'Server error (500)';
      }
      
      $('#stockTable tbody').html(`
        <tr>
          <td colspan="3" style="text-align: center; padding: 20px; color: red;">
            <strong>Error:</strong> ${errorMessage}
            <br><small>Check console for details</small>
          </td>
        </tr>
      `);
    }
  });

  // Render a batch of rows
  function renderNextBatch(dataSet = stockData) {
    console.log('📋 Rendering batch from index:', currentIndex);
    console.log('📋 Dataset length:', dataSet.length);
    
    if (currentIndex >= dataSet.length) {
      console.log('📋 No more data to render');
      return;
    }
    
    const nextBatch = dataSet.slice(currentIndex, currentIndex + itemsPerLoad);
    console.log('📋 Next batch size:', nextBatch.length);
    console.log('📋 Next batch data:', nextBatch);
    
    let rowsHtml = '';
    nextBatch.forEach(row => {
      console.log('➕ Adding row:', row);
      rowsHtml += `
        <tr>
          <td style="padding: 8px;">${row.stock_id || 'N/A'}</td>
          <td style="padding: 8px;">${row.item_id || 'N/A'}</td>
          <td style="padding: 8px;">${row.quantity || 'N/A'}</td>
        </tr>
      `;
    });
    
    $('#stockTable tbody').append(rowsHtml);
    currentIndex += itemsPerLoad;
    console.log('📋 Updated currentIndex:', currentIndex);
    console.log('📋 Total rows now:', $('#stockTable tbody tr').length);
  }

  // Infinite scrolling
  function setupInfiniteScroll(dataSet) {
    console.log('🔄 Setting up infinite scroll');
    
    const scrollContainer = $('#stockTable').parent();
    
    scrollContainer.off('scroll').on('scroll', function () {
      const container = $(this);
      const scrollTop = container.scrollTop();
      const scrollHeight = container[0].scrollHeight;
      const clientHeight = container.innerHeight();
      
      // Check if we're near the bottom (within 10px)
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        console.log('🔄 Scroll bottom reached, loading more...');
        if (currentIndex < dataSet.length) {
          renderNextBatch(dataSet);
        } else {
          console.log('🔄 No more data to load');
        }
      }
    });
  }

  // Search functionality
  $('#stockSearch').on('input', function () {
    const keyword = $(this).val().toLowerCase();
    console.log('🔍 Search keyword:', keyword);
    
    if (keyword.trim() === '') {
      console.log('🔍 Empty search, showing all data');
      $('#stockTable tbody').empty();
      currentIndex = 0;
      renderNextBatch(stockData);
      setupInfiniteScroll(stockData);
      return;
    }
    
    const filtered = stockData.filter(stock => {
      // Add null checks for safety
      const stockId = stock.stock_id ? stock.stock_id.toString().toLowerCase() : '';
      const itemId = stock.item_id ? stock.item_id.toString().toLowerCase() : '';
      const quantity = stock.quantity ? stock.quantity.toString().toLowerCase() : '';
      
      return stockId.includes(keyword) || 
             itemId.includes(keyword) || 
             quantity.includes(keyword);
    });

    console.log('🔍 Filtered results:', filtered.length, 'items');
    console.log('🔍 Filtered data:', filtered);
    
    $('#stockTable tbody').empty();
    currentIndex = 0;
    
    if (filtered.length > 0) {
      renderNextBatch(filtered);
      setupInfiniteScroll(filtered);
    } else {
      $('#stockTable tbody').html('<tr><td colspan="3" style="text-align: center; padding: 20px; color: #666;">No matching records found</td></tr>');
    }
  });

  inventoryInitialized = true;
  console.log('✅ Inventory.js setup complete');
}

// Make the function globally available
window.initializeInventory = initializeInventory;