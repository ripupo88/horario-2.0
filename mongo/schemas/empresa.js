"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const empresa_schema = new mongoose.Schema({
   nombre: String,
   cif: String,
   admin: {
      type: Schema.ObjectId,
      ref: "usuario"
   },
   chat: { type: Number, unique: true }
});

module.exports = mongoose.model("empresa", empresa_schema);
