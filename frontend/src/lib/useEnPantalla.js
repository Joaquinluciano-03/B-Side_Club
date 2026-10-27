// Marca un elemento segun este o no en pantalla, para que el CSS lo anime:
//   - data-visto: se pone una sola vez, cuando entra (con un margen, asi la
//     entrada se ve y no pasa en el borde de abajo). El CSS anima la entrada
//     con [data-visto] y esconde lo que falta entrar con
//     [data-entrada]:not([data-visto]).
//   - data-quieto (con pausa: true): mientras esta fuera de pantalla, para
//     pausar los loops que nadie esta mirando (la cinta, los discos).
//
//   const ref = useEnPantalla();
//   <section ref={ref} data-entrada>...</section>
//
// Es un ref de callback: funciona aunque el elemento aparezca despues (una
// seccion que espera datos). Sin IntersectionObserver se marca visto de una,
// asi nunca queda nada escondido.

import { useCallback } from 'react';

export function useEnPantalla({ entrada = true, pausa = false, margen = '0px 0px -12% 0px' } = {}) {
  return useCallback(
    (el) => {
      if (!el) return;
      if (!('IntersectionObserver' in window)) {
        if (entrada) el.setAttribute('data-visto', '');
        return;
      }
      const observadores = [];
      if (entrada) {
        const obs = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            el.setAttribute('data-visto', '');
            obs.disconnect();
          },
          { rootMargin: margen },
        );
        obs.observe(el);
        observadores.push(obs);
      }
      if (pausa) {
        const obs = new IntersectionObserver(([e]) => el.toggleAttribute('data-quieto', !e.isIntersecting));
        obs.observe(el);
        observadores.push(obs);
      }
      return () => observadores.forEach((o) => o.disconnect());
    },
    [entrada, pausa, margen],
  );
}
