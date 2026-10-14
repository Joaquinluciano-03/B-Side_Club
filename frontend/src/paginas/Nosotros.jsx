// Nosotros. El texto fijo es el relato del local; los datos de contacto y el
// horario salen de GET /api/store-info, que el panel puede editar.

import { Link } from 'react-router-dom';
import { useStoreInfo } from '../lib/useStoreInfo';

const CAPITULOS = [
  {
    n: '01',
    color: 'var(--naranja)',
    titulo: 'Empezó como un cajón',
    texto:
      'Arrancamos vendiendo los duplicados de nuestra propia colección en una feria de Chacarita. Un cajón de verdulería, una lona y una bandeja a pilas para que la gente escuchara antes de comprar. Esa bandeja todavía está en el mostrador.',
  },
  {
    n: '02',
    color: 'var(--neon-cian)',
    titulo: 'Escuchamos todo',
    texto:
      'Cada disco que entra pasa entero por la bandeja antes de llegar al catálogo. Si salta, si tiene ruido de fondo, si la tapa está gastada: lo escribimos en la ficha. Preferimos vender menos y que nadie se lleve una sorpresa.',
  },
  {
    n: '03',
    color: 'var(--neon-rosa)',
    titulo: 'El lado B',
    texto:
      'Nos interesa lo que no entró en el corte difusión: los prensados nacionales raros, los compilados caseros, el cassette que alguien grabó para otra persona. Si buscás algo puntual, escribinos y lo salimos a buscar.',
  },
];

export default function Nosotros() {
  const { info } = useStoreInfo();

  return (
    <main className="contenido">
      <div className="kicker">03 — Nosotros</div>
      <h1 className="titulo">
        LADO B:
        <br />
        <span style={{ color: 'var(--naranja)' }}>LA HISTORIA</span>
      </h1>

      <p
        style={{
          maxWidth: 620,
          margin: '0 0 54px',
          color: 'var(--tinta-suave)',
          fontSize: 17,
          textWrap: 'pretty',
        }}
      >
        {info?.description ||
          'Una disquería chica en Chacarita, especializada en usados que pasaron por la bandeja antes de entrar al catálogo.'}
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: 18,
          marginBottom: 60,
        }}
      >
        {CAPITULOS.map((c) => (
          <article key={c.n} className="card">
            <div
              style={{
                fontFamily: 'var(--display)',
                fontSize: 28,
                color: c.color,
                marginBottom: 12,
              }}
            >
              {c.n}
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 18, margin: '0 0 8px' }}>{c.titulo}</h2>
            <p style={{ color: 'var(--tinta-suave)', fontSize: 15, margin: 0, textWrap: 'pretty' }}>
              {c.texto}
            </p>
          </article>
        ))}
      </div>

      {/* ---------- Visitanos ---------- */}
      <div className="divisor">Visitanos</div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 18,
          marginBottom: 50,
        }}
      >
        <div className="card">
          <div className="etiqueta">Dirección</div>
          <div style={{ fontSize: 17, fontWeight: 700 }}>
            {info?.direccion || 'Chacarita, Buenos Aires'}
          </div>
        </div>

        <div className="card">
          <div className="etiqueta">Horarios</div>
          {info?.horario && typeof info.horario === 'object' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {Object.entries(info.horario).map(([dia, hs]) => (
                <div
                  key={dia}
                  style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 14 }}
                >
                  <span style={{ color: 'var(--meta)', textTransform: 'capitalize' }}>{dia}</span>
                  <span style={{ fontWeight: 700 }}>{String(hs)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--meta)', fontSize: 14 }}>Escribinos y coordinamos.</div>
          )}
        </div>

        <div className="card">
          <div className="etiqueta">Escribinos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 14 }}>
            {info?.telefono && <span>{info.telefono}</span>}
            {info?.email && <a href={`mailto:${info.email}`}>{info.email}</a>}
            {info?.instagram && (
              <a
                href={`https://instagram.com/${String(info.instagram).replace(/^@/, '')}`}
                target="_blank"
                rel="noreferrer"
              >
                {info.instagram.startsWith('@') ? info.instagram : `@${info.instagram}`}
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--madera)',
          color: 'var(--crema)',
          borderRadius: 'var(--r-card)',
          padding: 'clamp(28px, 5vw, 48px)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(22px,4vw,32px)', marginBottom: 12 }}>
          ¿BUSCÁS ALGO PUNTUAL?
        </div>
        <p
          style={{
            color: 'var(--crema-dim)',
            maxWidth: 520,
            margin: '0 auto 26px',
            textWrap: 'pretty',
          }}
        >
          Decinos qué disco estás buscando y lo anotamos en la lista. Cuando entra, te avisamos antes
          de publicarlo.
        </p>
        <Link to="/contacto" className="btn btn-primario" style={{ display: 'inline-block' }}>
          Escribinos
        </Link>
      </div>
    </main>
  );
}
