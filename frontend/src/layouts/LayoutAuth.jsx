// Marco de las pantallas de sesion (login, registro, recuperar, resetear,
// aceptar invitacion). Pantalla partida: a la izquierda el disco con un label
// de "solo staff" (el mismo mundo del hero), a la derecha el formulario.
// En mobile queda solo el formulario, con un label chico arriba.

import { Link } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import estilos from './LayoutAuth.module.css';

export default function LayoutAuth({ titulo, bajada, children, pie }) {
  return (
    <div className={estilos.pantalla}>
      <aside className={estilos.disco} aria-hidden="true">
        <div className={estilos.label}>
          <span className={estilos.vinilo} />
          <img src="/logo-512.webp" alt="" className={estilos.logo} width="256" height="256" />
          <span className={estilos.labelTexto}>Panel interno · Solo staff</span>
        </div>
      </aside>

      <main className={estilos.lado}>
        <div className={`${estilos.contenido} cascada`} style={{ '--cascada-inicio': '120ms' }}>
          <Link to="/" className={estilos.marca}>
            B-SIDE <span>CLUB</span>
          </Link>

          <h1 className={estilos.titulo}>{titulo}</h1>
          {bajada && <p className={estilos.bajada}>{bajada}</p>}

          <div className={estilos.formulario}>{children}</div>

          {pie && <div className={estilos.pie}>{pie}</div>}

          <Link to="/" className={estilos.volver}>
            <ArrowLeft size={14} weight="bold" aria-hidden="true" /> Volver al sitio
          </Link>
        </div>
      </main>
    </div>
  );
}
