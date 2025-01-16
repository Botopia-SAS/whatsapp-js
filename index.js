const { Client } = require('whatsapp-web.js');
const express = require('express'); // Importa Express
const app = express(); // Inicializa Express

let qrCode = null; // Variable para almacenar el QR

// Configuración del cliente de WhatsApp
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'], // Configuración necesaria para Puppeteer en entornos Linux
    },
});

// Evento cuando se genera el QR
client.on('qr', (qr) => {
    qrCode = qr; // Guarda el QR en una variable
    console.log('QR RECEIVED', qr); // Muestra el QR en la terminal
});

// Evento cuando el cliente está listo
client.on('ready', () => {
    console.log('Client is ready!');
});

// Evento para manejar mensajes entrantes
client.on('message', (msg) => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.on('auth_failure', (message) => {
    console.error('Authentication failure:', message);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out:', reason);
});

// Inicializa el cliente de WhatsApp
client.initialize();

// Ruta para mostrar el QR en el navegador
const QRCode = require('qrcode');

// Ruta para mostrar el QR en el navegador
app.get('/qr', async (req, res) => {
    if (qrCode) {
        const qrImage = await QRCode.toDataURL(qrCode);
        res.send(`
            <div style="text-align: center;">
                <h1>Escanea este código QR con tu WhatsApp</h1>
                <img src="${qrImage}" />
            </div>
        `);
    } else {
        res.send('<h1>Cliente ya listo o QR no disponible.</h1>');
    }
});


// Ruta principal
app.get('/', (req, res) => {
    res.send('<h1>Servidor funcionando. Ve a /qr para escanear el código QR.</h1>');
});

// Inicia el servidor Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
