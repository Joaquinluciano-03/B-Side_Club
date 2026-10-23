// Cuantos titulos hay en total y por categoria. /categorias trae el "total"
// de productos publicados de cada una, y el total general es la suma (todo
// producto tiene categoria): un solo pedido. Se cachea en memoria: lo usan el
// hero de la home, la seccion de formatos y los separadores del catalogo, y
// no queremos repetir pedidos (el backend tiene un techo de 300 cada 15 minutos).
//
// El cache vence al minuto: pasado ese tiempo se muestra lo que habia y se
// pide de nuevo en segundo plano. Y el panel lo descarta al tocar una
// categoria o un producto (olvidarConteos), para que al volver al sitio se
// vea el cambio (el icono nuevo, la categoria nueva) sin recargar la pagina.

import { useEffect, useState } from 'react';
import { get } from './api';

const VIGENCIA_MS = 60 * 1000;

let cache = null;
let pedidoEn = 0;
let enVuelo = null;
// los componentes montados, para avisarles cuando llegan datos nuevos
const suscriptores = new Set();

function vigente() {
  return cache && Date.now() - pedidoEn < VIGENCIA_MS;
}

function traer() {
  if (!enVuelo) {
    enVuelo = get('/categorias')
      .catch(() => null)
      .then((categorias) => {
        // si falla y ya habia datos, se quedan los de antes
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
