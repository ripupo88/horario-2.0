const moment = require('moment');
const mongo = require('../mongo/mongodb');
const jspdf = require('../jspdf/pdf');
const enviar = require('../telegram/enviar');

let f_procesa_informes = async message => {
    try {
        let creador_mensaje = await mongo.f_confirma_telegram_id(
            message.from.id
        );
        let mes = f_obten_mes(message);
        if (creador_mensaje.role == 'ADMIN_ROLE') {
            f_informes_todos(mes, creador_mensaje.id);
        } else {
            f_informe(creador_mensaje, mes, creador_mensaje.telegram_id);
        }
    } catch (e) {
        enviar.f_manda_mensaje(message.chat.id, e.toString());
    }
};

let f_obten_mes = message => {
    let fecha_recibida = message.text.replace(/\/informe /g, '').trim();
    let la_fecha = fecha_recibida.split('-');
    let mes = parseInt(la_fecha[0]);
    let anno = parseInt(la_fecha[1]);
    let fecha_solicitud = new moment(
        '20' + anno + '-' + mes + '-01',
        'YYYY-MM-DD'
    );

    let hoy = new moment();
    let numero_meses = hoy.diff(fecha_solicitud, 'months');
    if (mes >= 0 && mes < 49) {
        return numero_meses;
    } else {
        throw new Error('fecha incorrecta');
    }
};

let f_informes_todos = async (mes, admin) => {
    let las_empresas = await mongo.f_obten_empresa_admin(admin);
    for (let empresa of las_empresas) {
        let empleados = await mongo.f_obten_empleados(empresa.id);
        empleados.forEach(async empleado => {
            f_informe(empleado, mes, empresa.admin.telegram_id);
        });
    }
};

let f_informe = async (empleado, mes, destino) => {
    let informe = await mongo.f_obten_informe(empleado, mes);
    if (informe[0] != undefined) {
        jspdf.f_crea_pdf(informe, empleado, destino);
    }
};

module.exports = { f_informes_todos, f_procesa_informes };
