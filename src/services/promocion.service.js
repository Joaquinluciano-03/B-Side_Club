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

// Lista blanca, igual que en productos: antes se pasaba el body completo a
// Prisma y se podia mandar cualquier columna, incluido "id".
const CAMPOS_EDITABLES = ['titulo', 'descripcion', 'imagenUrl', 'activa'];

async function actualizar(id, data) {
  await obtenerPorId(id);

  const dataActualizada = {};
  for (const campo of CAMPOS_EDITABLES) {
    if (data[campo] !== undefined) dataActualizada[campo] = data[campo];
  }

  // las fechas llegan como texto y van a la base como Date; vacio = sin fecha
  for (const campo of ['fechaInicio', 'fechaFin']) {
    if (data[campo] !== undefined) {
      dataActualizada[campo] = data[campo] ? new Date(data[campo]) : null;
    }
  }

  return prisma.promocion.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
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