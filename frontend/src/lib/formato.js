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
