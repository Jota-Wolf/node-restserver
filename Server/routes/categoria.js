const express = require("express");
let {
  verificaAdminRole,
  verificaToken,
} = require("../middlewares/authetication");
const _ = require("underscore");

let app = express();

let Categoria = require("../models/categoria");

//LISTAR CATEGORIAS
app.get("/categorias", verificaToken, (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite;
  limite = Number(limite);

  Categoria.find()
    //Con la propiedad sort puedo espcificar como queiro que ordene la lista
    .sort("descripcion")
    //Populate va revisar que OBJECT-ID existe en la categoria que toy solicitando
    //y me va permitir cargar info de las foraneas
    //Si tengo mas Schemas que quiero mostrar info simplemente agrego otro populate()
    .populate("usuario", "nombre email")
    .skip(desde)
    .limit(limite)
    .exec((err, categorias) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      Categoria.countDocuments((err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          categorias,
          cant_reg: conteo,
        });
      });
    });
});

//LISTAR CATEGORIA POR ID
app.get("/categorias/:id", verificaToken, (req, res) => {
  let id = req.params.id;
  Categoria.findById(id)
    .populate("usuario", "nombre email")
    .exec((err, categoria) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!categoria) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No existe ID",
          },
        });
      }

      res.json({
        ok: true,
        categoria,
      });
    });
});

//CREAR CATEGORIA
app.post("/categorias", verificaToken, (req, res) => {
  let body = req.body;

  let categoria = new Categoria({
    descripcion: body.descripcion,
    //Asi puedo rescatar el id que viene del middleware del token valido
    usuario: req.usuario._id,
  });
  console.log(categoria.usuario);

  categoria.save((err, categoriaDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!categoriaDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      categoria: categoriaDB,
    });
  });
});

//ACTUALIZAR CATEGORIA
app.put("/categorias/:id", [verificaToken, verificaAdminRole], (req, res) => {
  let id = req.params.id;
  let body = req.body;

  let descCategoria = {
    descripcion: body.descripcion,
  };

  Categoria.findByIdAndUpdate(
    id,
    descCategoria,
    { new: true, runValidators: true },
    (err, categoriaDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!categoriaDB) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        categoria: categoriaDB,
      });
    }
  );
});

//DELETE CATEGORIA
app.delete(
  "/categorias/:id",
  [verificaToken, verificaAdminRole],
  (req, res) => {
    let id = req.params.id;
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      if (!categoriaBorrada) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "Categoria no encontrada",
          },
        });
      }

      res.json({
        ok: true,
        message: `Categoria ${categoriaBorrada._id} borrada!`,
      });
    });
  }
);

module.exports = app;
