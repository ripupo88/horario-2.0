require("./mongo/mongodb");
require("./cron/cron");
require("./jspdf/pdf");
require("./graphql/index");
require("./express/express");

const telegram = require("./telegram/telegram");
const comando = require("./comandos/comandos");
const confirm = require("./telegram/confirmacion");

telegram.eventEmitter.on("message", (message) => {
    console.log("mensaje llega");
    comando.f_procesa_comando(message);
});

telegram.eventEmitter.on("respuesta", (message) => {
    confirm.escucha_eventos(message);
});
