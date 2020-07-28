const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
  descripcion: {
    type: String,
    unique: true,
    required: [true, "La descripción es necesaria"],
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: [true,"El usuario es requerido"]
  },
});

module.exports = mongoose.model("Categoria", categoriaSchema);
