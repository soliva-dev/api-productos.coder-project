import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    try {
        const { limit, page, sort, query, category, availability } = req.query;
        
        let queryFilter = {};
        if (category) {
            queryFilter.category = category;
        }
        if (availability !== undefined) {
            queryFilter.availability = availability;
        }
        if (query) {
            try {
                queryFilter = { ...queryFilter, ...JSON.parse(query) };
            } catch {
                queryFilter.category = query;
            }
        }

        const options = {
            limit: limit || 10,
            page: page || 1,
            sort: sort,
            query: Object.keys(queryFilter).length > 0 ? queryFilter : undefined
        };

        const result = await productManager.getProducts(options);
        res.json(result);
    } catch (error) {
        console.error('Error en GET /api/products:', error);
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const product = await productManager.getProductById(productId);
        res.json({
            status: 'success',
            payload: product
        });
    } catch (error) {
        console.error('Error en GET /api/products/:pid:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productManager.addProduct(req.body);
        res.status(201).json({
            status: 'success',
            payload: newProduct
        });
    } catch (error) {
        console.error('Error en POST /api/products:', error);
        res.status(400).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        const updatedProduct = await productManager.updateProduct(productId, req.body);
        res.json({
            status: 'success',
            payload: updatedProduct
        });
    } catch (error) {
        console.error('Error en PUT /api/products:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 400;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const productId = req.params.pid;
        await productManager.deleteProduct(productId);
        res.json({
            status: 'success',
            message: 'Producto eliminado correctamente'
        });
    } catch (error) {
        console.error('Error en DELETE /api/products:', error);
        const statusCode = error.message.includes('no encontrado') || error.message.includes('invalido') ? 404 : 500;
        res.status(statusCode).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

export default router;