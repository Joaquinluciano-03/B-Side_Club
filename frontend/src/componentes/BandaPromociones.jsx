// Banda de novedades de la home. Solo aparece si hay alguna promo vigente:
// una seccion vacia con el titulo "NOVEDADES" se ve peor que no tenerla.

import { useEffect, useState } from 'react';
import { get } from '../lib/api';
import { vigentes } from '../lib/promociones';
import { formatearDia } from '../lib/formato';

function Tarjeta({ promo }) {
  const hastaCuando = promo.fechaFin ? `Hasta el ${formatearDia(promo.fechaFin)}` : null;

  return (
    <article
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 'var(--r-card)',
        border: '1px solid var(--borde-oscuro)',
        background: promo.imagenUrl
          ? 'var(--negro)'
          : 'radial-gradient(circle at 50% 50%, rgba(242,236,228,.10) 0 1px, transparent 1.2px) 0 0/9px 9px, var(--madera)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 190,
      }}
    >
      {promo.imagenUrl && (
        <>
          <img
            src={promo.imagenUrl}
            alt=""
            loading="lazy"
            onError={(e) => {
              // si la URL esta rota, escondemos la imagen y queda el fondo con trama
              e.currentTarget.style.display = 'none';
            }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(12,11,10,.25), rgba(12,11,10,.88))',
            }}
          />
        </>
      )}

      <div
        style={{
          position: 'relative',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flex: 1,
        }}
      >
        <h3
          style={{
            fontFamily: 'var(--display)',
            fontSize: 20,
            color: 'var(--crema)',
            margin: 0,
            lineHeight: 1.15,
            fontWeight: 400,
          }}
        >
          {promo.titulo}
        </h3>

        {promo.descripcion && (
          <p
            style={{
              color: 'var(--crema-dim)',
              fontSize: 14,
              margin: 0,
              textWrap: 'pretty',
            }}
          >
            {promo.descripcion}
          </p>
        )}

        {hastaCuando && (
          <div
            style={{
              marginTop: 'auto',
              paddingTop: 10,
              fontFamily: 'var(--mono)',
              fontSize: 10,
              letterSpacing: '.18em',
              color: 'var(--naranja)',
              textTransform: 'uppercase',
            }}
          >
            {hastaCuando}
          </div>
        )}
      </div>
    </article>
  );
}

export default function BandaPromociones() {
  const [promos, setPromos] = useState([]);

  useEffect(() => {
    // soloActivas filtra por el flag; la ventana de fechas la filtramos acá
    get('/promociones?soloActivas=true')
      .then((lista) => setPromos(vigentes(lista)))
      .catch(() => setPromos([]));
  }, []);

  if (promos.length === 0) return null;

  return (
    <section style={{ maxWidth: 'var(--ancho)', margin: '0 auto', padding: '20px 18px 40px' }}>
      <div
        className="kicker"
        style={{ color: 'var(--neon-rosa)', marginBottom: 18, letterSpacing: '.24em' }}
      >
        Novedades
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(${promos.length === 1 ? '100%' : '280px'}, 1fr))`,
          gap: 14,
        }}
      >
        {promos.map((p) => (
          <Tarjeta key={p.id} promo={p} />
        ))}
      </div>
    </section>
  );
}
