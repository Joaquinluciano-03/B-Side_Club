// vigencia de una promoción. El backend solo filtra por "activa" y no mira las fechas, así que la ventana de fechas se filtra acá.
// Son días de calendario: se guardan como medianoche UTC y en Argentina (UTC-3) una promo "hasta el 30" se apagaría el 29 a las 21:00.
// Por eso se saca el día en UTC y se reconstruye en hora local
function diaLocal(valor, finDelDia) {
  if (!valor) return null;
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    ...(finDelDia ? [23, 59, 59, 999] : [0, 0, 0, 0])
  );
}

/** ¿Hoy cae adentro de la ventana de la promo? Sin fechas, siempre. */
export function enVentana(promo, ahora = new Date()) {
  const desde = diaLocal(promo.fechaInicio, false);
  const hasta = diaLocal(promo.fechaFin, true);

  if (desde && ahora < desde) return false;
  if (hasta && ahora > hasta) return false;
  return true;
}

/** Lo que de verdad se le muestra al visitante. */
export function vigentes(promociones = [], ahora = new Date()) {
  return promociones.filter((p) => p.activa !== false && enVentana(p, ahora));
}

/** Etiqueta y color para la tabla del panel. */
export function estadoVigencia(promo, ahora = new Date()) {
  if (promo.activa === false) return { label: 'Apagada', badge: 'neutro' };

  const desde = diaLocal(promo.fechaInicio, false);
  if (desde && ahora < desde) return { label: 'Programada', badge: 'reservado' };

  if (!enVentana(promo, ahora)) return { label: 'Vencida', badge: 'vendido' };

  return { label: 'Vigente', badge: 'disponible' };
}
