const mongo = require('../mongo/mongodb');
const enviar = require('../telegram/enviar');
const confirmar = require('../telegram/confirmacion');
const adm_confirma = require('../telegram/confirma_entrada');
const moment = require('moment');
let mensajes_abiertos = [];
let f_procesa_salida = async message => {
   try {
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
      if (message.from.id != message.chat.id)
         throw new Error('Solo se puede fichar desde el chat privado');
      let empleado = await mongo.f_confirma_telegram_id(message.from.id);
      if (empleado.role == 'ADMIN_ROLE')
         throw new Error('Los administradores no fichan');
      let registro = await mongo.confirma_entrada(empleado);
      if (registro[0] == undefined)
         throw new Error('No tienes fichada una entrada, ficha la entrada.');
      let res_confirma = await confirmar.f_confirmacion(
         message,
         `Hola ${empleado.alias}, ¿quieres fichar tu salida a las ${moment
            .unix(message.date)
            .format('H:mm')}?`
      );
      let indice2 = 0;
      for (let cada_id of mensajes_abiertos) {
         if (cada_id == message.from.id) {
            mensajes_abiertos.splice(indice2, 1);
            continue;
         }
         indice2++;
      }
      if (res_confirma) {
         let salida_fichada = await mongo.f_nueva_salida(
            moment.unix(message.date).toISOString(),
            empleado.id,
            res_confirma
         );

         let admin_empresa = await mongo.f_obten_admin(empleado.id);
         let horas = Math.floor(
            new moment.duration(salida_fichada.jornada._milliseconds).asHours()
         );

         if (horas < 9) {
            await notifica_usuario(
               admin_empresa.empresa.admin.telegram_id,
               salida_fichada,
               empleado.alias,
               '\nubicación confirmada'
            );

            await notifica_usuario(
               message.chat.id,
               salida_fichada,
               empleado.alias,
               '\nubicación confirmada'
            );
         } else {
            let mi_text = await notifica_usuario(
               message.chat.id,
               salida_fichada,
               empleado.alias,
               '\nsu jornada a durado más de lo normal, requiere validacion del administrador.'
            );

            adm_confirma.f_confirmacion(
               message,
               mi_text,
               admin_empresa.empresa.admin.telegram_id,
               salida_fichada.res.id
            );
         }
         //notifica jefes
      } else {
         await doSalida(message, empleado, res_confirma);
      }
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
      console.log(message.chat.id);
      enviar.f_manda_mensaje(message.chat.id, err.toString());
      resolve();
   }
};

let notifica_usuario = async (chat_id, entrada, empleado, location) => {
   let fecha = moment(entrada.res.salida).format('DD-MM-YYYY');
   let hora = moment(entrada.res.salida).format('H:mm');
   let duracion = entrada.jornada;
   console.log(entrada.jornada._milliseconds);
   let horas = Math.floor(
      new moment.duration(entrada.jornada._milliseconds).asHours()
   );
   let minutos = duracion.minutes();
   let text = `*${empleado}* ha fichado su salida\na las *${hora}*\nel día _${fecha}_\nsu jornada ha durado\n${horas} horas ${minutos} minutos${location}`;
   enviar.f_manda_mensaje(chat_id, text);
   return text;
};

async function doSalida(message, empleado, res_confirma) {
   let salida_fichada = await mongo.f_nueva_salida(
      moment.unix(message.date).toISOString(),
      empleado.id,
      res_confirma
   );

   let admin_empresa = await mongo.f_obten_admin(empleado.id);

   if (res_confirma) {
      await notifica_usuario(
         admin_empresa.empresa.admin.telegram_id,
         salida_fichada,
         empleado.alias,
         '\nFichado por QR'
      );

      await notifica_usuario(
         message.chat.id,
         salida_fichada,
         empleado.alias,
         '\nFichado por QR'
      );
   } else {
      let mi_text = await notifica_usuario(
         message.chat.id,
         salida_fichada,
         empleado.alias,
         '\nfuera de ubicación, esto marcará un incidente en su registro'
      );
      adm_confirma.f_confirmacion(
         message,
         mi_text,
         admin_empresa.empresa.admin.telegram_id,
         salida_fichada.res.id
      );
   }
}

module.exports = { f_procesa_salida, doSalida };
