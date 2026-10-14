// Dialogo de confirmacion para las acciones que borran.
// Usa <dialog> nativo: trae el foco atrapado y el cierre con Escape sin que
// tengamos que implementarlos a mano.

import { useEffect, useRef } from 'react';

export default function Confirmar({ abierto, titulo, texto, textoBoton = 'Eliminar', onConfirmar, onCancelar }) {
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
      onCancel={(e) => {
        e.preventDefault();
        onCancelar();
      }}
      onClick={(e) => {
        // click en el backdrop (fuera de la tarjeta) = cancelar
        if (e.target === ref.current) onCancelar();
      }}
      style={{
        border: '1px solid var(--borde)',
        borderRadius: 'var(--r-card)',
        padding: 0,
        maxWidth: 420,
        width: 'calc(100% - 36px)',
        background: 'var(--superficie)',
        color: 'var(--tinta)',
      }}
    >
      <div style={{ padding: 26 }}>
        <h2
          style={{
            fontFamily: 'var(--display)',
            fontSize: 20,
            margin: '0 0 10px',
            fontWeight: 400,
          }}
        >
          {titulo}
        </h2>
        <p style={{ color: 'var(--tinta-suave)', fontSize: 14, margin: '0 0 24px' }}>{texto}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn btn-secundario btn-chico" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn-chico" style={{ background: 'var(--error)', color: '#fff' }} onClick={onConfirmar}>
            {textoBoton}
          </button>
        </div>
      </div>
    </dialog>
  );
}
