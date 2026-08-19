// logica de negocio de invitaciones

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const { enviarInvitacion } = require('../config/mailer');

const DIAS_EXPIRACION = 2;

async function crear({ email, rol, invitadoPorId }) {
  const mailEnUso = await prisma.user.findUnique({ where: { mail: email } });
  if (mailEnUso) {
    const error = new Error('Ese email ya pertenece a un usuario existente');
    error.status = 409;
    throw error;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + DIAS_EXPIRACION * 24 * 60 * 60 * 1000);

  const invitacion = await prisma.invitacion.create({
    data: { email, rol, token, expiraEn, invitadoPorId },
  });

  const link = `${process.env.FRONTEND_URL}/aceptar-invitacion?token=${token}`;
  await enviarInvitacion({ mail: email, link });

  return {
    id: invitacion.id,
    email: invitacion.email,
    rol: invitacion.rol,
    estado: invitacion.estado,
    expiraEn: invitacion.expiraEn,
  };
}

async function aceptar({ token, nombre, apellido, telefono, password }) {
  const invitacion = await prisma.invitacion.findUnique({ where: { token } });

  if (!invitacion) {
    const error = new Error('Invitación no encontrada');
    error.status = 404;
    throw error;
  }

  if (invitacion.estado !== 'pendiente') {
    const error = new Error('Esta invitación ya no está disponible');
    error.status = 409;
    throw error;
  }

  if (invitacion.expiraEn < new Date()) {
    const error = new Error('Esta invitación expiró');
    error.status = 410;
    throw error;
  }

  const passwordhash = await bcrypt.hash(password, 10);

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: {
        nombre,
        apellido,
        mail: invitacion.email,
        telefono,
        passwordhash,
        rol: invitacion.rol,
      },
    }),
    prisma.invitacion.update({
      where: { id: invitacion.id },
      data: { estado: 'aceptada' },
    }),
  ]);

  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    mail: user.mail,
    rol: user.rol,
  };
}

module.exports = { crear, aceptar };