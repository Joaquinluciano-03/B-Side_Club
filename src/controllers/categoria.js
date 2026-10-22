// traduce http a logica de negocio

const categoriaService = require('../services/categoria.service');
const v = require('../utils/validar');

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
    const categoria = await categoriaService.obtenerPorId(v.id(req.params.id));
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const categoria = await categoriaService.crear({
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 60 }),
      descripcion: v.texto(req.body.descripcion, 'descripcion', { max: 300, multilinea: true }),
    });
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, descripcion } = req.body;
    // los que no vienen quedan como estan (undefined); los que vienen se validan
    const categoria = await categoriaService.actualizar(v.id(req.params.id), {
      nombre: nombre === undefined ? undefined : v.texto(nombre, 'nombre', { requerido: true, max: 60 }),
      descripcion: descripcion === undefined ? undefined : v.texto(descripcion, 'descripcion', { max: 300, multilinea: true }),
    });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoriaService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
