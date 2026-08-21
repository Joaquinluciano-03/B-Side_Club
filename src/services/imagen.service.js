// logica de negocio de imagenes de productos

const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/db');

const uploadsDir = path.join(__dirname, '../../uploads');

async function agregar(productoId, files) {
  const producto = await prisma.producto.findUnique({ where: { id: Number(productoId) } });
  if (!producto) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }

  const imagenesCreadas = await Promise.all(
    files.map((file, index) =>
      prisma.imagen.create({
        data: {
          url: `/uploads/${file.filename}`,
          alt: producto.nombre,
          orden: index,
          productoId: Number(productoId),
        },
      })
    )
  );

  return imagenesCreadas;
}

async function eliminar(id) {
  const imagen = await prisma.imagen.findUnique({ where: { id: Number(id) } });
  if (!imagen) {
    const error = new Error('Imagen no encontrada');
    error.status = 404;
    throw error;
  }

  // borramos el registro de la base
  await prisma.imagen.delete({ where: { id: Number(id) } });

  // borramos tambien el archivo fisico del disco
  const rutaArchivo = path.join(uploadsDir, path.basename(imagen.url));
  fs.unlink(rutaArchivo, (err) => {
    if (err) console.error('No se pudo borrar el archivo físico:', err.message);
  });
}

module.exports = { agregar, eliminar };