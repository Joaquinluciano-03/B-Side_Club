// Dialogo de confirmacion para las acciones que borran.
// Usa <dialog> nativo: trae el foco atrapado y el cierre con Escape sin que
// tengamos que implementarlos a mano. El foco arranca en "Cancelar", que es
// la opcion segura si alguien aprieta Enter sin leer.

import { useEffect, useRef } from 'react';
import estilos from './Dialogo.module.css';

export default function Confirmar({ abierto, titulo, texto, textoBoton = 'Eliminar', onConfirmar, onCancelar }) {
  const ref = useRef(null);
  const cancelarRef = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) {
      d.showModal();
      cancelarRef.current?.focus();
    }
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      className={estilos.dialogo}
      style={{ maxWidth: 440 }}
      aria-labelledby="confirmar-titulo"
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      onClick={(e) => {
        // click en el backdrop (fuera de la tarjeta) = cancelar
        if (e.target === ref.current) onCancelar();
      }}
    >
      <div className={estilos.confirmar}>
        <h2 id="confirmar-titulo" className={estilos.titulo}>
          {titulo}
        </h2>
        <p className={estilos.confirmarTexto}>{texto}</p>
        <div className={estilos.acciones}>
          <button ref={cancelarRef} className="btn btn-secundario btn-chico" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-peligro-lleno btn-chico" onClick={onConfirmar}>
            {textoBoton}
          </button>
        </div>
      </div>
    </dialog>
  );
}
