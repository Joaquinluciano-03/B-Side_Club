// Un cassette sonando, para la cabecera de Nosotros (el Lado B). Hecho solo
// con CSS: los dos ejes giran y la cinta pasa de a poco de un carrete al otro
// (el de la izquierda se achica y el de la derecha crece). Es decorativo.
// Con alScroll la cinta avanza segun cuanto se bajo la pagina (arriba de todo
// esta llena a la izquierda, al final paso a la derecha) y los ejes giran mas
// rapido mientras se scrollea. Sin soporte de scroll-driven, avanza sola.

import { useDatosDelLocal } from '../lib/useStoreInfo';
import estilos from './Cassette.module.css';

function Carrete({ lado }) {
  return (
    <span className={`${estilos.carrete} ${estilos[lado]}`}>
      {/* la cinta enrollada y, encima, el eje dentado que gira */}
      <span className={estilos.cinta} />
      <span className={estilos.ejeScroll}>
        <span className={estilos.eje} />
      </span>
    </span>
  );
}

export default function Cassette({ className = '', alScroll = false }) {
  // la etiqueta lleva el nombre del local (de la base)
  const { nombre } = useDatosDelLocal();
  return (
    <figure className={`${estilos.figura} ${alScroll ? estilos.alScroll : ''} ${className}`} aria-hidden="true">
      <div className={estilos.cassette}>
        <div className={estilos.etiqueta}>
          <span className={estilos.ladoLetra}>B</span>
          <span className={estilos.titulo}>{nombre}</span>
          <span className={estilos.sub}>Mix de la casa · C90</span>
          <div className={estilos.ventana}>
            <Carrete lado="izq" />
            <Carrete lado="der" />
          </div>
        </div>
        {/* la boca de abajo, por donde pasa la cinta frente al cabezal */}
        <div className={estilos.boca}>
          <span className={estilos.cintaBoca} />
        </div>
      </div>
    </figure>
  );
}
