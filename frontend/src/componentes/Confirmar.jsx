// diálogo de confirmación para acciones que borran. El foco arranca en "Cancelar" por seguridad

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
        // click fuera de la tarjeta = cancelar
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
