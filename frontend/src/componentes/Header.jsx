// Header pegajoso del sitio publico. Sobre el carbon del disco: el logotipo
// es un cartel de neon rosa/cian igual al titulo del hero (componente Neon),
// y la navegacion va en una sola linea. En pantallas chicas los links se esconden detras de un boton
// de menu que despliega un panel desde arriba.

import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { List, X } from '@phosphor-icons/react';
import BandaCategorias from './BandaCategorias';
import Neon from './Neon';
import { useDatosDelLocal } from '../lib/useStoreInfo';
import estilos from './Header.module.css';

const NAV = [
  { a: '/', label: 'Home', exacto: true },
  { a: '/catalogo', label: 'Catálogo' },
  // ir al Lado B "da vuelta el disco" (View Transition, ver global.css)
  { a: '/nosotros', label: 'Nosotros', transicion: true },
  { a: '/contacto', label: 'Contacto' },
];

const claseLink = ({ isActive }) => `${estilos.link} ${isActive ? estilos.activo : ''}`;

export default function Header() {
  // el nombre del cartel sale de la base (Info del local)
  const { nombre } = useDatosDelLocal();
  const [abierto, setAbierto] = useState(false);
  const { pathname } = useLocation();
  const botonRef = useRef(null);
  const panelRef = useRef(null);

  // al navegar se cierra el menu (si no, queda tapando la pagina nueva)
  useEffect(() => {
    setAbierto(false);
  }, [pathname]);

  // con el menu abierto: Escape lo cierra y el foco entra al primer link
  useEffect(() => {
    if (!abierto) return;
    panelRef.current?.querySelector('a')?.focus();
    function alTeclear(e) {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  return (
    <header className={estilos.header} data-oscuro>
      <div className={estilos.barra}>
        <Link to="/" className={estilos.marca} aria-label={`${nombre}, ir al inicio`}>
          {/* el mismo cartel de neon que el titulo del hero */}
          <Neon texto={nombre} inicio={350} paso={70} />
        </Link>

        <nav className={estilos.nav} aria-label="Principal">
          {NAV.map((n) => (
            <NavLink key={n.a} to={n.a} end={n.exacto} className={claseLink} viewTransition={n.transicion}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <button
          ref={botonRef}
          type="button"
          className={estilos.botonMenu}
          aria-expanded={abierto}
          aria-controls="menu-mobile"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <X size={22} weight="bold" /> : <List size={22} weight="bold" />}
        </button>
      </div>

      <div
        id="menu-mobile"
        ref={panelRef}
        className={estilos.panel}
        data-abierto={abierto}
        // fuera de pantalla no tiene que recibir foco ni lectores de pantalla
        inert={!abierto}
      >
        {NAV.map((n) => (
          <NavLink key={n.a} to={n.a} end={n.exacto} className={claseLink}>
            {n.label}
          </NavLink>
        ))}
      </div>

      {/* la cinta de categorias (reemplaza la linea multicolor) */}
      <BandaCategorias />
    </header>
  );
}
