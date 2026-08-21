// logica de negocio del dashboard: agrega metricas de distintas tablas

const { prisma } = require('../config/db');

async function obtenerMetricas() {
  const [
    consultasPendientes,
    productosActivos,
    productosSinStock,
    invitacionesPendientes,
    totalUsuarios,
  ] = await Promise.all([
    prisma.consulta.count({ where: { estado: 'pendiente' } }),
    prisma.producto.count({ where: { esActivo: true } }),
    prisma.producto.count({ where: { esActivo: true, stock: 0 } }),
    prisma.invitacion.count({ where: { estado: 'pendiente' } }),
    prisma.user.count(),
  ]);

  return {
    consultasPendientes,
    productosActivos,
    productosSinStock,
    invitacionesPendientes,
    totalUsuarios,
  };
}

module.exports = { obtenerMetricas };