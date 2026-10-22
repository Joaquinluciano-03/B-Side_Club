// Primer viewport de la Home: el label central de un vinilo gigante.
// La tracklist del label ES la navegacion (A = el catalogo, B = el local), y
// al pasar por un tema "baja la pua" hasta esa fila. El buscador del pie del
// label lleva al catalogo con la busqueda hecha.

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { query } from '../../lib/api';
import { useConteos } from '../../lib/useConteos';
import { useDatosDelLocal } from '../../lib/useStoreInfo';
import { horarioDeHoy } from '../../lib/horario';
import Neon from '../Neon';
import estilos from './HeroLabel.module.css';

function cantidad(n, singular, plural) {
  if (n === null || n === undefined) return '';
  return `${n} ${n === 1 ? singular : plural}`;
}

function Tracklist({ temas, className }) {
  const [activa, setActiva] = useState(0);

  return (
    <div className={`${estilos.tracklist} ${className || ''}`} style={{ '--activa': activa }}>
      {/* la pua: se desliza hasta el tema que tiene el mouse o el foco */}
      <span className={estilos.pua} aria-hidden="true" />
      <ol>
        {temas.map((t, i) => (
          // --n escalona la entrada de cada tema (ver HeroLabel.module.css)
          <li key={t.lado} style={{ '--n': i }}>
            {t.a ? (
              <Link
                to={t.a}
                viewTransition={t.a === '/nosotros'}
                className={estilos.tema}
                onMouseEnter={() => setActiva(i)}
                onFocus={() => setActiva(i)}
              >
                <span className={estilos.lado}>{t.lado}</span>
                <span className={estilos.nombre}>{t.nombre}</span>
                <span className={estilos.dato}>{t.dato}</span>
              </Link>
            ) : (
              // fila de relleno mientras llegan las categorias: misma altura,
              // asi la tracklist no salta cuando aparecen
              <span className={`${estilos.tema} ${estilos.temaCargando}`} aria-hidden="true">
                <span className={estilos.lado}>{t.lado}</span>
                <span className={estilos.barra} />
                <span />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

// Pausa las animaciones que no terminan nunca (el disco, la luz del cartel,
// el tubo flojo) mientras el hero esta fuera de pantalla: nadie las ve y la
// GPU igual las tendria que mover en cada cuadro. Al volver siguen de donde
// estaban. Se marca con data-quieto en la seccion (ver HeroLabel.module.css).
function usePausarFueraDePantalla() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(([e]) => {
      el.toggleAttribute('data-quieto', !e.isIntersecting);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function HeroLabel() {
  const navigate = useNavigate();
  const heroRef = usePausarFueraDePantalla();
  // todo lo impreso en el label sale de la base (Info del local y categorias)
  const { info, nombre, zona: barrio } = useDatosDelLocal();
  const { total, categorias: todas, cargando } = useConteos();
  // el lado A tiene lugar para tres formatos ademas de "recien llegados"
  const categorias = todas.slice(0, 3);
  const [busqueda, setBusqueda] = useState('');

  const hoy = horarioDeHoy(info?.horario);

  // el tamaño se ajusta al largo del nombre para que entre en el label
  const tamTitulo = `${Math.min(11.2, 78 / (nombre.length * 0.78)).toFixed(2)}cqw`;

  const temas = [
    { lado: 'A1', nombre: 'Recién llegados', a: '/catalogo', dato: cantidad(total, 'título', 'títulos') },
    ...(cargando
      ? ['A2', 'A3', 'A4'].map((lado) => ({ lado, a: null }))
      : categorias.map((c, i) => ({
          lado: `A${i + 2}`,
          nombre: c.nombre,
          a: `/catalogo${query({ categoriaId: c.id })}`,
          dato: c.total ?? '',
        }))),
    { lado: 'B1', nombre: 'El local', a: '/nosotros', dato: hoy ? `Hoy ${hoy.value}` : barrio || '' },
    { lado: 'B2', nombre: 'Escribinos', a: '/contacto', dato: 'WhatsApp' },
  ];

  function buscar(e) {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(`/catalogo${query({ q })}`);
  }

  return (
    <section ref={heroRef} className={estilos.hero} aria-labelledby="hero-titulo" data-oscuro>
      <div className={estilos.label}>
        {/* detras del label, centrados en el: la sombra sobre la mesa (quieta),
            el vinilo (gira) y los reflejos de la luz (quietos: la luz no se
            mueve, el disco si) */}
        <span className={estilos.sombra} aria-hidden="true" />
        {/* tres capas anidadas, una rotacion cada una (ver HeroLabel.module.css) */}
        <span className={estilos.vinilo} aria-hidden="true">
          <span className={estilos.viniloScroll}>
            <span className={estilos.viniloArranque}>
              <span className={estilos.viniloGiro} />
            </span>
          </span>
        </span>
        <span className={estilos.brillo} aria-hidden="true" />

        <p className={estilos.catalogo}>
          {['Disquería', barrio, '33⅓ RPM'].filter(Boolean).join(' · ')}
        </p>
        {/* el cartel y el buscador van en una columna: el ancho lo pone el
            cartel (segun el nombre) y el buscador se estira hasta igualarlo */}
        <div className={estilos.cartel}>
          {/* el nombre como cartel de neon sobre una placa oscura */}
          <div className={estilos.placa}>
            <span className={estilos.luz} aria-hidden="true" />
            <h1 id="hero-titulo" className={estilos.titulo} style={{ fontSize: tamTitulo }} aria-label={nombre}>
              <Neon texto={nombre} />
            </h1>
          </div>

          <form className={estilos.buscador} role="search" onSubmit={buscar}>
            <label htmlFor="hero-buscar" className="sr-only">
              Buscar en el catálogo
            </label>
            <input
              id="hero-buscar"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar artista, disco o sello"
              autoComplete="off"
            />
            <button type="submit" aria-label="Buscar">
              <MagnifyingGlass size={18} weight="bold" />
            </button>
          </form>
        </div>

        <span className={estilos.agujero} aria-hidden="true" />

        <Tracklist temas={temas} className={estilos.tracklistLabel} />
      </div>

      {/* en mobile la tracklist sale del label y sigue debajo, como contratapa */}
      <Tracklist temas={temas} className={estilos.tracklistAfuera} />
    </section>
  );
}
