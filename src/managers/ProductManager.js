import Product from '../models/Product.js';

class ProductManager {
    constructor() {
        // Constructor sin parametros
    }

    async getProducts(options = {}) {
        try {
            const {
                limit = 10,
                page = 1,
                sort,
                query
            } = options;

            let filter = {};
            if (query) {
                if (query.category) {
                    filter.category = { $regex: query.category, $options: 'i' };
                }
                if (query.status !== undefined) {
                    filter.status = query.status;
                }
                if (query.availability !== undefined) {
                    filter.stock = query.availability === 'true' ? { $gt: 0 } : { $eq: 0 };
                }
            }

            let sortOption = {};
            if (sort) {
                if (sort === 'asc') {
                    sortOption.price = 1;
                } else if (sort === 'desc') {
                    sortOption.price = -1;
                }
            }

            const paginateOptions = {
                limit: parseInt(limit),
                page: parseInt(page),
                sort: Object.keys(sortOption).length > 0 ? sortOption : undefined,
                lean: true
            };

            const result = await Product.paginate(filter, paginateOptions);

            return {
                status: 'success',
                payload: result.docs,
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/api/products?limit=${limit}&page=${result.prevPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null,
                nextLink: result.hasNextPage ? `/api/products?limit=${limit}&page=${result.nextPage}${sort ? `&sort=${sort}` : ''}${query ? `&query=${JSON.stringify(query)}` : ''}` : null
            };
        } catch (error) {
            console.error('Error en getProducts:', error);
            return {
                status: 'error',
                message: error.message
            };
        }
    }

    async getAllProducts() {
        try {
            return await Product.find().lean();
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id).lean();
            if (!product) {
                throw new Error(`Producto con id ${id} no encontrado.`);
            }
            return product;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID de producto invalido: ${id}`);
            }
            throw error;
        }
    }

    async addProduct(productData) {
        try {
            if (productData.price < 0) {
                throw new Error('El precio no puede ser negativo');
            }
            if (productData.stock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            const newProduct = new Product({
                title: productData.title,
                description: productData.description,
                code: productData.code,
                price: productData.price,
                status: productData.status !== undefined ? productData.status : true,
                stock: productData.stock,
                category: productData.category,
                thumbnails: productData.thumbnails || []
            });

            const savedProduct = await newProduct.save();
            return savedProduct.toObject();
        } catch (error) {
            if (error.code === 11000) {
                throw new Error(`Ya existe un producto con el codigo ${productData.code}.`);
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(`Error de validacion: ${messages.join(', ')}`);
            }
            throw error;
        }
    }

    async updateProduct(id, updatedFields) {
        try {
            const { _id, __v, createdAt, updatedAt, ...fieldsToUpdate } = updatedFields;

            if (fieldsToUpdate.price && fieldsToUpdate.price < 0) {
                throw new Error('El precio no puede ser negativo');
            }
            if (fieldsToUpdate.stock && fieldsToUpdate.stock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            const updatedProduct = await Product.findByIdAndUpdate(
                id,
                fieldsToUpdate,
                { new: true, runValidators: true }
            ).lean();

            if (!updatedProduct) {
                throw new Error(`Producto con id ${id} no encontrado.`);
            }

            return updatedProduct;
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID de producto invalido: ${id}`);
            }
            if (error.code === 11000) {
                throw new Error(`Ya existe un producto con ese codigo.`);
            }
            if (error.name === 'ValidationError') {
                const messages = Object.values(error.errors).map(err => err.message);
                throw new Error(`Error de validacion: ${messages.join(', ')}`);
            }
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            const deletedProduct = await Product.findByIdAndDelete(id);
            
            if (!deletedProduct) {
                throw new Error(`Producto con id ${id} no encontrado.`);
            }

            return deletedProduct.toObject();
        } catch (error) {
            if (error.name === 'CastError') {
                throw new Error(`ID de producto invalido: ${id}`);
            }
            throw error;
        }
    }
}

export default ProductManager;