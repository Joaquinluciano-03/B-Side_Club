// traduce http a logica de negocio

const invitacionService = require('../services/invitacion.service');

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// roles que se pueden dar por invitacion. super_admin queda afuera a proposito:
// es el dueño del local, hay uno solo y sale del registro inicial. Sin esta
// lista un administrador podia invitar a alguien como super_admin, y un rol
// inventado ("jefe") llegaba a Prisma y salia como error 500.
const ROLES_INVITABLES = ['administrador', 'vendedor'];

async function crear(req, res, next) {
  try {
    const { email, rol } = req.body;

    if (!email || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!MAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'El mail no tiene un formato válido' });
    }
    if (!ROLES_INVITABLES.includes(rol)) {
      return res.status(400).json({ error: `Rol inválido, debe ser uno de: ${ROLES_INVITABLES.join(', ')}` });
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
    const { token, nombre, apellido, telefono, password } = req.body;

    if (!token || !nombre || !apellido || !telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const resultado = await invitacionService.aceptar({ token, nombre, apellido, telefono, password });
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
    await invitacionService.revocar(req.params.id);
    res.json({ mensaje: 'Invitación revocada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, aceptar, listar, revocar };