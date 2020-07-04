'use strict';
const mongoose = require('mongoose');
const moment = require('moment');

mongoose.connect(
    'mongodb://127.0.0.1/horariodb',
    { useNewUrlParser: true },
    err => {
        if (err) console.log(err);
    }
);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const Usuario = require('./schemas/usuario');
const Registro = require('./schemas/registro');
const Empresa = require('./schemas/empresa');

let iniciar_DB = () => {
    Usuario.find({}, (err, res) => {
        if (err) console.log(err);
        if (res[0] == undefined) {
            f_nuevo_usuario({
                nombre: 'Admin',
                nif: 'Administrador',
                role: 'ADMIN_ROLE',
                alias: 'Admin',
                correo: 'ripupo88@gmail.com',
                telegram_id: 777069558
            });
        }
    });
};

iniciar_DB();

let f_nuevo_usuario = objeto_usuario => {
    return new Promise((resolve, reject) => {
        let usuario = new Usuario(objeto_usuario);

        usuario.save((err, res) => {
            if (err) {
                console.log(err);
                reject('Error con la base de datos, posibles datos duplicados');
            }
            resolve(res);
        });
    });
};

let confirma_entrada = empleado => {
    return new Promise((resolve, reject) => {
        Registro.find({ fin: false, empleado: empleado.id }, (err, res) => {
            if (err) reject('error al conectar con base de datos');
            resolve(res);
        });
    });
};

