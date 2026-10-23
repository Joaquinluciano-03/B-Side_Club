// traduce http a logica de negocio

const categoriaService = require('../services/categoria.service');
const v = require('../utils/validar');

// los iconos que sabe dibujar el sitio: tiene que coincidir con la lista de
// frontend/src/componentes/IconoCategoria.jsx
const ICONOS = [
  'vinilo', 'simple', 'color', 'cd', 'cassette', 'vhs',
  'bandeja', 'amplificador', 'perilla', 'parlante', 'auriculares', 'radio', 'microfono',
  'aguja', 'cepillo', 'funda', 'caja', 'libro', 'poster', 'remera', 'regalo', 'etiqueta',
];

// como se cuentan sus productos: "1 equipo" / "4 equipos". Van de a dos:
// las dos vacias = la unidad por defecto (título / títulos)
function unidades(b) {
  const singular = v.texto(b.unidad_singular, 'unidad_singular', { max: 30 });
  const plural = v.texto(b.unidad_plural, 'unidad_plural', { max: 30 });
  if (Boolean(singular) !== Boolean(plural)) {
    throw v.error400('Completá la unidad en singular y en plural (por ejemplo "equipo" y "equipos").');
  }
  return { unidad_singular: singular, unidad_plural: plural };
}

async function listar(req, res, next) {
  try {
    const categorias = await categoriaService.listar();
    res.json(categorias);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    const categoria = await categoriaService.obtenerPorId(v.id(req.params.id));
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const categoria = await categoriaService.crear({
      nombre: v.texto(req.body.nombre, 'nombre', { requerido: true, max: 60 }),
      descripcion: v.texto(req.body.descripcion, 'descripcion', { max: 300, multilinea: true }),
      icono: v.opcion(req.body.icono, 'icono', ICONOS),
      ...unidades(req.body),
    });
    res.status(201).json(categoria);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, descripcion, icono, unidad_singular, unidad_plural } = req.body;
    // los que no vienen quedan como estan (undefined); los que vienen se validan
    const categoria = await categoriaService.actualizar(v.id(req.params.id), {
      nombre: nombre === undefined ? undefined : v.texto(nombre, 'nombre', { requerido: true, max: 60 }),
      descripcion: descripcion === undefined ? undefined : v.texto(descripcion, 'descripcion', { max: 300, multilinea: true }),
      icono: icono === undefined ? undefined : v.opcion(icono, 'icono', ICONOS),
      ...(unidad_singular !== undefined || unidad_plural !== undefined ? unidades(req.body) : {}),
    });
    res.json(categoria);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await categoriaService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
