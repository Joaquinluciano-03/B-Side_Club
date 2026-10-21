// Banda de novedades de la home. Solo aparece si hay alguna promo vigente:
// una seccion vacia con el titulo "Novedades" se ve peor que no tenerla.
// Cada promo es un volante: imagen (si tiene) y texto, con la fecha de fin.

import { useEffect, useState } from 'react';
import { get } from '../lib/api';
import { vigentes } from '../lib/promociones';
import { formatearDia } from '../lib/formato';
import estilos from './BandaPromociones.module.css';

function Volante({ promo }) {
  const [imagenRota, setImagenRota] = useState(false);
  const conImagen = promo.imagenUrl && !imagenRota;

  return (
    <article className={`${estilos.volante} ${conImagen ? estilos.conImagen : ''}`}>
      {conImagen && (
        <img
          className={estilos.imagen}
          src={promo.imagenUrl}
          alt=""
          loading="lazy"
          onError={() => setImagenRota(true)}
        />
      )}
      <div className={estilos.texto}>
        <h3 className={estilos.titulo}>{promo.titulo}</h3>
        {promo.descripcion && <p className={estilos.descripcion}>{promo.descripcion}</p>}
        {promo.fechaFin && <p className={estilos.hasta}>Hasta el {formatearDia(promo.fechaFin)}</p>}
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
    <section className={estilos.banda} aria-labelledby="novedades-titulo">
      <div className={estilos.interior}>
        <h2 id="novedades-titulo" className={estilos.encabezado}>
          Novedades
        </h2>
        <div className={estilos.lista}>
          {promos.map((p) => (
            <Volante key={p.id} promo={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
