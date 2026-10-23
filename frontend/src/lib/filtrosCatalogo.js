// Los filtros del catalogo (ademas de categoria, busqueda y ofertas): genero,
// estado del ejemplar, disponibilidad, decada y rango de precio. Viven en la
// URL, asi un filtro se comparte con un link y el boton Atras lo deshace:
//   ?genero=Rock%20nacional,Tango&decada=1970&precioMax=100000
// Los de varios valores van separados por coma.

import { etiquetaStock, formatearPrecio } from './formato';

export const LISTAS = ['genero', 'condicion', 'disponibilidad', 'decada'];
const CLAVES = [...LISTAS, 'precioMin', 'precioMax'];

export const FILTROS_VACIOS = { genero: [], condicion: [], disponibilidad: [], decada: [], precioMin: '', precioMax: '' };

/** Los filtros que trae la URL. */
export function leerFiltros(params) {
  const valores = { ...FILTROS_VACIOS };
  for (const clave of LISTAS) {
    const crudo = params.get(clave);
    valores[clave] = crudo ? crudo.split(',').filter(Boolean) : [];
  }
  valores.precioMin = params.get('precioMin') || '';
  valores.precioMax = params.get('precioMax') || '';
  return valores;
}

/** Copia los filtros a unos URLSearchParams (y borra los que quedaron vacios). */
export function escribirFiltros(params, valores) {
  for (const clave of CLAVES) {
    const v = valores[clave];
    const texto = Array.isArray(v) ? v.join(',') : String(v ?? '').trim();
    if (texto) params.set(clave, texto);
    else params.delete(clave);
  }
  return params;
}

/** Los filtros como objeto para query() de lib/api. */
export function filtrosAQuery(valores) {
  const q = {};
  for (const clave of CLAVES) {
    const v = valores[clave];
    q[clave] = Array.isArray(v) ? v.join(',') || undefined : String(v ?? '').trim() || undefined;
  }
  return q;
}

export function cantidadDeFiltros(valores) {
  return LISTAS.reduce((n, c) => n + valores[c].length, 0) + (valores.precioMin || valores.precioMax ? 1 : 0);
}

export function etiquetaDecada(decada) {
  const d = Number(decada);
  return d < 2000 ? `Años ${String(d).slice(2)}` : `Años ${d}`;
}

/** Como se nombra cada valor elegido (para las etiquetas de filtros activos). */
export function etiquetaDe(clave, valor) {
  if (clave === 'disponibilidad') return etiquetaStock(valor);
  if (clave === 'decada') return etiquetaDecada(valor);
  return valor;
}

export function etiquetaPrecio({ precioMin, precioMax }) {
  if (precioMin && precioMax) return `${formatearPrecio(precioMin)} a ${formatearPrecio(precioMax)}`;
  if (precioMin) return `Desde ${formatearPrecio(precioMin)}`;
  if (precioMax) return `Hasta ${formatearPrecio(precioMax)}`;
  return '';
}
