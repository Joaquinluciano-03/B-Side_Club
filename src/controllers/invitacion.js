// traduce http a logica de negocio

const invitacionService = require('../services/invitacion.service');

async function crear(req, res, next) {
  try {
    const { email, rol } = req.body;

    if (!email || !rol) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
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

    const resultado = await invitacionService.aceptar({ token, nombre, apellido, telefono, password });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, aceptar };