const mongo = require('../mongo/mongodb');
const enviar = require('../telegram/enviar');
const moment = require('moment');

let f_procesa_ahora = async ({ message, web }) => {
    console.log(message.from);
    try {
        if (message.from.id != message.chat.id)
            throw new Error('Comando solo disponible en privado');
        let empleado = await mongo.f_confirma_telegram_id(message.from.id);
        if (empleado.role != 'ADMIN_ROLE')
            throw new Error('Comando solo para administradores');
        let empresas = await mongo.f_obten_empresa_admin(empleado.id);
        let mi_hora = new moment();
        let activosParaWeb = [];
        if (web != true) {
            enviar.f_manda_mensaje(
                message.from.id,
                `Hora actual:\n${mi_hora.format(
                    'H:mm'
                )}\nFecha actual:\n${mi_hora.format('dddd')}\n${mi_hora.format(
                    'DD/MM/YYYY'
                )}`
            );
        }
        if (empresas[0] == undefined)
            throw new Error('No has creado empresas aún');
        for (let empresa of empresas) {
            let empleados = await mongo.f_obten_empleados(empresa.id);
            console.log('cada empresa', empresa);
            if (empleados[0] == undefined)
                throw new Error('Tu empresa aún no tiene empleados');
            let turno_activo = '';
            for (let cada_empleado of empleados) {
                let turno = await mongo.confirma_entrada(cada_empleado);
                if (turno[0] != undefined) {
                    let dato_empleado = await mongo.f_empleado_por_id(
                        turno[0].empleado
                    );
                    let webActivo = {
                        alias: dato_empleado.alias,
                        entrada: turno[0].entrada,
                        empresa: empresa.nombre
                    };
                    let horaEntrada = moment(turno[0].entrada);
                    activosParaWeb.push(webActivo);
                    turno_activo += dato_empleado.alias + " " + horaEntrada.format('H:mm') + '\n';
                }
            }
            if (turno_activo == '') turno_activo = 'No hay empleados activos';
            if (web != true) {
                enviar.f_manda_mensaje(
                    message.from.id,
                    `Empresa:\n${empresa.nombre}\nEmpleados activos:\n${turno_activo}`
                );
            } else {
                //en la web solo enviará una empresa porque sale del bukle
                return { activosParaWeb };
            }
        }
    } catch (err) {
        console.log(err);
        if (web != true) {
            enviar.f_manda_mensaje(message.chat.id, err.toString());
        }
        let activosParaWeb = [];
        return { activosParaWeb };
    }
};

module.exports = { f_procesa_ahora };
