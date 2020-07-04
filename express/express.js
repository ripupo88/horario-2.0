const mongo = require('../mongo/mongodb');
const entrada = require('../comandos/entrada');
const salida = require('../comandos/salida');

const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const port = 8080;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json

app.post('/fichar', async (req, res) => {
   try {
      console.log('req.body', req.body);
      let telegram_id = req.body.telegram;
      let empleado = await mongo.f_confirma_telegram_id(telegram_id);
      let registro = await mongo.confirma_entrada(empleado);
      let newTime = Math.floor(new Date() / 1000);
      let createTime = newTime;
      console.log('createTime', createTime);
      let message = {
         date: createTime,
         chat: {
            id: telegram_id
         },
         from: {
            id: telegram_id
         }
      };

      if (registro[0] != undefined) {
         salida.doSalida(message, empleado, true);
      } else {
         entrada.doEntrada(message, empleado, true, 'fichado por QR', 0);
      }
      res.json({ message: 'has fichado' });
   } catch (e) {
      console.log(e);
      res.json({ message: 'NOOO has fichado' });
   }
});

let time = () => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         resolve({ user: 'sd' });
      }, 5000);
   });
};

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
