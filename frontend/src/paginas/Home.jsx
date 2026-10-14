// Home. El hero es el disco girando con el logo al centro y el texto curvado
// en el surco, tal como lo define la demo.

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { get, query } from '../lib/api';
import CardProducto from '../componentes/CardProducto';
import BandaPromociones from '../componentes/BandaPromociones';
import { SkeletonGrilla } from '../componentes/Estados';

const MARQUEE = [
  'VINILOS',
  'CASSETTES',
  'CDs',
  'EQUIPOS DE AUDIO',
  'PRENSADOS ORIGINALES',
  'ESCUCHAMOS TODO ANTES DE VENDER',
];
const PUNTOS = ['var(--naranja)', 'var(--neon-cian)', 'var(--neon-rosa)'];

function Marquee() {
  const tira = (
    <div style={{ display: 'flex', gap: 26, paddingRight: 26 }}>
      {MARQUEE.map((t, i) => (
        <span key={t} style={{ display: 'contents' }}>
          <span>{t}</span>
          <span style={{ color: PUNTOS[i % PUNTOS.length] }}>●</span>
        </span>
      ))}
    </div>
  );
  return (
    <div
      style={{
        borderTop: '1px solid var(--borde-oscuro)',
        background: 'var(--carbon-2)',
        overflow: 'hidden',
        padding: '11px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          width: 'max-content',
          animation: 'bmarq 26s linear infinite',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          letterSpacing: '.28em',
          color: '#6B625D',
        }}
      >
        {/* dos copias iguales: cuando la primera termina de salir, la segunda
            ya esta en su lugar y el loop no se nota */}
        {tira}
        {tira}
      </div>
    </div>
  );
}

function Hero() {
  const navigate = useNavigate();
  const diametro = 'clamp(268px, 41vw, 452px)';

  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--carbon)',
        color: 'var(--crema)',
        borderBottom: '1px solid var(--borde-oscuro)',
      }}
    >
      {/* resplandor de fondo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(60% 50% at 50% 42%, rgba(242,106,27,.14), transparent 70%), radial-gradient(40% 40% at 18% 12%, rgba(255,79,163,.10), transparent 70%), radial-gradient(40% 40% at 84% 86%, rgba(53,208,232,.09), transparent 70%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 'var(--ancho)',
          margin: '0 auto',
          minHeight: 'max(min(84vh, 720px), 640px)',
          padding: 'clamp(56px,9vw,96px) 18px clamp(44px,7vw,74px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 'clamp(30px,5vh,54px)',
        }}
      >
        {/* el disco */}
        <div style={{ width: diametro, aspectRatio: '1 / 1', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 50% 34%, #2A231C, #191411 70%)',
              border: 'clamp(6px,0.85vw,10px) solid var(--naranja)',
              boxShadow: '0 0 0 1px rgba(0,0,0,.6), inset 0 0 50px rgba(0,0,0,.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'bspin 26s linear infinite',
            }}
          >
            {/* texto curvado siguiendo el surco */}
            <svg
              viewBox="0 0 400 400"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
              }}
            >
              <path id="bsArc" d="M 32,200 A 168,168 0 0 1 368,200" fill="none" />
              <text
                fill="var(--naranja)"
                fontFamily="'Space Mono', monospace"
                fontSize="13.5"
                letterSpacing="3.4"
              >
                <textPath href="#bsArc" startOffset="50%" textAnchor="middle">
                  DISQUERÍA · CHACARITA, BUENOS AIRES
                </textPath>
              </text>
              <path id="bsArcBot" d="M 32,200 A 168,168 0 0 0 368,200" fill="none" />
              <text
                fill="var(--naranja)"
                fontFamily="'Space Mono', monospace"
                fontSize="13.5"
                letterSpacing="3.4"
              >
                <textPath href="#bsArcBot" startOffset="50%" textAnchor="middle">
                  B-SIDE CLUB · ARGENTINA
                </textPath>
              </text>
            </svg>

            <img
              src="/logo.png"
              alt="B-Side Club"
              style={{
                width: 'clamp(168px, 29vw, 290px)',
                height: 'auto',
                display: 'block',
                transform: 'translateX(1.6%)',
              }}
            />

            {/* el agujero del centro */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%,-50%)',
                width: 'clamp(16px,2.4vw,26px)',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                background: 'var(--negro)',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,.9), 0 0 0 1px rgba(242,106,27,.35)',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primario"
            style={{ fontSize: 15, padding: '16px 30px' }}
            onClick={() => navigate('/catalogo')}
          >
            Ver el catálogo
          </button>
          <button
            className="btn btn-secundario-oscuro"
            style={{ fontSize: 15, padding: '15px 29px' }}
            onClick={() => navigate('/nosotros')}
          >
            Conocé el local
          </button>
        </div>
      </div>

      <Marquee />
    </section>
  );
}

