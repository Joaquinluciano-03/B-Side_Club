// logica de negocio de productos

const { prisma } = require('../config/db');

async function listar({ categoriaId, destacado } = {}) {
  const where = {};
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (destacado !== undefined) where.destacado = destacado === 'true';

  return prisma.producto.findMany({
    where,
    include: { categoria: true, imagenes: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function obtenerPorId(id) {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { categoria: true, imagenes: true },
  });
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return producto;
}

async function crear(data) {
  const categoria = await prisma.categoria.findUnique({ where: { id: Number(data.categoriaId) } });
  if (!categoria) {
    const error = new Error('La categoría indicada no existe');
    error.status = 400;
    throw error;
  }

  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      anio: Number(data.anio),
      precio: data.precio !== undefined ? data.precio : null,
      stock: Number(data.stock),
      estado_stock: data.estado_stock || 'disponible',
      condicion: data.condicion,
      destacado: data.destacado || false,
      descripcion: data.descripcion,
      categoriaId: Number(data.categoriaId),
    },
  });
}

async function actualizar(id, data) {
  await obtenerPorId(id);

  const dataActualizada = { ...data };
  if (data.anio !== undefined) dataActualizada.anio = Number(data.anio);
  if (data.stock !== undefined) dataActualizada.stock = Number(data.stock);
  if (data.categoriaId !== undefined) dataActualizada.categoriaId = Number(data.categoriaId);

  return prisma.producto.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
}

async function eliminar(id) {
  await obtenerPorId(id);
  await prisma.producto.delete({ where: { id: Number(id) } });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };