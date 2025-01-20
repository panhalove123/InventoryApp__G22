import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-gGTPAHIbPl87q1ifGIn2e5vxhXBlWiE",
  authDomain: "productsdata-dede1.firebaseapp.com",
  databaseURL: "https://productsdata-dede1-default-rtdb.firebaseio.com",
  projectId: "productsdata-dede1",
  storageBucket: "productsdata-dede1.appspot.com",
  messagingSenderId: "663702486621",
  appId: "1:663702486621:web:103db80cc8980cc68497b4",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener('DOMContentLoaded', () => {
  const categoriesSection = document.getElementById('categories');
  const productCardsSection = document.getElementById('product-cards');
  const productsRef = ref(database, 'products/');

  // Add search functionality
  const searchInput = document.getElementById('searchProducts');
  searchInput.addEventListener('input', searchProducts);

  function searchProducts() {
    const searchInput = document.getElementById('searchProducts');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // Don't search if input is empty
    if (!searchTerm) {
        categoriesSection.style.display = 'grid';
        productCardsSection.style.display = 'none';
        return;
    }

    // Show products section, hide categories
    categoriesSection.style.display = 'none';
    productCardsSection.style.display = 'grid';
    productCardsSection.innerHTML = '';

    // Reference to products in Firebase
    const productsRef = ref(database, 'products/');
    
    onValue(productsRef, (snapshot) => {
        const products = snapshot.val();
        let hasResults = false;

        if (products) {
            Object.values(products).forEach(product => {
                // Check all relevant fields for matches
                const matchesName = product.name.toLowerCase().includes(searchTerm);
                const matchesCategory = product.category.toLowerCase().includes(searchTerm);
                const matchesDescription = product.description.toLowerCase().includes(searchTerm);
                const matchesQuantity = product.quantity.toString().includes(searchTerm);

                if (matchesName || matchesCategory || matchesDescription || matchesQuantity) {
                    hasResults = true;
                    // Create product card
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.setAttribute('data-category', product.category);
                    productCard.setAttribute('data-id', product.id);
                    
                    // Highlight matching text
                    const highlightedName = highlightMatch(product.name, searchTerm);
                    const highlightedDescription = highlightMatch(product.description, searchTerm);
                    const highlightedQuantity = highlightMatch(product.quantity.toString(), searchTerm);

                    productCard.innerHTML = `
                        <button class="delete-btn" title="Delete product"></button>
                        <h3 title="${product.name}">${highlightedName}</h3>
                        <div class="product-info">
                            <p class="category"><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Quantity:</strong> ${highlightedQuantity}</p>
                            <p class="description"><strong>Description:</strong> ${highlightedDescription}</p>
                        </div>
                        <div class="status-wrapper">
                            <span class="status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    `;

                    // Add delete functionality
                    const deleteBtn = productCard.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this product?')) {
                            const productRef = ref(database, `products/${product.id}`);
                            remove(productRef).then(() => {
                                productCard.style.animation = 'cardRemove 0.3s ease-out forwards';
                                setTimeout(() => productCard.remove(), 300);
                            }).catch(error => {
                                console.error('Error removing product:', error);
                                alert('Failed to delete product');
                            });
                        }
                    });

                    productCard.style.animation = 'cardAppear 0.3s ease-out forwards';
                    productCardsSection.appendChild(productCard);
                }
            });
        }

        // Show no results 
        if (!hasResults) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = `No products found matching "${searchTerm}"`;
            productCardsSection.appendChild(noResults);
        }
    });
  }

  // Helper function to highlight matching text
  function highlightMatch(text, searchTerm) {
    if (!text) return '';
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background-color: rgba(255, 193, 7, 0.3); padding: 0 2px; border-radius: 2px;">$1</mark>');
  }

  // Add debounce to improve performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Apply debounce to search function
  const debouncedSearch = debounce(searchProducts, 300);
  searchInput.addEventListener('input', debouncedSearch);

  let allProducts = []; // Store all products

  // Fetch all products once
  onValue(productsRef, (snapshot) => {
    const products = snapshot.val();
    if (products) {
      allProducts = Object.values(products);
    }
  });

  // Create and display category cards
  function createCategories() {
    const categories = [
      { id: 'tshirt', display: 'T-shirt' },
      { id: 'bags', display: 'Bags' },
      { id: 'hat', display: 'Hat' },
      { id: 'pants', display: 'Pants' },
      { id: 'dress', display: 'Dress' },
      { id: 'shoes', display: 'Shoes' }
    ];
    
    categories.forEach((category, index) => {
      const categoryCard = document.createElement('div');
      categoryCard.className = 'category-card';
      categoryCard.setAttribute('data-category', category.id);
      categoryCard.style.setProperty('--card-index', index);
      
      categoryCard.innerHTML = `
        <h2>${category.display}</h2>
        <p>Explore our collection of ${category.display.toLowerCase()} products</p>
        <button data-category="${category.id}">View Collection</button>
      `;
      categoriesSection.appendChild(categoryCard);

      // Add click handler to the button
      categoryCard.querySelector('button').addEventListener('click', () => {
        document.querySelectorAll('.category-card').forEach(card => {
          card.classList.remove('active');
        });
        categoryCard.classList.add('active');
        showProductsByCategory(category.id);
      });
    });
  }

  function showProductsByCategory(category) {
    // Hide categories section
    categoriesSection.style.display = 'none';
    
    // Show products section
    productCardsSection.style.display = 'grid';
    productCardsSection.innerHTML = '';
    
    onValue(productsRef, (snapshot) => {
        const products = snapshot.val();
        let hasProducts = false;
        
        if (products) {
            Object.values(products).forEach(product => {
                if (product.category.toLowerCase() === category.toLowerCase()) {
                    hasProducts = true;
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.setAttribute('data-category', product.category);
                    productCard.setAttribute('data-id', product.id); 
                    productCard.innerHTML = `
                        <button class="delete-btn" title="Delete product"></button>
                        <h3 title="${product.name}">${product.name}</h3>
                        <div class="product-info">
                            <p class="category"><strong>Category:</strong> ${product.category}</p>
                            <p><strong>Quantity:</strong> ${product.quantity}</p>
                            <p class="description"><strong>Description:</strong> ${product.description}</p>
                        </div>
                        <div class="status-wrapper">
                            <span class="status ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    `;

                    // Add delete functionality
                    const deleteBtn = productCard.querySelector('.delete-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this product?')) {
                            const productId = productCard.getAttribute('data-id');
                            const productRef = ref(database, `products/${productId}`);
                            remove(productRef).then(() => {
                                productCard.style.animation = 'cardRemove 0.3s ease-out forwards';
                                setTimeout(() => productCard.remove(), 300);
                            }).catch(error => {
                                console.error('Error removing product:', error);
                                alert('Failed to delete product');
                            });
                        }
                    });

                    productCardsSection.appendChild(productCard);
                }
            });
        }

        if (!hasProducts) {
            productCardsSection.innerHTML = `
                <div class="no-results">
                    No products found in ${category} category
                </div>
            `;
        }
    });

    // Add a "Back to Categories" button
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.innerHTML = 'Back to Categories';
    backButton.addEventListener('click', () => {
        categoriesSection.style.display = 'grid';
        productCardsSection.style.display = 'none';
        // Remove active state from all category cards
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
    });
    productCardsSection.insertBefore(backButton, productCardsSection.firstChild);
  }

  createCategories();

  // Add search functionality to handle category and product filtering
  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    if (searchTerm === '') {
        // Show categories, hide products when search is empty
        categoriesSection.style.display = 'grid';
        productCardsSection.style.display = 'none';
        return;
    }

    // Hide categories, show products section when searching
    categoriesSection.style.display = 'none';
    productCardsSection.style.display = 'grid';

    // Filter and display matching products
    const productCards = document.querySelectorAll('.product-card');
    let hasResults = false;

    productCards.forEach(card => {
        const productName = card.querySelector('h3').textContent.toLowerCase();
        const productCategory = card.getAttribute('data-category').toLowerCase();

        if (productName.includes(searchTerm) || productCategory.includes(searchTerm)) {
            card.style.display = 'block';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Show "no results" message if needed
    if (!hasResults) {
        if (!document.querySelector('.no-results')) {
            const noResults = document.createElement('div');
            noResults.className = 'no-results';
            noResults.textContent = 'No products found matching your search.';
            productCardsSection.appendChild(noResults);
        }
    } else {
        const noResults = document.querySelector('.no-results');
        if (noResults) {
            noResults.remove();
        }
    }
  });

  // Add this CSS animation
  const style = document.createElement('style');
  style.textContent = `
      @keyframes cardRemove {
          0% {
              transform: scale(1);
              opacity: 1;
          }
          100% {
              transform: scale(0.8);
              opacity: 0;
          }
      }
  `;
  document.head.appendChild(style);

  // Add CSS for highlight animation
  const highlightStyle = document.createElement('style');
  highlightStyle.textContent = `
      @keyframes cardHighlight {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
      }
  `;
  document.head.appendChild(highlightStyle);
});
