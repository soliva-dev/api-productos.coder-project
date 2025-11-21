import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, 'La cantidad debe ser mayor a 0'],
            default: 1
        }
    }]
}, {
    timestamps: true
});

cartSchema.index({ 'products.product': 1 }); // Para busquedas por producto en carritos
cartSchema.index({ createdAt: -1 }); // Para ordenar carritos por fecha

export default mongoose.model('Cart', cartSchema);