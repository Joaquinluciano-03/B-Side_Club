// logica de negocio de categorias

const { prisma } = require('../config/db');

// Cada categoria viene con "total": cuantos productos publicados tiene. El
// sitio lo muestra en el hero, en la home y en los separadores del catalogo;
// antes lo averiguaba con un pedido aparte por categoria, despues de recibir
// esta lista (una cadena de pedidos que demoraba la carga).
async function listar() {
  const categorias = await prisma.categoria.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: { where: { esActivo: true } } } } },
  });
  return categorias.map(({ _count, ...c }) => ({ ...c, total: _count.productos }));
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