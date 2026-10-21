// El horario del local es un campo Json en la base, y convivieron dos formas:
//
//   arreglo (la que vale):  [{ label: 'Martes', value: '13 a 23 hs' }, ...]
//   objeto (forma vieja):   { martes: '13 a 23 hs', ... }
//
// El seed guarda el arreglo y el panel guardaba el objeto. Recorrer el arreglo
// con Object.entries() era lo que mostraba "0: [object Object]" en el footer.
// Todo el que lea el horario pasa por aca y recibe siempre el arreglo.

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

// Abreviaturas sin tildes, en el orden de Date.getDay() (0 = domingo)
const DIAS = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];

function diaDe(texto) {
  const limpio = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  return DIAS.indexOf(limpio.slice(0, 3));
}

/**
 * La fila del horario que corresponde a hoy, o null si no hay ninguna.
 * Entiende etiquetas sueltas ("Martes", "Sábados") y rangos ("Miér a Vie").
 */
export function horarioDeHoy(horario, fecha = new Date()) {
  const hoy = fecha.getDay();
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

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
