// Scroll suave con la rueda del mouse en el sitio publico (Lenis). Sutil: un
// suavizado corto que llega rapido, sin la sensacion de "patinar", y la
// misma distancia por movimiento de rueda que el scroll normal.
// - Solo con mouse o trackpad: en el celular el scroll tactil queda nativo
//   (ya es suave y es el que la gente espera).
// - Mueve el scroll real de la ventana: las animaciones atadas al scroll, la
//   barra pegada del catalogo y los IntersectionObserver siguen igual.
// - Adentro de un <dialog> (modales, filtros, galeria) o de algo marcado con
//   data-lenis-prevent, el scroll es el normal.
// Lo que mueve el scroll por codigo pasa por irAlScroll: si no, un salto
// (volver arriba al cambiar de pagina) se peleaba con el suavizado en curso.

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Con Lenis el scroll se mueve desde el hilo principal: en el hero (la zona
// mas pesada de dibujar) un deslizamiento largo se sentia a tirones. Por eso
// el deslizamiento es corto (lerp 0.2: llega rapido, hay menos cuadros que
// dependen del hilo principal). Con false, el sitio usa el scroll del
// navegador.
const SCROLL_SUAVE_ACTIVO = true;

let lenis = null;
let cuadro = 0;
let quietos = 0;

// El bucle de cuadros solo corre mientras hay algo que deslizar: despierta
// con la rueda (o con irAlScroll) y se duerme unos cuadros despues de que el
// scroll termino. Con autoRaf de Lenis corria siempre, 60 veces por segundo,
// aunque nadie scrolleara
function paso(tiempo) {
  lenis?.raf(tiempo);
  quietos = lenis?.isScrolling ? 0 : quietos + 1;
  cuadro = lenis && quietos < 3 ? requestAnimationFrame(paso) : 0;
}
function despertar() {
  quietos = 0;
  if (!cuadro) cuadro = requestAnimationFrame(paso);
}

/** Prende el scroll suave; devuelve la funcion que lo apaga. */
export function activarScrollSuave() {
  if (!SCROLL_SUAVE_ACTIVO || lenis || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  lenis = new Lenis({
    lerp: 0.2,
    wheelMultiplier: 1,
    smoothWheel: true,
    syncTouch: false,
    autoRaf: false,
    // una lista o un panel con scroll propio scrollea primero lo suyo
    allowNestedScroll: true,
    prevent: (nodo) => Boolean(nodo.closest?.('dialog, [data-lenis-prevent]')),
  });
  window.addEventListener('wheel', despertar, { passive: true });
  return () => {
    window.removeEventListener('wheel', despertar);
    cancelAnimationFrame(cuadro);
    cuadro = 0;
    lenis?.destroy();
    lenis = null;
  };
}

/** Lleva el scroll a `y`: de una (por defecto) o deslizando (suave: true). */
export function irAlScroll(y, { suave = false } = {}) {
  if (!lenis) {
    window.scrollTo({ top: y, behavior: suave ? 'smooth' : 'auto' });
    return;
  }
  // Lenis no deja pasar del alto que midio la ultima vez. Al volver con
  // Atras la pagina va creciendo mientras llegan los productos y se reintenta
  // cada cuadro (ver ManejoDelScroll en App.jsx): sin volver a medir, el
  // salto quedaba frenado en el alto viejo
  lenis.resize();
  lenis.scrollTo(y, suave ? { duration: 0.9, force: true } : { immediate: true, force: true });
  if (suave) despertar();
}
