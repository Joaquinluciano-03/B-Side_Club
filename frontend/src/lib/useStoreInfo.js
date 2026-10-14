// La info del local la piden el footer, el home y la pagina de contacto.
// Se cachea en memoria para no pedirla una vez por componente en cada render
// de ruta: es una fila sola que casi nunca cambia.

import { useEffect, useState } from 'react';
import { get } from './api';

let cache = null;
let enVuelo = null;
const suscriptores = new Set();

function traer() {
  if (cache) return Promise.resolve(cache);
  if (!enVuelo) {
    enVuelo = get('/store-info')
      .then((info) => {
        cache = info;
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
  suscriptores.forEach((fn) => fn(cache));
  if (!nueva) traer();
}

export function useStoreInfo() {
  const [info, setInfo] = useState(cache);
  const [cargando, setCargando] = useState(!cache);

  useEffect(() => {
    suscriptores.add(setInfo);
    traer().then(() => setCargando(false));
    return () => suscriptores.delete(setInfo);
  }, []);

  return { info, cargando };
}
