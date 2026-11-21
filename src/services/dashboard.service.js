const { prisma } = require('../config/db');

async function obtenerMetricas() {
  const [
    consultasPendientes,
    consultasSinResponder,
    productosActivos,
    productosInactivos,
    productosSinStock,
    invitacionesPendientes,
    totalUsuarios,
  ] = await Promise.all([
    // pendientes = sin leer (aviso del menú); sin responder = pendientes + leídas
    prisma.consulta.count({ where: { estado: 'pendiente' } }),
    prisma.consulta.count({ where: { estado: { in: ['pendiente', 'leida'] } } }),
    prisma.producto.count({ where: { esActivo: true } }),
    prisma.producto.count({ where: { esActivo: false } }),
    prisma.producto.count({ where: { esActivo: true, stock: 0 } }),
    prisma.invitacion.count({ where: { estado: 'pendiente' } }),
    prisma.user.count(),
  ]);

  return {
    consultasPendientes,
    consultasSinResponder,
    productosActivos,
    productosInactivos,
    productosSinStock,
    invitacionesPendientes,
    totalUsuarios,
  };
}

module.exports = { obtenerMetricas };