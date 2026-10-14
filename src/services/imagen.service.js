// logica de negocio de imagenes de productos.
// Los archivos viven en Supabase Storage (ver src/config/storage.js); en la
// base solo guardamos la URL publica que devuelve.

const { prisma } = require('../config/db');
const { subirImagen, borrarImagen } = require('../config/storage');

async function agregar(productoId, files) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  // el orden sigue despues de las imagenes que ya tiene el producto, para no
  // pisar la portada existente (orden 0) con cada tanda nueva de subidas
  const ultima = await prisma.imagen.findFirst({
    where: { productoId: Number(productoId) },
    orderBy: { orden: 'desc' },
  });
  const ordenInicial = ultima ? ultima.orden + 1 : 0;

  // Primero subimos todos los archivos y despues escribimos en la base. Si
  // una subida falla cortamos acá y no queda ninguna fila apuntando a un
  // archivo que no existe.
  const urls = [];
  try {
    for (const file of files) {
      urls.push(await subirImagen(file));
    }
  } catch (err) {
    // limpiamos lo que si llego a subir, para no dejar archivos huerfanos
    await Promise.all(urls.map((u) => borrarImagen(u)));
    throw err;
  }

  return prisma.$transaction(
    urls.map((url, index) =>
      prisma.imagen.create({
        data: {
          url,
          alt: producto.nombre,
          orden: ordenInicial + index,
          productoId: Number(productoId),
        },
      })
    )
  );
}

async function actualizarOrden(id, orden) {
  const numero = Number(orden);
  if (!Number.isFinite(numero)) {
    const error = new Error('El campo "orden" tiene que ser un numero');
    error.status = 400;
    throw error;
  }

  const imagen = await prisma.imagen.findUnique({ where: { id: Number(id) } });
  if (!imagen) {
    const error = new Error('Imagen no encontrada');
    error.status = 404;
    throw error;
  }

  return prisma.imagen.update({
    where: { id: Number(id) },
    data: { orden: numero },
  });
}

async function eliminar(id) {
  const imagen = await prisma.imagen.findUnique({ where: { id: Number(id) } });
  if (!imagen) {
    const error = new Error('Imagen no encontrada');
    error.status = 404;
    throw error;
  }

  // la fila primero: si falla el borrado del archivo preferimos quedarnos con
  // un archivo huerfano (molesta poco) antes que con una fila apuntando a
  // algo que ya no existe (rompe la galeria del producto)
  await prisma.imagen.delete({ where: { id: Number(id) } });
  await borrarImagen(imagen.url);
}

module.exports = { agregar, eliminar, actualizarOrden };
