// cassette decorativo de la cabecera de Nosotros, solo con CSS. Con alScroll la cinta avanza según el scroll; si no, avanza sola

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
  // la etiqueta lleva el nombre del local
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
