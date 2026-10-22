// La info del local (nombre, direccion, contacto, horario) sale de la base:
// GET /api/store-info, que el panel edita en "Info del local". Todo lo que el
// sitio muestra del local tiene que salir de aca, nunca escrito a mano en el
// front: si el local cambia de barrio o de nombre, cambia en toda la web.
//
// Se cachea en memoria (es una fila sola que casi nunca cambia) y ademas se
// guarda en el navegador, asi en la siguiente visita el nombre y el barrio
// aparecen bien desde el primer cuadro, sin esperar a la API.

import { useEffect, useState } from 'react';
import { get } from './api';

// solo mientras la base no respondio nunca en este navegador (o si falla)
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
    // modo privado o almacenamiento lleno: no pasa nada, se usa la de memoria
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

// la usa el panel despues de guardar, para que el footer muestre lo nuevo
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
 * Los datos del local ya listos para mostrar, derivados de la base.
 * La direccion se carga como "Calle 123, Barrio, Ciudad":
 *   barrio -> "Barrio"            (para "disqueria en ...")
 *   zona   -> "Barrio, Ciudad"    (todo lo que va despues de la calle)
 *   ciudad -> "Ciudad"            (si la direccion la trae)
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
