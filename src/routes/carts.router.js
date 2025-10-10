import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const cartManager = new CartManager('./src/data/carts.json');
const productManager = new ProductManager('./src/data/products.json');


// POST /api/carts/
router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/carts/:cid
router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        res.json(cart.products);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
});

// POST /api/carts/:cid/product/:pid
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        // Aca vemos si el producto existe antes de agregarlo al carrito
        await productManager.getProductById(productId);

        const updatedCart = await cartManager.addProductToCart(cartId, productId);
        res.json(updatedCart);
    } catch (error) {
        // Diferencio si el error es por producto o carrito no encontrado
        if (error.message.includes('Producto')) {
            res.status(404).json({ error: `Producto con id ${req.params.pid} no encontrado.` });
        } else if (error.message.includes('Carrito')) {
            res.status(404).json({ error: `Carrito con id ${req.params.cid} no encontrado.` });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

export default router;