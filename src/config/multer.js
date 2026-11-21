// configuracion de multer: recibe las imagenes que sube el panel

const multer = require('multer');

// memoryStorage: el backend no tiene disco propio, el archivo pasa a Supabase Storage (máx. 5 MB)
const storage = multer.memoryStorage();

// SVG queda afuera porque puede llevar scripts; validarImagen.js revisa el contenido
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

const fileFilter = (req, file, cb) => {
  if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // con .status el errorHandler lo devuelve como 400
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
