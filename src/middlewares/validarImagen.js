// Revisa que lo que se subio sea de verdad una imagen, mirando sus primeros
// bytes (la "firma" de cada formato). El tipo que manda el navegador lo
// elige el cliente: alguien podia subir un .html o un .svg con codigo
// diciendo que era image/png, y quedaba publicado en nuestro storage.
// Si la firma coincide, el tipo y la extension con que se guarda salen de
// aca, no de lo que dijo el cliente.

const FORMATOS = [
  { tipo: 'image/jpeg', ext: '.jpg', es: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    tipo: 'image/png',
    ext: '.png',
    es: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  { tipo: 'image/gif', ext: '.gif', es: (b) => /^GIF8[79]a$/.test(b.toString('latin1', 0, 6)) },
  {
    tipo: 'image/webp',
    ext: '.webp',
    es: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
  },
  {
    tipo: 'image/avif',
    ext: '.avif',
    es: (b) => b.toString('latin1', 4, 8) === 'ftyp' && /^avi[fs]$/.test(b.toString('latin1', 8, 12)),
  },
];

function validarImagen(req, res, next) {
  const archivos = req.files || (req.file ? [req.file] : []);
  for (const file of archivos) {
    const formato = file.buffer && file.buffer.length >= 12 && FORMATOS.find((f) => f.es(file.buffer));
    if (!formato) {
      return res.status(400).json({ error: 'El archivo no es una imagen válida (JPG, PNG, WEBP, GIF o AVIF).' });
    }
    file.mimetype = formato.tipo;
    file.originalname = `imagen${formato.ext}`;
  }
  next();
}

module.exports = { validarImagen };
