// Import necessary functions from Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-gGTPAHIbPl87q1ifGIn2e5vxhXBlWiE",
  authDomain: "productsdata-dede1.firebaseapp.com",
  databaseURL: "https://productsdata-dede1-default-rtdb.firebaseio.com",
  projectId: "productsdata-dede1",
  storageBucket: "productsdata-dede1.firebasestorage.app",
  messagingSenderId: "663702486621",
  appId: "1:663702486621:web:103db80cc8980cc68497b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


document.getElementById("addProductButton").addEventListener("click", () => {
  const productName = document.getElementById("productName").value.trim();
  const productCategory = document.getElementById("productCategory").value;
  const stockQuantity = document.getElementById("stockQuantity").value.trim();
  const productDescription = document.getElementById("productDescription").value.trim();

  
  if (!productName) {
    alert("Please enter the product name.");
    return;
  }

  if (!productCategory) {
    alert("Please select a product category.");
    return;
  }

  if (!stockQuantity || isNaN(stockQuantity) || Number(stockQuantity) <= 0) {
    alert("Please enter a valid stock quantity.");
    return;
  }

  // Save data to Firebase 
  const productRef = push(ref(database, "products"));
  set(productRef, {
    name: productName,
    category: productCategory,
    quantity: Number(stockQuantity),
    description: productDescription || "No description provided"
  })
  .then(() => {
    alert("Product added successfully!");
    document.getElementById("addProductForm").reset();
  })
  .catch((error) => {
    console.error("Error adding product:", error);
    alert("Error adding product: " + error.message);
  });
});



