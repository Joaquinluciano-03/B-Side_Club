// Home. El primer viewport es el label de un vinilo gigante con la tracklist
// como navegacion (componentes/home/HeroLabel). Abajo, cada seccion con una
// forma distinta: elegidos (grilla de fundas), formatos (separadores en
// filas), la promesa del local (Lado B, oscuro) y el cierre naranja.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, WhatsappLogo } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { useConteos } from '../lib/useConteos';
import { useStoreInfo } from '../lib/useStoreInfo';
import { linkWhatsApp } from '../lib/contacto';
import CardProducto from '../componentes/CardProducto';
import HeroLabel from '../componentes/home/HeroLabel';
import { MotivoCategoria } from '../componentes/ArteProducto';
import BandaPromociones from '../componentes/BandaPromociones';
import { SkeletonGrilla } from '../componentes/Estados';
import estilos from './Home.module.css';

const COLORES_FORMATO = ['#F26A1B', '#0E8FA6', '#C41E75', '#9A6100', '#5B45B8'];

const PROMESAS = [
  {
    titulo: 'Garantía de calidad',
    texto: 'Cada disco, nuevo o usado, se revisa antes de entrar al catálogo. Si tiene algún detalle, lo decimos en la ficha.',
  },
  {
    titulo: 'Estado real, sin vueltas',
    texto: 'Usamos la escala Goldmine para vinilo y tapa, y fotos del ejemplar exacto que te llevás.',
  },
  {
    titulo: 'Reservas por mensaje',
    texto: 'Te lo guardamos 48 hs. Escribinos por WhatsApp o Instagram y pasá a buscarlo.',
  },
];

function Elegidos() {
  const [destacados, setDestacados] = useState(null);
  const { total } = useConteos();

  // las ofertas (productos con descuento) primero y despues los destacados,
  // sin repetir los que son las dos cosas; hasta 8 en total
  useEffect(() => {
    const pedir = (filtro) =>
      get(`/productos${query({ ...filtro, pageSize: 8 })}`)
        .then((r) => r.productos)
        .catch(() => []);
    Promise.all([pedir({ conDescuento: 'true' }), pedir({ destacado: 'true' })]).then(([ofertas, elegidos]) => {
      const vistos = new Set();
      const lista = [...ofertas, ...elegidos].filter((p) => !vistos.has(p.id) && vistos.add(p.id));
      setDestacados(lista.slice(0, 8));
    });
  }, []);

  // sin destacados cargados la seccion no aporta: mejor no mostrarla
  if (destacados && destacados.length === 0) return null;

  return (
    <section className={estilos.elegidos} aria-labelledby="elegidos-titulo">
      <div className={estilos.cabecera}>
        <h2 id="elegidos-titulo" className={estilos.h2}>
          Destacados y ofertas
        </h2>
        <Link to="/catalogo" className={estilos.verTodo}>
          {total !== null ? `Ver los ${total} títulos` : 'Ver el catálogo'}
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </Link>
      </div>

      {destacados === null ? (
        <SkeletonGrilla cantidad={4} />
      ) : (
        <div className={estilos.carril}>
          {destacados.map((p, i) => (
            <div key={p.id} className={estilos.carrilItem}>
              <CardProducto producto={p} prioridad={i < 2} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Formatos() {
  const { categorias } = useConteos();
  if (categorias.length === 0) return null;

  return (
    <section className={estilos.formatos} aria-labelledby="formatos-titulo">
      <h2 id="formatos-titulo" className={`${estilos.h2} ${estilos.formatosTitulo}`}>
        Por formato
      </h2>
      <ul className={estilos.filas}>
        {categorias.map((c, i) => (
          <li key={c.id}>
            <Link to={`/catalogo${query({ categoriaId: c.id })}`} className={estilos.fila}>
              <span className={estilos.filaNombre}>{c.nombre}</span>
              <span className={estilos.filaDescripcion}>{c.descripcion}</span>
              <span className={estilos.filaCantidad}>
                {c.total ?? ''} {c.total === 1 ? 'título' : 'títulos'}
              </span>
              <span className={estilos.filaMotivo} aria-hidden="true">
                <MotivoCategoria categoria={c.nombre} color={COLORES_FORMATO[i % COLORES_FORMATO.length]} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LadoB() {
  return (
    <section className={estilos.ladoB} aria-labelledby="ladob-titulo" data-oscuro>
      <div className={estilos.ladoBInterior}>
        <h2 id="ladob-titulo" className={estilos.ladoBTitulo}>
          Un disco no se compra,
          <br />
          <span className={estilos.ladoBAcento}>se encuentra.</span>
        </h2>
        <dl className={estilos.promesas}>
          {PROMESAS.map((p) => (
            <div key={p.titulo}>
              <dt>{p.titulo}</dt>
              <dd>{p.texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Cierre() {
  const { info } = useStoreInfo();
  const whatsapp = linkWhatsApp(info?.whatsapp, 'Hola B-Side Club! Estoy buscando un disco:');

  return (
    <section className={estilos.cierre} aria-labelledby="cierre-titulo">
      <div className={estilos.cierreInterior}>
        <h2 id="cierre-titulo" className={estilos.cierreTitulo}>
          ¿Buscás algo puntual?
        </h2>
        <p className={estilos.cierreTexto}>
          Decinos qué disco estás buscando y lo anotamos. Cuando entra, te avisamos antes de
          publicarlo.
        </p>
        <div className={estilos.cierreAcciones}>
          {whatsapp && (
            <a className={`btn ${estilos.botonOscuro}`} href={whatsapp} target="_blank" rel="noreferrer">
              <WhatsappLogo size={18} weight="bold" /> Pedilo por WhatsApp
            </a>
          )}
          <Link className={`btn ${estilos.botonLinea}`} to="/contacto">
            Dejar un mensaje
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main>
      <HeroLabel />
      {/* se dibuja sola solo si hay alguna promo vigente */}
      <BandaPromociones />
      <Elegidos />
      <Formatos />
      <LadoB />
      <Cierre />
    </main>
  );
}
