// traduce http a logica de negocio

const usuariosService = require('../services/usuarios.service');

async function listar(req, res, next) {
  try {
    const usuarios = await usuariosService.listar();
    res.json(usuarios);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, apellido, mail, telefono, rol } = req.body;
    const usuario = await usuariosService.actualizar(req.params.id, { nombre, apellido, mail, telefono, rol });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await usuariosService.eliminar(req.params.id);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, actualizar, eliminar };
