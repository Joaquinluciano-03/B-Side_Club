// traduce http a logica de negocio

const promocionService = require('../services/promocion.service');
const v = require('../utils/validar');

// Valida cada campo que vino. Con parcial (edicion) los que no vienen quedan
// en undefined y no se tocan.
function datosDeLaPromocion(b, { parcial = false } = {}) {
  const si = (campo, fn) => (parcial && b[campo] === undefined ? undefined : fn(b[campo]));
  const datos = {
    titulo: si('titulo', (x) => v.texto(x, 'titulo', { requerido: true, max: 120 })),
    descripcion: si('descripcion', (x) => v.texto(x, 'descripcion', { max: 1000, multilinea: true })),
    // el servicio solo acepta la que ya tenia o null (ver promocion.service)
    imagenUrl: si('imagenUrl', (x) => v.texto(x, 'imagenUrl', { max: 500 })),
    fechaInicio: si('fechaInicio', (x) => v.fecha(x, 'fechaInicio')),
    fechaFin: si('fechaFin', (x) => v.fecha(x, 'fechaFin')),
    activa: v.booleano(b.activa, 'activa'),
  };
  if (datos.fechaInicio && datos.fechaFin && datos.fechaFin < datos.fechaInicio) {
    throw v.error400('La fecha de fin es anterior a la de inicio.');
  }
  return datos;
}

async function listar(req, res, next) {
  try {
    const soloActivas = v.opcion(req.query.soloActivas, 'soloActivas', ['true', 'false']) ?? undefined;
    const promociones = await promocionService.listar(
      { soloActivas },
      { esAdmin: Boolean(req.user) }
    );
    res.json(promociones);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const promocion = await promocionService.obtenerPorId(v.id(req.params.id), {
      soloActivas: !req.user,
    });
    res.json(promocion);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const promocion = await promocionService.crear(datosDeLaPromocion(req.body));
    res.status(201).json(promocion);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const promocion = await promocionService.actualizar(
      v.id(req.params.id),
      datosDeLaPromocion(req.body, { parcial: true })
    );
    res.json(promocion);
  } catch (err) {
    next(err);
  }
}

async function subirImagen(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ninguna imagen' });
    }
    const promocion = await promocionService.subirImagenPromocion(v.id(req.params.id), req.file);
    res.json(promocion);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await promocionService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, subirImagen, eliminar };
