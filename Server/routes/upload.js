const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs");
const path = require("path");

const app = express();

const Usuario = require("../models/usuario");
const Producto = require("../models/producto");
//Cuando se llama a la funcion fileupload cuando se carguen archivos
//el middleware va poner los archivos en un objeto files , que estara en la request
//req.files
app.use(fileUpload({ useTempFiles: true }));

app.put("/upload/:tipo/:id", (req, res) => {
  //Con el parametro tipo pido de que tipo sera la imagen si para el usuario o el producto
  let tipo = req.params.tipo;
  //Con el parametro id , busco cual usuario o producto actualizar
  let id = req.params.id;

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "No se ha seleccionado ningún archivo",
      },
    });
  }

  let tiposValidos = ["productos", "usuarios"];
  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message: "Las tipos permitidos son " + tiposValidos.join(", "),
        tipo: tipo,
      },
    });
  }

  //el req.files.archivo , "archivo" es el nombre del imput donde
  //se van a cargar archivos
  let archivo = req.files.archivo;
  let nombreCortado = archivo.name.split(".");
  let extension = nombreCortado[nombreCortado.length - 1];
  //Extensiones Permitidas
  let extensionesValidas = ["png", "jpg", "gif", "jpeg"];

  //Con la propiedad indexOf puedo buscar en el arreglo la posicion de un elemento
  //Si es menor a 0 siginifica que no la encontro
  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      err: {
        message:
          "Las extensiones permitidas son " + extensionesValidas.join(", "),
        ext: extension,
      },
    });
  }

  //CAMBIAR NOMBRE AL ARCHIVO Y PROCURAR QUE SEA UNICO PARA PREVENIR CACHE DEL NAVEGADOR
  let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

  archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    //AQUI , YA SE QUE LA IMAGEN SE CARGO
    if (tipo === "usuarios") {
      imagenUsuario(id, res, nombreArchivo);
    } else {
      imagenProducto(id, res, nombreArchivo);
    }
  });
});

function imagenUsuario(id, res, nombreArchivo) {
  Usuario.findById(id, (err, usuarioDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "usuarios");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!usuarioDB) {
      if (err) {
        borraArchivo(nombreArchivo, "usuarios");
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no existe",
          },
        });
      }
    }

    borraArchivo(usuarioDB.img, "usuarios");

    usuarioDB.img = nombreArchivo;

    usuarioDB.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        usuario: usuarioGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function imagenProducto(id, res, nombreArchivo) {
  Producto.findById(id, (err, productoDB) => {
    if (err) {
      borraArchivo(nombreArchivo, "productos");
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      if (err) {
        borraArchivo(nombreArchivo, "productos");
        return res.status(400).json({
          ok: false,
          err: {
            message: "Producto no existe",
          },
        });
      }
    }

    borraArchivo(productoDB.img, "productos");

    productoDB.img = nombreArchivo;

    productoDB.save((err, productoGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }
      res.json({
        ok: true,
        producto: productoGuardado,
        img: nombreArchivo,
      });
    });
  });
}

function borraArchivo(nombreImagen, tipo) {
  let path_imagen = path.resolve(
    __dirname,
    `../../uploads/${tipo}/${nombreImagen}`
  );

  //La funcion existsSync , comprueba si un path existe o no
  if (fs.existsSync(path_imagen)) {
    //La funcion unlinkSync borra un path
    fs.unlinkSync(path_imagen);
  }
}

module.exports = app;