const PILARES = [
  {
    n: '01',
    color: 'var(--naranja)',
    titulo: 'Escuchado, no listado',
    texto:
      'Cada disco pasa por la bandeja antes de entrar al catálogo. Si suena mal, lo decimos en la ficha.',
  },
  {
    n: '02',
    color: 'var(--neon-cian)',
    titulo: 'Estado real, sin vueltas',
    texto: 'Usamos escala Goldmine para vinilo y tapa. Fotos del ejemplar exacto que te llevás.',
  },
  {
    n: '03',
    color: 'var(--neon-rosa)',
    titulo: 'Reservas por mensaje',
    texto: 'Te lo guardamos 48 hs. Escribinos por WhatsApp o Instagram y pasá a escucharlo.',
  },
];

export default function Home() {
  const [destacados, setDestacados] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(null);

  useEffect(() => {
    // los destacados y las categorias son independientes: si una falla,
    // la otra igual se muestra
    get(`/productos${query({ destacado: 'true', pageSize: 4 })}`)
      .then((r) => setDestacados(r.productos))
      .catch(() => setDestacados([]));

    get('/categorias')
      .then(setCategorias)
      .catch(() => setCategorias([]));

    get(`/productos${query({ pageSize: 1 })}`)
      .then((r) => setTotal(r.total))
      .catch(() => {});
  }, []);

  return (
    <main>
      <Hero />

      {/* se dibuja sola solo si hay alguna promo vigente */}
      <BandaPromociones />

      {/* ---------- Destacados ---------- */}
      <section style={{ maxWidth: 'var(--ancho)', margin: '0 auto', padding: '64px 18px 20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 18,
            flexWrap: 'wrap',
            marginBottom: 26,
          }}
        >
          <div>
            <div className="kicker" style={{ marginBottom: 10 }}>
              Lado A — Recién llegados
            </div>
            <h2 className="titulo-seccion">DESTACADOS</h2>
          </div>
          <Link to="/catalogo" className="btn-enlace" style={{ alignSelf: 'flex-end' }}>
            {total !== null ? `Ver los ${total} títulos →` : 'Ver el catálogo →'}
          </Link>
        </div>

        {destacados === null ? (
          <SkeletonGrilla cantidad={4} />
        ) : destacados.length > 0 ? (
          <div className="grilla-productos">
            {destacados.map((p) => (
              <CardProducto key={p.id} producto={p} />
            ))}
          </div>
        ) : (
          <div className="vacio">
            <div className="vacio-titulo">TODAVÍA NO HAY DESTACADOS</div>
            <div className="vacio-texto">
              Marcá productos como destacados desde el panel para que aparezcan acá.
            </div>
          </div>
        )}
      </section>

      {/* ---------- Por formato ---------- */}
      {categorias.length > 0 && (
        <section style={{ maxWidth: 'var(--ancho)', margin: '0 auto', padding: '56px 18px' }}>
          <div
            className="kicker"
            style={{ color: 'var(--tinta-tenue)', marginBottom: 20, letterSpacing: '.24em' }}
          >
            Por formato
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
            }}
          >
            {categorias.map((c) => (
              <Link
                key={c.id}
                to={`/catalogo${query({ categoriaId: c.id })}`}
                className="card tarjeta-categoria"
                style={{
                  color: 'inherit',
                  transition: 'border-color .15s, transform .15s',
                  display: 'block',
                }}
              >
                <div
                  style={{
                    height: 70,
                    borderRadius: 10,
                    background:
                      'repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0 2px, rgba(255,255,255,.07) 2px 3px), radial-gradient(circle at 50% 50%, var(--naranja) 0 16%, var(--negro) 16.5% 100%)',
                  }}
                />
                <div style={{ fontFamily: 'var(--display)', fontSize: 19, marginTop: 16 }}>
                  {c.nombre}
                </div>
                <div style={{ color: 'var(--tinta-dim)', fontSize: 13, marginTop: 5 }}>
                  {c.descripcion || 'Ver todo'}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Pilares ---------- */}
      <section
        style={{
          borderTop: '1px solid var(--borde-oscuro)',
          borderBottom: '1px solid var(--borde-oscuro)',
          background: 'var(--madera)',
          color: 'var(--crema)',
        }}
      >
        <div
          style={{
            maxWidth: 'var(--ancho)',
            margin: '0 auto',
            padding: '56px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 34,
          }}
        >
          {PILARES.map((p) => (
            <div key={p.n}>
              <div
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 28,
                  color: p.color,
                  marginBottom: 12,
                }}
              >
                {p.n}
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 8 }}>{p.titulo}</div>
              <div style={{ color: 'var(--crema-dim)', fontSize: 15, textWrap: 'pretty' }}>
                {p.texto}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
