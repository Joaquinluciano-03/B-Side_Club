// Cuantos titulos hay en total y por categoria. /categorias trae el "total"
// de productos publicados de cada una, y el total general es la suma (todo
// producto tiene categoria): un solo pedido. Se cachea en memoria: lo usan el
// hero de la home, la seccion de formatos y los separadores del catalogo, y
// no queremos repetir pedidos (el backend tiene un techo de 300 cada 15 minutos).

import { useEffect, useState } from 'react';
import { get } from './api';

let cache = null;
let enVuelo = null;

function traer() {
  if (cache) return Promise.resolve(cache);
  if (!enVuelo) {
    enVuelo = get('/categorias')
      .catch(() => [])
      .then((categorias) => {
        const conTotal = categorias.every((c) => typeof c.total === 'number');
        cache = {
          total: conTotal && categorias.length ? categorias.reduce((suma, c) => suma + c.total, 0) : null,
          categorias: categorias.map((c) => ({ ...c, total: c.total ?? null })),
        };
        return cache;
      })
      .finally(() => {
        enVuelo = null;
      });
  }
  return enVuelo;
}

export function useConteos() {
  const [datos, setDatos] = useState(cache || { total: null, categorias: [] });
  const [cargando, setCargando] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    let vivo = true;
    traer().then((d) => {
      if (vivo) {
        setDatos(d);
        setCargando(false);
      }
    });
    return () => {
      vivo = false;
    };
  }, []);

  return { ...datos, cargando };
}
