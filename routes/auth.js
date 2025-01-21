const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../utils/mailer');
const { generateToken } = require('../utils/jwt');
const User = require('../models/user');

const router = express.Router();
const { verifyToken } = require('../utils/jwt');

router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Debe ser un correo válido.'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, firstName, lastName, phone, company, linkedin, country } = req.body;

        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).send('El correo ya está registrado.');
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                company,
                linkedin,
                country,
            });

            await newUser.save();

            // Generar un token de verificación
            const token = generateToken({ email }, '1d'); // Expira en 1 día
            const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'; // Fallback si no está definida

            const verificationLink = `${APP_BASE_URL}/auth/verify?token=${token}`;

            // Enviar correo de verificación
            await sendEmail(
                email,
                'Verifica tu cuenta',
                `<p>Hola ${firstName},</p>
                <p>Gracias por registrarte. Haz clic en el enlace para verificar tu cuenta:</p>
                <a href="${verificationLink}">Verificar mi cuenta</a>`
            );

            res.status(201).send('Usuario registrado. Por favor, verifica tu correo electrónico.');
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            res.status(500).send('Error al registrar usuario.');
        }
    }
);

router.get('/verify', async (req, res) => {
    const { token } = req.query;

    try {
        const payload = verifyToken(token); // Asegúrate de importar verifyToken
        if (!payload) {
            return res.status(400).send('Token inválido o expirado.');
        }

        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return res.status(404).send('Usuario no encontrado.');
        }

        user.isVerified = true;
        await user.save();

        res.send('Cuenta verificada con éxito. Ya puedes iniciar sesión.');
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        res.status(500).send('Error al verificar la cuenta.');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Credenciales inválidas.');
        }

        if (!user.isVerified) {
            return res.status(403).send('Por favor, verifica tu cuenta antes de iniciar sesión.');
        }

        res.send({ userId: user._id });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).send('Error al iniciar sesión.');
    }
});



module.exports = router;
