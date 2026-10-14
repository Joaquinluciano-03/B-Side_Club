// logica de negocio de consultas

const { prisma } = require('../config/db');

const ESTADOS_VALIDOS = ['pendiente', 'leida', 'respondida'];

async function crear({ nombre, email, telefono, asunto, mensaje, productoId }) {
  if (productoId) {
    const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
    if (!producto) {
      const error = new Error('El producto indicado no existe');
      error.status = 400;
      throw error;
    }
  }

  return prisma.consulta.create({
    data: {
      nombre,
      email,
      telefono,
      asunto,
      mensaje,
      canal: 'formulario',
      estado: 'pendiente',
      productoId: productoId ? Number(productoId) : undefined,
    },
  });
}

async function listar({ estado } = {}) {
  const where = {};

  // el estado es un enum en la base: un valor cualquiera metido en el where
  // falla como error interno, asi que lo validamos antes y devolvemos 400
  if (estado) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      const error = new Error(`Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
      error.status = 400;
      throw error;
    }
    where.estado = estado;
  }

  return prisma.consulta.findMany({
    where,
    include: { producto: true },
    orderBy: { fecha: 'desc' },
  });
}

async function obtenerPorId(id) {
  const consulta = await prisma.consulta.findUnique({ where: { id: Number(id) } });
  if (!consulta) {
    const error = new Error('Consulta no encontrada');
    error.status = 404;
    throw error;
  }
  return consulta;
}

async function cambiarEstado(id, estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    const error = new Error(`Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
    error.status = 400;
    throw error;
  }

  await obtenerPorId(id);

  return prisma.consulta.update({
    where: { id: Number(id) },
    data: { estado },
  });
}

async function eliminar(id) {
  await obtenerPorId(id);
  await prisma.consulta.delete({ where: { id: Number(id) } });
}

module.exports = { crear, listar, obtenerPorId, cambiarEstado, eliminar };