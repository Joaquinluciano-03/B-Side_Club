// logica de negocio de consultas

const { prisma } = require('../config/db');

const ESTADOS_VALIDOS = ['pendiente', 'leida', 'respondida'];
// "sin responder": las que todavia hay que contestar, se hayan leido o no
const SIN_RESPONDER = ['pendiente', 'leida'];

async function crear({ nombre, email, telefono, asunto, mensaje, productoId }) {
  if (productoId) {
    const producto = await prisma.producto.findUnique({ where: { id: productoId } });
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
      productoId: productoId ?? undefined,
    },
  });
}

async function listar({ estado } = {}) {
  const where = {};

  // el estado es un enum en la base: un valor cualquiera metido en el where
  // falla como error interno, asi que lo validamos antes y devolvemos 400
  if (estado === 'sin_responder') {
    where.estado = { in: SIN_RESPONDER };
  } else if (estado) {
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
  const consulta = await prisma.consulta.findUnique({ where: { id } });
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
    where: { id },
    data: { estado },
  });
}

async function eliminar(id) {
  await obtenerPorId(id);
  await prisma.consulta.delete({ where: { id } });
}

module.exports = { crear, listar, obtenerPorId, cambiarEstado, eliminar };