// traduce http a logica de negocio

const generoService = require('../services/genero.service');
const v = require('../utils/validar');

async function listar(req, res, next) {
  try {
    res.json(await generoService.listar());
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const genero = await generoService.crear({
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 40 }),
    });
    res.status(201).json(genero);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await generoService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, crear, eliminar };
