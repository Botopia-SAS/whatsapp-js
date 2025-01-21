const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true }, // Nombre
    lastName: { type: String, required: true }, // Apellido
    email: { type: String, required: true, unique: true }, // Correo electrónico
    phone: { type: String, required: true }, // Teléfono
    company: { type: String, required: true }, // Empresa
    linkedin: { type: String, required: true }, // URL de LinkedIn
    country: { type: String, required: true }, // País
    password: { type: String, required: true }, // Contraseña
    session: { type: Object, default: null }, // Guarda la sesión de WhatsApp
    isVerified: { type: Boolean, default: false }, // Nuevo campo
});

module.exports = mongoose.model('User', UserSchema);
