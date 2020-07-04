'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const usuario_schema = new mongoose.Schema({
    nombre: String,
    nif: String,
    alias: String,
    role: {
        type: String,
        enum: ['ADMIN_ROLE', 'USER_ROLE'],
        default: 'USER_ROLE'
    },
    empresa: {
        type: Schema.ObjectId,
        ref: "'empresa"
    },
    correo: String,
    telegram_id: { type: Number, unique: true },
    pass: String,
    activo: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('usuario', usuario_schema);
