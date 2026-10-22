//traduce http a logica de negocio

const authService = require('../services/auth.service');
const v = require('../utils/validar');

async function register(req, res, next) {
  try {
    const datos = {
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: v.texto(req.body.apellido, 'apellido', { requerido: true, max: 60 }),
      mail: v.email(req.body.mail, 'mail', { requerido: true }),
      telefono: v.telefono(req.body.telefono, 'telefono', { requerido: true }),
      password: v.password(req.body.password),
    };

    const resultado = await authService.register(datos);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { mail, password } = req.body;

    // solo se chequea que sean textos, no la politica de contraseñas: una
    // cuenta con clave vieja (mas corta) tiene que poder entrar para cambiarla
    if (typeof mail !== 'string' || typeof password !== 'string' || !mail.trim() || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    if (mail.length > 254 || password.length > 200) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const resultado = await authService.login({ mail: mail.trim().toLowerCase(), password });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// el token es stateless: este dispositivo lo descarta. Para cerrar las
// sesiones de los demas dispositivos alcanza con cambiar la contraseña, que
// invalida los tokens anteriores (ver tokenVersion en auth.service.js).
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
    const b = req.body;
    // los que no vienen quedan como estan (undefined); los que vienen se validan
    const datos = {
      nombre: b.nombre === undefined ? undefined : v.texto(b.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: b.apellido === undefined ? undefined : v.texto(b.apellido, 'apellido', { requerido: true, max: 60 }),
      mail: b.mail === undefined ? undefined : v.email(b.mail, 'mail', { requerido: true }),
      telefono: b.telefono === undefined ? undefined : v.telefono(b.telefono),
      password: v.password(b.password, { requerido: false }),
      // la de ahora: hace falta para cambiar la contraseña o el mail
      passwordActual: typeof b.passwordActual === 'string' ? b.passwordActual.slice(0, 200) : undefined,
    };
    const usuario = await authService.actualizarMe(req.user.id, datos);
    res.json(usuario);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const mail = v.email(req.body.mail, 'mail', { requerido: true });

    await authService.forgotPassword(mail);
    // respuesta identica exista o no el mail, para no filtrar que usuarios estan registrados
    res.json({ mensaje: 'Si el mail esta registrado, te enviamos un link para recuperar la contraseña' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const token = v.texto(req.body.token, 'token', { requerido: true, max: 128 });
    const password = v.password(req.body.password);

    await authService.resetPassword({ token, password });
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, me, actualizarMe, forgotPassword, resetPassword };
