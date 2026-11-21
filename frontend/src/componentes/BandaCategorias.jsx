// banda decorativa bajo el header con los nombres de las categorías

import { useConteos } from '../lib/useConteos';
import estilos from './BandaCategorias.module.css';

// los puntos alternan los tres colores de la marca
const PUNTOS = ['var(--naranja)', 'var(--neon-cian)', 'var(--neon-rosa)'];

// cuántas veces se repite la lista por mitad, para cubrir pantallas anchas
const REPETICIONES = 5;

function Tira({ categorias }) {
  return (
    <div className={estilos.tira}>
      {Array.from({ length: REPETICIONES }, (_, r) =>
        categorias.map((c, i) => (
          <span key={`${r}-${c.id}`} className={estilos.item}>
            <span className={estilos.nombre}>{c.nombre}</span>
            <span className={estilos.punto} style={{ color: PUNTOS[(r * categorias.length + i) % PUNTOS.length] }}>
              ●
            </span>
          </span>
        ))
      )}
    </div>
  );
}

export default function BandaCategorias() {
  const { categorias, cargando } = useConteos();

  // aria-hidden: es adorno
  return (
    <div className={estilos.banda} aria-hidden="true">
      {!cargando && categorias.length > 0 && (
        // dos tiras iguales para que el loop no se note
        <div className={estilos.pista}>
          <Tira categorias={categorias} />
          <Tira categorias={categorias} />
        </div>
      )}
    </div>
  );
}
