// handler central de errores (todo lo que llega con next(err))

const multer = require('multer');

// multer lanza errores con .code; se traducen a mensajes útiles
const ERRORES_MULTER = {
  LIMIT_FILE_SIZE: 'La imagen supera el maximo de 5 MB',
  LIMIT_FILE_COUNT: 'Se pueden subir hasta 5 imagenes por vez',
  LIMIT_UNEXPECTED_FILE:
    'Campo de archivo inesperado: "imagenes" para productos, "imagen" para promociones',
};

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const mensaje = ERRORES_MULTER[err.code] || 'No se pudo procesar el archivo subido';
    return res.status(400).json({ error: mensaje });
  }

  const status = err.status || 500;

  // los errores con .status se devuelven tal cual; el resto es inesperado y se reemplaza
  // por un texto genérico (el detalle queda solo en el log)
  const mensaje = err.status ? err.message : 'Error interno del servidor';

  res.status(status).json({ error: mensaje });
}

module.exports = { errorHandler };
