// traduce http a logica de negocio

const invitacionService = require('../services/invitacion.service');
const v = require('../utils/validar');

// roles que se pueden dar por invitacion. super_admin queda afuera a proposito:
// es el dueño del local, hay uno solo y sale del registro inicial. Sin esta
// lista un administrador podia invitar a alguien como super_admin, y un rol
// inventado ("jefe") llegaba a Prisma y salia como error 500.
const ROLES_INVITABLES = ['administrador', 'vendedor'];

async function crear(req, res, next) {
  try {
    const email = v.email(req.body.email, 'email', { requerido: true });
    const rol = v.opcion(req.body.rol, 'rol', ROLES_INVITABLES, { requerido: true });

    // solo el dueño suma administradores: si no, un administrador podia
    // invitar a otros con su mismo poder (y ellos a mas)
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
      password: v.password(req.body.password),
    };

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
