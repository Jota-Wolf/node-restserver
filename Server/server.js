//TODO: ACORDARSE HACER ESTO
//FIXME: ARREGLAR ESTO
//Al ser config.js el primer archivo va configurar el servidor
require("./config/config");
const express = require("express");
const mongoose = require("mongoose");
const app = express();
//Este paquete body-parser que permite procesar la informacion que viene de un post o put o delete
// y la serializa en on objeto JSON
const bodyParser = require("body-parser");
const colors = require("colors");
//Estos son middleware , cada vez que se ocupa el app.use se ocupan los middleware
//cada vez que se realiza una peticion se activa el middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//Importo la configuracion global de rutas 
app.use(require("./routes/index"));

//conexion a base de datos mongo
mongoose.connect(
  process.env.URLDB,
  { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true },
  (err, res) => {
    if (err) throw err;

    console.log("Conexion a Base de datos ACTIVA!".green);
  }
);
//Uso el puerto que esta en config.js
app.listen(process.env.PORT, () => {
  console.log("Servidor en puerto:", process.env.PORT);
});
