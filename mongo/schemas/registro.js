'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registro_schema = new mongoose.Schema({
    entrada: Date,
    fin: {
        type: Boolean,
        default: false
    },
    salida: Date,
    jornada: Number,
    validado: {
        entrada: {
            type: Boolean,
            default: false
        },
        salida: {
            type: Boolean,
            default: false
        }
    },
    empleado: {
        type: Schema.ObjectId,
        ref: "'usuario"
    }
});

module.exports = mongoose.model('registro', registro_schema);
