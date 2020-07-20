const express = require("express");
const bcrypt = require("bcrypt");
const _ = require("underscore");
const Usuario = require("../models/usuario");
const app = express();

//URLS
//LISTAR TODOOS LOS USUARIOS
app.get("/usuarios", (req, res) => {
  //existen parametros opcionales y se guardan dentro del objeto query del request
  //el parametro opcional se ingresa en la url como ?parametro
  //ej. localhost:3000/usuarios?desde=10
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite;
  limite = Number(limite);

  // find es un metodo de moongose , se puede especificar una condicion por ejemplo
  //que busque todos los registros menos los de estado false
  //ademas el segundo parametro me permite decir que campos quiero que se muestren
  Usuario.find({ estado: true }, "nombre email role estado google img")
    //Con la propiedad skip le digo que se salte los primeros 5 y me muestre los que siguen
    //ej. podria ser una paginación
    .skip(desde)
    //Con la propiedad limit le digo a find cuando registros quiero que me traiga
    .limit(limite)
    //Con la propiedad excec voy definir que hacer cuadndo se ejecute el find
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Usuario.count({ estado: true }, (err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          usuarios,
          cant_reg: conteo,
        });
      });
    });
});

//CREAR USUARIO
app.post("/usuarios", (req, res) => {
  //estoy obteniendo toda la info que viene del post con el objeto body de la request req.body
  let body = req.body;

  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
  });

  usuario.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    //Le aplico el null para que cuando cree el usuario no me muestre la contrraseña
    //aunque ya este encriptada
    //usuarioDB.password = null;

    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

//ACTUALIZAR USUARIO
app.put("/usuarios/:id", (req, res) => {
  //el params.id hace referencia al id de la url /usuarios/:"id"
  let id = req.params.id;
  //Con la libreria UNDERSCORE _ puedo filtrar que campos quiero que se puedan modificar o no
  //con la función pick , se pasa por parametro el objeto a modificar y un arreglo con los campos
  //que SI queremos modificar.
  let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);

  //Esta funcion es de moongose , que recibe el id del usuario , el objeto , opciones (en este
  //caso se ocupa new:true para retornar el valor modificado) y por ultimo un callback
  //runvalidators va ejecutar todas las validaciones definidos en el Schema
  Usuario.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    }
  );
});

//BORRADO LOGICO USUARIO
app.delete("/usuarios/:id", (req, res) => {
  let id = req.params.id;

  let cambiaEstado = {
    estado: false,
  };

  //Con esta funcion borro completamente el registro de la BD pero como yo quiero solo
  //cambiar el estado ocupo findByIdAndUpdate
  //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
  Usuario.findByIdAndUpdate(
    id,
    cambiaEstado,
    { new: true },
    (err, usuarioBorrado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!usuarioBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Usuario no encontrado",
          },
        });
      }

      res.json({
        ok: true,
        usuario: usuarioBorrado,
      });
    }
  );
});

module.exports = app;
