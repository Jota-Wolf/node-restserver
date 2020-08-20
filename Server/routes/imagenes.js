const express = require("express");
const fs = require("fs");
const path = require("path");
const {
  verificaToken,
  verificaTokenImg,
} = require("../middlewares/authetication");

let app = express();

app.get("/imagen/:tipo/:img", verificaTokenImg, (req, res) => {
  let tipo = req.params.tipo;
  let img = req.params.img;

  //La funcion resolve del modulo path me va decovler el path obsoluto de donde viene la imagen
  let path_img = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

  //Tanto la funcion existsSync y sendFile necesitan un path absoluto
  if (fs.existsSync(path_img)) {
    res.sendFile(path_img);
  } else {
    let noImage_path = path.resolve(__dirname, "../assets/no-image.jpg");
    res.sendFile(noImage_path);
  }
});

module.exports = app;
