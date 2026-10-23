// Como se cuentan los productos de una categoria: "1 título / 4 títulos",
// "1 equipo / 3 equipos"... Cada categoria puede tener su unidad (panel >
// Categorias); si no tiene, va la de siempre.

export const UNIDAD_POR_DEFECTO = { singular: 'título', plural: 'títulos' };

export function unidadDe(categoria) {
  const singular = categoria?.unidad_singular?.trim();
  const plural = categoria?.unidad_plural?.trim();
  return singular && plural ? { singular, plural } : UNIDAD_POR_DEFECTO;
}

/** "4 equipos", "1 equipo". Sin numero, texto vacio. */
export function cantidadCon(n, categoria) {
  if (n === null || n === undefined) return '';
  const { singular, plural } = unidadDe(categoria);
  return `${n} ${n === 1 ? singular : plural}`;
}

// sugerencia del plural mientras se escribe el singular en el panel:
// vocal -> +s (título, títulos); consonante -> +es (par, pares; unidad,
// unidades); z -> ces (luz, luces). Se puede corregir a mano.
export function pluralSugerido(singular) {
  const s = String(singular ?? '').trim();
  if (!s) return '';
  if (/[aeiouáéíóú]$/i.test(s)) return `${s}s`;
  if (/z$/i.test(s)) return `${s.slice(0, -1)}ces`;
  if (/s$/i.test(s)) return s;
  return `${s}es`;
}
