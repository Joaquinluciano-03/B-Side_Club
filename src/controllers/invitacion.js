const invitacionService = require('../services/invitacion.service');
const v = require('../utils/validar');

// super_admin no se puede invitar: es el dueño y hay uno solo
const ROLES_INVITABLES = ['administrador', 'vendedor'];

async function crear(req, res, next) {
  try {
    const email = v.email(req.body.email, 'email', { requerido: true });
    const rol = v.opcion(req.body.rol, 'rol', ROLES_INVITABLES, { requerido: true });

    // solo el dueño puede sumar administradores
    if (rol === 'administrador' && req.user.rol !== 'super_admin') {
      return res.status(403).json({ error: 'Solo el dueño del local puede invitar administradores.' });
    }

    const resultado = await invitacionService.crear({
      email,
      rol,
      invitadoPorId: req.user.id,
    });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function aceptar(req, res, next) {
  try {
    const datos = {
      token: v.texto(req.body.token, 'token', { requerido: true, max: 128 }),
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: v.texto(req.body.apellido, 'apellido', { requerido: true, max: 60 }),
      telefono: v.telefono(req.body.telefono, 'telefono', { requerido: true }),
    };
    // el service revisa el mail
    datos.password = v.password(req.body.password, { datos });

    const resultado = await invitacionService.aceptar(datos);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const invitaciones = await invitacionService.listar();
    res.json(invitaciones);
  } catch (err) {
    next(err);
  }
}

async function revocar(req, res, next) {
  try {
    await invitacionService.revocar(v.id(req.params.id));
    res.json({ mensaje: 'Invitación revocada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, aceptar, listar, revocar };
