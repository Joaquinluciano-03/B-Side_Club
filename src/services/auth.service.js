//logica de negocio (bcrypt + jwt)

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { enviarRecuperoPassword } = require('../config/mailer');

const MINUTOS_EXPIRACION_RESET = 30;
const COSTO_BCRYPT = 10;

// Hash con el que se compara cuando el mail no existe: asi el login tarda lo
// mismo exista o no la cuenta, y no se puede averiguar que mails estan
// registrados midiendo cuanto tarda la respuesta.
const HASH_DE_RELLENO = bcrypt.hashSync('relleno-para-igualar-tiempos', COSTO_BCRYPT);

// Los tokens de un solo uso (recuperar contraseña, invitaciones) se guardan
// hasheados: el link lleva el token, la base solo su huella. Si alguien
// llegara a leer la base, no podria usarlos.
function huella(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

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

// "v" es la version de las credenciales: al cambiar la contraseña sube y los
// tokens firmados antes dejan de servir (lo chequea middlewares/auth.js)
function firmarToken(user) {
  return jwt.sign(
    { id: user.id, rol: user.rol, v: user.tokenVersion ?? 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d', algorithm: 'HS256' }
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

  // cambiar la contraseña o el mail (con el que se recupera la cuenta) pide la
  // contraseña de ahora: si no, con una sesion abierta ajena o un token
  // robado alguien podia quedarse con la cuenta
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

  const data = { nombre, apellido, mail, telefono };
  if (password) {
    data.passwordhash = await bcrypt.hash(password, COSTO_BCRYPT);
    // cambiar la contraseña cierra las sesiones de los otros dispositivos
    data.tokenVersion = { increment: 1 };
  }

  const user = await prisma.user.update({ where: { id: userId }, data });
  // con contraseña nueva el token actual tambien quedo viejo: se devuelve uno
  // nuevo para que este dispositivo siga con la sesion abierta
  return { ...datosPublicos(user), ...(password && { token: firmarToken(user) }) };
}

async function login({ mail, password }) {
  const user = await prisma.user.findUnique({ where: { mail } });

  // se compara igual aunque el usuario no exista (ver HASH_DE_RELLENO)
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

  // si el mail no existe no avisamos nada distinto: evita que alguien
  // pueda usar este endpoint para averiguar que mails estan registrados.
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

  const passwordhash = await bcrypt.hash(password, COSTO_BCRYPT);

  await prisma.$transaction([
    // contraseña nueva: se cierran todas las sesiones abiertas
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordhash, tokenVersion: { increment: 1 } },
    }),
    // este link y cualquier otro pedido anterior del mismo usuario quedan usados
    prisma.passwordResetToken.updateMany({
      where: { userId: resetToken.userId, usado: false },
      data: { usado: true },
    }),
  ]);
}

module.exports = { register, login, me, actualizarMe, forgotPassword, resetPassword, huella };
