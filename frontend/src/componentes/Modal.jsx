// Contenedor de los modales del panel. La demo define tres (detalle de
// consulta, plantilla del mail, confirmacion) y los tres comparten la misma
// caja: fondo oscuro con blur, tarjeta clara centrada, cierre con la X.
//
// Usa <dialog> nativo para no reimplementar a mano el foco atrapado, el
// cierre con Escape y el aislamiento del resto de la pagina.

import { useEffect, useRef } from 'react';

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
      onCancel={(e) => {
        e.preventDefault();
        onCerrar();
      }}
      onClick={(e) => {
        // click en el backdrop (afuera de la tarjeta) cierra
        if (e.target === ref.current) onCerrar();
      }}
      style={{
        border: '1px solid var(--borde)',
        borderRadius: 16,
        padding: 0,
        width: 'calc(100% - 36px)',
        maxWidth: ancho,
        maxHeight: '88vh',
        background: 'var(--superficie)',
        color: 'var(--tinta)',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '88vh' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 14,
            padding: '18px 22px',
            borderBottom: '1px solid var(--borde)',
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            {kicker && (
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 10,
                  letterSpacing: '.2em',
                  color: 'var(--meta)',
                  marginBottom: 8,
                  textTransform: 'uppercase',
                }}
              >
                {kicker}
              </div>
            )}
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 20,
                lineHeight: 1.1,
                fontWeight: 400,
              }}
            >
              {titulo}
            </div>
            {bajada && (
              <div style={{ color: 'var(--tinta-tenue)', fontSize: 13, marginTop: 5 }}>{bajada}</div>
            )}
          </div>

          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="modal-cerrar"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--borde-fuerte)',
              color: 'var(--meta)',
              fontSize: 16,
              cursor: 'pointer',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 22, overflowY: 'auto' }}>{children}</div>
      </div>
    </dialog>
  );
}
