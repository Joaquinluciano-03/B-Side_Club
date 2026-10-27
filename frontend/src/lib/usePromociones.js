// Las promociones vigentes, pedidas una sola vez para toda la Home: las usan
// la banda de Novedades y la tracklist del hero (que solo apunta a Novedades
// si hay alguna). El pedido se reusa un minuto, como los conteos.
// null mientras carga; despues, la lista (puede venir vacia).

import { useEffect, useState } from 'react';
import { get } from './api';
import { vigentes } from './promociones';

const VIGENCIA_MS = 60_000;
let pedido = null;
let pedidoEn = 0;

function pedirPromociones() {
  if (!pedido || Date.now() - pedidoEn > VIGENCIA_MS) {
    pedidoEn = Date.now();
    // soloActivas filtra por el flag; la ventana de fechas la filtra vigentes()
    pedido = get('/promociones?soloActivas=true').catch(() => []);
  }
  return pedido;
}

export function usePromocionesVigentes() {
  const [promos, setPromos] = useState(null);
  useEffect(() => {
    let vigente = true;
    pedirPromociones().then((lista) => vigente && setPromos(vigentes(lista)));
    return () => {
      vigente = false;
    };
  }, []);
  return promos;
}
