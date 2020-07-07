"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const empresa_schema = new mongoose.Schema({
    nombre: String,
    cif: String,
    admin: {
        type: Schema.ObjectId,
        ref: "usuario",
    },
    HorarioSemana: [{
      lunes: {
         turnos: Number,
         horarios:[{
            nombre: String,
            
         }]
      }
    }],
    chat: { type: Number, unique: true },
});

module.exports = mongoose.model("empresa", empresa_schema);

HorarioSemana: [
    {
        lunes: {
            Turnos: 3,
            horarios: [
                {
                    nombre: "M",
                    horaEntrada: "5:30",
                    horaSalida: "13:30",
                },
                {
                    nombre: "T",
                    horaEntrada: "13:30",
                    horaSalida: "21:30",
                },
                {
                    nombre: "N",
                    horaEntrada: "21:30",
                    horaSalida: "5:30",
                },
            ],
        },
    },
];
