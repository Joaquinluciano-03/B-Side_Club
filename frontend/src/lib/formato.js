// Formateo de datos que vienen del backend.

// OJO: "precio" es Decimal en Prisma, asi que llega como STRING en el JSON
// (no como number). Hay que pasarlo por Number antes de cualquier cuenta.
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

// Descuento de un producto (descuento_tipo + descuento_valor, ver el backend).
// Devuelve null si no tiene, o los numeros listos para mostrar:
//   final: el precio con el descuento, redondeado a pesos enteros
//   ahorro: cuanto se descuenta en pesos
//   etiqueta: lo que se lee en el badge ("-15%" o "-$ 20.000")
// Recibe tipo, valor y precio sueltos para poder usarlo tambien en el
// formulario del panel, antes de guardar.
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

// Producto no tiene campo "artista": por convencion el nombre se carga como
// "Titulo — Artista" (tambien vale con " - " o " – "). Lo separamos para
// mostrar dos lineas con jerarquia. Si no hay separador, todo es titulo.
// Se corta en el PRIMER separador con espacios alrededor, asi un titulo con
// guion pegado ("Lado-B") no se parte.
const SEPARADOR_NOMBRE = /\s+[—–-]\s+/;

export function separarNombre(nombre) {
  const texto = String(nombre ?? '').trim();
  const partes = texto.split(SEPARADOR_NOMBRE);
  if (partes.length < 2) return { titulo: texto, artista: null };
  const [titulo, ...resto] = partes;
  return { titulo: titulo.trim(), artista: resto.join(' - ').trim() || null };
}

// Escala Goldmine para vinilos, cassettes y CDs, de mejor a peor. La
// condicion es texto libre en la base ("Muy bueno (VG+)", "Casi nuevo (NM)"):
// si trae un codigo entre parentesis lo marcamos en la escala; si no
// ("Revisado en taller", "Coleccionista") no se muestra escala.
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
  // G+ no esta en la escala corta: cuenta como G. Ojo: solo el codigo "G+"
  // exacto (un replace suelto convertia "VG+" en "VG")
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

// Para INSTANTES (cuándo llegó una consulta, cuándo vence una invitación):
// convertir a hora local es lo correcto.
export function formatearFecha(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Para DÍAS DE CALENDARIO (la vigencia de una promoción): acá convertir a
// hora local está MAL. Se guardan como medianoche UTC del día elegido, así
// que en Argentina (UTC-3) ese instante cae el día anterior a las 21:00 y
// "1 de junio" se mostraría como "31 de mayo". Leemos los componentes en UTC,
// que son los que la persona eligió en el formulario.
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

// Mismo texto que usa el backend cuando no hay SMTP: sirve para explicarle al
// usuario por que no le llego el mail en desarrollo.
export function mensajeDeError(err) {
  return err?.message || 'Algo salió mal. Probá de nuevo.';
}
