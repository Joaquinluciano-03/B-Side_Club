const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no provisto' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, rol }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// no bloquea si no hay token: solo completa req.user si viene uno valido.
// se usa en rutas publicas donde el comportamiento cambia segun si quien pide esta logueado (ej. catalogo).
function authOpcional(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // token invalido o vencido: seguimos como visitante anonimo, no como error
  }

  next();
}

module.exports = { requireAuth, authOpcional };