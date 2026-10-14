// Panel interno: sidebar carbon fija + area de contenido gris.
// En mobile el sidebar se vuelve una barra horizontal scrolleable (lo resuelve
// el bloque .adm-side de global.css, copiado de la demo).

import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { get } from '../lib/api';
import { etiquetaRol } from '../lib/formato';

const SECCIONES = [
  { a: '/panel', label: 'Dashboard', exacto: true },
  { a: '/panel/productos', label: 'Productos' },
  { a: '/panel/categorias', label: 'Categorías' },
  { a: '/panel/promociones', label: 'Promociones' },
  { a: '/panel/consultas', label: 'Consultas', badge: 'consultasPendientes' },
  { a: '/panel/info', label: 'Info del local' },
  { a: '/panel/invitaciones', label: 'Invitaciones', soloAdmin: true },
  { a: '/panel/usuarios', label: 'Equipo', soloAdmin: true },
];

const enlace = (activo) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  width: '100%',
  textAlign: 'left',
  background: activo ? 'var(--cinta)' : 'transparent',
  color: activo ? 'var(--crema)' : '#9A918B',
  border: 'none',
  borderRadius: 'var(--r-control)',
  padding: '11px 13px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
  transition: 'color .15s, background .15s',
  textDecoration: 'none',
  borderLeft: `2px solid ${activo ? 'var(--naranja)' : 'transparent'}`,
});

export default function LayoutPanel() {
  const { usuario, logout, puedeInvitar } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [metricas, setMetricas] = useState(null);

  // el badge de consultas pendientes se refresca al cambiar de seccion:
  // alcanza para que no quede viejo despues de marcar una como leida
  useEffect(() => {
    get('/dashboard/metricas')
      .then(setMetricas)
      .catch(() => setMetricas(null));
  }, [location.pathname]);

  const visibles = SECCIONES.filter((s) => !s.soloAdmin || puedeInvitar);
  const inicial = (usuario?.nombre || '?').charAt(0).toUpperCase();

  async function salir() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <div className="adm-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--panel-fondo)' }}>
      <aside
        className="adm-side"
        style={{
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          width: 252,
          flexShrink: 0,
          background: 'var(--tinta-sobre-naranja)',
          borderRight: '1px solid var(--borde-oscuro)',
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          padding: '18px 13px',
          overflowY: 'auto',
        }}
      >
        <div
          className="adm-side-marca"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px 16px' }}
        >
          <img src="/logo.png" alt="" style={{ width: 36, height: 36 }} />
          <div>
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 14,
                color: 'var(--crema)',
                lineHeight: 1,
              }}
            >
              B-SIDE <span style={{ color: 'var(--neon-cian)' }}>CLUB</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 9,
                letterSpacing: '.2em',
                color: 'var(--crema-tenue)',
                marginTop: 5,
              }}
            >
              PANEL INTERNO
            </div>
          </div>
        </div>

        {visibles.map((s) => {
          const cuenta = s.badge ? metricas?.[s.badge] : 0;
          return (
            <NavLink key={s.a} to={s.a} end={s.exacto} style={({ isActive }) => enlace(isActive)}>
              <span>{s.label}</span>
              {cuenta > 0 && (
                <span
                  style={{
                    background: 'var(--naranja)',
                    color: 'var(--tinta-sobre-naranja)',
                    fontFamily: 'var(--mono)',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 999,
                  }}
                >
                  {cuenta}
                </span>
              )}
            </NavLink>
          );
        })}

        <div
          className="adm-side-foot"
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingTop: 16,
            borderTop: '1px solid var(--borde-oscuro)',
          }}
        >
          <NavLink
            to="/panel/perfil"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'var(--naranja)',
                color: 'var(--tinta-sobre-naranja)',
                fontFamily: 'var(--display)',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {inicial}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  color: 'var(--crema)',
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {usuario?.nombre} {usuario?.apellido}
              </div>
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: 9,
                  letterSpacing: '.16em',
                  color: 'var(--crema-tenue)',
                  textTransform: 'uppercase',
                }}
              >
                {etiquetaRol(usuario?.rol)}
              </div>
            </div>
          </NavLink>

          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: '1px solid var(--borde-oscuro-3)',
              color: 'var(--crema-dim)',
              borderRadius: 'var(--r-control)',
              padding: '11px 13px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Ver el sitio público
          </button>

          <button
            onClick={salir}
            style={{
              background: 'transparent',
              border: '1px solid var(--borde-oscuro-3)',
              color: 'var(--crema-dim)',
              borderRadius: 'var(--r-control)',
              padding: '11px 13px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}

/** Encabezado pegajoso de cada seccion del panel. */
export function CabeceraPanel({ kicker, titulo, accion }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(221,225,227,.93)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--borde)',
        padding: '15px clamp(16px,3vw,30px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 14,
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 10,
            letterSpacing: '.22em',
            color: 'var(--meta)',
            marginBottom: 5,
            textTransform: 'uppercase',
          }}
        >
          {kicker}
        </div>
        <h1
          style={{
            fontFamily: 'var(--display)',
            fontSize: 'clamp(19px,2.6vw,26px)',
            margin: 0,
            lineHeight: 1.05,
            fontWeight: 400,
          }}
        >
          {titulo}
        </h1>
      </div>
      {accion}
    </div>
  );
}

/** Cuerpo de cada seccion, con el padding que usa la demo. */
export function CuerpoPanel({ children }) {
  return <div style={{ padding: 'clamp(18px,3vw,28px) clamp(16px,3vw,30px) 80px' }}>{children}</div>;
}
