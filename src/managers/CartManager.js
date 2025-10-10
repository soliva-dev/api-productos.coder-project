import fs from 'fs/promises';
import { randomUUID } from 'crypto';

// Clase para manejar carritos
class CartManager {
    constructor(path) {
        this.path = path;
    }

    // Metodo para leer los carritos del archivo
    async #readCarts() {
        try {
            const json = await fs.readFile(this.path, 'utf-8');
            return JSON.parse(json);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    // Metodo para escribir carritos en el archivo
    async #writeCarts(carts) {
        await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
    }

    // Metodo para crear un nuevo carrito
    async createCart() {
        const carts = await this.#readCarts();
        const newCart = {
            id: randomUUID(),
            products: [],
        };
        carts.push(newCart);
        await this.#writeCarts(carts);
        return newCart;
    }

    // Metodo para traer un carrito por su id
    async getCartById(id) {
        const carts = await this.#readCarts();
        const cart = carts.find(c => c.id === id);

        // Si no lo encuentro lanzo un error
        if (!cart) {
            throw new Error(`Carrito con id ${id} no encontrado.`);
        }
        return cart;
    }

    // Metodo para agregar un producto a un carrito
    async addProductToCart(cartId, productId) {
        const carts = await this.#readCarts();
        const cartIndex = carts.findIndex(c => c.id === cartId);

        // Si no lo encuentro lanzo un error
        if (cartIndex === -1) {
            throw new Error(`Carrito con id ${cartId} no encontrado.`);
        }

        const cart = carts[cartIndex];
        const productIndex = cart.products.findIndex(p => p.product === productId);

        if (productIndex !== -1) {
            // Si el producto ya existe en el carrito solo incremento la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Sino lo agrego
            cart.products.push({
                product: productId,
                quantity: 1,
            });
        }

        carts[cartIndex] = cart;
        await this.#writeCarts(carts);
        return cart;
    }
}

export default CartManager;