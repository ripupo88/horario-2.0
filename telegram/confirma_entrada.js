const telegram = require('telegram-bot-api');
const telegram_config = require('../privado/telegram.config');

var api = new telegram({
    token: telegram_config.telegram_config.token
});

let f_confirmacion = (message, text, admin, reg) => {
    return new Promise((resolve, reject) => {
        console.log('adminnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn', admin);

        let KeyBoard = {
            inline_keyboard: [
                [
                    {
                        text: 'Validar',
                        callback_data: reg
                    },
                    {
                        text: 'Cancelar',
                        callback_data: 'no'
                    }
                ]
            ]
        };

        api.sendMessage(
            {
                chat_id: admin,
                text,
                reply_markup: JSON.stringify(KeyBoard),
                parse_mode: 'Markdown'
            },
            (err, res) => {
                if (err) console.log(err);
                console.log('ressssssssssssssssssss', res);
            }
        );

        // api.deleteMessage({
        //     chat_id: message.chat.id,
        //     message_id: mensaje_id
        // });
    });
};

module.exports = { f_confirmacion };
