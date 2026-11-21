// cuántos títulos hay en total y por categoría, con un solo pedido a /categorias. Se cachea un minuto (el backend limita los pedidos);
// el panel lo descarta al tocar una categoría o producto (olvidarConteos)

import { useEffect, useState } from 'react';
import { get } from './api';

const VIGENCIA_MS = 60 * 1000;

let cache = null;
let pedidoEn = 0;
let enVuelo = null;
// componentes montados, para avisarles cuando llegan datos nuevos
const suscriptores = new Set();

function vigente() {
  return cache && Date.now() - pedidoEn < VIGENCIA_MS;
}

function traer() {
  if (!enVuelo) {
    enVuelo = get('/categorias')
      .catch(() => null)
      .then((categorias) => {
        // si falla y ya había datos, quedan los de antes
        if (!categorias) return cache ?? { total: null, categorias: [] };
        const conTotal = categorias.every((c) => typeof c.total === 'number');
        cache = {
          total: conTotal && categorias.length ? categorias.reduce((suma, c) => suma + c.total, 0) : null,
          categorias: categorias.map((c) => ({ ...c, total: c.total ?? null })),
        };
        pedidoEn = Date.now();
        suscriptores.forEach((avisar) => avisar(cache));
        return cache;
      })
      .finally(() => {
        enVuelo = null;
      });
  }
  return enVuelo;
}

/** Descarta lo cacheado: la proxima vez que se use, se pide de nuevo. */
export function olvidarConteos() {
  pedidoEn = 0;
}

export function useConteos() {
  const [datos, setDatos] = useState(cache || { total: null, categorias: [] });
  const [cargando, setCargando] = useState(!cache);

  useEffect(() => {
    let vivo = true;
    const avisar = (d) => {
      if (vivo) {
        setDatos(d);
        setCargando(false);
      }
    };
    suscriptores.add(avisar);
    if (!vigente()) traer().then(avisar);
    return () => {
      vivo = false;
      suscriptores.delete(avisar);
    };
  }, []);

  return { ...datos, cargando };
}
