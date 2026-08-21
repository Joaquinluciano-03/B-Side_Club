// traduce http a logica de negocio

const imagenService = require('../services/imagen.service');

async function agregar(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }

    const imagenes = await imagenService.agregar(req.params.id, req.files);
    res.status(201).json(imagenes);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await imagenService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { agregar, eliminar };