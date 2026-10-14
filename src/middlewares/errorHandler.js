// handler central de errores: cualquier error que llegue con next(err) termina aca,
// en vez de tirar abajo el servidor o devolver HTML de error por defecto de express.

const multer = require('multer');

// multer no usa nuestra convencion de .status, tira sus propios errores con
// un .code. Los traducimos a mensajes utiles en vez de dejarlos caer como 500.
const ERRORES_MULTER = {
  LIMIT_FILE_SIZE: 'La imagen supera el maximo de 5 MB',
  LIMIT_FILE_COUNT: 'Se pueden subir hasta 5 imagenes por vez',
  LIMIT_UNEXPECTED_FILE: 'El campo del archivo tiene que llamarse "imagenes"',
};

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err instanceof multer.MulterError) {
    const mensaje = ERRORES_MULTER[err.code] || 'No se pudo procesar el archivo subido';
    return res.status(400).json({ error: mensaje });
  }

  const status = err.status || 500;

  // Los errores que nosotros lanzamos traen .status y un mensaje pensado para
  // el usuario, asi que se devuelven tal cual. Los que NO traen status son
  // inesperados (Prisma, bugs nuestros) y su mensaje puede incluir detalles
  // del schema o de la conexion: esos se reemplazan por un texto generico y
  // el detalle real queda solo en el log del servidor.
  const mensaje = err.status ? err.message : 'Error interno del servidor';

  res.status(status).json({ error: mensaje });
}

module.exports = { errorHandler };
