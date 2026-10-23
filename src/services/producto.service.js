// logica de negocio de productos

const { prisma } = require('../config/db');
const { borrarImagen } = require('../config/storage');

const PAGE_SIZE_DEFAULT = 12;
const PAGE_SIZE_MAX = 60;

// convierte a numero validando: sin esto un "abc" se vuelve NaN, llega a
// Prisma y revienta como 500 en vez de avisar que el dato vino mal.
function aNumero(valor, campo) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) {
    const error = new Error(`El campo "${campo}" tiene que ser un numero`);
    error.status = 400;
    throw error;
  }
  return numero;
}

function errorDescuento(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  return error;
}

// Valida el descuento contra el precio y devuelve los dos campos listos para
// guardar. Sin tipo (null, undefined o "") = sin descuento. Reglas:
// - hace falta un precio: un producto "a consultar" no tiene a que descontarle
// - porcentaje: mas de 0 y menos de 100
// - monto: mas de 0 y menos que el precio (el precio final no puede ser 0)
function normalizarDescuento(tipo, valor, precio) {
  if (tipo === null || tipo === undefined || tipo === '') {
    return { descuento_tipo: null, descuento_valor: null };
  }
  if (tipo !== 'porcentaje' && tipo !== 'monto') {
    throw errorDescuento('El tipo de descuento tiene que ser "porcentaje" o "monto"');
  }
  if (precio === null || precio === undefined || precio === '') {
    throw errorDescuento('Para aplicar un descuento el producto tiene que tener precio');
  }
  const numero = aNumero(valor, 'descuento_valor');
  const precioNumero = Number(precio);
  if (numero <= 0) throw errorDescuento('El descuento tiene que ser mayor a 0');
  if (tipo === 'porcentaje' && numero >= 100) {
    throw errorDescuento('El porcentaje de descuento tiene que ser menor a 100');
  }
  if (tipo === 'monto' && numero >= precioNumero) {
    throw errorDescuento('El descuento no puede ser igual o mayor que el precio');
  }
  return { descuento_tipo: tipo, descuento_valor: numero };
}

// El precio con el descuento aplicado, igual que lo muestra el sitio
// (frontend/src/lib/formato.js, calcularDescuento): se guarda en precio_final
// para poder filtrar el catalogo por el precio que ve la gente.
function precioFinal(precio, tipo, valor) {
  if (precio === null || precio === undefined || precio === '') return null;
  const p = Number(precio);
  const v = Number(valor);
  if (!tipo || !Number.isFinite(v) || v <= 0) return p;
  if (tipo === 'porcentaje' && v < 100) return Math.round(p * (1 - v / 100));
  if (tipo === 'monto' && v < p) return Math.round(p - v);
  return p;
}

// el genero tiene que ser uno de la lista (tabla Genero)
async function validarGenero(generoId) {
  if (generoId === null || generoId === undefined) return;
  const genero = await prisma.genero.findUnique({ where: { id: generoId } });
  if (!genero) {
    const error = new Error('El género indicado no existe');
    error.status = 400;
    throw error;
  }
}

async function validarCategoria(categoriaId) {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) {
    const error = new Error('La categoría indicada no existe');
    error.status = 400;
    throw error;
  }
}

// lo que filtra "donde se esta mirando": categoria, ofertas, busqueda y, para
// el publico, solo los activos. Lo comparten el listado y los filtros.
function filtroBase({ categoriaId, destacado, conDescuento, q, esActivo } = {}, { esAdmin = false } = {}) {
  const where = { AND: [] };
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (destacado !== undefined) where.destacado = destacado === 'true';
  // conDescuento=true: solo los que tienen un descuento cargado (las ofertas)
  if (conDescuento === 'true') where.descuento_tipo = { not: null };
  if (q) {
    where.AND.push({
      OR: [
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
        { genero: { nombre: { contains: q, mode: 'insensitive' } } },
      ],
    });
  }

  // el publico solo ve productos activos, sin excepcion; el panel admin puede
  // pedir activos, inactivos, o todos segun el filtro que elija
  if (esAdmin) {
    if (esActivo !== undefined) where.esActivo = esActivo === 'true';
  } else {
    where.esActivo = true;
  }
  return where;
}

