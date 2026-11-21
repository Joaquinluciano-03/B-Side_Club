const { prisma } = require('../config/db');
const { borrarImagen } = require('../config/storage');

const PAGE_SIZE_DEFAULT = 12;
const PAGE_SIZE_MAX = 60;

// un "abc" daría NaN y un error 500: se valida antes
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

// Valida el descuento contra el precio. Sin tipo = sin descuento.
// - hace falta un precio
// - porcentaje: mayor a 0 y menor a 100
// - monto: mayor a 0 y menor al precio
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

// precio con descuento aplicado (igual que calcularDescuento en el frontend), se guarda en precio_final para filtrar
function precioFinal(precio, tipo, valor) {
  if (precio === null || precio === undefined || precio === '') return null;
  const p = Number(precio);
  const v = Number(valor);
  if (!tipo || !Number.isFinite(v) || v <= 0) return p;
  if (tipo === 'porcentaje' && v < 100) return Math.round(p * (1 - v / 100));
  if (tipo === 'monto' && v < p) return Math.round(p - v);
  return p;
}

// el género tiene que ser de la tabla Genero
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

// filtro de "dónde se está mirando", lo comparten el listado y los filtros
function filtroBase({ categoriaId, destacado, conDescuento, q, esActivo } = {}, { esAdmin = false } = {}) {
  const where = { AND: [] };
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (destacado !== undefined) where.destacado = destacado === 'true';
  // conDescuento: solo las ofertas
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

  // el público solo ve activos; el panel puede pedir activos, inactivos o todos
  if (esAdmin) {
    if (esActivo !== undefined) where.esActivo = esActivo === 'true';
  } else {
    where.esActivo = true;
  }
  return where;
}

// filtros del catálogo: dentro de cada uno vale cualquier valor elegido, entre filtros valen todos a la vez
function aplicarFiltros(where, { generos, condiciones, disponibilidad, precioMin, precioMax, decadas } = {}) {
  // los géneros llegan por nombre (legibles en la URL)
  if (generos?.length) where.genero = { nombre: { in: generos } };
  if (condiciones?.length) where.condicion = { in: condiciones };
  if (disponibilidad?.length) where.estado_stock = { in: disponibilidad };
  if (precioMin !== undefined || precioMax !== undefined) {
    // con rango de precio, los "a consultar" quedan afuera
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

// orden del catálogo: los "a consultar" van al final y el id desempata
const ORDENES = {
  recientes: [{ createdAt: 'desc' }, { id: 'desc' }],
  'precio-asc': [{ precio_final: { sort: 'asc', nulls: 'last' } }, { id: 'desc' }],
  'precio-desc': [{ precio_final: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
  nombre: [{ nombre: 'asc' }, { id: 'desc' }],
};

async function listar(filtros = {}, opciones = {}) {
  const { page, pageSize, orden } = filtros;
  const where = aplicarFiltros(filtroBase(filtros, opciones), filtros);

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSizeNum = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(pageSize) || PAGE_SIZE_DEFAULT));

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true, genero: true, imagenes: { orderBy: { orden: 'asc' } } },
      orderBy: ORDENES[orden] || ORDENES.recientes,
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

// filtros que tienen sentido para lo que se mira, con cuántos productos tiene cada opción.
// No dependen de los filtros ya elegidos, así las opciones no desaparecen
async function filtrosDisponibles(base = {}, opciones = {}) {
  const where = filtroBase(base, opciones);
  // los productos sin ese dato no cuentan
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
  // el filtro usa nombres (los de la URL)
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

// soloActivos=true es la vista pública: un producto dado de baja responde 404 como uno inexistente
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

// lista blanca de campos editables (si no, se podía mandar cualquier columna, ej. "id")
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

  // el descuento se valida contra el precio que va a quedar (lo que no viene se toma de lo guardado)
  const tocaDescuento = data.descuento_tipo !== undefined || data.descuento_valor !== undefined;
  if (tocaDescuento || data.precio !== undefined) {
    const precio = data.precio !== undefined ? data.precio : actual.precio;
    const tipo = data.descuento_tipo !== undefined ? data.descuento_tipo : actual.descuento_tipo;
    const valor = data.descuento_valor !== undefined ? data.descuento_valor : actual.descuento_valor;
    // pasar a "a consultar" saca el descuento
    const sinPrecio = precio === null || precio === '';
    Object.assign(
      dataActualizada,
      sinPrecio && !tocaDescuento
        ? { descuento_tipo: null, descuento_valor: null }
        : normalizarDescuento(tipo, valor, precio)
    );
  }

  // 400 claro si la categoría no existe, en vez de un error de foreign key
  if (dataActualizada.generoId) await validarGenero(dataActualizada.generoId);

  if (dataActualizada.categoriaId !== undefined) {
    await validarCategoria(dataActualizada.categoriaId);
  }

  // el precio final se recalcula siempre
  const quedan = { ...actual, ...dataActualizada };
  dataActualizada.precio_final = precioFinal(quedan.precio, quedan.descuento_tipo, quedan.descuento_valor);

  return prisma.producto.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
}

async function eliminar(id) {
  const producto = await obtenerPorId(id);
  // las filas de imágenes se borran solas (Cascade), los archivos del storage no
  await prisma.producto.delete({ where: { id: Number(id) } });
  // la fila primero, igual que con las promociones
  for (const imagen of producto.imagenes || []) {
    await borrarImagen(imagen.url);
  }
}

module.exports = { listar, filtrosDisponibles, obtenerPorId, crear, actualizar, eliminar, precioFinal };