const nodemailer = require('nodemailer');

// Configura el transporte con Gmail o tu propio servidor SMTP
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER, // Tu dirección de correo
        pass: process.env.EMAIL_PASS, // Tu contraseña o "App Password" de Gmail
    },
});

// Función para enviar correos
const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"Botopia Technology SAS" <${process.env.EMAIL_USER}>`,
            to, // Destinatario
            subject, // Asunto
            html, // Contenido HTML
        });
        console.log('Correo enviado con éxito');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
    }
};

module.exports = { sendEmail };
