// Pie con los datos reales del local (vienen de GET /api/store-info).

import { Link } from 'react-router-dom';
import { useStoreInfo } from '../lib/useStoreInfo';

export default function Footer() {
  const { info } = useStoreInfo();

  const col = { display: 'flex', flexDirection: 'column', gap: 8 };
  const label = {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '.2em',
    color: 'var(--naranja)',
    marginBottom: 6,
    textTransform: 'uppercase',
  };
  const linea = { color: 'var(--crema-dim)', fontSize: 14 };

  return (
    <footer
      style={{
        background: 'var(--carbon)',
        color: 'var(--crema)',
        borderTop: '1px solid var(--borde-oscuro)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--ancho)',
          margin: '0 auto',
          padding: '48px 18px 30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 34,
        }}
      >
        <div style={col}>
          <div style={{ fontFamily: 'var(--display)', fontSize: 22, lineHeight: 1.1 }}>
            <span style={{ color: 'var(--neon-rosa)' }}>B-SIDE</span>{' '}
            <span style={{ color: 'var(--neon-cian)' }}>CLUB</span>
          </div>
          <div style={{ ...linea, maxWidth: 260 }}>
            {info?.description || 'Disquería en Chacarita. Escuchamos todo antes de vender.'}
          </div>
        </div>

        <div style={col}>
          <div style={label}>Dónde</div>
          <div style={linea}>{info?.direccion || 'Chacarita, Buenos Aires'}</div>
          {info?.horario && typeof info.horario === 'object' && (
            <div style={{ ...linea, fontFamily: 'var(--mono)', fontSize: 12 }}>
              {Object.entries(info.horario).map(([dia, hs]) => (
                <div key={dia}>
                  {dia}: {String(hs)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={col}>
          <div style={label}>Contacto</div>
          {info?.telefono && <div style={linea}>{info.telefono}</div>}
          {info?.email && (
            <a href={`mailto:${info.email}`} style={linea}>
              {info.email}
            </a>
          )}
          {info?.whatsapp && (
            <a
              href={`https://wa.me/${String(info.whatsapp).replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              style={linea}
            >
              WhatsApp
            </a>
          )}
          {info?.instagram && (
            <a
              href={`https://instagram.com/${String(info.instagram).replace(/^@/, '')}`}
              target="_blank"
              rel="noreferrer"
              style={linea}
            >
              {info.instagram.startsWith('@') ? info.instagram : `@${info.instagram}`}
            </a>
          )}
        </div>

        <div style={col}>
          <div style={label}>Sitio</div>
          <Link to="/catalogo" style={linea}>
            Catálogo
          </Link>
          <Link to="/nosotros" style={linea}>
            Nosotros
          </Link>
          <Link to="/contacto" style={linea}>
            Contacto
          </Link>
          <Link to="/login" style={linea}>
            Panel interno
          </Link>
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--borde-oscuro)',
          padding: '16px 18px',
          textAlign: 'center',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '.2em',
          color: '#6B625D',
          textTransform: 'uppercase',
        }}
      >
        {info?.nombre || 'B-Side Club'} · Buenos Aires, Argentina
      </div>
    </footer>
  );
}
