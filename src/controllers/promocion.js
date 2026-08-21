// traduce http a logica de negocio

const promocionService = require('../services/promocion.service');

async function listar(req, res, next) {
  try {
    const { soloActivas } = req.query;
    const promociones = await promocionService.listar({ soloActivas });
    res.json(promociones);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const promocion = await promocionService.obtenerPorId(req.params.id);
    res.json(promocion);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { titulo, descripcion, imagenUrl, fechaInicio, fechaFin, activa } = req.body;

    if (!titulo) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const promocion = await promocionService.crear({ titulo, descripcion, imagenUrl, fechaInicio, fechaFin, activa });
    res.status(201).json(promocion);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const promocion = await promocionService.actualizar(req.params.id, req.body);
    res.json(promocion);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await promocionService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };