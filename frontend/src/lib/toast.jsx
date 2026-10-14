// Avisos flotantes. La demo los define como una pastilla oscura abajo al
// centro, con un punto de color segun el tipo.
//
// Sirven para confirmar algo que YA pasó ("Cambios guardados"). Para los
// errores que la persona tiene que leer y corregir en el formulario seguimos
// usando el .aviso inline: un toast se va solo y eso no se puede perder.

import { createContext, useContext, useState, useCallback, useRef } from 'react';

const Ctx = createContext(null);

const DURACION = 4000;

const PUNTOS = {
  ok: 'var(--ok-texto)',
  error: 'var(--error)',
  info: 'var(--neon-cian)',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // contador propio en vez de Date.now(): dos toasts en el mismo milisegundo
  // compartirian key y React se queja
  const siguienteId = useRef(0);

  const cerrar = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensaje, tipo = 'ok') => {
      const id = siguienteId.current++;
      setToasts((prev) => [...prev, { id, mensaje, tipo }]);
      setTimeout(() => cerrar(id), DURACION);
    },
    [cerrar]
  );

  const api = {
    exito: useCallback((m) => mostrar(m, 'ok'), [mostrar]),
    error: useCallback((m) => mostrar(m, 'error'), [mostrar]),
    info: useCallback((m) => mostrar(m, 'info'), [mostrar]),
  };

  return (
    <Ctx.Provider value={api}>
      {children}

      {/* aria-live para que un lector de pantalla lo anuncie sin robar el foco */}
      <div
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 26,
          transform: 'translateX(-50%)',
          zIndex: 95,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 10,
          alignItems: 'center',
          pointerEvents: 'none',
          maxWidth: 'calc(100vw - 36px)',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            onClick={() => cerrar(t.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: 'var(--tinta-sobre-naranja)',
              border: '1px solid var(--borde-oscuro-3)',
              borderRadius: 11,
              padding: '14px 18px',
              boxShadow: '0 18px 40px rgba(0,0,0,.35)',
              pointerEvents: 'auto',
              cursor: 'pointer',
              animation: 'toast-entra .22s ease-out',
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: PUNTOS[t.tipo] || PUNTOS.info,
                flexShrink: 0,
              }}
            />
            <div style={{ color: 'var(--crema)', fontSize: 14, fontWeight: 700 }}>{t.mensaje}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast tiene que usarse adentro de <ToastProvider>');
  return ctx;
}
