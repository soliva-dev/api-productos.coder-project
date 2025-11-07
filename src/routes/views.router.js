import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuracion de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const productManager = new ProductManager(path.join(__dirname, '../data/products.json'));

const router = Router();

// Ruta GET / .. vista solo estatica, solo muestra los productos al cargar la pagina
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza 'home.handlebars' y pasa la lista de productos
        res.render('home', { products: products, title: 'Home - Lista de Productos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta GET /realtimeproducts .. esta vista cargara la lista inicial de productos y luego usara websockets
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        // Renderiza 'realTimeProducts.handlebars' y pasa la lista
        res.render('realTimeProducts', { products: products, title: 'Productos en Tiempo Real' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;