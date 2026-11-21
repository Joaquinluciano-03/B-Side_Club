// las imágenes viven en Supabase Storage; en la base solo va la URL pública

const { prisma } = require('../config/db');
const { subirImagen, borrarImagen } = require('../config/storage');

async function agregar(productoId, files) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  // el orden sigue después de las imágenes que ya tiene, para no pisar la portada
  const ultima = await prisma.imagen.findFirst({
    where: { productoId: Number(productoId) },
    orderBy: { orden: 'desc' },
  });
  const ordenInicial = ultima ? ultima.orden + 1 : 0;

  // primero se suben todos los archivos y después se escribe en la base: si una subida falla no queda ninguna fila rota
  const urls = [];
  try {
    for (const file of files) {
      urls.push(await subirImagen(file));
    }
  } catch (err) {
    // se borra lo que sí llegó a subir
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

  // primero la fila: mejor un archivo huérfano que una fila apuntando a un archivo que no existe
  await prisma.imagen.delete({ where: { id: Number(id) } });
  await borrarImagen(imagen.url);
}

module.exports = { agregar, eliminar, actualizarOrden };
