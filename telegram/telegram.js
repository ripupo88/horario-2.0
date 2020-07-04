const telegram = require('telegram-bot-api');
const telegram_config = require('../privado/telegram.config');
const events = require('events');
const mongo = require('../mongo/mongodb');
const enviar = require('./enviar');
const moment = require('moment');

// Create an eventEmitter object
let eventEmitter = new events.EventEmitter();

let api = new telegram({
    token: telegram_config.telegram_config.token,
    updates: { enabled: true }
});

api.on('message', function(message) {
    console.log('XXXXXXXXXXXXXXXXXX', message);
    if (message.location != undefined || message.text == 'Cancelar') {
        eventEmitter.emit('respuesta', message);
    } else {
        eventEmitter.emit('message', message);
    }
});

api.on('inline.callback.query', function(message) {
    api.answerCallbackQuery(
        {
            callback_query_id: message.id,
            text: 'procesando'
        },
        async (err, res) => {
            let KeyBoard = {
                inline_keyboard: [[]]
            };

            if (err) console.log('error', err);

            let re = /entrada/gi;
            let result = re.exec(message.message.text);

            if (result != null) {
                let res = await mongo.f_validador(message.data, 'entrada');
                notifica_val(res, 'entrada');
            } else if (message.data != 'no') {
                let res = await mongo.f_validador(message.data, 'salida');
                notifica_val(res, 'salida');
            }

            api.editMessageReplyMarkup({
                chat_id: message.message.chat.id,
                message_id: message.message.message_id,
                reply_markup: JSON.stringify(KeyBoard)
            });
        }
    );
});

let notifica_val = async (res, es) => {
    let empleado = await mongo.f_empleado_por_id(res.empleado);
    let fecha;
    let hora;
    if (es == 'entrada') {
        fecha = moment(res.entrada).format('DD-MM-YYYY');
        hora = moment(res.entrada).format('H:mm');
    } else {
        fecha = moment(res.salida).format('DD-MM-YYYY');
        hora = moment(res.salida).format('H:mm');
    }

    let text = `*${empleado.alias}* el administrador ha validado su ${es}\ndel día _${fecha}_.\na las *${hora}*\n`;

    enviar.f_manda_mensaje(empleado.telegram_id, text);
};

module.exports = { eventEmitter };
