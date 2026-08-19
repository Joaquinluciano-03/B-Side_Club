// verifica que el usuario autenticado tenga uno de los roles permitidos
// se usa despues de requireAuth (necesita req.user ya seteado)

function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No tenés permisos para esta acción' });
    }

    next();
  };
}

module.exports = { requireRol };