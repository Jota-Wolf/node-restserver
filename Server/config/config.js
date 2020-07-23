// PUERTO
process.env.PORT = process.env.PORT || 3000;

//ENTORNO
process.env.NODE_ENV = process.env.NODE_ENV || "dev";

//VENCIMIENTO DEL TOKEN
// 60 seg * 60 min * 24 hrs * 30 diass
process.env.CADUCIDAD_TOKEN = 60 * 60 * 24 * 30;
//SEED DE AUTENTICACION
process.env.SEED = process.env.SEED || "este-es-el-seed-desarrollo";

//CLIENTE ID DE GOOGLE
process.env.CLIENT_ID = process.env.CLIENT_ID ||'559765111674-qffosmf4d80hfacp9sn28vi8sdnj5l9r.apps.googleusercontent.com';
//BASE DE DATOS
let urlDB;
if (process.env.NODE_ENV === "dev") {
  urlDB = "mongodb://localhost:27017/cafe";
} else {
  urlDB = process.env.MONGO_URL;
}

process.env.URLDB = urlDB;
