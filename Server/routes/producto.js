const express = require("express");
const {
  verificaAdminRole,
  verificaToken,
} = require("../middlewares/authetication");
const _ = require("underscore");
let app = express();

let Producto = require("../models/producto");
const producto = require("../models/producto");

//LISTAR PRODUCTOS
app.get("/productos", verificaToken, (req, res) => {
  //traer todos los productos
  //populate : usuario y categoria
  //paginado
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite;
  limite = Number(limite);

  Producto.find({ disponible: true })
    .sort("precioUni")
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .skip(desde)
    .limit(limite)
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      Producto.countDocuments({ disponible: true }, (err, conteo) => {
        if (err) {
          return res.status(400).json({
            ok: false,
            err,
          });
        }

        res.json({
          ok: true,
          productos,
          cant_reg: conteo,
        });
      });
    });
});

//LISTAR PRODUCTO POR ID
app.get("/productos/:id", verificaToken, (req, res) => {
  //populate : usuario y categoria
  let id = req.params.id;
  Producto.findById(id)
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, producto) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!producto) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "No existe ID",
          },
        });
      }

      res.json({
        ok: true,
        producto,
      });
    });
});

//BUSCAR PRODUCTOS
app.get("/productos/buscar/:termino", verificaToken, (req, res) => {
  let termino = req.params.termino;

  let regex = new RegExp(termino, "i");

  Producto.find({ descripcion: regex, disponible: true })
    .populate("usuario", "nombre email")
    .populate("categoria", "descripcion")
    .exec((err, productos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!productos) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        productos,
      });
    });
});

//CREAR PRODUCTOS
app.post("/productos", verificaToken, (req, res) => {
  //grabar USUARIO y CATEGORIA
  let body = req.body;

  let producto = new Producto({
    nombre: body.nombre,
    precioUni: body.precioUni,
    descripcion: body.descripcion,
    disponible: body.disponible,
    categoria: body.categoria,
    usuario: req.usuario._id,
  });

  producto.save((err, productoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        err,
      });
    }

    if (!productoDB) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    //El status 201 es para cuando se crea un registro
    res.status(201).json({
      ok: true,
      producto: productoDB,
      message: `Producto N°${productoDB._id} creado!`,
    });
  });
});

//ACTUALIZAR PRODUCTOS
app.put("/productos/:id", [verificaToken, verificaAdminRole], (req, res) => {
  //grabar USUARIO y CATEGORIA
  let id = req.params.id;
  let body = _.pick(req.body, [
    "nombre",
    "precioUni",
    "descripcion",
    "categoria",
    "usuario",
  ]);

  Producto.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, productoDB) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!productoDB) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "El ID no existe",
          },
        });
      }

      res.json({
        ok: true,
        producto: productoDB,
        message: `Producto N°${productoDB._id} modificado!`,
      });
    }
  );
});

//BORRADO LOGICO PRODUCTOS
app.delete("/productos/:id", [verificaToken, verificaAdminRole], (req, res) => {
  //cambiar de NO DISPONIBLE !
  let id = req.params.id;
  let cambiaEstado = {
    disponible: false,
  };
  Producto.findByIdAndUpdate(
    id,
    cambiaEstado,
    { new: true, runValidators: true },
    (err, productoBorrado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          err,
        });
      }

      if (!productoBorrado) {
        return res.status(400).json({
          ok: false,
          err: {
            message: "El ID no existe",
          },
        });
      }

      res.json({
        ok: true,
        message: `Producto N°${productoBorrado._id} eliminado!`,
      });
    }
  );
});

module.exports = app;
