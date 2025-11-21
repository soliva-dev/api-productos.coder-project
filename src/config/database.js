import mongoose from 'mongoose';

// BD: coderhouse
// PASS coderhousepass

const MONGO_URL = 'mongodb+srv://coderhouse:coderhousepass@ecommerce-cluster.mnrgrgr.mongodb.net/myEcommerce?retryWrites=true&w=majority&appName=ecommerce-cluster';

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log('Conectado a MongoDB Atlas exitosamente');
        console.log('Base de datos: myEcommerce');
    } catch (error) {
        console.error('Error al conectar a MongoDB Atlas:', error.message);
        process.exit(1);
    }
};