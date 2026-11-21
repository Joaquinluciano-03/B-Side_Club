const { prisma } = require('../config/db');

// cada categoría trae "total": cuántos productos publicados tiene
async function listar() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: { where: { esActivo: true } } } } },
  });
  return categorias.map(({ _count, ...c }) => ({ ...c, total: _count.productos }));
}

async function obtenerPorId(id) {
  const categoria = await prisma.categoria.findUnique({ where: { id } });
  if (!categoria) {
    const error = new Error('Categoría no encontrada');
    error.status = 404;
    throw error;
  }
  return categoria;
}

async function crear({ nombre, descripcion, icono, unidad_singular, unidad_plural }) {
  return prisma.categoria.create({ data: { nombre, descripcion, icono, unidad_singular, unidad_plural } });
}

async function actualizar(id, { nombre, descripcion, icono, unidad_singular, unidad_plural }) {
  await obtenerPorId(id);
  return prisma.categoria.update({
    where: { id },
    data: { nombre, descripcion, icono, unidad_singular, unidad_plural },
  });
}

async function eliminar(id) {
  await obtenerPorId(id);

  const productosAsociados = await prisma.producto.count({ where: { categoriaId: id } });
  if (productosAsociados > 0) {
    const error = new Error('No se puede eliminar: hay productos usando esta categoría');
    error.status = 409;
    throw error;
  }

  await prisma.categoria.delete({ where: { id } });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };