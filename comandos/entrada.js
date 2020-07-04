const mongo = require('../mongo/mongodb');
const enviar = require('../telegram/enviar');
const confirmar = require('../telegram/confirmacion');
const adm_confirma = require('../telegram/confirma_entrada');
const moment = require('moment');
let mensajes_abiertos = [];
let f_procesa_entrada = async message => {
   try {
      let intentos = 0;
      var gps = true;
      let indice = 0;
      if (mensajes_abiertos[0] != undefined) {
         for (let cada_id of mensajes_abiertos) {
            if (cada_id == message.from.id) {
               return;
            }
            indice++;
         }
         mensajes_abiertos.push(message.from.id);
      } else {
         mensajes_abiertos.push(message.from.id);
      }
      console.log(mensajes_abiertos);
      if (message.from.id != message.chat.id)
         throw new Error('Solo se puede fichar desde el chat privado');
      let empleado = await mongo.f_confirma_telegram_id(message.from.id);
      if (empleado.role == 'ADMIN_ROLE')
         throw new Error('Los administradores no fichan');
      let registro = await mongo.confirma_entrada(empleado);
      if (registro[0] != undefined)
         throw new Error('Ya tienes un turno abierto.');
      let duplicado = await mongo.f_busca_duplicado(empleado);
      if (duplicado[0] != undefined) throw new Error('Hoy ya has fichado.');
      var res_conf_glo;
      var hola = 'Hola';
      var ubica = 'Ubicación confirmada.';
      do {
         if (intentos == 1) {
            hola = 'Error de ubicacion, Nuevo intento:\n';
         } else if (intentos == 2) {
            gps = false;
            ubica =
               'Ubicación no confirmada, notificando administrador para validación manual.';
            break;
         }
         let res_confirma = await confirmar.f_confirmacion(
            message,
            `${hola} ${
               empleado.alias
            }, ¿quieres fichar tu entrada a las ${moment
               .unix(message.date)
               .format('H:mm')}?`
         );
         res_conf_glo = res_confirma;
         if (!res_conf_glo) {
            intentos++;
         }
      } while (!res_conf_glo);

      let indice2 = 0;
      for (let cada_id of mensajes_abiertos) {
         if (cada_id == message.from.id) {
            mensajes_abiertos.splice(indice2, 1);
            continue;
         }
         indice2++;
      }

      await doEntrada(message, empleado, gps, ubica, intentos);
   } catch (err) {
      let indice3 = 0;
      for (let cada_id of mensajes_abiertos) {
         if (cada_id == message.from.id) {
            mensajes_abiertos.splice(indice3, 1);
            continue;
         }
         indice2++;
      }
      console.log(err);
      enviar.f_manda_mensaje(message.chat.id, err.toString());
   }
};

let notifica_usuario = async (chat_id, entrada, empleado, ubica) => {
   let fecha = moment(entrada.entrada).format('DD-MM-YYYY');
   let hora = moment(entrada.entrada).format('H:mm');
   let text = `*${empleado}* ha fichado su entrada\na las *${hora}*\nel día _${fecha}_.\n${ubica}`;
   enviar.f_manda_mensaje(chat_id, text);
   return text;
};

async function doEntrada(message, empleado, gps, ubica, intentos) {
   let duplicado = await mongo.f_busca_duplicado(empleado);
   if (duplicado[0] != undefined) throw new Error('Hoy ya has fichado.');

   let entrada_fichada = await mongo.f_nueva_entrada(
      moment.unix(message.date).toISOString(),
      empleado.id,
      gps
   );
   let admin_empresa = await mongo.f_obten_admin(empleado.id);
   let mi_text = await notifica_usuario(
      message.chat.id,
      entrada_fichada,
      empleado.alias,
      ubica
   );
   if (intentos == 2) {
      adm_confirma.f_confirmacion(
         message,
         mi_text,
         admin_empresa.empresa.admin.telegram_id,
         entrada_fichada.id
      );
   } else {
      await notifica_usuario(
         admin_empresa.empresa.admin.telegram_id,
         entrada_fichada,
         empleado.alias,
         ubica
      );
   }
}

module.exports = { f_procesa_entrada, doEntrada };
