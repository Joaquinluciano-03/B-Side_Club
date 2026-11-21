const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

// Valida el token contra la base: el usuario tiene que existir, la versión del token tiene que ser la actual
// y el rol es el de la base, no el del token
async function usuarioDelToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return { sinToken: true };

  const token = authHeader.slice(7).trim();
  let datos;
  try {
    // algoritmo fijo
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

// no bloquea sin token: completa req.user si viene uno válido (rutas públicas como el catálogo)
async function authOpcional(req, res, next) {
  try {
    const { user } = await usuarioDelToken(req.headers.authorization);
    // token inválido o vencido: sigue como visitante
    if (user) req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, authOpcional };
