const authService = require('../services/auth.service');
const v = require('../utils/validar');

async function register(req, res, next) {
  try {
    const datos = {
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: v.texto(req.body.apellido, 'apellido', { requerido: true, max: 60 }),
      mail: v.email(req.body.mail, 'mail', { requerido: true }),
      telefono: v.telefono(req.body.telefono, 'telefono', { requerido: true }),
    };
    // la contraseña no puede contener el nombre, el apellido ni el mail
    datos.password = v.password(req.body.password, { datos });

    const resultado = await authService.register(datos);
    res.status(201).json(resultado);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { mail, password } = req.body;

    // acá solo se chequea que sean textos: una cuenta con clave vieja tiene que poder entrar
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

// el token no se guarda: cambiar la contraseña invalida los anteriores
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
    const datos = {
      nombre: b.nombre === undefined ? undefined : v.texto(b.nombre, 'nombre', { requerido: true, max: 60 }),
      apellido: b.apellido === undefined ? undefined : v.texto(b.apellido, 'apellido', { requerido: true, max: 60 }),
      mail: b.mail === undefined ? undefined : v.email(b.mail, 'mail', { requerido: true }),
      telefono: b.telefono === undefined ? undefined : v.telefono(b.telefono),
      // el service revisa que no use su nombre ni su mail
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
    // misma respuesta exista o no el mail
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
