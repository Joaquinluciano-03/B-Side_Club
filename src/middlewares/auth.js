const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Valida el token y ademas lo contrasta con la base. Solo con la firma no
// alcanzaba: un usuario borrado, o al que le bajaron el rol, seguia entrando
// con su token viejo (y con el rol viejo) hasta que vencia, hasta 7 dias.
// Ahora:
//   - el usuario tiene que seguir existiendo
//   - la version del token tiene que ser la actual (cambiar la contraseña la
//     sube y deja afuera los tokens anteriores)
//   - el rol que vale es el de la base, no el que quedo escrito en el token
async function usuarioDelToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { sinToken: true };

  const token = authHeader.slice(7).trim();
  let datos;
  try {
    // algoritmo fijo: no se acepta un token firmado con otro distinto
    datos = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    return { invalido: true };
  }

  const id = Number(datos?.id);
  if (!Number.isInteger(id)) return { invalido: true };

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, rol: true, tokenVersion: true },
  });
  if (!user || (datos.v ?? 0) !== user.tokenVersion) return { invalido: true };

  return { user: { id: user.id, rol: user.rol } };
}

async function requireAuth(req, res, next) {
  try {
    const { sinToken, invalido, user } = await usuarioDelToken(req.headers.authorization);
    if (sinToken) return res.status(401).json({ error: 'Token no provisto' });
    if (invalido) return res.status(401).json({ error: 'Token inválido o expirado' });
    req.user = user; // { id, rol }
    next();
  } catch (err) {
    next(err);
  }
}

// no bloquea si no hay token: solo completa req.user si viene uno valido.
// se usa en rutas publicas donde el comportamiento cambia segun si quien pide esta logueado (ej. catalogo).
async function authOpcional(req, res, next) {
  try {
    const { user } = await usuarioDelToken(req.headers.authorization);
    // token invalido o vencido: seguimos como visitante anonimo, no como error
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, authOpcional };
