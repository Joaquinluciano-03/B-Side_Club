// traduce http a logica de negocio

const consultaService = require('../services/consulta.service');
const v = require('../utils/validar');

const ESTADOS_VALIDOS = ['pendiente', 'leida', 'respondida'];

async function crear(req, res, next) {
  try {
    // formulario publico: es lo primero que alguien de afuera puede escribir en la base
    const datos = {
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 80 }),
      email: v.email(req.body.email, 'email', { requerido: true }),
      telefono: v.telefono(req.body.telefono),
      asunto: v.texto(req.body.asunto, 'asunto', { requerido: true, max: 120 }),
      mensaje: v.texto(req.body.mensaje, 'mensaje', { requerido: true, max: 2000, multilinea: true }),
      productoId: v.entero(req.body.productoId, 'productoId', { min: 1, max: 2147483647 }),
    };

    await consultaService.crear(datos);
    // a quien escribe le alcanza con saber que llego: no se le devuelve el registro
    res.status(201).json({ mensaje: 'Consulta enviada' });
  } catch (err) {
    next(err);
  }
}

async function listar(req, res, next) {
  try {
    const estado = v.opcion(req.query.estado, 'estado', [...ESTADOS_VALIDOS, 'sin_responder']);
    const consultas = await consultaService.listar({ estado: estado ?? undefined });
    res.json(consultas);
  } catch (err) {
    next(err);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const estado = v.opcion(req.body.estado, 'estado', ESTADOS_VALIDOS, { requerido: true });
    const consulta = await consultaService.cambiarEstado(v.id(req.params.id), estado);
    res.json(consulta);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await consultaService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { crear, listar, cambiarEstado, eliminar };
