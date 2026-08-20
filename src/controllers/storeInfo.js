// traduce http a logica de negocio

const storeInfoService = require('../services/storeInfo.service');

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
    const { nombre, direccion, telefono, email, instagram, whatsapp, description, horario } = req.body;

    if (!nombre || !direccion || !horario) {
      return res.status(400).json({ error: 'Faltan campos requeridos (nombre, direccion, horario)' });
    }

    const info = await storeInfoService.actualizar({
      nombre, direccion, telefono, email, instagram, whatsapp, description, horario,
    });
    res.json(info);
  } catch (err) {
    next(err);
  }
}

module.exports = { obtener, actualizar };