// los filtros del catalogo (todos opcionales; dentro de cada uno, cualquiera
// de los valores elegidos; entre filtros distintos, todos a la vez)
function aplicarFiltros(where, { generos, condiciones, disponibilidad, precioMin, precioMax, decadas } = {}) {
  // los generos llegan por nombre (asi quedan legibles en la URL)
  if (generos?.length) where.genero = { nombre: { in: generos } };
  if (condiciones?.length) where.condicion = { in: condiciones };
  if (disponibilidad?.length) where.estado_stock = { in: disponibilidad };
  if (precioMin !== undefined || precioMax !== undefined) {
    // con rango de precio, los "a consultar" (sin precio) quedan afuera
    where.precio_final = {
      not: null,
      ...(precioMin !== undefined && { gte: precioMin }),
      ...(precioMax !== undefined && { lte: precioMax }),
    };
  }
  if (decadas?.length) {
    where.AND.push({ OR: decadas.map((d) => ({ anio: { gte: d, lte: d + 9 } })) });
  }
  return where;
}

async function listar(filtros = {}, opciones = {}) {
  const { page, pageSize } = filtros;
  const where = aplicarFiltros(filtroBase(filtros, opciones), filtros);

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSizeNum = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(pageSize) || PAGE_SIZE_DEFAULT));

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true, genero: true, imagenes: { orderBy: { orden: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * pageSizeNum,
      take: pageSizeNum,
    }),
    prisma.producto.count({ where }),
  ]);

  return {
    productos,
    page: pageNum,
    pageSize: pageSizeNum,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSizeNum)),
  };
}

// Que filtros tienen sentido para lo que se esta mirando (categoria, ofertas,
// busqueda), con cuantos productos tiene cada opcion. El catalogo muestra
// solo los que tienen mas de una opcion: en Equipos no aparece "genero"
// porque ningun equipo tiene. No dependen de los filtros ya elegidos, asi
// las opciones no desaparecen mientras se eligen.
async function filtrosDisponibles(base = {}, opciones = {}) {
  const where = filtroBase(base, opciones);
  // opcional: los productos sin ese dato (un equipo no tiene genero) no cuentan
  const contar = async (campo, { opcional = true } = {}) => {
    const filas = await prisma.producto.groupBy({
      by: [campo],
      where: opcional ? { ...where, [campo]: { not: null } } : where,
      _count: { _all: true },
    });
    return filas
      .map((f) => ({ valor: f[campo], total: f._count._all }))
      .sort((a, b) => b.total - a.total || String(a.valor).localeCompare(String(b.valor), 'es'));
  };

  const [porGenero, condiciones, disponibilidad, anios, precios, listaGeneros] = await Promise.all([
    contar('generoId'),
    contar('condicion'),
    contar('estado_stock', { opcional: false }),
    prisma.producto.groupBy({ by: ['anio'], where, _count: { _all: true } }),
    prisma.producto.aggregate({ where: { ...where, precio_final: { not: null } }, _min: { precio_final: true }, _max: { precio_final: true } }),
    prisma.genero.findMany({ select: { id: true, nombre: true } }),
  ]);
  // el filtro trabaja con nombres (son los que van en la URL)
  const nombreDe = new Map(listaGeneros.map((g) => [g.id, g.nombre]));
  const generos = porGenero
    .map((g) => ({ valor: nombreDe.get(g.valor), total: g.total }))
    .filter((g) => g.valor);

  const porDecada = {};
  for (const f of anios) {
    const d = Math.floor(f.anio / 10) * 10;
    porDecada[d] = (porDecada[d] || 0) + f._count._all;
  }

  return {
    generos,
    condiciones,
    disponibilidad,
    decadas: Object.entries(porDecada)
      .map(([d, total]) => ({ valor: Number(d), total }))
      .sort((a, b) => a.valor - b.valor),
    precio: {
      min: precios._min.precio_final === null ? null : Number(precios._min.precio_final),
      max: precios._max.precio_final === null ? null : Number(precios._max.precio_final),
    },
  };
}

