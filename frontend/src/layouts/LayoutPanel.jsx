// Panel interno: sidebar carbon fija + area de contenido gris.
// En pantallas chicas el sidebar se esconde y se abre como cajon lateral
// desde un boton de menu en la barra de arriba.

import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Suspense, useEffect, useRef, useState } from 'react';
import {
  SquaresFour,
  Disc,
  Tag,
  Megaphone,
  ChatCircleText,
  Storefront,
  EnvelopeSimple,
  UsersThree,
  ArrowSquareOut,
  SignOut,
  List,
  X,
} from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';
import { get } from '../lib/api';
import { etiquetaRol } from '../lib/formato';
import { Cargando } from '../componentes/Estados';
import Logotipo from '../componentes/Logotipo';
import estilos from './LayoutPanel.module.css';

const SECCIONES = [
  { a: '/panel', label: 'Dashboard', icono: SquaresFour, exacto: true },
  { a: '/panel/productos', label: 'Productos', icono: Disc },
  { a: '/panel/categorias', label: 'Categorías', icono: Tag },
  { a: '/panel/promociones', label: 'Promociones', icono: Megaphone },
  { a: '/panel/consultas', label: 'Consultas', icono: ChatCircleText, badge: 'consultasPendientes' },
  { a: '/panel/info', label: 'Info del local', icono: Storefront },
  { a: '/panel/invitaciones', label: 'Invitaciones', icono: EnvelopeSimple, soloAdmin: true },
  { a: '/panel/usuarios', label: 'Equipo', icono: UsersThree, soloAdmin: true },
];

const claseEnlace = ({ isActive }) => `${estilos.enlace} ${isActive ? estilos.activo : ''}`;

function Marca() {
  return (
    <Link to="/panel" className={estilos.marca}>
      <img src="/logo-256.png" alt="" width="36" height="36" />
      <span>
        <span className={estilos.marcaNombre}>
          <Logotipo />
        </span>
        <span className={estilos.marcaSub}>Panel interno</span>
      </span>
    </Link>
  );
}

export default function LayoutPanel() {
  const { usuario, logout, puedeInvitar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [metricas, setMetricas] = useState(null);
  const [abierto, setAbierto] = useState(false);
  const botonRef = useRef(null);

  // el badge de consultas pendientes se refresca al cambiar de seccion:
  // alcanza para que no quede viejo despues de marcar una como leida
  useEffect(() => {
    get('/dashboard/metricas')
      .then(setMetricas)
      .catch(() => setMetricas(null));
    setAbierto(false);
  }, [location.pathname]);

  // con el cajon abierto en mobile: Escape lo cierra
  useEffect(() => {
    if (!abierto) return;
    function alTeclear(e) {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    }
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [abierto]);

  const visibles = SECCIONES.filter((s) => !s.soloAdmin || puedeInvitar);
  const inicial = (usuario?.nombre || '?').charAt(0).toUpperCase();

  async function salir() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className={estilos.shell}>
      {/* barra de arriba, solo en pantallas chicas */}
      <div className={estilos.barraMovil} data-oscuro>
        <Marca />
        <button
          ref={botonRef}
          type="button"
          className={estilos.botonMenu}
          onClick={() => setAbierto(true)}
          aria-label="Abrir menú del panel"
          aria-expanded={abierto}
          aria-controls="panel-menu"
        >
          <List size={22} weight="bold" />
          {metricas?.consultasPendientes > 0 && <span className={estilos.puntoAviso} aria-hidden="true" />}
        </button>
      </div>

      {abierto && <div className={estilos.velo} onClick={() => setAbierto(false)} aria-hidden="true" />}

      <aside id="panel-menu" className={estilos.lateral} data-abierto={abierto} data-oscuro>
        <div className={estilos.lateralCabecera}>
          <Marca />
          <button
            type="button"
            className={estilos.cerrarMenu}
            onClick={() => setAbierto(false)}
            aria-label="Cerrar menú"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <nav className={estilos.nav} aria-label="Secciones del panel">
          {visibles.map((s) => {
            const cuenta = s.badge ? metricas?.[s.badge] : 0;
            const Icono = s.icono;
            return (
              <NavLink key={s.a} to={s.a} end={s.exacto} className={claseEnlace}>
                <Icono size={19} weight="duotone" aria-hidden="true" />
                <span className={estilos.enlaceTexto}>{s.label}</span>
                {cuenta > 0 && (
                  <span className={estilos.badge} aria-label={`${cuenta} pendientes`}>
                    {cuenta}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className={estilos.pie}>
          <NavLink to="/panel/perfil" className={estilos.usuario}>
            <span className={estilos.avatar}>{inicial}</span>
            <span className={estilos.usuarioTexto}>
              <span className={estilos.usuarioNombre}>
                {usuario?.nombre} {usuario?.apellido}
              </span>
              <span className={estilos.usuarioRol}>{etiquetaRol(usuario?.rol)}</span>
            </span>
          </NavLink>

          <Link to="/" className={estilos.accionPie}>
            <ArrowSquareOut size={18} aria-hidden="true" /> Ver el sitio público
          </Link>
          <button type="button" onClick={salir} className={estilos.accionPie}>
            <SignOut size={18} aria-hidden="true" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* main: el contenido de cada seccion (los lectores de pantalla saltan directo aca) */}
      <main className={estilos.area}>
        {/* cada seccion del panel se baja aparte (App.jsx): mientras llega,
            el lateral queda y el contenido muestra el disco de carga */}
        <Suspense fallback={<Cargando />}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}

/** Encabezado pegajoso de cada seccion del panel. "kicker" es el contexto
 *  (en que parte del panel estas), "accion" el boton principal. */
export function CabeceraPanel({ kicker, titulo, accion }) {
  return (
    <header className={estilos.cabecera}>
      <div className={estilos.cabeceraTexto}>
        {kicker && <p className={estilos.contexto}>{kicker}</p>}
        <h1 className={estilos.titulo}>{titulo}</h1>
      </div>
      {accion && <div className={estilos.accion}>{accion}</div>}
    </header>
  );
}

/** Cuerpo de cada seccion. */
export function CuerpoPanel({ children }) {
  return <div className={estilos.cuerpo}>{children}</div>;
}
