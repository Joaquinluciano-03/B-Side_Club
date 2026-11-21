// formateo de datos del backend. OJO: "precio" llega como string (Decimal), hay que pasarlo por Number
export function formatearPrecio(precio) {
  if (precio === null || precio === undefined || precio === '') return 'A consultar';
  const n = Number(precio);
  if (!Number.isFinite(n)) return 'A consultar';
  return n.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
}

export function esAConsultar(precio) {
  return precio === null || precio === undefined || precio === '';
}

// descuento de un producto: null si no tiene, o { final, ahorro, etiqueta } ("-15%" o "-$ 20.000").
// Recibe tipo, valor y precio sueltos para usarlo también en el formulario
export function calcularDescuento(precio, tipo, valor) {
  if (esAConsultar(precio) || !tipo) return null;
  const p = Number(precio);
  const v = Number(valor);
  if (!Number.isFinite(p) || !Number.isFinite(v) || v <= 0) return null;
  if (tipo === 'porcentaje' && v >= 100) return null;
  if (tipo === 'monto' && v >= p) return null;

  const final = Math.round(tipo === 'porcentaje' ? p * (1 - v / 100) : p - v);
  const porcentaje = `${Number(v.toFixed(2)).toLocaleString('es-AR')}%`;
  return {
    final,
    ahorro: p - final,
    etiqueta: tipo === 'porcentaje' ? `-${porcentaje}` : `-${formatearPrecio(v)}`,
  };
}

export function descuentoDe(producto) {
  return calcularDescuento(producto?.precio, producto?.descuento_tipo, producto?.descuento_valor);
}

// el nombre se carga como "Título — Artista" (también " - " o " – "). Se corta en el primer separador con espacios, así "Lado-B" no se parte
const SEPARADOR_NOMBRE = /\s+[—–-]\s+/;

export function separarNombre(nombre) {
  const texto = String(nombre ?? '').trim();
  const partes = texto.split(SEPARADOR_NOMBRE);
  if (partes.length < 2) return { titulo: texto, artista: null };
  const [titulo, ...resto] = partes;
  return { titulo: titulo.trim(), artista: resto.join(' - ').trim() || null };
}

// escala Goldmine: si la condición trae un código entre paréntesis se marca en la escala; si no, no se muestra
export const ESCALA_GOLDMINE = [
  { codigo: 'M', nombre: 'Nuevo' },
  { codigo: 'NM', nombre: 'Casi nuevo' },
  { codigo: 'VG+', nombre: 'Muy bueno' },
  { codigo: 'VG', nombre: 'Bueno' },
  { codigo: 'G', nombre: 'Aceptable' },
];

export function gradoGoldmine(condicion) {
  const m = String(condicion ?? '').match(/\((M|NM|VG\+|VG|G\+?)\)/i);
  if (!m) return null;
  // G+ cuenta como G (solo el código exacto: un replace suelto convertía "VG+" en "VG")
  const leido = m[1].toUpperCase();
  const codigo = leido === 'G+' ? 'G' : leido;
  return ESCALA_GOLDMINE.some((g) => g.codigo === codigo) ? codigo : null;
}

const ETIQUETAS_STOCK = {
  disponible: 'Disponible',
  ultima_unidad: 'Última unidad',
  reservado: 'Reservado',
  a_consultar: 'A consultar',
  vendido: 'Vendido',
};

export function etiquetaStock(estado) {
  return ETIQUETAS_STOCK[estado] || estado;
}

export const ESTADOS_STOCK = Object.keys(ETIQUETAS_STOCK);

const ETIQUETAS_CONSULTA = {
  pendiente: 'Pendiente',
  leida: 'Leída',
  respondida: 'Respondida',
};

export function etiquetaConsulta(estado) {
  return ETIQUETAS_CONSULTA[estado] || estado;
}

export const ESTADOS_CONSULTA = Object.keys(ETIQUETAS_CONSULTA);

const ETIQUETAS_ROL = {
  super_admin: 'Dueño',
  administrador: 'Administrador',
  vendedor: 'Vendedor',
};

export function etiquetaRol(rol) {
  return ETIQUETAS_ROL[rol] || rol;
}

// para instantes (cuándo llegó una consulta): hora local
export function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// para días de calendario (vigencia de una promo): se guardan como medianoche UTC, así que en Argentina caerían el día anterior. Se leen en UTC
export function formatearDia(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatearFechaHora(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// mismo texto que el backend cuando no hay SMTP
export function mensajeDeError(err) {
  return err?.message || 'Algo salió mal. Probá de nuevo.';
}
