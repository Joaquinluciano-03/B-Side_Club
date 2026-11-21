// promociones vigentes, pedidas una vez para toda la Home (banda de Novedades y tracklist). null mientras carga

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
