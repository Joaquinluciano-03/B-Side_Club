// handler central de errores: cualquier error que llegue con next(err) termina aca,
// en vez de tirar abajo el servidor o devolver HTML de error por defecto de express.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Error interno del servidor" });
}

module.exports = { errorHandler };
