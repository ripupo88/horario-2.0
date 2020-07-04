const mongo = require('../mongo/mongodb');
const enviar = require('../telegram/enviar');

let f_procesa_empresa = async message => {
    try {
        let creador_mensaje = await mongo.f_confirma_telegram_id(
            message.from.id
        );
        if (creador_mensaje.role != 'ADMIN_ROLE')
            throw new Error('No tienes privilegios para esta operación');
        if (creador_mensaje.telegram_id == message.chat.id)
            throw new Error('Solo puedes crear una empresa desde un grupo');
        let mensaje_separado = message.text.split(',');
        let nueva_empresa = {
            nombre: mensaje_separado[0].replace(/\/empresa /g, '').trim(),
            cif: mensaje_separado[1].trim(),
            admin: creador_mensaje.id,
            chat: message.chat.id
        };
        await mongo.f_crea_empresa(nueva_empresa);
        enviar.f_manda_mensaje(message.chat.id, `Empresa creada con exito`);
    } catch (e) {
        enviar.f_manda_mensaje(message.chat.id, e.toString());
    }
};

module.exports = { f_procesa_empresa };
