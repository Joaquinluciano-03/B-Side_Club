//logica de negocio (bcrypt + jwt)

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

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

module.exports = { register, login, me, actualizarMe };