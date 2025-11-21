import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El titulo es obligatorio'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'La descripcion es obligatoria'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'El codigo es obligatorio'],
        unique: true,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    status: {
        type: Boolean,
        default: true
    },
    stock: {
        type: Number,
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser negativo']
    },
    category: {
        type: String,
        required: [true, 'La categoria es obligatoria'],
        trim: true
    },
    thumbnails: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

productSchema.plugin(mongoosePaginate);

// indices para optimizar consultas
productSchema.index({ category: 1 }); // Para filtros por categoria
productSchema.index({ price: 1 }); // Para ordenamiento por precio
productSchema.index({ status: 1 }); // Para filtros por disponibilidad
// Removido el indice de code porque ya esta definido como unique en el schema
productSchema.index({ title: 'text', description: 'text' }); // Busqueda de texto

export default mongoose.model('Product', productSchema);