// el horario es un Json con dos formas: arreglo [{ label, value }] (la actual) y objeto { martes: '...' } (la vieja).
// Todo lo que lo lea pasa por acá y recibe siempre el arreglo

export function normalizarHorario(horario) {
  if (!horario || typeof horario !== 'object') return [];

  if (Array.isArray(horario)) {
    return horario
      .filter((fila) => fila && typeof fila === 'object')
      .map((fila) => ({ label: String(fila.label ?? '').trim(), value: String(fila.value ?? '').trim() }))
      .filter((fila) => fila.label && fila.value);
  }

  return Object.entries(horario)
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([label, value]) => ({ label: capitalizar(label.trim()), value: value.trim() }));
}

// abreviaturas sin tildes, en el orden de Date.getDay() (0 = domingo)
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

function diaDe(texto) {
  const limpio = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  return DIAS.indexOf(limpio.slice(0, 3));
}

// "hoy" y "ahora" son los de Buenos Aires, esté donde esté el visitante
const ZONA_DEL_LOCAL = 'America/Argentina/Buenos_Aires';
const DIAS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Dia de la semana (0 = domingo) y minutos desde la medianoche, en el local. */
export function ahoraEnElLocal(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_DEL_LOCAL,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(fecha);
  const parte = (tipo) => partes.find((p) => p.type === tipo)?.value;
  return { dia: DIAS_EN.indexOf(parte('weekday')), minutos: Number(parte('hour')) * 60 + Number(parte('minute')) };
}

/** La fila del horario de hoy (o de la fecha dada), o null. Entiende "Martes", "Sábados" y rangos ("Miér a Vie"). */
export function horarioDeHoy(horario, fecha) {
  return filaDelDia(horario, fecha ? fecha.getDay() : ahoraEnElLocal().dia);
}

function filaDelDia(horario, hoy) {
  for (const fila of normalizarHorario(horario)) {
    const partes = fila.label.split(/\s+a\s+/i);
    if (partes.length === 2) {
      const desde = diaDe(partes[0]);
      const hasta = diaDe(partes[1]);
      if (desde === -1 || hasta === -1) continue;
      // el rango puede cruzar el domingo ("Vie a Lun")
      const adentro = desde <= hasta ? hoy >= desde && hoy <= hasta : hoy >= desde || hoy <= hasta;
      if (adentro) return fila;
    } else if (diaDe(fila.label) === hoy) {
      return fila;
    }
  }
  return null;
}

/**
 * Rangos de un horario en minutos desde la medianoche:
 *   "13 a 23 hs" -> [[780, 1380]]
 *   "10 a 13 y 16 a 20" -> [[600, 780], [960, 1200]]
 *   "20 a 2 hs" -> [[1200, 1560]] (pasa la medianoche)
 *   "Cerrado" -> []
 * Si no se entiende devuelve null.
 */
export function rangosDe(valor) {
  const texto = String(valor || '').toLowerCase();
  if (/cerrad/.test(texto)) return [];
  if (/24\s*h/.test(texto)) return [[0, 1440]];
  const rangos = [];
  const patron = /(\d{1,2})(?:[:.](\d{2}))?\s*(?:hs?\.?)?\s*(?:a|al|-|–)\s*(\d{1,2})(?:[:.](\d{2}))?/g;
  for (const m of texto.matchAll(patron)) {
    const desde = Number(m[1]) * 60 + Number(m[2] || 0);
    let hasta = Number(m[3]) * 60 + Number(m[4] || 0);
    if (desde > 1440 || hasta > 1440) continue;
    if (hasta <= desde) hasta += 1440;
    rangos.push([desde, hasta]);
  }
  return rangos.length ? rangos : null;
}

/** ¿Abierto ahora? { abierto } o null si no hay horario o no se entiende. Cuenta el horario de ayer que pasa la medianoche. */
export function estadoDelLocal(horario, fecha = new Date()) {
  if (normalizarHorario(horario).length === 0) return null;
  const { dia, minutos } = ahoraEnElLocal(fecha);
  const hoy = filaDelDia(horario, dia);
  const ayer = filaDelDia(horario, (dia + 6) % 7);
  // un día que no figura es un día cerrado
  const rangosHoy = hoy ? rangosDe(hoy.value) : [];
  const rangosAyer = ayer ? rangosDe(ayer.value) || [] : [];
  if (rangosHoy === null) return null;
  const sigueDeAyer = rangosAyer.some(([, hasta]) => hasta > 1440 && minutos < hasta - 1440);
  const abiertoHoy = rangosHoy.some(([desde, hasta]) => minutos >= desde && minutos < hasta);
  return { abierto: sigueDeAyer || abiertoHoy };
}

/** "Hoy 13 a 23 hs", o "Hoy no abrimos" si hoy esta cerrado. */
export function textoDeHoy(fila) {
  if (!fila) return '';
  return /cerrad/i.test(fila.value) ? 'Hoy no abrimos' : `Hoy ${fila.value}`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
