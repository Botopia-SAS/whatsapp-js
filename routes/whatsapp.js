const express = require('express');
const { Client } = require('whatsapp-web.js');
const User = require('../models/user'); // Modelo de usuario en MongoDB
const router = express.Router();

const clients = {}; // Almacena instancias de WhatsApp para cada usuario

// Función para inicializar un cliente de WhatsApp
const initializeClient = async (userId, user) => {
    console.log(`Inicializando cliente para usuario: ${userId}`);
    console.log('Verificando inicialización del cliente para:', userId);
    if (!clients[userId]) {
        console.log('Inicializando cliente...');
        await initializeClient(userId, user);
    }

    const client = new Client({
        puppeteer: {
            headless: true, // Ejecutar en modo headless
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Configuración necesaria para Puppeteer en entornos Linux
        },
        session: user.session, // Cargar sesión del usuario desde MongoDB
    });

    // Manejar eventos del cliente
    client.on('qr', (qr) => {
        console.log(`QR para ${userId}: ${qr}`);
        clients[userId] = { client, qr }; // Guardar el cliente y el QR
    });

    client.on('ready', () => {
        console.log(`Cliente para ${userId} está listo`);
    });

    client.on('authenticated', async (session) => {
        console.log(`Usuario ${userId} autenticado.`);
        user.session = session; // Guardar la sesión en MongoDB
        await user.save();
    });

    client.on('disconnected', (reason) => {
        console.log(`Cliente ${userId} desconectado. Razón: ${reason}`);
        delete clients[userId]; // Limpiar el cliente desconectado
    });

    client.on('message', (msg) => {
        console.log(`Mensaje recibido de ${userId}: ${msg.body}`);
        if (msg.body === '!ping') {
            msg.reply('pong');
        }
    });

    client.initialize();
    return client;
};

// Ruta para generar y manejar códigos QR
router.get('/:userId/qr', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Buscar el usuario en la base de datos
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Verificar si ya existe un cliente para este usuario
        if (!clients[userId]) {
            await initializeClient(userId, user);
        }

        // Responder con el QR actual
        const userClient = clients[userId];
        if (userClient && userClient.qr) {
            return res.json({ qr: userClient.qr }); // Devuelve el QR como JSON
        } else {
            return res.status(202).json({ message: 'Generando QR, actualiza en unos segundos.' });
        }
    } catch (error) {
        console.error(`Error al manejar la sesión para ${userId}:`, error);
        res.status(500).json({ error: 'Error al manejar la sesión.' });
    }
});

router.get('/:userId/status', async (req, res) => {
    const userId = req.params.userId;

    try {
        const userClient = clients[userId];
        if (userClient) {
            const isReady = userClient.client.info ? true : false;
            return res.json({ ready: isReady });
        } else {
            return res.status(404).json({ message: 'Cliente no inicializado.' });
        }
    } catch (error) {
        console.error(`Error al obtener el estado para ${userId}:`, error);
        res.status(500).json({ error: 'Error al obtener el estado.' });
    }
});

router.post('/:userId/logout', async (req, res) => {
    const userId = req.params.userId;

    try {
        const userClient = clients[userId];
        if (userClient) {
            await userClient.client.logout(); // Cierra la sesión
            delete clients[userId]; // Elimina al cliente de la lista
            return res.json({ message: 'Sesión cerrada exitosamente.' });
        } else {
            return res.status(404).json({ message: 'Cliente no inicializado.' });
        }
    } catch (error) {
        console.error(`Error al cerrar sesión para ${userId}:`, error);
        res.status(500).json({ error: 'Error al cerrar sesión.' });
    }
});

module.exports = router;
