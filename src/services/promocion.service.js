// logica de negocio de promociones/novedades

const { prisma } = require('../config/db');

async function listar({ soloActivas } = {}) {
  const where = {};
  if (soloActivas === 'true') where.activa = true;

  return prisma.promocion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function obtenerPorId(id) {
  const promocion = await prisma.promocion.findUnique({ where: { id: Number(id) } });
  if (!promocion) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  return promocion;
}

async function crear(data) {
  return prisma.promocion.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      imagenUrl: data.imagenUrl,
      fechaInicio: data.fechaInicio ? new Date(data.fechaInicio) : null,
      fechaFin: data.fechaFin ? new Date(data.fechaFin) : null,
      activa: data.activa !== undefined ? data.activa : true,
    },
  });
}

async function actualizar(id, data) {
  await obtenerPorId(id);

  const dataActualizada = { ...data };
  if (data.fechaInicio !== undefined) dataActualizada.fechaInicio = data.fechaInicio ? new Date(data.fechaInicio) : null;
  if (data.fechaFin !== undefined) dataActualizada.fechaFin = data.fechaFin ? new Date(data.fechaFin) : null;

  return prisma.promocion.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
}

async function eliminar(id) {
  await obtenerPorId(id);
  await prisma.promocion.delete({ where: { id: Number(id) } });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };