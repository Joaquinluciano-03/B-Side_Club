// traduce http a logica de negocio

const categoriaService = require('../services/categoria.service');

async function listar(req, res, next) {
  try {
    const categorias = await categoriaService.listar();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const categoria = await categoriaService.obtenerPorId(req.params.id);
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    const categoria = await categoriaService.crear({ nombre, descripcion });
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    const categoria = await categoriaService.actualizar(req.params.id, { nombre, descripcion });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoriaService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };