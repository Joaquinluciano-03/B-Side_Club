const { prisma } = require('../config/db');

// para comparar sin mayúsculas ni acentos
const comparable = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// cada género con cuántos productos lo usan (activos o no)
async function listar() {
  const generos = await prisma.genero.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: true } } },
  });
  return generos.map(({ _count, ...g }) => ({ ...g, productos: _count.productos }));
}

async function crear({ nombre: escrito }) {
  // primera letra en mayúscula
  const nombre = escrito.charAt(0).toLocaleUpperCase('es') + escrito.slice(1);
  // "rock nacional" y "Rock nacional" serían el mismo género
  const existentes = await prisma.genero.findMany({ select: { nombre: true } });
  const igual = existentes.find((g) => comparable(g.nombre) === comparable(nombre));
  if (igual) {
    const error = new Error(`Ya existe el género "${igual.nombre}".`);
    error.status = 409;
    throw error;
  }
  return prisma.genero.create({ data: { nombre } });
}

async function eliminar(id) {
  const genero = await prisma.genero.findUnique({
    where: { id },
    include: { _count: { select: { productos: true } } },
  });
  if (!genero) {
    const error = new Error('Género no encontrado');
    error.status = 404;
    throw error;
  }
  const enUso = genero._count.productos;
  if (enUso > 0) {
    const error = new Error(
      `"${genero.nombre}" lo ${enUso === 1 ? 'usa 1 producto' : `usan ${enUso} productos`}: cambiales el género antes de borrarlo.`
    );
    error.status = 409;
    throw error;
  }
  await prisma.genero.delete({ where: { id } });
}

module.exports = { listar, crear, eliminar };
