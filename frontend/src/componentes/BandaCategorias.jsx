// Banda que corre bajo el header con los nombres de las categorias reales de
// la base, como la cinta que separaba el hero de la siguiente seccion en la
// demo. Es decorativa: no tiene links ni se frena con el mouse (para navegar
// por categoria estan los separadores del catalogo).

import { useConteos } from '../lib/useConteos';
import estilos from './BandaCategorias.module.css';

// los puntos alternan los tres colores de la marca
const PUNTOS = ['var(--naranja)', 'var(--neon-cian)', 'var(--neon-rosa)'];

// cuantas veces se repite la lista dentro de cada mitad: con 4 categorias
// una sola pasada no llega a cubrir una pantalla ancha
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

  // aria-hidden: es adorno, un lector de pantalla no tiene que leer la cinta
  return (
    <div className={estilos.banda} aria-hidden="true">
      {!cargando && categorias.length > 0 && (
        // dos tiras iguales: cuando la primera termina de salir, la segunda ya
        // esta en su lugar y el loop no se nota
        <div className={estilos.pista}>
          <Tira categorias={categorias} />
          <Tira categorias={categorias} />
        </div>
      )}
    </div>
  );
}
