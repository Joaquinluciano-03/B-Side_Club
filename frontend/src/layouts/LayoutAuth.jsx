// Marco de las pantallas de sesion: fondo carbon con el disco de fondo y una
// tarjeta centrada. Es el mismo tratamiento del hero, en version sobria.

import { Link } from 'react-router-dom';

export default function LayoutAuth({ titulo, bajada, children, pie }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(70% 55% at 50% 0%, rgba(242,106,27,.14), transparent 70%), radial-gradient(40% 40% at 12% 90%, rgba(255,79,163,.10), transparent 70%), radial-gradient(40% 40% at 88% 85%, rgba(53,208,232,.09), transparent 70%), var(--carbon)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 18px',
        gap: 26,
      }}
    >
      <Link to="/" style={{ textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--display)',
            fontSize: 30,
            letterSpacing: '.02em',
            lineHeight: 1,
          }}
        >
          <span
            style={{
              color: 'var(--neon-rosa-claro)',
              textShadow: '0 0 4px #FF4FA3, 0 0 14px #FF4FA3, 0 0 30px rgba(255,79,163,.6)',
            }}
          >
            B-SIDE
          </span>{' '}
          <span
            style={{
              color: 'var(--neon-cian-claro)',
              textShadow: '0 0 4px #35D0E8, 0 0 14px #35D0E8, 0 0 30px rgba(53,208,232,.6)',
            }}
          >
            CLUB
          </span>
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 9,
            letterSpacing: '.3em',
            color: 'var(--crema-tenue)',
            marginTop: 8,
            textTransform: 'uppercase',
          }}
        >
          Panel interno
        </div>
      </Link>

      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--superficie)',
          border: '1px solid var(--borde)',
          borderRadius: 'var(--r-card)',
          padding: 'clamp(24px, 5vw, 36px)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--display)',
            fontSize: 24,
            margin: '0 0 8px',
            lineHeight: 1.1,
            fontWeight: 400,
          }}
        >
          {titulo}
        </h1>
        {bajada && (
          <p style={{ color: 'var(--tinta-tenue)', fontSize: 14, margin: '0 0 24px' }}>{bajada}</p>
        )}
        {children}
      </div>

      {pie && (
        <div style={{ color: 'var(--crema-dim)', fontSize: 13, textAlign: 'center' }}>{pie}</div>
      )}

      <Link
        to="/"
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '.2em',
          color: 'var(--crema-tenue)',
          textTransform: 'uppercase',
        }}
      >
        ← Volver al sitio
      </Link>
    </div>
  );
}
