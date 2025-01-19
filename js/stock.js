import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

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

  onValue(productsRef, (snapshot) => {
    tbody.innerHTML = ''; // Clear existing rows
    const products = snapshot.val();
    
    if (products) {
      Object.values(products).forEach((product) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="name-cell">${product.name}</td>
          <td>${product.category}</td>
          <td class="stock-cell">${product.quantity}</td>
          <td class="status-cell">
            <button class="status-button ${product.quantity >= 2 ? 'active' : 'low'}">
              ${product.quantity >= 2 ? 'Active' : 'Low'}
            </button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  }, (error) => {
    console.error("Error fetching products:", error);
    alert("Error fetching products: " + error.message);
  });
});