let f_nueva_entrada = (entrada, empleado, gps) => {
    return new Promise((resolve, reject) => {
        let registro = new Registro({
            entrada,
            empleado,
            validado: { entrada: gps }
        });

        registro.save((err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
};

let f_nueva_salida = (salida, empleado, validado) => {
    return new Promise((resolve, reject) => {
        f_encuentra_entrada(empleado, salida)
            .then(duration => {
                let horas = Math.floor(new moment.duration(duration).asHours());
                if (horas >= 9) {
                    validado = false;
                }
                Registro.findOneAndUpdate(
                    { empleado: empleado, fin: false },
                    {
                        salida,
                        fin: true,
                        jornada: duration,
                        'validado.salida': validado
                    },
                    (err, res) => {
                        if (err) console.log(err);
                        resolve({
                            res,
                            jornada: duration
                        });
                    }
                );
            })
            .catch(err => {
                console.log(err);
            });
    });
};

let f_encuentra_entrada = (empleado, salida) => {
    return new Promise((resolve, reject) => {
        Registro.find({ empleado: empleado, fin: false }, (err, res) => {
            if (err) reject(err);
            var duration = moment.duration(
                new moment(salida).diff(new moment(res[0].entrada))
            );
            resolve(duration);
        });
    });
};

let f_busca_duplicado = (empleado, salida) => {
    return new Promise((resolve, reject) => {
        let hoy = new moment(new Date());
        let buscar_hoy = new moment('2010-10-01T00:00:00.000Z')
            .year(hoy.year())
            .month(hoy.month())
            .date(hoy.date());

        Registro.find(
            { empleado: empleado, entrada: { $gte: buscar_hoy } },
            (err, res) => {
                if (err) reject(err);
                console.log(res);
                resolve(res);
            }
        );
    });
};

let f_confirma_telegram_id = telegram_id => {
    return new Promise((resolve, reject) => {
        Usuario.find({ telegram_id }, (err, res) => {
            if (err) {
                console.log(err);
                reject('Ha ocurrido un error');
            } else if (typeof res !== 'undefined' && res.length > 0) {
                resolve(res[0]);
            } else {
                reject('Su ID no aparece en nuestra base de datos');
            }
        });
    });
};

let f_obten_empleados = empresa => {
    return new Promise((resolve, reject) => {
        Usuario.find({ role: 'USER_ROLE', empresa }, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
};

let f_obten_empresa_admin = admin => {
    return new Promise((resolve, reject) => {
        Empresa.find({ admin })
            .populate({ path: 'admin', model: Usuario })
            .exec((err, res) => {
                if (err) {
                    reject(err);
                }
                resolve(res);
            });
    });
};

let f_obten_informe = (empleado, mes) => {
    return new Promise((resolve, reject) => {
        let ahora = new moment(new Date());
        let inicio = new moment('2010-10-01T00:00:00.000Z')
            .year(ahora.year())
            .month(ahora.month() - mes);
        let fin = new moment('2010-10-01T00:00:00.000Z')
            .year(ahora.year())
            .month(ahora.month() - mes + 1);

        Registro.find(
            {
                empleado: empleado.id,
                entrada: {
                    $gte: inicio,
                    $lt: fin
                }
            },
            (err, res) => {
                if (err) {
                    reject(err);
                }

                resolve(res);
            }
        );
    });
};

let f_fin_jornada = horas => {
    return new Promise((resolve, reject) => {
        let jornada = new moment();
        jornada = jornada.hour(jornada.hour() - horas);
        console.log(jornada);
        Registro.find(
            {
                entrada: {
                    $lt: jornada
                },
                fin: false
            },
            (err, res) => {
                if (err) {
                    reject(err);
                }
                console.log(res);
                resolve(res);
            }
        );
    });
};

let f_empleado_por_id = empleado_id => {
    return new Promise((resolve, reject) => {
        Usuario.findById(empleado_id, (err, res) => {
            if (err) reject(err);
            resolve(res);
        });
    });
};

let f_crea_empresa = objeto_empresa => {
    return new Promise((resolve, reject) => {
        let empresa = new Empresa(objeto_empresa);

        empresa.save((err, res) => {
            if (err) {
                console.log(err);
                reject(
                    'Error con la base de datos, posible empresa ya existente'
                );
            }
            resolve(res);
        });
    });
};

let f_empresa = id => {
    return new Promise((resolve, reject) => {
        Empresa.findById(id, (err, res) => {
            if (err) console.log(err);

            resolve(res);
        });
    });
};

let f_obten_empresa = chat => {
    return new Promise((resolve, reject) => {
        Empresa.find(
            {
                chat
            },
            (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res[0] == undefined) {
                    reject(
                        'No has añadido una empresa. Registra una empresa antes de crear empleados'
                    );
                }
                resolve(res[0]);
            }
        );
    });
};

let f_obten_admin = id_admin => {
    return new Promise((resolve, reject) => {
        console.log('id_admin', id_admin);
        Usuario.findById(id_admin)
            .populate({
                path: 'empresa',
                model: Empresa,
                populate: { path: 'admin', model: Usuario }
            })
            .exec((err, res) => {
                if (err) reject(err);
                resolve(res);
            });
    });
};

let f_validador = (id, es) => {
    return new Promise((resolve, reject) => {
        let mofificador;
        if (es == 'entrada') {
            mofificador = {
                'validado.entrada': true
            };
        } else {
            mofificador = {
                'validado.salida': true
            };
        }
        Registro.findByIdAndUpdate(id, mofificador, (err, res) => {
            if (err) reject(err);
            console.log(res);
            resolve(res);
        });
    });
};

let f_user = user => {
    return new Promise((resolve, reject) => {
        Usuario.find({ correo: user }, (err, res) => {
            if (err) reject(err);
            resolve(res[0]);
        });
    });
};

module.exports = {
    f_confirma_telegram_id,
    f_nuevo_usuario,
    confirma_entrada,
    f_nueva_entrada,
    f_nueva_salida,
    f_obten_empleados,
    f_obten_informe,
    f_busca_duplicado,
    f_fin_jornada,
    f_empleado_por_id,
    f_crea_empresa,
    f_obten_empresa,
    f_empresa,
    f_obten_admin,
    f_obten_empresa_admin,
    f_validador,
    f_user
};
