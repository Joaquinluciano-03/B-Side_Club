const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { enviarRecuperoPassword } = require('../config/mailer');
const { passwordSinDatosPersonales } = require('../utils/validar');

const MINUTOS_EXPIRACION_RESET = 30;
const COSTO_BCRYPT = 10;

// hash de relleno: el login tarda lo mismo exista o no el mail
const HASH_DE_RELLENO = bcrypt.hashSync('relleno-para-igualar-tiempos', COSTO_BCRYPT);

// los tokens de un solo uso se guardan hasheados: el link lleva el token y la base solo su huella
function huella(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// datos seguros de devolver (sin el hash)
function datosPublicos(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    mail: user.mail,
    telefono: user.telefono,
    rol: user.rol,
  };
}

// v = versión de las credenciales: al cambiar la contraseña sube y los tokens anteriores dejan de servir
function firmarToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol, v: user.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d', algorithm: 'HS256' }
  );
}

async function register({ nombre, apellido, mail, telefono, password }) {
  // el registro solo crea al super_admin, una vez; el resto entra por invitación
  const yaHaySuperAdmin = await prisma.user.findFirst({ where: { rol: 'super_admin' } });
  if (yaHaySuperAdmin) {
    const error = new Error('Ya existe un administrador registrado. Pedile una invitacion a alguien del equipo.');
    error.status = 409;
    throw error;
  }

  const mailEnUso = await prisma.user.findUnique({ where: { mail } });
  if (mailEnUso) {
    const error = new Error('Ese email ya esta en uso');
    error.status = 409;
    throw error;
  }

  const passwordhash = await bcrypt.hash(password, COSTO_BCRYPT);

  const user = await prisma.user.create({
    data: { nombre, apellido, mail, telefono, passwordhash, rol: 'super_admin' },
  });

  return { token: firmarToken(user), user: datosPublicos(user) };
}

async function me(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }
  return datosPublicos(user);
}

async function actualizarMe(userId, { nombre, apellido, mail, telefono, password, passwordActual }) {
  const actual = await prisma.user.findUnique({ where: { id: userId } });
  if (!actual) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }

  // para cambiar contraseña o mail hace falta la contraseña actual
  const cambiaMail = mail && mail !== actual.mail;
  if (password || cambiaMail) {
    const ok = passwordActual && (await bcrypt.compare(passwordActual, actual.passwordhash));
    if (!ok) {
      const error = new Error('La contraseña actual no es correcta.');
      error.status = 403;
      throw error;
    }
  }

  if (cambiaMail) {
    const mailEnUso = await prisma.user.findFirst({ where: { mail, NOT: { id: userId } } });
    if (mailEnUso) {
      const error = new Error('Ese email ya esta en uso');
      error.status = 409;
      throw error;
    }
  }

  if (password) {
    passwordSinDatosPersonales(password, {
      nombre: nombre ?? actual.nombre,
      apellido: apellido ?? actual.apellido,
      mail: mail ?? actual.mail,
    });
  }

  const data = { nombre, apellido, mail, telefono };
  if (password) {
    data.passwordhash = await bcrypt.hash(password, COSTO_BCRYPT);
    // cambiar la contraseña cierra las otras sesiones
    data.tokenVersion = { increment: 1 };
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  // se devuelve un token nuevo para que este dispositivo siga logueado
  return { ...datosPublicos(user), ...(password && { token: firmarToken(user) }) };
}

async function login({ mail, password }) {
  const user = await prisma.user.findUnique({ where: { mail } });

  // se compara igual aunque no exista (ver HASH_DE_RELLENO)
  const passwordValida = await bcrypt.compare(password, user?.passwordhash || HASH_DE_RELLENO);

  if (!user || !passwordValida) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  return { token: firmarToken(user), user: datosPublicos(user) };
}

async function forgotPassword(mail) {
  const user = await prisma.user.findUnique({ where: { mail } });

  // no se avisa si el mail no existe, para no revelar qué mails están registrados
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + MINUTOS_EXPIRACION_RESET * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token: huella(token), userId: user.id, expiraEn },
  });

  const link = `${process.env.FRONTEND_URL}/resetear-password?token=${token}`;
  await enviarRecuperoPassword({ mail: user.mail, link });
}

async function resetPassword({ token, password }) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token: huella(token) } });

  if (!resetToken) {
    const error = new Error('Token invalido');
    error.status = 400;
    throw error;
  }

  if (resetToken.usado) {
    const error = new Error('Este token ya fue utilizado');
    error.status = 409;
    throw error;
  }

  if (resetToken.expiraEn < new Date()) {
    const error = new Error('Este token expiro');
    error.status = 410;
    throw error;
  }

  const duenio = await prisma.user.findUnique({ where: { id: resetToken.userId } });
  passwordSinDatosPersonales(password, duenio || {});

  const passwordhash = await bcrypt.hash(password, COSTO_BCRYPT);

  await prisma.$transaction([
    // contraseña nueva: se cierran todas las sesiones
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordhash, tokenVersion: { increment: 1 } },
    }),
    // este link y los anteriores del usuario quedan usados
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usado: false },
      data: { usado: true },
    }),
  ]);
}

module.exports = { register, login, me, actualizarMe, forgotPassword, resetPassword, huella };
