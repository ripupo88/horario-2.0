global.window = {
  document: {
    createElementNS: () => {
      return {};
    },
  },
};
global.navigator = {};
global.html2pdf = {};
global.btoa = () => {};

const fs = require("fs");
const jsPDF = require("jspdf/dist/jspdf.node.debug");
const moment = require("moment");
const enviar = require("../telegram/enviar");
const mongo = require("../mongo/mongodb");

global.jsPDF = jsPDF;

moment.locale("es");

require("jspdf-autotable");

let f_crea_pdf = async (registro, empleado, destino) => {
  let empresa = await mongo.f_empresa(empleado.empresa);
  let mes = new moment(registro[0].entrada);
  let texto_mes = mes.format("MMMM YYYY");
  let documento_nombre = empleado.alias + mes.format("-MMMM-YYYY");

  const doc = new jsPDF();

  //Texto superior con el mes y el año
  doc.text(`${texto_mes.toUpperCase()}`, 15, 14);
  doc.setFontSize(8);
  doc.text(
    "Registro realizado en cumplimiento del Art 34.9 del texto refundido de la Ley del Estatuto de los Trabajadores",
    55,
    17
  );

  let dias = mes.daysInMonth();

  let body_principal = [];
  //creando el body
  for (let i = 0; i < dias; i++) {
    let hora_entrada = "";
    let dia_semana;
    let hora_salida = "";
    let duracion = "";
    let entra_validado = "";
    let sale_validado = "";

    registro.forEach((element) => {
      let now_time = new moment(element.entrada);
      let fecha_hoy = now_time.format("D");
      dia_semana = mes.date(i + 1).format("dddd");
      if (fecha_hoy == i + 1) {
        hora_entrada = now_time.format("HH:mm");
        if (element.salida != undefined) {
          hora_salida = new moment(element.salida).format("HH:mm");
          if (element.validado.entrada && element.validado.salida) {
            duracion =
              Math.floor(new moment.duration(element.jornada).asHours()) +
              ":" +
              new moment(element.jornada).format("mm");
          } else {
            duracion = "(          )__________";
          }
          if (element.validado.entrada == false) {
            entra_validado = "no (           )";
          } else {
            entra_validado = "si";
          }
          if (element.validado.salida == false) {
            sale_validado = "no (           )";
          } else {
            sale_validado = "si";
          }
        }

        return;
      }
    });

    body_principal[i] = [
      i + 1 + "   " + dia_semana,
      hora_entrada,
      entra_validado,
      hora_salida,
      sale_validado,
      duracion,
    ];
  }

  //tabla principal con los datos del trabajador
  doc.autoTable({
    margin: { top: 19 },
    tableLineWidth: 0.1,
    tableLineColor: 0,
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: "auto" },
      2: { cellWidth: "auto" },
      3: { cellWidth: "auto" },
      4: { cellWidth: "auto" },
      5: { cellWidth: 30 },
    },
    styles: {
      cellPadding: 1,
      fontSize: 12,
      //cellWidth: 'auto'
    },
    head: [["Día", "Entrada", "Validada", "Salida", "Validada", "Jornada"]],
    body: body_principal,
  });

  //pie de pagina con datos de la empresa y el empleado
  doc.autoTable({
    styles: {
      cellPadding: 1,
      fontSize: 11,
      cellWidth: "wrap",
    },
    theme: "plain",
    head: [],
    body: [
      [
        {
          content: "EMPRESA:",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        {
          content: "CIF:",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        "",
        "",
      ],
      [
        empresa.nombre,
        empresa.cif,
        "Firma",
        {
          content: "_______________",
          styles: { halign: "center", valign: "bottom" },
        },
      ],
      [
        {
          content: "EMPLEADO:",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        {
          content: "NIF/NIE:",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        "",
        "",
      ],
      [
        `${empleado.nombre}`,
        `${empleado.nif}`,
        "Firma",
        {
          content: "_______________",
          styles: { halign: "center", valign: "bottom" },
        },
      ],
      [
        {
          content: "CONTRATO:",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        {
          content: "Jornada Completa",
          styles: { minCellHeight: 8, valign: "bottom" },
        },
        "",
        "",
      ],
    ],
  });

  const datas = doc.output();

  fs.writeFileSync(`./informes/${documento_nombre}.pdf`, datas, "binary");
  enviar.f_enviar_doc(documento_nombre, destino);
};

module.exports = { f_crea_pdf };

delete global.window;
delete global.navigator;
delete global.btoa;
delete global.html2pdf;
