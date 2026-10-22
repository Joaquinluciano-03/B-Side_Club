// traduce http a logica de negocio

const imagenService = require('../services/imagen.service');
const v = require('../utils/validar');

async function agregar(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const imagenes = await imagenService.agregar(v.id(req.params.id), req.files);
    res.status(201).json(imagenes);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await imagenService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function actualizarOrden(req, res, next) {
  try {
    const orden = v.entero(req.body.orden, 'orden', { requerido: true, min: 0, max: 1000 });
    const imagen = await imagenService.actualizarOrden(v.id(req.params.id), orden);
    res.json(imagen);
  } catch (err) {
    next(err);
  }
}

module.exports = { agregar, eliminar, actualizarOrden };
