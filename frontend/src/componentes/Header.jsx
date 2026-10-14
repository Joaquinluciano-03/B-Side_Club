// Header pegajoso del sitio publico. El logo lleva el neon rosa/cian de la
// demo y abajo corre la linea de gradiente animada (keyframes bneon).

import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const NAV = [
  { a: '/', label: 'Home', exacto: true },
  { a: '/catalogo', label: 'Catálogo' },
  { a: '/nosotros', label: 'Nosotros' },
  { a: '/contacto', label: 'Contacto' },
];

const estiloNav = (activo) => ({
  background: activo ? 'var(--naranja)' : 'transparent',
  color: activo ? 'var(--tinta-sobre-naranja)' : '#C8C0B9',
  fontWeight: activo ? 800 : 700,
  fontSize: 13,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  padding: '9px 16px',
  border: 'none',
  borderRadius: 999,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  transition: 'color .15s, background .15s',
  textDecoration: 'none',
  display: 'inline-block',
});

export default function Header() {
  const { esStaff } = useAuth();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--borde-oscuro)',
        background:
          'radial-gradient(120% 180% at 12% 0%, rgba(255,79,163,.14), transparent 58%), radial-gradient(90% 160% at 88% 100%, rgba(53,208,232,.11), transparent 60%), rgba(16,15,14,.95)',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--ancho)',
          margin: '0 auto',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          justifyContent: 'space-between',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              fontFamily: 'var(--display)',
              fontSize: 'clamp(24px, 4.5vw, 34px)',
              letterSpacing: '.02em',
              lineHeight: 1,
              padding: '2px 0',
            }}
          >
            <span
              style={{
                color: 'var(--neon-rosa-claro)',
                textShadow:
                  '0 0 4px #FF4FA3, 0 0 12px #FF4FA3, 0 0 26px rgba(255,79,163,.85), 0 0 46px rgba(255,79,163,.5)',
              }}
            >
              B-SIDE
            </span>{' '}
            <span
              style={{
                color: 'var(--neon-cian-claro)',
                textShadow:
                  '0 0 4px #35D0E8, 0 0 12px #35D0E8, 0 0 26px rgba(53,208,232,.85), 0 0 46px rgba(53,208,232,.5)',
              }}
            >
              CLUB
            </span>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              border: '1px solid var(--borde-oscuro-2)',
              borderRadius: 999,
              padding: 4,
              overflowX: 'auto',
              maxWidth: '100%',
              background: 'var(--madera)',
              boxShadow: 'var(--sombra-card)',
            }}
          >
            {NAV.map((n) => (
              <NavLink key={n.a} to={n.a} end={n.exacto} style={({ isActive }) => estiloNav(isActive)}>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <Link
            to={esStaff ? '/panel' : '/login'}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '.18em',
              color: 'var(--crema-tenue)',
              border: '1px solid var(--borde-oscuro-2)',
              borderRadius: 999,
              padding: '9px 14px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {esStaff ? 'Panel' : 'Ingresar'}
          </Link>
        </div>
      </div>

      {/* linea de neon animada */}
      <div
        style={{
          height: 2,
          opacity: 0.85,
          background:
            'linear-gradient(90deg, #FF4FA3, #F26A1B 17%, #35D0E8 34%, #FF4FA3 50%, #F26A1B 67%, #35D0E8 84%, #FF4FA3)',
          backgroundSize: '200% 100%',
          animation: 'bneon 14s linear infinite',
        }}
      />
    </header>
  );
}
