import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove, push, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { read, utils, write } from 'https://cdn.sheetjs.com/xlsx-0.19.3/package/xlsx.mjs';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-gGTPAHIbPl87q1ifGIn2e5vxhXBlWiE",
  authDomain: "productsdata-dede1.firebaseapp.com",
  databaseURL: "https://productsdata-dede1-default-rtdb.firebaseio.com",
  projectId: "productsdata-dede1",
  storageBucket: "productsdata-dede1.appspot.com",
  messagingSenderId: "663702486621",
  appId: "1:663702486621:web:103db80cc8980cc68497b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', function() {
  const tbody = document.querySelector('#stocks tbody');
  const productsRef = ref(database, 'products');
  const searchInput = document.getElementById('searchProducts');
  const categoryFilter = document.getElementById('categoryFilter');
  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 8;
  let currentFilter = '';

  onValue(productsRef, (snapshot) => {
    allProducts = [];
    tbody.innerHTML = ''; 
    const products = snapshot.val();
    
    if (products) {
      // Modify this section to include IDs
      allProducts = Object.entries(products).map(([id, product]) => ({
        ...product,
        id: id
      }));
      filterProducts(); // Use filterProducts instead of displayProducts
    }
  });

  // Add category filter event listener
  categoryFilter.addEventListener('change', (e) => {
    currentFilter = e.target.value;
    filterProducts();
  });

  // Update search input event listener
  searchInput.addEventListener('input', (e) => {
    filterProducts();
  });

  // Combined filter function
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const filteredProducts = allProducts.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm) ||
        product.category.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm);
        
      const matchesCategory = 
        currentFilter === '' || product.category === currentFilter;
        
      return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
    updateSummary(filteredProducts); // Update summary with filtered results
  }

  function displayProducts(products) {
    tbody.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    // Display current page products
    paginatedProducts.forEach((product) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="name-cell">${product.name}</td>
        <td data-category="${product.category}"><span>${product.category}</span></td>
        <td class="stock-cell">${product.quantity}</td>
        <td class="status-cell">
          <button class="status-button ${product.quantity >= 2 ? 'active' : 'low'}">
            ${product.quantity >= 2 ? 'IN STOCK' : 'LOW STOCK'}
          </button>
        </td>
        <td class="action-cell">
          <button onclick="editProduct('${product.id}')" class="edit-btn">
            <span class="material-symbols-outlined">edit</span>
          </button>
          <button onclick="deleteProduct('${product.id}')" class="delete-btn">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });

    // Add empty rows if needed to maintain 8 rows
    const currentRows = paginatedProducts.length;
    for (let i = currentRows; i < itemsPerPage; i++) {
      const emptyRow = document.createElement('tr');
      emptyRow.innerHTML = `
        <td class="name-cell">-</td>
        <td>-</td>
        <td class="stock-cell">-</td>
        <td class="status-cell">
          <button class="status-button" disabled>-</button>
        </td>
        <td class="action-cell">-</td>  <!-- Add this line to maintain table structure -->
      `;
      tbody.appendChild(emptyRow);
    }

    // Create pagination container
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'pagination-wrapper';

    // Add entries info
    const entriesInfo = document.createElement('div');
    entriesInfo.className = 'entries-info';
    const startEntry = Math.min((currentPage - 1) * itemsPerPage + 1, products.length);
    const endEntry = Math.min(currentPage * itemsPerPage, products.length);
    entriesInfo.textContent = `Showing ${startEntry} to ${endEntry} out of ${products.length} entries`;

    // Create pagination controls
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    const totalPages = Math.ceil(products.length / itemsPerPage);
    paginationContainer.innerHTML = `
      <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})"><<</button>
      <span>Page ${currentPage} of ${totalPages}</span>
      <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">>></button>
    `;

    // Remove existing pagination if any
    const existingPagination = document.querySelector('.pagination-wrapper');
    if (existingPagination) {
      existingPagination.remove();
    }

    // Combine entries info and pagination
    paginationWrapper.appendChild(entriesInfo);
    paginationWrapper.appendChild(paginationContainer);

    // Add to document
    document.querySelector('#stocks').after(paginationWrapper);
  }

  // Add this function to global scope
  window.changePage = function(newPage) {
    if (newPage >= 1 && newPage <= Math.ceil(allProducts.length / itemsPerPage)) {
      currentPage = newPage;
      displayProducts(allProducts);
    }
  };

  // Update edit function
  window.editProduct = function(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    // Create edit form HTML
    const editForm = `
      <div class="edit-modal">
        <div class="edit-content">
          <h2>Edit Product</h2>
          <div class="form-group">
            <label for="editName">Name</label>
            <input type="text" id="editName" value="${product.name}" placeholder="Name">
          </div>
          <div class="form-group">
            <label for="editCategory">Category</label>
            <select id="editCategory">
              <option value="tshirt" ${product.category === 'tshirt' ? 'selected' : ''}>T-shirt</option>
              <option value="bags" ${product.category === 'bags' ? 'selected' : ''}>Bags</option>
              <option value="hat" ${product.category === 'hat' ? 'selected' : ''}>Hat</option>
              <option value="pants" ${product.category === 'pants' ? 'selected' : ''}>Pants</option>
              <option value="dress" ${product.category === 'dress' ? 'selected' : ''}>Dress</option>
              <option value="shoes" ${product.category === 'shoes' ? 'selected' : ''}>Shoes</option>
            </select>
          </div>
          <div class="form-group">
            <label for="editQuantity">Quantity</label>
            <input type="number" id="editQuantity" value="${product.quantity}" placeholder="Quantity">
          </div>
          <div class="form-group">
            <label for="editDescription">Description</label>
            <textarea id="editDescription" placeholder="Description">${product.description || ''}</textarea>
          </div>
          <div class="edit-buttons">
            <button onclick="saveEdit('${productId}')">Save</button>
            <button onclick="closeEdit()">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', editForm);
  };

  // Update save edit function
  window.saveEdit = function(productId) {
    const updatedProduct = {
      name: document.getElementById('editName').value,
      category: document.getElementById('editCategory').value,
      quantity: parseInt(document.getElementById('editQuantity').value),
      description: document.getElementById('editDescription').value
    };

    // Validate input
    if (!updatedProduct.name || !updatedProduct.category || isNaN(updatedProduct.quantity)) {
      alert('Please fill in all required fields correctly');
      return;
    }

    update(ref(database, `products/${productId}`), updatedProduct)
      .then(() => {
        closeEdit();
        // Optional: Show success message
        alert('Product updated successfully!');
      })
      .catch(error => {
        console.error("Error updating product:", error);
        alert('Error updating product. Please try again.');
      });
  };

  // Add close edit function to global scope
  window.closeEdit = function() {
    const modal = document.querySelector('.edit-modal');
    if (modal) modal.remove();
  };

  // Add delete function to global scope
  window.deleteProduct = function(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      remove(ref(database, `products/${productId}`))
        .catch(error => console.error("Error deleting product:", error));
    }
  };

  function updateSummary(products) {
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.quantity < 2).length;
    const inStockCount = products.filter(p => p.quantity >= 2).length;

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('lowStockCount').textContent = lowStockCount;
    document.getElementById('inStockCount').textContent = inStockCount;

    // Calculate most common category
    const categories = products.map(p => p.category);
    const commonCategory = categories.reduce((a, b) =>
      categories.filter(v => v === a).length >= categories.filter(v => v === b).length ? a : b
    );
    document.getElementById('commonCategory').textContent = commonCategory.charAt(0).toUpperCase() + commonCategory.slice(1);

    // Calculate average stock
    const avgStock = Math.round(products.reduce((sum, p) => sum + p.quantity, 0) / totalProducts);
    document.getElementById('avgStock').textContent = avgStock;

    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleString();
  }

  // Add these functions to handle Excel operations
  window.importExcel = function() {
    // Create file input if it doesn't exist
    let fileInput = document.getElementById('excelFileInput');
    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'excelFileInput';
      fileInput.accept = '.xlsx, .xls';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);
    }
    fileInput.click();

    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = utils.sheet_to_json(worksheet);

        // Format the data
        const formattedProducts = jsonData.map(row => ({
          name: String(row.Name || row.name || ''),
          category: String(row.Category || row.category || '').toLowerCase(),
          quantity: parseInt(row.Quantity || row.quantity || 0),
          description: String(row.Description || row.description || '')
        }));

        // Validate data
        const validProducts = formattedProducts.filter(product => 
          product.name && 
          product.category && 
          !isNaN(product.quantity)
        );

        if (validProducts.length === 0) {
          alert('No valid products found in Excel file. Please check the format.');
          return;
        }

        // Import to Firebase
        const updates = {};
        validProducts.forEach(product => {
          const newKey = push(ref(database, 'products')).key;
          updates[`products/${newKey}`] = product;
        });

        await update(ref(database), updates);
        alert(`Successfully imported ${validProducts.length} products!`);

      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing file. Please check the format and try again.');
      }

      fileInput.value = ''; // Reset file input
    });
  };

  window.exportExcel = function() {
    try {
      if (allProducts.length === 0) {
        alert('No products to export');
        return;
      }

      // Format data for export
      const exportData = allProducts.map(product => ({
        Name: product.name,
        Category: product.category,
        Quantity: product.quantity,
        Description: product.description || ''
      }));

      // Create worksheet
      const ws = utils.json_to_sheet(exportData);

      // Set column widths
      const colWidths = [
        { wch: 30 }, // Name
        { wch: 15 }, // Category
        { wch: 10 }, // Quantity
        { wch: 40 }  // Description
      ];
      ws['!cols'] = colWidths;

      // Create workbook and add worksheet
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Inventory');

      // Generate Excel file
      const excelBuffer = write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        bookSST: false
      });
      
      // Create and trigger download
      const blob = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data. Please try again.');
    }
  };

  // Modal functionality
  const modal = document.getElementById('addProductModal');
  const addBtn = document.getElementById('addNewBtn');
  const closeBtn = document.querySelector('.close-modal');
  const cancelBtn = document.querySelector('.cancel-btn');
  const addProductForm = document.getElementById('addProductForm');

  // Open modal
  addBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  // Close modal
  const closeModal = () => {
    modal.style.display = 'none';
    addProductForm.reset();
  };

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Update form submission handler
  addProductForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const productData = {
      name: document.getElementById('productName').value,
      category: document.getElementById('category').value,
      quantity: parseInt(document.getElementById('stockQuantity').value),
      description: document.getElementById('description').value || ''
    };

    // Validate input
    if (!productData.name || !productData.category || isNaN(productData.quantity)) {
      alert('Please fill in all required fields correctly');
      return;
    }

    try {
      // Generate a new key for the product
      const newProductRef = push(ref(database, 'products'));
      
      // Save the product data
      await set(newProductRef, productData);
      
      // Close modal and reset form
      closeModal();
      addProductForm.reset();
      
      // The product will automatically appear in the table because of the
      // onValue listener we set up earlier
      
      // Optional: Show success message
      alert('Product added successfully!');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  });

  // Ensure the onValue listener is properly set up
  onValue(productsRef, (snapshot) => {
    allProducts = [];
    tbody.innerHTML = '';
    const products = snapshot.val();
    
    if (products) {
      // Convert Firebase data to array with IDs
      allProducts = Object.entries(products).map(([id, product]) => ({
        ...product,
        id: id
      }));
      
      currentPage = 1; // Reset to first page when data changes
      filterProducts(); // This will trigger displayProducts with the new data
    } else {
      // Handle case when there are no products
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="no-data">No products available</td>
        </tr>
      `;
    }
  });
});