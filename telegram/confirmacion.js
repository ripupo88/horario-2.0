const telegram = require('telegram-bot-api');
const telegram_config = require('../privado/telegram.config');
const events = require('events');
const geolib = require('geolib');

// Create an eventEmitter object
let eventEmitter = new events.EventEmitter();

var api = new telegram({
    token: telegram_config.telegram_config.token
});

let escucha_eventos = message => {
    api.deleteMessage({
        chat_id: message.chat.id,
        message_id: message.message_id
    });

    var confirmacion;
    if (message.location != undefined) {
        confirmacion = f_comprueba_ubicacion(
            message.location.latitude,
            message.location.longitude
        );
    } else {
        confirmacion = 'no';
    }
    eventEmitter.emit('respu', { confirmacion, message });
};

let f_comprueba_ubicacion = (longitude, latitude) => {
    let distancia = geolib.getDistance(
        { latitude, longitude },
        { latitude: -16.3832116, longitude: 28.4873451 }
    );
    console.log(distancia);
    if (distancia < 150) {
        return 'si';
    } else {
        return distancia;
    }
};

let KeyBoard = {
    keyboard: [
        [
            {
                text: 'Confirmar',
                request_location: true
            },
            {
                text: 'Cancelar'
            }
        ]
    ],
    resize_keyboard: true,
    one_time_keyboard: true
};

let f_confirmacion = (message, text) => {
    return new Promise((resolve, reject) => {
        var mensaje_id;
        let borrado = false;
        api.sendMessage(
            {
                chat_id: message.chat.id,
                text,
                reply_to_message_id: message.message_id,
                reply_markup: JSON.stringify(KeyBoard)
            },
            (err, res) => {
                if (err) console.log(err);
                mensaje_id = res.message_id;
            }
        );
        var terminado = false;
        eventEmitter.on('respu', confirm => {
            if (confirm.message.from.id === message.chat.id) {
                console.log('salta evento');
                clearTimeout(time_fuera);
                terminado = true;
                if (confirm.confirmacion == 'si') {
                    console.log('confirmacion y borrando ', mensaje_id);
                    borra_mensaje(message.chat.id, mensaje_id);
                    return resolve(true);
                } else if (confirm.confirmacion > 150) {
                    console.log('Error de ubicacion', mensaje_id);
                    borra_mensaje(message.chat.id, mensaje_id);
                    return resolve(false);
                } else {
                    console.log('cancelacion y borrando ', mensaje_id);
                    borra_mensaje(message.chat.id, mensaje_id);
                    return reject('Has cancelado la operación');
                }
            }
        });

        let time_fuera = setTimeout(() => {
            console.log('se ejecuta el timeout');
            if (!terminado) {
                borra_mensaje(message.chat.id, mensaje_id);
                return reject('tiempo limite excedido');
            }
            mensaje_id = null;
        }, 13000);

        let borra_mensaje = (chat, messg) => {
            if (!borrado) {
                borrado = true;
                api.deleteMessage({
                    chat_id: chat,
                    message_id: messg
                });
            }
        };
    });
};

module.exports = { f_confirmacion, escucha_eventos };
