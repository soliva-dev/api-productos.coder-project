import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import CartManager from '../managers/CartManager.js';

const router = Router();
const productManager = new ProductManager();
const cartManager = new CartManager();

router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query, category } = req.query;
        
        let queryFilter = {};
        if (category) {
            queryFilter.category = category;
        }
        if (query) {
            try {
                queryFilter = { ...queryFilter, ...JSON.parse(query) };
            } catch {
                queryFilter.category = query;
            }
        }

        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            sort,
            query: Object.keys(queryFilter).length > 0 ? queryFilter : undefined
        };

        const result = await productManager.getProducts(options);
        
        if (result.status === 'error') {
            throw new Error(result.message);
        }

        // Construir URLs para navegacion
        const buildURL = (pageNum) => {
            let url = `/products?limit=${limit}&page=${pageNum}`;
            if (sort) url += `&sort=${sort}`;
            if (category) url += `&category=${category}`;
            if (query) url += `&query=${query}`;
            return url;
        };

        const pagination = {
            ...result,
            prevLink: result.hasPrevPage ? buildURL(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildURL(result.nextPage) : null
        };

        res.render('home', { 
            products: result.payload,
            pagination: pagination,
            title: 'Productos',
            hasProducts: result.payload.length > 0
        });
    } catch (error) {
        console.error('Error en vista products:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar productos',
            error: error.message 
        });
    }
});

router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getAllProducts();
        // Renderiza 'realTimeProducts.handlebars' y pasa la lista
        res.render('realTimeProducts', { 
            products: products, 
            title: 'Productos en Tiempo Real' 
        });
    } catch (error) {
        console.error('Error en vista realtimeproducts:', error);
        res.status(500).render('error', { 
            message: 'Error al cargar productos en tiempo real',
            error: error.message 
        });
    }
});

router.get('/products/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);
        
        res.render('productDetail', { 
            product: product,
            title: product.title
        });
    } catch (error) {
        console.error('Error en vista product detail:', error);
        res.status(404).render('error', { 
            message: 'Producto no encontrado',
            error: error.message 
        });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const cart = await cartManager.getCartById(cartId);
        
        // Calcular totales
        let totalAmount = 0;
        let totalItems = 0;
        
        cart.products.forEach(item => {
            totalAmount += item.product.price * item.quantity;
            totalItems += item.quantity;
        });

        res.render('cart', { 
            cart: cart,
            products: cart.products,
            totalAmount: totalAmount.toFixed(2),
            totalItems: totalItems,
            title: `Carrito ${cartId}`,
            hasProducts: cart.products.length > 0
        });
    } catch (error) {
        console.error('Error en vista cart:', error);
        res.status(404).render('error', { 
            message: 'Carrito no encontrado',
            error: error.message 
        });
    }
});

router.get('/', (req, res) => {
    res.redirect('/products');
});

export default router;