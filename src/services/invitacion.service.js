// logica de negocio de invitaciones

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { prisma } = require('../config/db');
const { enviarInvitacion } = require('../config/mailer');
const { huella } = require('./auth.service');

const DIAS_EXPIRACION = 7;

async function crear({ email, rol, invitadoPorId }) {
  const mailEnUso = await prisma.user.findUnique({ where: { mail: email } });
  if (mailEnUso) {
    const error = new Error('Ese email ya pertenece a un usuario existente');
    error.status = 409;
    throw error;
  }

  // sin este chequeo se podian emitir N tokens validos para el mismo mail,
  // y revocar uno no servia de nada porque los otros seguian funcionando.
  // Las vencidas no cuentan: ya no sirven, se puede volver a invitar.
  const invitacionVigente = await prisma.invitacion.findFirst({
    where: { email, estado: 'pendiente', expiraEn: { gt: new Date() } },
  });
  if (invitacionVigente) {
    const error = new Error('Ya hay una invitación pendiente para ese email. Revocala antes de generar una nueva.');
    error.status = 409;
    throw error;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiraEn = new Date(Date.now() + DIAS_EXPIRACION * 24 * 60 * 60 * 1000);

  // en la base va la huella del token, no el token (ver huella en auth.service)
  const invitacion = await prisma.invitacion.create({
    data: { email, rol, token: huella(token), expiraEn, invitadoPorId },
  });

  const link = `${process.env.FRONTEND_URL}/aceptar-invitacion?token=${token}`;

  // si el mail no sale, la invitacion no sirve para nada: nadie va a recibir
  // el link. La borramos para que el admin pueda reintentar, porque si no el
  // chequeo de "ya hay una invitacion pendiente" de arriba le bloquearia el
  // segundo intento con un 409.
  // el mail dice quien invito, para que no llegue como si fuera automatico
  const quienInvita = invitadoPorId
    ? await prisma.user.findUnique({ where: { id: invitadoPorId }, select: { nombre: true, apellido: true } })
    : null;

  try {
    await enviarInvitacion({
      mail: email,
      link,
      invitadoPor: quienInvita ? `${quienInvita.nombre} ${quienInvita.apellido}` : null,
    });
  } catch (err) {
    await prisma.invitacion.delete({ where: { id: invitacion.id } });
    console.error('No se pudo enviar la invitacion, se dio de baja:', err.message);
    const error = new Error('No se pudo enviar el mail de invitación. Probá de nuevo en un rato.');
    error.status = 502;
    throw error;
  }

  return {
    id: invitacion.id,
    email: invitacion.email,
    rol: invitacion.rol,
    estado: invitacion.estado,
    expiraEn: invitacion.expiraEn,
  };
}

async function aceptar({ token, nombre, apellido, telefono, password }) {
  // las invitaciones nuevas guardan la huella; las anteriores a este cambio,
  // el token tal cual (se aceptan hasta que venzan)
  const invitacion =
    (await prisma.invitacion.findUnique({ where: { token: huella(token) } })) ||
    (await prisma.invitacion.findUnique({ where: { token } }));

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

  // por si el mail ya se registro por otro lado mientras la invitacion esperaba
  const yaExiste = await prisma.user.findUnique({ where: { mail: invitacion.email } });
  if (yaExiste) {
    const error = new Error('Ese email ya tiene una cuenta. Iniciá sesión.');
    error.status = 409;
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

async function listar() {
  return prisma.invitacion.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, rol: true, estado: true, expiraEn: true, createdAt: true },
  });
}

async function revocar(id) {
  const invitacion = await prisma.invitacion.findUnique({ where: { id: Number(id) } });

  if (!invitacion) {
    const error = new Error('Invitación no encontrada');
    error.status = 404;
    throw error;
  }

  if (invitacion.estado !== 'pendiente') {
    const error = new Error('Solo se pueden revocar invitaciones pendientes');
    error.status = 409;
    throw error;
  }

  await prisma.invitacion.update({ where: { id: invitacion.id }, data: { estado: 'revocada' } });
}

module.exports = { crear, aceptar, listar, revocar };