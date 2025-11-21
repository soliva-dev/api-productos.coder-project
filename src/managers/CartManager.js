import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

class CartManager {
    constructor() {
        // Constructor sin parametros
    }
    async createCart() {
        try {
            const newCart = new Cart({
                products: []
            });

            const savedCart = await newCart.save();
            return savedCart.toObject();
        } catch (error) {
            throw new Error(`Error al crear carrito: ${error.message}`);
        }
    }

    async getCartById(id) {
        try {
            const cart = await Cart.findById(id)
                .populate('products.product', 'title description price stock category thumbnails')
                .lean();
                
            if (!cart) {
                throw new Error(`Carrito con id ${id} no encontrado.`);
            }
            
            return cart;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID de carrito invalido: ${id}`);
            }
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Producto con id ${productId} no encontrado.`);
            }

            if (product.stock < quantity) {
                throw new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con id ${cartId} no encontrado.`);
            }

            const existingProductIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += quantity;
            } else {
                cart.products.push({
                    product: productId,
                    quantity: quantity
                });
            }

            const updatedCart = await cart.save();
            return updatedCart.toObject();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID invalido: ${error.path === 'cartId' ? cartId : productId}`);
            }
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con id ${cartId} no encontrado.`);
            }

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );

            if (productIndex === -1) {
                throw new Error(`Producto con id ${productId} no encontrado en el carrito.`);
            }

            cart.products.splice(productIndex, 1);
            
            const updatedCart = await cart.save();
            return updatedCart.toObject();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID invalido: ${error.path === 'cartId' ? cartId : productId}`);
            }
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            if (quantity <= 0) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            const product = await Product.findById(productId);
            if (!product) {
                throw new Error(`Producto con id ${productId} no encontrado.`);
            }

            if (product.stock < quantity) {
                throw new Error(`Stock insuficiente. Stock disponible: ${product.stock}`);
            }

            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con id ${cartId} no encontrado.`);
            }

            const productIndex = cart.products.findIndex(
                item => item.product.toString() === productId
            );

            if (productIndex === -1) {
                throw new Error(`Producto con id ${productId} no encontrado en el carrito.`);
            }

            cart.products[productIndex].quantity = quantity;
            
            const updatedCart = await cart.save();
            return updatedCart.toObject();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID invalido: ${error.path === 'cartId' ? cartId : productId}`);
            }
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error(`Carrito con id ${cartId} no encontrado.`);
            }

            cart.products = [];
            const updatedCart = await cart.save();
            return updatedCart.toObject();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID de carrito invalido: ${cartId}`);
            }
            throw error;
        }
    }
}

export default CartManager;