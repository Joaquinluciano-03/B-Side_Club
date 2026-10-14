// traduce http a logica de negocio

const productoService = require('../services/producto.service');

async function listar(req, res, next) {
  try {
    const { categoriaId, destacado, q, esActivo, page, pageSize } = req.query;
    const resultado = await productoService.listar(
      { categoriaId, destacado, q, esActivo, page, pageSize },
      { esAdmin: Boolean(req.user) }
    );
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    // mismo criterio que listar: sin token sos visitante y solo ves activos
    const producto = await productoService.obtenerPorId(req.params.id, {
      soloActivos: !req.user,
    });
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