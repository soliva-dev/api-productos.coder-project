import fs from 'fs/promises';
import { randomUUID } from 'crypto';

// Clase para manejar productos
class ProductManager {
    constructor(path) {
        this.path = path;
    }

    // Metodo para leer los productos del archivo
    async #readProducts() {
        try {
            const json = await fs.readFile(this.path, 'utf-8');
            // Si el archivo esta vacio solo devuelvo un array vacio
            if (!json.trim()) {
                return [];
            }
            return JSON.parse(json);
        } catch (error) {
            // Si no existe tambien devuelvo un array vacio
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    // Metodo para escribir productos en el archivo
    async #writeProducts(products) {
        await fs.writeFile(this.path, JSON.stringify(products, null, 2));
    }

    // Metodo para traer todos los productos
    async getProducts() {
        return await this.#readProducts();
    }

    // Metodo para traer un producto por su id
    async getProductById(id) {
        const products = await this.#readProducts();
        const product = products.find(p => p.id === id);

        // Si no lo encuentro lanzo un error
        if (!product) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }
        return product;
    }

    // Metodo para agregar un nuevo producto
    async addProduct(productData) {
        // Valido campos obligatorios
        if (!productData.title || !productData.description || !productData.code || !productData.price || !productData.stock || !productData.category) {
            throw new Error("Todos los campos son obligatorios, excepto 'thumbnails'.");
        }

        const products = await this.#readProducts();
        
        // Valido que no exista otro producto con el mismo codigo
        if (products.some(p => p.code === productData.code)) {
            throw new Error(`Ya existe un producto con el codigo ${productData.code}.`);
        }
        
        const newProduct = {
            id: randomUUID(),
            status: true,
            ...productData,
        };

        products.push(newProduct);
        await this.#writeProducts(products);
        return newProduct;
    }

    // Metodo para actualizar un producto
    async updateProduct(id, updatedFields) {
        const products = await this.#readProducts();
        const productIndex = products.findIndex(p => p.id === id);

        // Si no lo encuentro lanzo un error
        if (productIndex === -1) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }
        // No permito actualizar el id del producto
        if (updatedFields.id) {
            delete updatedFields.id;
        }

        // Valido que los campos obligatorios esten
        products[productIndex] = { ...products[productIndex], ...updatedFields };
        await this.#writeProducts(products);
        return products[productIndex];
    }

    // Metodo para eliminar un producto
    async deleteProduct(id) {
        const products = await this.#readProducts();
        const productIndex = products.findIndex(p => p.id === id);

        // Si no lo encuentro lanzo un error
        if (productIndex === -1) {
            throw new Error(`Producto con id ${id} no encontrado.`);
        }

        products.splice(productIndex, 1);
        await this.#writeProducts(products);
    }
}

export default ProductManager;