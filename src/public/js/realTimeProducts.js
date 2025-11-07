// Inicializo la con del socket del lado del cliente
const socket = io();

const productList = document.getElementById('products-list');
const createForm = document.getElementById('create-product-form');

// Funcion para renderizar la lista de productos
const renderProducts = (products) => {
    productList.innerHTML = '';

    if (products.length === 0) {
        productList.innerHTML = '<li>No hay productos para mostrar.</li>';
        return;
    }

    // Crea y suma cada producto a la lista
    products.forEach(product => {
        const productElement = document.createElement('li');
        productElement.id = `product-${product.id}`;
        productElement.innerHTML = `
            <button class="delete-btn" data-id="${product.id}">Eliminar</button>
            <strong>${product.title}</strong> (ID: ${product.id})<br>
            Descripcion: ${product.description}<br>
            Precio: $${product.price} | Stock: ${product.stock} | Codigo: ${product.code}
        `;
        productList.appendChild(productElement);
    });
};

// Escuchamos el evento 'updateProducts' del servidor
socket.on('updateProducts', (products) => {
    console.log('Lista de productos actualizada recibida:', products);
    renderProducts(products);
});

// Manejamos el envio del formulario de creacion
createForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Obtenemos los datos del formulario
    const formData = new FormData(createForm);
    const productData = {};
    formData.forEach((value, key) => {
        productData[key] = value;
    });

    // Emitimos el evento 'createProduct' al servidor
    console.log('Enviando producto para crear:', productData);
    socket.emit('createProduct', productData);

    createForm.reset();
});

// Usamos delegacion de eventos en la lista de productos
productList.addEventListener('click', (e) => {
    // Verificamos si el clic fue en un boton de eliminar
    if (e.target.classList.contains('delete-btn')) {
        const productId = e.target.getAttribute('data-id');
        console.log('Enviando ID para eliminar:', productId);
        
        // Emitimos el evento 'deleteProduct' al servidor
        socket.emit('deleteProduct', productId);
    }
});

socket.on('productError', (error) => {
    console.error('Error desde el servidor:', error.message);
    alert(`Error: ${error.message}`);
});