const enviar = require('../telegram/enviar');

let f_procesa_app = async message => {
   try {
      enviar.f_manda_mensaje(
         message.from.id,
         `https://dist.ripupo88.now.sh/?t=${message.from.id}`
      );
   } catch (e) {
      enviar.f_manda_mensaje(message.chat.id, e.toString());
   }
};

module.exports = { f_procesa_app };
