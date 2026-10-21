// Contenedor de los modales del panel (detalle de consulta, plantilla del
// mail): fondo oscuro con blur, tarjeta clara centrada, cierre con la X.
//
// Usa <dialog> nativo para no reimplementar a mano el foco atrapado, el
// cierre con Escape y el aislamiento del resto de la pagina. La animacion de
// entrada y salida vive en global.css.

import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';
import estilos from './Dialogo.module.css';

export default function Modal({ abierto, onCerrar, titulo, kicker, bajada, ancho = 540, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={estilos.dialogo}
      style={{ maxWidth: ancho }}
      aria-label={typeof titulo === 'string' ? titulo : undefined}
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      onClick={(e) => {
        // click en el backdrop (afuera de la tarjeta) cierra
        if (e.target === ref.current) onCerrar();
      }}
    >
      <div className={estilos.marco}>
        <div className={estilos.cabecera}>
          <div style={{ minWidth: 0 }}>
            {/* "kicker" es el contexto del modal (ej: "Consulta de Malena") */}
            {kicker && <p className={estilos.contexto}>{kicker}</p>}
            <h2 className={estilos.titulo}>{titulo}</h2>
            {bajada && <p className={estilos.bajada}>{bajada}</p>}
          </div>

          <button onClick={onCerrar} aria-label="Cerrar" className={estilos.cerrar}>
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className={estilos.cuerpo}>{children}</div>
      </div>
    </dialog>
  );
}
