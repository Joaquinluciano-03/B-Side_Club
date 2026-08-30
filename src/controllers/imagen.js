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

async function actualizarOrden(req, res, next) {
  try {
    const { orden } = req.body;
    if (orden === undefined) {
      return res.status(400).json({ error: 'Falta el campo orden' });
    }

    const imagen = await imagenService.actualizarOrden(req.params.id, orden);
    res.json(imagen);
  } catch (err) {
    next(err);
  }
}

module.exports = { agregar, eliminar, actualizarOrden };