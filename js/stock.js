import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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
  let allProducts = [];
  let currentPage = 1;
  const itemsPerPage = 8;

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
      displayProducts(allProducts);
      updateSummary(allProducts); // Add this line
    }
  });

  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (searchTerm === '') {
      displayProducts(allProducts);
      return;
    }

    const filteredProducts = allProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm)
    );

    displayProducts(filteredProducts);
  });

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
        <td>${product.category}</td>
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
});