const jwt = require("jsonwebtoken");

//Verificar token
//el next lo que va hacer es continuar con la ejecucion del programa
let verificaToken = (req, res, next) => {
  let token = req.get("token");

  jwt.verify(token, process.env.SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        err: {
          message: "Token no válido",
        },
      });
    }

    req.usuario = decoded.usuario;
    next();
  });
};

//Verificar ADminRole
let verificaAdminRole = (req, res, next) => {
  let usuario = req.usuario;

  if (usuario.role === "admin_role") {
    next();
  } else {
    return res.json({
      ok: false,
      err: {
        message: "El usuario no es administrador",
      },
    });
  }
};

module.exports = {
  verificaToken,
  verificaAdminRole,
};
