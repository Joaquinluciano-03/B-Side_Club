// logica de negocio de gestion de staff (listar/editar/eliminar usuarios ya existentes).
// crear usuarios nuevos no pasa por aca: se hace via invitacion (invitacion.service.js).

const { prisma } = require('../config/db');

function datosPublicos(user) {
  return {
    id: user.id,
    nombre: user.nombre,
    apellido: user.apellido,
    mail: user.mail,
    telefono: user.telefono,
    rol: user.rol,
  };
}

async function listar() {
  const usuarios = await prisma.user.findMany({ orderBy: { nombre: 'asc' } });
  return usuarios.map(datosPublicos);
}

async function buscarOFallar(id) {
  const usuario = await prisma.user.findUnique({ where: { id: Number(id) } });
  if (!usuario) {
    const error = new Error('Usuario no encontrado');
    error.status = 404;
    throw error;
  }
  return usuario;
}

async function actualizar(id, { nombre, apellido, mail, telefono, rol }) {
  const target = await buscarOFallar(id);

  // al super_admin (el dueño del local) no lo puede tocar nadie desde este endpoint
  if (target.rol === 'super_admin') {
    const error = new Error('No se puede modificar al super_admin');
    error.status = 403;
    throw error;
  }

  // tampoco se puede usar esta via para fabricar un segundo super_admin
  if (rol === 'super_admin') {
    const error = new Error('No se puede asignar el rol super_admin');
    error.status = 403;
    throw error;
  }

  if (mail) {
    const mailEnUso = await prisma.user.findFirst({ where: { mail, NOT: { id: target.id } } });
    if (mailEnUso) {
      const error = new Error('Ese email ya esta en uso');
      error.status = 409;
      throw error;
    }
  }

  const usuario = await prisma.user.update({
    where: { id: target.id },
    data: { nombre, apellido, mail, telefono, rol },
  });

  return datosPublicos(usuario);
}

async function eliminar(id) {
  const target = await buscarOFallar(id);

  if (target.rol === 'super_admin') {
    const error = new Error('No se puede eliminar al super_admin');
    error.status = 403;
    throw error;
  }

  await prisma.user.delete({ where: { id: target.id } });
}

module.exports = { listar, actualizar, eliminar };
