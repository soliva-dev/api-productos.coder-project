import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

router.post('/', async (req, res) => {
    try {
        const newCart = await cartManager.createCart();
        res.status(201).json({
            status: 'success',
            payload: newCart
        });
    } catch (error) {
        console.error('Error en POST /api/carts:', error);
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.get('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        res.json({
            status: 'success',
            payload: cart
        });
    } catch (error) {
        console.error('Error en GET /api/carts/:cid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity || 1;

        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        res.json({
            status: 'success',
            payload: updatedCart
        });
    } catch (error) {
        console.error('Error en POST /api/carts/:cid/product/:pid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 400;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;

        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Producto eliminado del carrito correctamente'
        });
    } catch (error) {
        console.error('Error en DELETE /api/carts/:cid/products/:pid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body;

        if (!quantity || quantity <= 0) {
            return res.status(400).json({
                status: 'error',
                message: 'La cantidad debe ser un numero mayor a 0'
            });
        }

        const updatedCart = await cartManager.updateProductQuantity(cartId, productId, quantity);
        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Cantidad actualizada correctamente'
        });
    } catch (error) {
        console.error('Error en PUT /api/carts/:cid/products/:pid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 400;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.delete('/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;

        const updatedCart = await cartManager.clearCart(cartId);
        res.json({
            status: 'success',
            payload: updatedCart,
            message: 'Carrito vaciado correctamente'
        });
    } catch (error) {
        console.error('Error en DELETE /api/carts/:cid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

export default router;