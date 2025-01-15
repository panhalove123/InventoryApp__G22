document.addEventListener('DOMContentLoaded', function() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tbody = document.querySelector('#stocks tbody');
    
    products.forEach(product => {
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
});