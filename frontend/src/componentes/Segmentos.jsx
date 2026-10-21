// Control segmentado para filtrar listas del panel (Todas / Pendiente / …).
// La opcion activa se marca con una pastilla oscura que se desliza.

import { motion } from 'motion/react';
import estilos from './Segmentos.module.css';

export default function Segmentos({ opciones, valor, onCambiar, etiqueta, id = 'segmentos' }) {
  return (
    <div className={estilos.segmentos} role="tablist" aria-label={etiqueta}>
      {opciones.map((o) => {
        const activo = o.valor === valor;
        return (
          <button
            key={o.valor}
            role="tab"
            aria-selected={activo}
            className={`${estilos.opcion} ${activo ? estilos.activa : ''}`}
            onClick={() => onCambiar(o.valor)}
          >
            {activo && (
              <motion.span
                layoutId={`${id}-activa`}
                className={estilos.fondo}
                transition={{ type: 'spring', duration: 0.35, bounce: 0.12 }}
              />
            )}
            <span className={estilos.texto}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
