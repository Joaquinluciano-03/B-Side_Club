// logica de negocio de generos musicales (la lista que usan los productos)

const { prisma } = require('../config/db');

// para comparar sin mayusculas ni acentos: "Electrónica" = "electronica"
const comparable = (texto) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// cada genero con cuantos productos lo usan (activos o no: un genero en uso
// por un producto dado de baja tampoco se puede borrar)
async function listar() {
  const generos = await prisma.genero.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { productos: true } } },
  });
  return generos.map(({ _count, ...g }) => ({ ...g, productos: _count.productos }));
}

async function crear({ nombre: escrito }) {
  // primera letra en mayuscula, como el resto de la lista ("cumbia" -> "Cumbia")
  const nombre = escrito.charAt(0).toLocaleUpperCase('es') + escrito.slice(1);
  // "rock nacional" no puede convivir con "Rock nacional": seria el mismo
  // genero escrito distinto, que es justo lo que la lista viene a evitar
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
