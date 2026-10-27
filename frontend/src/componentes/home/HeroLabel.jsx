// Primer viewport de la Home: el label central de un vinilo gigante.
// La tracklist del label es el indice de la Home: cada tema lleva a una
// seccion (A = los discos, B = el local), y al pasar por un tema "baja la
// pua" hasta esa fila. Arriba del label, el cartel de abierto/cerrado con el
// horario de hoy. El buscador lleva al catalogo con la busqueda hecha.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ArrowDown } from '@phosphor-icons/react';
import { query } from '../../lib/api';
import { useDatosDelLocal } from '../../lib/useStoreInfo';
import { horarioDeHoy, textoDeHoy } from '../../lib/horario';
import { usePromocionesVigentes } from '../../lib/usePromociones';
import { irAlScroll } from '../../lib/scrollSuave';
import Neon from '../Neon';
import CartelAbierto from '../CartelAbierto';
import estilos from './HeroLabel.module.css';

// Lleva a una seccion de la Home deslizando, y la deja justo debajo del
// header (que queda pegado arriba). El foco pasa a la seccion: con teclado o
// lector de pantalla se sigue leyendo desde ahi.
function irASeccion(evento, id) {
  const seccion = document.getElementById(id);
  if (!seccion) return;
  evento.preventDefault();
  const alto = document.querySelector('header')?.offsetHeight || 0;
  irAlScroll(seccion.getBoundingClientRect().top + window.scrollY - alto - 8, { suave: true });
  seccion.focus({ preventScroll: true });
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
            {t.id ? (
              <a
                href={`#${t.id}`}
                className={estilos.tema}
                onClick={(e) => irASeccion(e, t.id)}
                onMouseEnter={() => setActiva(i)}
                onFocus={() => setActiva(i)}
              >
                <span className={estilos.lado}>{t.lado}</span>
                <span className={estilos.nombre}>{t.nombre}</span>
                {/* la flechita dice que el tema lleva mas abajo en la pagina */}
                <span className={estilos.dato} aria-hidden="true">
                  <ArrowDown size={14} weight="bold" />
                </span>
              </a>
            ) : (
              // fila de relleno mientras se sabe si hay novedades: misma
              // altura, asi la tracklist no salta cuando aparecen
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

export default function HeroLabel() {
  const navigate = useNavigate();
  // todo lo impreso en el label sale de la base (Info del local y categorias)
  const { info, nombre, zona: barrio } = useDatosDelLocal();
  const promos = usePromocionesVigentes();
  const [busqueda, setBusqueda] = useState('');

  const hoy = horarioDeHoy(info?.horario);

  // el tamaño se ajusta al largo del nombre para que entre en el label
  const tamTitulo = `${Math.min(11.2, 78 / (nombre.length * 0.78)).toFixed(2)}cqw`;

  // los temas son las secciones de la Home, en orden. Novedades solo si hay
  // alguna promocion vigente (mientras se sabe, una fila de relleno)
  const ladoA = [
    ...(promos === null ? [{ cargando: true }] : promos.length ? [{ id: 'novedades', nombre: 'Novedades' }] : []),
    { id: 'destacados', nombre: 'Destacados' },
    { id: 'categorias', nombre: 'Categorías' },
  ];
  const ladoB = [
    { id: 'el-local', nombre: 'El local' },
    { id: 'pedi-tu-disco', nombre: 'Pedí tu disco' },
  ];
  const temas = [
    ...ladoA.map((t, i) => ({ ...t, lado: `A${i + 1}` })),
    ...ladoB.map((t, i) => ({ ...t, lado: `B${i + 1}` })),
  ];

  function buscar(e) {
    e.preventDefault();
    const q = busqueda.trim();
    navigate(`/catalogo${query({ q })}`);
  }

  // Las animaciones del hero (el disco, la luz del cartel, el tubo flojo)
  // siguen aunque el hero no se vea: son todas de las que van en la GPU y
  // fuera de pantalla casi no cuestan. Antes se pausaban al salir, pero
  // pausar y reanudar todo el hero de golpe rearmaba sus capas grandes y
  // trababa el scroll justo donde Novedades pasa bajo el header.
  return (
    <section className={estilos.hero} aria-labelledby="hero-titulo" data-oscuro>
      <div className={estilos.label}>
        {/* detras del label, centrados en el: la sombra sobre la mesa (quieta),
            el vinilo (gira) y los reflejos de la luz (quietos: la luz no se
            mueve, el disco si) */}
        <span className={estilos.sombra} aria-hidden="true" />
        {/* dos capas anidadas, una rotacion cada una (ver HeroLabel.module.css) */}
        <span className={estilos.vinilo} aria-hidden="true">
          <span className={estilos.viniloArranque}>
            <span className={estilos.viniloGiro} />
          </span>
        </span>
        <span className={estilos.brillo} aria-hidden="true" />

        {/* el horario de hoy, centrado arriba de todo: el cartel de
            abierto/cerrado y el horario del dia */}
        <p className={estilos.hoy}>
          <CartelAbierto horario={info?.horario} className={estilos.cartelAbierto} />
          {hoy && <span>{textoDeHoy(hoy)}</span>}
        </p>
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

        {/* en el celular la tracklist no esta: la mitad de abajo del disco
            queda para el cartel de abierto/cerrado, grande */}
        <span className={estilos.cartelMovil}>
          <CartelAbierto horario={info?.horario} />
        </span>

        <Tracklist temas={temas} className={estilos.tracklistLabel} />
      </div>

      {/* en mobile la tracklist sale del label y sigue debajo, como contratapa */}
      <Tracklist temas={temas} className={estilos.tracklistAfuera} />
    </section>
  );
}
