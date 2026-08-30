// traduce http a logica de negocio

const consultaService = require('../services/consulta.service');

const MAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function crear(req, res, next) {
  try {
    const { nombre, email, telefono, asunto, mensaje, productoId } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ error: 'Faltan campos requeridos (nombre, email, asunto, mensaje)' });
    }
    if (!MAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'El mail no tiene un formato válido' });
    }

    const consulta = await consultaService.crear({ nombre, email, telefono, asunto, mensaje, productoId });
    res.status(201).json(consulta);
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const { estado } = req.query;
    const consultas = await consultaService.listar({ estado });
    res.json(consultas);
  } catch (err) {
    next(err);
  }
}

const ESTADOS_VALIDOS = ['pendiente', 'leida', 'respondida'];

async function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Falta el campo estado' });
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({ error: `Estado inválido, debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` });
    }

    const consulta = await consultaService.cambiarEstado(req.params.id, estado);
    res.json(consulta);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await consultaService.eliminar(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, cambiarEstado, eliminar };