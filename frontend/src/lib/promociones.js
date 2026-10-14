// Vigencia de una promocion.
//
// OJO: el backend solo filtra por el campo "activa"; NO mira fechaInicio ni
// fechaFin. O sea que una promo encendida pero con la fecha de fin ya pasada
// sigue viniendo en GET /promociones. Por eso el filtro de ventana temporal
// lo hace el frontend, acá, y lo usan tanto la banda publica como el panel.

// Estas fechas son DIAS DE CALENDARIO, no instantes: "hasta el 30" significa
// hasta que termine el 30 acá, en el local.
//
// El problema es que se guardan como medianoche UTC de ese día (el backend
// hace new Date("2026-06-30")), y Argentina está en UTC-3. Si comparáramos
// contra el instante guardado, una promo "hasta el 30" se apagaría el 29 a
// las 21:00. Por eso sacamos el día en UTC —que es el que la persona
// eligió— y lo reconstruimos en hora local.
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
