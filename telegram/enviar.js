const telegram = require('telegram-bot-api');
const telegram_config = require('../privado/telegram.config');
const fs = require('fs');

var api = new telegram({
    token: telegram_config.telegram_config.token
});

let f_manda_mensaje = (chat_id, text) => {
    api.sendMessage({
        chat_id,
        text,
        parse_mode: 'Markdown'
    });
};

let f_enviar_doc = (doc, chat_id) => {
    let document = fs.createReadStream(`./informes/${doc}.pdf`);

    api.sendDocument({
        chat_id,
        document: document.path
    });
};

module.exports = { f_manda_mensaje, f_enviar_doc };
