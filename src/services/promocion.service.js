const { prisma } = require('../config/db');
const { subirImagen, borrarImagen } = require('../config/storage');

// el visitante solo ve las activas; el panel puede pedir todas o filtrar con soloActivas
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

// la imagen solo se carga subiendo un archivo; por JSON se puede dejar la que tenía o quitarla (null).
// Si se aceptara cualquier URL, borrar la promo podría borrar el archivo de otro producto
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

// lista blanca, igual que en productos
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

  // si le sacan la imagen, el archivo también se borra del storage
  if (dataActualizada.imagenUrl === null && actual.imagenUrl) {
    await borrarImagen(actual.imagenUrl);
  }
  return actualizada;
}

// sube la imagen y la deja como imagenUrl. La anterior se borra después, así si falla la subida no queda sin imagen
async function subirImagenPromocion(id, file) {
  const promocion = await obtenerPorId(id);
  const url = await subirImagen(file);

  const actualizada = await prisma.promocion.update({
    where: { id: Number(id) },
    data: { imagenUrl: url },
  });

  // borrarImagen ignora las URLs que no son del storage
  await borrarImagen(promocion.imagenUrl);
  return actualizada;
}

async function eliminar(id) {
  const promocion = await obtenerPorId(id);
  await prisma.promocion.delete({ where: { id: Number(id) } });
  // la fila primero, como con las imágenes de productos
  await borrarImagen(promocion.imagenUrl);
}

module.exports = { listar, obtenerPorId, crear, actualizar, subirImagenPromocion, eliminar };