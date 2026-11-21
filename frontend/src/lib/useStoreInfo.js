// info del local (nombre, dirección, contacto, horario) desde GET /api/store-info; el panel la edita.
// Todo lo que el sitio muestre del local sale de acá, nunca escrito a mano.
// Se cachea en memoria y en el navegador, así el nombre aparece desde el primer cuadro

import { useEffect, useState } from 'react';
import { get } from './api';

// solo si la base nunca respondió en este navegador (o falla)
export const NOMBRE_POR_DEFECTO = 'B-Side Club';
const CLAVE_GUARDADA = 'bsc_info_local';

function leerGuardada() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_GUARDADA)) || null;
  } catch {
    return null;
  }
}

let cache = null;
let guardada = leerGuardada();
let enVuelo = null;
const suscriptores = new Set();

function guardar(info) {
  guardada = info;
  try {
    localStorage.setItem(CLAVE_GUARDADA, JSON.stringify(info));
  } catch {
    // modo privado o almacenamiento lleno: se usa la de memoria
  }
}

function traer() {
  if (cache) return Promise.resolve(cache);
  if (!enVuelo) {
    enVuelo = get('/store-info')
      .then((info) => {
        cache = info;
        guardar(info);
        suscriptores.forEach((fn) => fn(info));
        return info;
      })
      .catch(() => null)
      .finally(() => {
        enVuelo = null;
      });
  }
  return enVuelo;
}

// el panel la usa después de guardar, para que el footer muestre lo nuevo
export function invalidarStoreInfo(nueva) {
  cache = nueva || null;
  if (nueva) guardar(nueva);
  suscriptores.forEach((fn) => fn(cache));
  if (!nueva) traer();
}

export function useStoreInfo() {
  const [info, setInfo] = useState(cache || guardada);
  const [cargando, setCargando] = useState(!cache);

  useEffect(() => {
    suscriptores.add(setInfo);
    traer().then(() => setCargando(false));
    return () => suscriptores.delete(setInfo);
  }, []);

  return { info, cargando };
}

/**
 * Datos del local listos para mostrar. La dirección se carga como "Calle 123, Barrio, Ciudad":
 *   barrio -> "Barrio", zona -> "Barrio, Ciudad", ciudad -> "Ciudad"
 */
export function datosDelLocal(info) {
  const partes = String(info?.direccion || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    nombre: info?.nombre?.trim() || NOMBRE_POR_DEFECTO,
    barrio: partes[1] || '',
    zona: partes.slice(1).join(', '),
    ciudad: partes.length > 2 ? partes[partes.length - 1] : '',
  };
}

export function useDatosDelLocal() {
  const { info, cargando } = useStoreInfo();
  return { info, cargando, ...datosDelLocal(info) };
}

/** El nombre partido para el logotipo de dos colores: "B-Side" + "Club". */
export function partirNombre(nombre) {
  const palabras = String(nombre).trim().split(/\s+/);
  const ultima = palabras.length > 1 ? palabras.pop() : '';
  return { resto: palabras.join(' '), ultima };
}
