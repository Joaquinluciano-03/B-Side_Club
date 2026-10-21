// Cuantos titulos hay en total y por categoria. El backend no devuelve el
// conteo en /categorias, asi que se pide /productos?pageSize=1 por categoria y
// se lee "total". Se cachea en memoria: lo usan el hero de la home, la seccion
// de formatos y los separadores del catalogo, y no queremos repetir pedidos
// (el backend tiene un techo de 300 cada 15 minutos).

import { useEffect, useState } from 'react';
import { get, query } from './api';

let cache = null;
let enVuelo = null;

function traer() {
  if (cache) return Promise.resolve(cache);
  if (!enVuelo) {
    enVuelo = Promise.all([
      get(`/productos${query({ pageSize: 1 })}`).catch(() => null),
      get('/categorias').catch(() => []),
    ])
      .then(async ([todos, categorias]) => {
        const totales = await Promise.all(
          categorias.map((c) =>
            get(`/productos${query({ categoriaId: c.id, pageSize: 1 })}`)
              .then((r) => r.total)
              .catch(() => null)
          )
        );
        cache = {
          total: todos?.total ?? null,
          categorias: categorias.map((c, i) => ({ ...c, total: totales[i] })),
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
