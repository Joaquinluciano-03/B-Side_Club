// logica de negocio de productos

const { prisma } = require('../config/db');

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

async function validarCategoria(categoriaId) {
  const categoria = await prisma.categoria.findUnique({ where: { id: categoriaId } });
  if (!categoria) {
    const error = new Error('La categoría indicada no existe');
    error.status = 400;
    throw error;
  }
}

async function listar({ categoriaId, destacado, q, esActivo, page, pageSize } = {}, { esAdmin = false } = {}) {
  const where = {};
  if (categoriaId) where.categoriaId = Number(categoriaId);
  if (destacado !== undefined) where.destacado = destacado === 'true';
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
    ];
  }

  // el publico solo ve productos activos, sin excepcion; el panel admin puede
  // pedir activos, inactivos, o todos segun el filtro que elija
  if (esAdmin) {
    if (esActivo !== undefined) where.esActivo = esActivo === 'true';
  } else {
    where.esActivo = true;
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const pageSizeNum = Math.min(PAGE_SIZE_MAX, Math.max(1, Number(pageSize) || PAGE_SIZE_DEFAULT));

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true, imagenes: { orderBy: { orden: 'asc' } } },
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

// soloActivos=true es la vista publica: un producto dado de baja tiene que
// responder 404 igual que uno inexistente, para no delatar que existe.
// Los llamados internos (actualizar/eliminar) lo dejan en false: el panel
// necesita poder tocar productos inactivos.
async function obtenerPorId(id, { soloActivos = false } = {}) {
  const producto = await prisma.producto.findUnique({
    where: { id: Number(id) },
    include: { categoria: true, imagenes: { orderBy: { orden: 'asc' } } },
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

  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      anio: aNumero(data.anio, 'anio'),
      precio: data.precio !== undefined ? data.precio : null,
      stock: aNumero(data.stock, 'stock'),
      estado_stock: data.estado_stock || 'disponible',
      condicion: data.condicion,
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
  'destacado',
  'esActivo',
  'descripcion',
];

const CAMPOS_EDITABLES_NUMERICOS = ['anio', 'stock', 'categoriaId'];

async function actualizar(id, data) {
  await obtenerPorId(id);

  const dataActualizada = {};

  for (const campo of CAMPOS_EDITABLES) {
    if (data[campo] !== undefined) dataActualizada[campo] = data[campo];
  }

  for (const campo of CAMPOS_EDITABLES_NUMERICOS) {
    if (data[campo] !== undefined) dataActualizada[campo] = aNumero(data[campo], campo);
  }

  // si cambia de categoria avisamos con un 400 claro, en vez de dejar que
  // la foreign key falle contra la base y salga como error interno
  if (dataActualizada.categoriaId !== undefined) {
    await validarCategoria(dataActualizada.categoriaId);
  }

  return prisma.producto.update({
    where: { id: Number(id) },
    data: dataActualizada,
  });
}

async function eliminar(id) {
  await obtenerPorId(id);
  await prisma.producto.delete({ where: { id: Number(id) } });
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };