//logica de negocio (bcrypt + jwt)

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

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

  const token = jwt.sign(
    { id: user.id, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      mail: user.mail,
      rol: user.rol,
    },
  };
}

module.exports = { login };