// logica de negocio de categorias

const { prisma } = require('../config/db');

async function listar() {
  return prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
}

async function obtenerPorId(id) {
  const categoria = await prisma.categoria.findUnique({ where: { id: Number(id) } });
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
}

async function crear({ nombre, descripcion }) {
  return prisma.categoria.create({ data: { nombre, descripcion } });
}

async function actualizar(id, { nombre, descripcion }) {
  await obtenerPorId(id);
  return prisma.categoria.update({
    where: { id: Number(id) },
    data: { nombre, descripcion },
  });
}

async function eliminar(id) {
  await obtenerPorId(id);

  const productosAsociados = await prisma.producto.count({ where: { categoriaId: Number(id) } });
  if (productosAsociados > 0) {
    const error = new Error('No se puede eliminar: hay productos usando esta categoría');
    error.status = 409;
    throw error;
  }

  await prisma.categoria.delete({ where: { id: Number(id) } });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };