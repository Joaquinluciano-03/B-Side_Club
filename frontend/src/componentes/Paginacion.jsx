// Paginacion: anterior / ventana de 5 paginas / siguiente.

import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import estilos from './Paginacion.module.css';

export default function Paginacion({ pagina, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  // ventana de paginas alrededor de la actual, para no imprimir 30 botones
  const desde = Math.max(1, Math.min(pagina - 2, totalPaginas - 4));
  const hasta = Math.min(totalPaginas, desde + 4);
  const paginas = Array.from({ length: hasta - desde + 1 }, (_, i) => desde + i);

  return (
    <nav className={estilos.paginacion} aria-label="Páginas">
      <button
        className={estilos.flecha}
        disabled={pagina <= 1}
        onClick={() => onCambiar(pagina - 1)}
        aria-label="Página anterior"
      >
        <CaretLeft size={16} weight="bold" />
        <span>Anterior</span>
      </button>

      <ol className={estilos.numeros}>
        {paginas.map((n) => (
          <li key={n}>
            <button
              className={`${estilos.numero} ${n === pagina ? estilos.actual : ''}`}
              aria-current={n === pagina ? 'page' : undefined}
              onClick={() => onCambiar(n)}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>

      <button
        className={estilos.flecha}
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
        aria-label="Página siguiente"
      >
        <span>Siguiente</span>
        <CaretRight size={16} weight="bold" />
      </button>
    </nav>
  );
}
