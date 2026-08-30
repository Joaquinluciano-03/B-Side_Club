// traduce http a logica de negocio

const invitacionService = require('../services/invitacion.service');

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function crear(req, res, next) {
  try {
    const { email, rol } = req.body;

    if (!email || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!MAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'El mail no tiene un formato válido' });
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