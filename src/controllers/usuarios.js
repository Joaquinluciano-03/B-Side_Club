// traduce http a logica de negocio

const usuariosService = require('../services/usuarios.service');
const v = require('../utils/validar');

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
    const b = req.body;
    // los que no vienen quedan como estan (undefined); los que vienen se validan
    const datos = {
      nombre: b.nombre === undefined ? undefined : v.texto(b.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: b.apellido === undefined ? undefined : v.texto(b.apellido, 'apellido', { requerido: true, max: 60 }),
      mail: b.mail === undefined ? undefined : v.email(b.mail, 'mail', { requerido: true }),
      telefono: b.telefono === undefined ? undefined : v.telefono(b.telefono, 'telefono', { requerido: true }),
      rol: b.rol === undefined ? undefined : v.opcion(b.rol, 'rol', ['administrador', 'vendedor'], { requerido: true }),
    };
    const usuario = await usuariosService.actualizar(v.id(req.params.id), datos, req.user.rol);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await usuariosService.eliminar(v.id(req.params.id), req.user.rol);
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, actualizar, eliminar };
