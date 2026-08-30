//traduce http a logica de negocio


const authService = require('../services/auth.service');

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register(req, res, next) {
  try {
    const { nombre, apellido, mail, telefono, password } = req.body;

    if (!nombre || !apellido || !mail || !telefono || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (!MAIL_REGEX.test(mail)) {
      return res.status(400).json({ error: 'El mail no tiene un formato válido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const resultado = await authService.register({ nombre, apellido, mail, telefono, password });
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { mail, password } = req.body;

    if (!mail || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const resultado = await authService.login({ mail, password });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// el token es stateless: no hay nada que invalidar del lado del servidor.
// el frontend es el que descarta el token guardado; esto solo confirma la accion.
async function logout(req, res) {
  res.json({ mensaje: 'Sesion cerrada' });
}

async function me(req, res, next) {
  try {
    const usuario = await authService.me(req.user.id);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function actualizarMe(req, res, next) {
  try {
    const { nombre, apellido, mail, telefono, password } = req.body;
    const usuario = await authService.actualizarMe(req.user.id, { nombre, apellido, mail, telefono, password });
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { mail } = req.body;

    if (!mail) {
      return res.status(400).json({ error: 'Falta el mail' });
    }

    await authService.forgotPassword(mail);
    // respuesta identica exista o no el mail, para no filtrar que usuarios estan registrados
    res.json({ mensaje: 'Si el mail esta registrado, te enviamos un link para recuperar la contraseña' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    await authService.resetPassword({ token, password });
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, actualizarMe, forgotPassword, resetPassword };