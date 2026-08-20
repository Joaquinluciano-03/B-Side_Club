// logica de negocio de la info del local (registro unico, id siempre 1)

const { prisma } = require('../config/db');

async function obtener() {
  const info = await prisma.storeInfo.findUnique({ where: { id: 1 } });
  if (!info) {
    const error = new Error('La información del local todavía no fue configurada');
    error.status = 404;
    throw error;
  }
  return info;
}

async function actualizar(data) {
  return prisma.storeInfo.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
}

module.exports = { obtener, actualizar };