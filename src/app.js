import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js'; 
import ProductManager from './managers/ProductManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 8080;
const productManager = new ProductManager(path.join(__dirname, './data/products.json'));

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

io.on('connection', async (socket) => {
    console.log('Nuevo cliente conectado');

    // 1. Enviar la lista de productos al cliente que se acaba de conectar
    try {
        const products = await productManager.getProducts();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener productos para el nuevo cliente:', error);
    }

    // 2. Escuchar el evento 'createProduct' (desde el formulario)
    socket.on('createProduct', async (productData) => {
        try {
            // Parseamos los datos que vienen del formulario
            const newProduct = {
                title: productData.title,
                description: productData.description,
                code: productData.code,
                price: parseFloat(productData.price),
                status: productData.status === 'true',
                stock: parseInt(productData.stock, 10),
                category: productData.category,
                thumbnails: productData.thumbnails ? productData.thumbnails.split(',').map(s => s.trim()) : []
            };
            
            await productManager.addProduct(newProduct);
            
            // 3. Obtener la lista actualizada y emitirla a TODOS los clientes
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts); // Usamos io.emit para enviar a todos
        } catch (error) {
            console.error('Error al crear producto:', error);
            socket.emit('productError', { message: error.message });
        }
    });

    // 4. Escuchar el evento 'deleteProduct' (desde el boton de eliminar)
    socket.on('deleteProduct', async (productId) => {
        try {
            await productManager.deleteProduct(productId);
            
            // 5. Obtener la lista actualizada y emitirla a TODOS los clientes
            const updatedProducts = await productManager.getProducts();
            io.emit('updateProducts', updatedProducts); // Usamos io.emit para enviar a todos
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            socket.emit('productError', { message: error.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});

// Usamos 'server.listen' en lugar de 'app.listen' para que socket.io funcione
server.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});