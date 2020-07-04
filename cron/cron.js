//cron
const CronJob = require('cron').CronJob;
const mongo = require('../mongo/mongodb');
const informes = require('../comandos/informes');
const enviar = require('../telegram/enviar');

new CronJob(
    '0 30 8 1 * *',
    async () => {
        informes.f_informes_todos(1, null);
    },
    null,
    true,
    'Europe/London'
);

new CronJob(
    '0 */5 * * * *',
    async () => {
        try {
            let jornadas_abiertas = await mongo.f_fin_jornada(8);
            jornadas_abiertas.forEach(async registro => {
                let empleado = await mongo.f_empleado_por_id(registro.empleado);
                enviar.f_manda_mensaje(
                    empleado.telegram_id,
                    `${empleado.alias} no olvides fichar cuando termine tu jornada laboral.`
                );
            });
        } catch (e) {
            console.log(e);
        }
    },
    null,
    true,
    'Europe/London'
);
