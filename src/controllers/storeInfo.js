// traduce http a logica de negocio

const storeInfoService = require('../services/storeInfo.service');
const v = require('../utils/validar');

async function obtener(req, res, next) {
  try {
    const info = await storeInfoService.obtener();
    res.json(info);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const b = req.body;
    if (b.horario === undefined) throw v.error400('Falta el campo "horario".');

    // lo que se carga aca se muestra en toda la web publica (header, footer,
    // contacto, mails), asi que pasa por la misma limpieza que el resto
    const info = await storeInfoService.actualizar({
      nombre: v.texto(b.nombre, 'nombre', { requerido: true, max: 60 }),
      direccion: v.texto(b.direccion, 'direccion', { requerido: true, max: 160 }),
      telefono: v.telefono(b.telefono),
      email: v.email(b.email),
      instagram: v.usuarioInstagram(b.instagram),
      whatsapp: v.telefono(b.whatsapp, 'whatsapp'),
      description: v.texto(b.description, 'description', { max: 1000, multilinea: true }),
      horario: v.horario(b.horario),
    });
    res.json(info);
  } catch (err) {
    next(err);
  }
}

module.exports = { obtener, actualizar };