// soloActivos=true es la vista publica: un producto dado de baja tiene que
// responder 404 igual que uno inexistente, para no delatar que existe.
// Los llamados internos (actualizar/eliminar) lo dejan en false: el panel
// necesita poder tocar productos inactivos.
async function obtenerPorId(id, { soloActivos = false } = {}) {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { categoria: true, genero: true, imagenes: { orderBy: { orden: 'asc' } } },
  });
  if (!producto || (soloActivos && !producto.esActivo)) {
    const error = new Error('Producto no encontrado');
    error.status = 404;
    throw error;
  }
  return producto;
}

async function crear(data) {
  const categoriaId = aNumero(data.categoriaId, 'categoriaId');
  await validarCategoria(categoriaId);
  await validarGenero(data.generoId);
  const precio = data.precio !== undefined ? data.precio : null;

  const descuento = normalizarDescuento(data.descuento_tipo, data.descuento_valor, precio);
  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      anio: aNumero(data.anio, 'anio'),
      precio,
      ...descuento,
      precio_final: precioFinal(precio, descuento.descuento_tipo, descuento.descuento_valor),
      stock: aNumero(data.stock, 'stock'),
      estado_stock: data.estado_stock || 'disponible',
      condicion: data.condicion,
      generoId: data.generoId ?? null,
      destacado: data.destacado || false,
      descripcion: data.descripcion,
      categoriaId,
    },
  });
}

// Campos que el cliente puede editar. Es una lista blanca a proposito: antes
// se hacia { ...req.body } y se podia mandar cualquier columna de la tabla
// (por ejemplo "id", que reasignaba la clave primaria del producto).
const CAMPOS_EDITABLES = [
  'nombre',
  'precio',
  'estado_stock',
  'condicion',
  'generoId',
  'destacado',
  'esActivo',
  'descripcion',
];

const CAMPOS_EDITABLES_NUMERICOS = ['anio', 'stock', 'categoriaId'];

async function actualizar(id, data) {
  const actual = await obtenerPorId(id);

  const dataActualizada = {};

  for (const campo of CAMPOS_EDITABLES) {
    if (data[campo] !== undefined) dataActualizada[campo] = data[campo];
  }

  for (const campo of CAMPOS_EDITABLES_NUMERICOS) {
    if (data[campo] !== undefined) dataActualizada[campo] = aNumero(data[campo], campo);
  }

  // el descuento se valida contra el precio que va a quedar: si cambia el
  // precio o el descuento, se revisan los dos juntos (lo que no viene en el
  // pedido se toma de lo que ya esta guardado)
  const tocaDescuento = data.descuento_tipo !== undefined || data.descuento_valor !== undefined;
  if (tocaDescuento || data.precio !== undefined) {
    const precio = data.precio !== undefined ? data.precio : actual.precio;
    const tipo = data.descuento_tipo !== undefined ? data.descuento_tipo : actual.descuento_tipo;
    const valor = data.descuento_valor !== undefined ? data.descuento_valor : actual.descuento_valor;
    // pasar a "a consultar" saca el descuento solo (no hay precio que descontar)
    const sinPrecio = precio === null || precio === '';
    Object.assign(
      dataActualizada,
      sinPrecio && !tocaDescuento
        ? { descuento_tipo: null, descuento_valor: null }
        : normalizarDescuento(tipo, valor, precio)
    );
  }

  // si cambia de categoria avisamos con un 400 claro, en vez de dejar que
  // la foreign key falle contra la base y salga como error interno
  if (dataActualizada.generoId) await validarGenero(dataActualizada.generoId);

  if (dataActualizada.categoriaId !== undefined) {
    await validarCategoria(dataActualizada.categoriaId);
  }

  // el precio final se recalcula siempre con lo que va a quedar guardado
  const quedan = { ...actual, ...dataActualizada };
  dataActualizada.precio_final = precioFinal(quedan.precio, quedan.descuento_tipo, quedan.descuento_valor);

  return prisma.producto.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
}

async function eliminar(id) {
  const producto = await obtenerPorId(id);
  // las filas de imagenes se borran solas (onDelete: Cascade), pero los
  // archivos del storage no: si no los borramos quedan ocupando lugar
  await prisma.producto.delete({ where: { id: Number(id) } });
  // la fila primero, igual que con las promociones
  for (const imagen of producto.imagenes || []) {
    await borrarImagen(imagen.url);
  }
}

module.exports = { listar, filtrosDisponibles, obtenerPorId, crear, actualizar, eliminar, precioFinal };