// traduce http a logica de negocio

const productoService = require('../services/producto.service');
const v = require('../utils/validar');

const ESTADOS_STOCK = ['disponible', 'ultima_unidad', 'reservado', 'a_consultar', 'vendido'];
const TIPOS_DESCUENTO = ['porcentaje', 'monto'];
const SI_NO = ['true', 'false'];
// como se puede ordenar el catalogo (ver ORDENES en producto.service)
const ORDENES = ['recientes', 'precio-asc', 'precio-desc', 'nombre'];
const ANIO_MAX = () => new Date().getFullYear() + 1;

// Valida cada campo que vino. Con parcial (edicion) los que no vienen quedan
// en undefined y no se tocan; al crear, los obligatorios tienen que estar.
function datosDelProducto(b, { parcial = false } = {}) {
  const req = !parcial;
  const si = (campo, fn) => (parcial && b[campo] === undefined ? undefined : fn(b[campo]));

  const datos = {
    nombre: si('nombre', (x) => v.texto(x, 'nombre', { requerido: true, max: 160 })),
    anio: si('anio', (x) => v.entero(x, 'anio', { requerido: true, min: 1800, max: ANIO_MAX() })),
    // vacio o null = "a consultar"
    precio: si('precio', (x) => v.decimal(x, 'precio', { min: 0, max: 1e9 })),
    descuento_tipo: si('descuento_tipo', (x) => v.opcion(x, 'descuento_tipo', TIPOS_DESCUENTO)),
    descuento_valor: si('descuento_valor', (x) => v.decimal(x, 'descuento_valor', { min: 0, max: 1e9 })),
    stock: si('stock', (x) => v.entero(x, 'stock', { requerido: true, min: 0, max: 100000 })),
    estado_stock: si('estado_stock', (x) => v.opcion(x, 'estado_stock', ESTADOS_STOCK, { requerido: parcial })),
    condicion: si('condicion', (x) => v.texto(x, 'condicion', { max: 60 })),
    // de la lista de generos; vacio o null = sin genero
    generoId: si('generoId', (x) => v.entero(x, 'generoId', { min: 1, max: 2147483647 })),
    destacado: v.booleano(b.destacado, 'destacado'),
    esActivo: v.booleano(b.esActivo, 'esActivo'),
    descripcion: si('descripcion', (x) => v.texto(x, 'descripcion', { requerido: true, max: 4000, multilinea: true })),
    categoriaId: si('categoriaId', (x) => v.entero(x, 'categoriaId', { requerido: true, min: 1, max: 2147483647 })),
  };

  // al crear, lo que no vino se completa con el valor por defecto del servicio
  if (req) {
    if (datos.estado_stock === null) datos.estado_stock = undefined;
    if (datos.precio === null) datos.precio = undefined;
  }
  return datos;
}

// donde se esta mirando: categoria, ofertas, busqueda (y activos, en el panel)
function filtrosBase(q) {
  return {
    categoriaId: v.entero(q.categoriaId, 'categoriaId', { min: 1, max: 2147483647 }) ?? undefined,
    destacado: v.opcion(q.destacado, 'destacado', SI_NO) ?? undefined,
    conDescuento: v.opcion(q.conDescuento, 'conDescuento', SI_NO) ?? undefined,
    esActivo: v.opcion(q.esActivo, 'esActivo', SI_NO) ?? undefined,
    q: v.texto(q.q, 'q', { max: 100 }) ?? undefined,
  };
}

// los filtros del catalogo: genero, estado, disponibilidad, decada y precio
function filtrosCatalogo(q) {
  const decada = (x) => {
    const n = v.entero(x, 'decada', { min: 1900, max: 2100 });
    if (n !== null && n % 10 !== 0) throw v.error400('La década se indica con su primer año (1970, 1980...).');
    return n;
  };
  const precioMin = v.decimal(q.precioMin, 'precioMin', { min: 0, max: 1e9 }) ?? undefined;
  const precioMax = v.decimal(q.precioMax, 'precioMax', { min: 0, max: 1e9 }) ?? undefined;
  if (precioMin !== undefined && precioMax !== undefined && precioMin > precioMax) {
    throw v.error400('El precio mínimo no puede ser mayor que el máximo.');
  }
  return {
    generos: v.lista(q.genero, 'genero', (x) => v.texto(x, 'genero', { max: 40 })),
    condiciones: v.lista(q.condicion, 'condicion', (x) => v.texto(x, 'condicion', { max: 60 })),
    disponibilidad: v.lista(q.disponibilidad, 'disponibilidad', (x) => v.opcion(x, 'disponibilidad', ESTADOS_STOCK)),
    decadas: v.lista(q.decada, 'decada', decada),
    precioMin,
    precioMax,
  };
}

async function listar(req, res, next) {
  try {
    const q = req.query;
    const filtros = {
      ...filtrosBase(q),
      ...filtrosCatalogo(q),
      page: v.entero(q.page, 'page', { min: 1, max: 10000 }) ?? undefined,
      pageSize: v.entero(q.pageSize, 'pageSize', { min: 1, max: 60 }) ?? undefined,
      orden: v.opcion(q.orden, 'orden', ORDENES) ?? undefined,
    };
    const resultado = await productoService.listar(filtros, { esAdmin: Boolean(req.user) });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

// GET /productos/filtros: que filtros ofrecer para lo que se esta mirando
async function filtros(req, res, next) {
  try {
    const resultado = await productoService.filtrosDisponibles(filtrosBase(req.query), { esAdmin: Boolean(req.user) });
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}

async function obtener(req, res, next) {
  try {
    // mismo criterio que listar: sin token sos visitante y solo ves activos
    const producto = await productoService.obtenerPorId(v.id(req.params.id), {
      soloActivos: !req.user,
    });
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function crear(req, res, next) {
  try {
    const producto = await productoService.crear(datosDelProducto(req.body));
    res.status(201).json(producto);
  } catch (err) {
    next(err);
  }
}

async function actualizar(req, res, next) {
  try {
    const producto = await productoService.actualizar(
      v.id(req.params.id),
      datosDelProducto(req.body, { parcial: true })
    );
    res.json(producto);
  } catch (err) {
    next(err);
  }
}

async function eliminar(req, res, next) {
  try {
    await productoService.eliminar(v.id(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, filtros, obtener, crear, actualizar, eliminar };
