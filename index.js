const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const authRoutes = require('./routes/auth');
const whatsappRoutes = require('./routes/whatsapp');

const app = express();
connectDB();

// Configura CORS
app.use(cors({
    origin: 'https://frontend-whatsapp-bot.vercel.app/', // Reemplaza con la URL de tu frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/whatsapp', whatsappRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo`);
});
