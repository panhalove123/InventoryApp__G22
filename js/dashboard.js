document.addEventListener('DOMContentLoaded', function () {
    console.log('Dashboard script loaded.');

    // Define default categories and initial stock levels
    const defaultCategories = ['T-shirt', 'Hat', 'Bag', 'Pants', 'Dress', 'Shoes'];
    const initialStockLevels = [100, 80, 60, 120, 90, 70]; // Example stock levels

    // Normalize stock levels by dividing by 10
    const normalizeStockLevels = (stockLevels) => stockLevels.map(stock => Math.round(stock / 10) * 10);

    // Define thresholds for low and critical stock (after normalization)
    const lowStockThreshold = 5; // 50 units (50 / 10 = 5)
    const criticalStockThreshold = 2; // 20 units (20 / 10 = 2)

    // Define colors based on stock levels
    const getColor = (stock) => {
        if (stock <= criticalStockThreshold) return 'rgba(255, 99, 132, 0.5)'; // Red
        if (stock <= lowStockThreshold) return 'rgba(255, 206, 86, 0.5)'; // Yellow
        return 'rgba(75, 192, 192, 0.5)'; // Green
    };

    // Prepare data for the chart
    let inventoryData = {
        labels: defaultCategories,
        datasets: [
            {
                label: 'Stock Level (Normalized)',
                data: normalizeStockLevels(initialStockLevels),
                backgroundColor: normalizeStockLevels(initialStockLevels).map(stock => getColor(stock)),
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }
        ]
    };

    console.log('Initial inventory data:', inventoryData);

    const ctx = document.getElementById('salesChart').getContext('2d');
    const config = {
        type: 'bar',
        data: inventoryData,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Inventory Balance Chart (Normalized)'
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            label += context.raw * 10 + ' units'; // Convert back to original units in tooltip
                            return label;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Stock Level (Normalized)'
                    },
                    ticks: {
                        stepSize: 10
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Product Categories'
                    }
                }
            }
        },
    };

    const inventoryChart = new Chart(ctx, config);
    console.log('Inventory chart initialized.');

    // Function to update inventory data from localStorage
    function updateInventoryData() {
        console.log('Updating inventory data from localStorage...');

        const products = JSON.parse(localStorage.getItem('products')) || [];
        console.log('Products from localStorage:', products);

        // Reset inventory data
        inventoryData.labels = defaultCategories;
        inventoryData.datasets[0].data = normalizeStockLevels(initialStockLevels);
        inventoryData.datasets[0].backgroundColor = normalizeStockLevels(initialStockLevels).map(stock => getColor(stock));

        // Update inventory data based on localStorage
        products.forEach(product => {
            const categoryIndex = inventoryData.labels.indexOf(product.category);
            if (categoryIndex !== -1) {
                console.log(`Updating stock for category: ${product.category} with quantity: ${product.quantity}`);
                const updatedStock = inventoryData.datasets[0].data[categoryIndex] + Math.round(product.quantity / 10);
                inventoryData.datasets[0].data[categoryIndex] = updatedStock;
                inventoryData.datasets[0].backgroundColor[categoryIndex] = getColor(updatedStock);
            } else {
                console.log(`Adding new category: ${product.category} with quantity: ${product.quantity}`);
                const normalizedStock = Math.round(product.quantity / 10);
                inventoryData.labels.push(product.category);
                inventoryData.datasets[0].data.push(normalizedStock);
                inventoryData.datasets[0].backgroundColor.push(getColor(normalizedStock));
            }
        });

        console.log('Updated inventory data:', inventoryData);

        // Update the chart
        inventoryChart.update();
        console.log('Inventory chart updated.');
    }

    // Initialize inventory data when the page loads
    updateInventoryData();

    // Periodically check for updates (e.g., every 5 seconds)
    setInterval(() => {
        console.log('Checking for updates in localStorage...');
        updateInventoryData();
    }, 5000);
});