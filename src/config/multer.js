// configuracion de multer: recibe las imagenes que sube el panel

const multer = require('multer');

// memoryStorage y no diskStorage: el backend corre como funcion de Netlify y
// no tiene disco propio donde escribir. El archivo queda en memoria y de ahi
// lo sube storage.js a Supabase Storage.
// El limite de 5 MB de abajo es lo que mantiene acotado el uso de memoria.
const storage = multer.memoryStorage();

// los formatos que muestra cualquier navegador. SVG queda afuera a proposito:
// es texto y puede llevar scripts adentro. Ademas, despues de multer,
// middlewares/validarImagen.js confirma el formato mirando el contenido.
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const fileFilter = (req, file, cb) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // con .status el errorHandler lo devuelve como 400 con este mismo mensaje,
    // en vez de tratarlo como un error interno inesperado
    const error = new Error('Solo se permiten imágenes JPG, PNG, WEBP, GIF o AVIF');
    error.status = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5, fields: 10 }, // 5 MB máximo por archivo
});

module.exports = upload;
