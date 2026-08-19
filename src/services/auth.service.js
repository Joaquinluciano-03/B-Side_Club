//logica de negocio (bcrypt + jwt)

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { enviarRecuperoPassword } = require('../config/mailer');

const MINUTOS_EXPIRACION_RESET = 30;

// datos del usuario que es seguro devolver (sin el passwordhash)
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

function firmarToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

async function register({ nombre, apellido, mail, telefono, password }) {
  // el registro solo sirve para crear al super_admin (dueño del local), una unica vez.
  // cualquier otro usuario se suma despues por invitacion, no por aca.
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

  const passwordhash = await bcrypt.hash(password, 10);

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

async function actualizarMe(userId, { nombre, apellido, mail, telefono, password }) {
  if (mail) {
    const mailEnUso = await prisma.user.findFirst({ where: { mail, NOT: { id: userId } } });
    if (mailEnUso) {
      const error = new Error('Ese email ya esta en uso');
      error.status = 409;
      throw error;
    }
  }

  const data = { nombre, apellido, mail, telefono };
  if (password) {
    data.passwordhash = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  return datosPublicos(user);
}

async function login({ mail, password }) {
  const user = await prisma.user.findUnique({ where: { mail } });

  if (!user) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  const passwordValida = await bcrypt.compare(password, user.passwordhash);

  if (!passwordValida) {
    const error = new Error('Credenciales inválidas');
    error.status = 401;
    throw error;
  }

  return { token: firmarToken(user), user: datosPublicos(user) };
}

async function forgotPassword(mail) {
  const user = await prisma.user.findUnique({ where: { mail } });

  // si el mail no existe no avisamos nada distinto: evita que alguien
  // pueda usar este endpoint para averiguar que mails estan registrados.
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + MINUTOS_EXPIRACION_RESET * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { token, userId: user.id, expiraEn },
  });

  const link = `${process.env.FRONTEND_URL}/resetear-password?token=${token}`;
  await enviarRecuperoPassword({ mail: user.mail, link });
}

async function resetPassword({ token, password }) {
  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

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

  const passwordhash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordhash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usado: true } }),
  ]);
}

module.exports = { register, login, me, actualizarMe, forgotPassword, resetPassword };