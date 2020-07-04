const crear = require('./crear');
const entrada = require('./entrada');
const salida = require('./salida');
const informes = require('./informes');
const empresa = require('./empresa');
const ahora = require('./ahora');
const app = require('./app');

let f_procesa_comando = message => {
   let re = /^\/[a-z]*/gi;
   let result = re.exec(message.text);

   switch (result[0]) {
      case '/crear':
         crear.f_procesa_crear(message);
         break;

      case '/entrada':
         entrada.f_procesa_entrada(message);
         break;

      case '/salida':
         salida.f_procesa_salida(message);
         break;

      case '/informe':
         informes.f_procesa_informes(message);
         break;

      case '/empresa':
         empresa.f_procesa_empresa(message);
         break;

      case '/ahora':
         ahora.f_procesa_ahora({ message, web: false });
         break;

      case '/app':
         app.f_procesa_app(message);
         break;

      default:
         break;
   }
};
module.exports = { f_procesa_comando };
