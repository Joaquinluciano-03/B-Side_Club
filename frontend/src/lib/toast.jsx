// Avisos flotantes: una pastilla oscura abajo al centro, con un icono segun
// el tipo. Entran desde abajo con @starting-style (toast.module.css).
//
// Sirven para confirmar algo que YA pasó ("Cambios guardados"). Para los
// errores que la persona tiene que leer y corregir en el formulario seguimos
// usando el .aviso inline: un toast se va solo y eso no se puede perder.

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';
import estilos from './toast.module.css';

const Ctx = createContext(null);

const DURACION = 4000;

// cada tipo con su icono: el estado se lee por la forma, no solo por el color
const ICONOS = {
  ok: CheckCircle,
  error: WarningCircle,
  info: Info,
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
      <div aria-live="polite" aria-atomic="false" className={estilos.pila}>
        {toasts.map((t) => {
          const Icono = ICONOS[t.tipo] || ICONOS.info;
          return (
            <div
              key={t.id}
              role="status"
              onClick={() => cerrar(t.id)}
              className={`${estilos.toast} ${estilos[t.tipo] || ''}`}
            >
              <Icono size={18} weight="fill" className={estilos.icono} aria-hidden="true" />
              <span>{t.mensaje}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useToast tiene que usarse adentro de <ToastProvider>');
  return ctx;
}
