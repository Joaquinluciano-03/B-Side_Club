// traduce http a logica de negocio

const productoService = require('../services/producto.service');

async function listar(req, res, next) {
  try {
    const { categoriaId, destacado } = req.query;
    const productos = await productoService.listar({ categoriaId, destacado });
    res.json(productos);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const producto = await productoService.obtenerPorId(req.params.id);
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, anio, precio, stock, estado_stock, condicion, destacado, descripcion, categoriaId } = req.body;

    if (!nombre || !anio || stock === undefined || !descripcion || !categoriaId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const producto = await productoService.crear({
      nombre, anio, precio, stock, estado_stock, condicion, destacado, descripcion, categoriaId,
    });
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const producto = await productoService.actualizar(req.params.id, req.body);
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await productoService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };