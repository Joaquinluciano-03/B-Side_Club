// logica de negocio de promociones/novedades

const { prisma } = require('../config/db');
const { subirImagen, borrarImagen } = require('../config/storage');

// Mismo criterio que productos: el visitante solo ve las promociones activas.
// El panel (con token) puede pedir todas, o filtrar con soloActivas.
async function listar({ soloActivas } = {}, { esAdmin = false } = {}) {
  const where = {};
  if (esAdmin) {
    if (soloActivas === 'true') where.activa = true;
  } else {
    where.activa = true;
  }

  return prisma.promocion.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function obtenerPorId(id, { soloActivas = false } = {}) {
  const promocion = await prisma.promocion.findUnique({ where: { id: Number(id) } });
  if (!promocion || (soloActivas && !promocion.activa)) {
    const error = new Error('Promoción no encontrada');
    error.status = 404;
    throw error;
  }
  return promocion;
}

// La imagen de una promo solo se carga subiendo un archivo (subirImagenPromocion).
// Por el JSON se acepta dejar la que ya tenia o quitarla (null), nada mas: si
// se aceptara cualquier URL, alguien podia apuntar la promo a un archivo de
// otro producto y, al borrarla o cambiarle la imagen, borraria ese archivo
// del storage. Y de paso tampoco se pueden meter links externos en la home.
function imagenUrlPermitida(nueva, actual = null) {
  if (nueva === null || nueva === actual) return nueva;
  const error = new Error('La imagen de la promoción se carga subiendo un archivo.');
  error.status = 400;
  throw error;
}

async function crear(data) {
  return prisma.promocion.create({
    data: {
      titulo: data.titulo,
      descripcion: data.descripcion,
      imagenUrl: imagenUrlPermitida(data.imagenUrl ?? null),
      fechaInicio: data.fechaInicio ?? null,
      fechaFin: data.fechaFin ?? null,
      activa: data.activa !== undefined ? data.activa : true,
    },
  });
}

// Lista blanca, igual que en productos: antes se pasaba el body completo a
// Prisma y se podia mandar cualquier columna, incluido "id".
// (las fechas ya llegan como Date o null desde el controller)
const CAMPOS_EDITABLES = ['titulo', 'descripcion', 'activa', 'fechaInicio', 'fechaFin'];

async function actualizar(id, data) {
  const actual = await obtenerPorId(id);

  const dataActualizada = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (data[campo] !== undefined) dataActualizada[campo] = data[campo];
  }
  if (data.imagenUrl !== undefined) {
    dataActualizada.imagenUrl = imagenUrlPermitida(data.imagenUrl, actual.imagenUrl);
  }

  const actualizada = await prisma.promocion.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });

  // si le sacaron la imagen, el archivo tambien se va del storage
  if (dataActualizada.imagenUrl === null && actual.imagenUrl) {
    await borrarImagen(actual.imagenUrl);
  }
  return actualizada;
}

// Sube la imagen a Supabase Storage (mismo bucket que los productos) y la deja
// como imagenUrl de la promocion. Si ya tenia una nuestra, se borra despues:
// primero la nueva, asi si la subida falla la promo no queda sin imagen.
async function subirImagenPromocion(id, file) {
  const promocion = await obtenerPorId(id);
  const url = await subirImagen(file);

  const actualizada = await prisma.promocion.update({
    where: { id: Number(id) },
    data: { imagenUrl: url },
  });

  // borrarImagen ignora las URLs que no son de nuestro storage (una pegada a mano)
  await borrarImagen(promocion.imagenUrl);
  return actualizada;
}

async function eliminar(id) {
  const promocion = await obtenerPorId(id);
  await prisma.promocion.delete({ where: { id: Number(id) } });
  // la fila primero, igual que con las imagenes de productos
  await borrarImagen(promocion.imagenUrl);
}

module.exports = { listar, obtenerPorId, crear, actualizar, subirImagenPromocion, eliminar };