// scroll suave con la rueda en el sitio público (Lenis). Solo con mouse o trackpad; en el celular queda el scroll nativo.
// Mueve el scroll real de la ventana, y adentro de un <dialog> o de algo con data-lenis-prevent el scroll es el normal.
// Lo que mueve el scroll por código pasa por irAlScroll, si no se pelea con el suavizado

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// suavizado corto (lerp 0.2): en el hero un deslizamiento largo se sentía a tirones. Con false se usa el scroll del navegador
const SCROLL_SUAVE_ACTIVO = true;

let lenis = null;
let cuadro = 0;
let quietos = 0;

// el bucle de cuadros solo corre mientras hay algo que deslizar (con autoRaf de Lenis corría siempre)
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
    // una lista o panel con scroll propio scrollea primero lo suyo
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
  // Lenis no deja pasar del alto que midió; al volver con Atrás la página crece, así que se vuelve a medir
  lenis.resize();
  lenis.scrollTo(y, suave ? { duration: 0.9, force: true } : { immediate: true, force: true });
  if (suave) despertar();
}
