document.getElementById('addProductButton').addEventListener('click', function () {
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('productCategory').value; 
  const quantity = document.getElementById('stockQuantity').value.trim();
  const description = document.getElementById('productDescription').value.trim();


  if (!name || !category || !quantity) {
      alert('Please fill out all required fields!');
      return;
  }


  const productData = {
      name,
      category,
      quantity,
      description,
  };


  let productList = JSON.parse(localStorage.getItem('products')) || [];

  productList.push(productData);

  localStorage.setItem('products', JSON.stringify(productList));

  alert('Product added successfully!');
  document.getElementById('addProductForm').reset();

  console.log('Products in localStorage:', JSON.parse(localStorage.getItem('products'))); // Debugging
});
