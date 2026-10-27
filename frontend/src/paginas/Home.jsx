// Home. El primer viewport es el label de un vinilo gigante con la tracklist
// como navegacion (componentes/home/HeroLabel). Abajo, cada seccion con una
// forma distinta: elegidos (grilla de fundas), categorias (cartel de neon
// con una fila por categoria), la cinta con los formatos, la promesa del local (Lado B, oscuro) y
// el cierre naranja. Del Lado B para abajo cada seccion entra al llegar a pantalla
// (lib/useEnPantalla) y tiene su propio movimiento.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, WhatsappLogo } from '@phosphor-icons/react';
import { get, query } from '../lib/api';
import { useConteos } from '../lib/useConteos';
import { useDatosDelLocal } from '../lib/useStoreInfo';
import { linkWhatsApp } from '../lib/contacto';
import CardProducto from '../componentes/CardProducto';
import HeroLabel from '../componentes/home/HeroLabel';
import IconoCategoria from '../componentes/IconoCategoria';
import Neon from '../componentes/Neon';
import { cantidadCon } from '../lib/unidades';
import { useEnPantalla } from '../lib/useEnPantalla';
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
  const [cantidadOfertas, setCantidadOfertas] = useState(0);
  const { total } = useConteos();

  // las ofertas (productos con descuento) primero y despues los destacados,
  // sin repetir los que son las dos cosas; hasta 8 en total
  useEffect(() => {
    const pedir = (filtro) =>
      get(`/productos${query({ ...filtro, pageSize: 8 })}`).catch(() => ({ productos: [], total: 0 }));
    Promise.all([pedir({ conDescuento: 'true' }), pedir({ destacado: 'true' })]).then(([rOfertas, rElegidos]) => {
      const ofertas = rOfertas.productos;
      const elegidos = rElegidos.productos;
      setCantidadOfertas(rOfertas.total ?? ofertas.length);
      const vistos = new Set();
      const lista = [...ofertas, ...elegidos].filter((p) => !vistos.has(p.id) && vistos.add(p.id));
      setDestacados(lista.slice(0, 8));
    });
  }, []);

  // sin destacados cargados la seccion no aporta: mejor no mostrarla
  if (destacados && destacados.length === 0) return null;

  return (
    // los id de las secciones son a donde apunta la tracklist del hero
    <section id="destacados" tabIndex={-1} className={estilos.elegidos} aria-labelledby="elegidos-titulo">
      <div className={estilos.cabecera}>
        <h2 id="elegidos-titulo" className={estilos.h2}>
          Destacados y ofertas
        </h2>
        <div className={estilos.verTodos}>
          {/* las ofertas tienen su propio filtro en el catalogo */}
          {cantidadOfertas > 0 && (
            <Link to="/catalogo?ofertas=1" className={estilos.verTodo}>
              {cantidadOfertas === 1 ? 'Ver la oferta' : `Ver las ${cantidadOfertas} ofertas`}
              <ArrowRight size={16} weight="bold" aria-hidden="true" />
            </Link>
          )}
          <Link to="/catalogo" className={estilos.verTodo}>
            {total !== null ? `Ver los ${total} títulos` : 'Ver el catálogo'}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        </div>
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
  // el neon se enciende la primera vez que el panel se ve, y su titileo se
  // pausa cuando no esta en pantalla
  const refMarco = useEnPantalla({ pausa: true });
  if (categorias.length === 0) return null;

  return (
    <section id="categorias" tabIndex={-1} className={estilos.formatos} aria-labelledby="formatos-titulo">
      {/* un cartel de neon en los dos colores del logo: el borde son dos
          tubos (rosa afuera, cian adentro), el titulo alterna como el logo y
          las filas tambien. Todo se enciende la primera vez que el panel
          llega a pantalla */}
      <div ref={refMarco} className={estilos.formatosMarco} data-oscuro data-entrada>
        {/* cada tubo son dos capas: la de afuera se enciende y la de adentro
            titila. Dos animaciones de opacidad en el mismo elemento no pueden
            ir a la GPU, y corrian en cada cuadro del scroll */}
        <span className={estilos.neonTubo} aria-hidden="true">
          <span className={estilos.neonLuz} />
        </span>
        <span className={estilos.neonTuboInterior} aria-hidden="true">
          <span className={estilos.neonLuz} />
        </span>
        {/* una sola palabra: todo en cian, que equilibra el tubo rosa de afuera */}
        <h2 id="formatos-titulo" className={estilos.formatosTitulo}>
          <span className="sr-only">Categorías</span>
          <Neon texto="Categorías" color="cian" inicio={350} paso={70} />
        </h2>
        <ul className={estilos.filas}>
          {categorias.map((c, i) => (
            <li key={c.id}>
              <Link to={`/catalogo${query({ categoriaId: c.id })}`} className={estilos.fila}>
                <span className={estilos.filaNombre}>{c.nombre}</span>
                <span className={estilos.filaDescripcion}>{c.descripcion}</span>
                <span className={estilos.filaCantidad}>{cantidadCon(c.total, c)}</span>
                <span className={estilos.filaMotivo} aria-hidden="true">
                  <IconoCategoria categoria={c} color={COLORES_FORMATO[i % COLORES_FORMATO.length]} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// La cinta naranja entre Categorias y el Lado B: lo que promete el local,
// pasando sin parar, y al hacer scroll corre un poco mas rapido. Los formatos
// ya pasan en la franja del header, por eso aca van frases. Es decorativa (lo
// mismo se lee abajo, en el Lado B), por eso va aria-hidden.
const FRASES_CINTA = ['Nuevos y usados', 'Garantía de calidad', 'Escala Goldmine', 'Fotos del ejemplar real', 'Reservas por 48 hs'];

function Cinta() {
  const ref = useEnPantalla({ entrada: false, pausa: true });

  // se repiten las frases hasta llenar bien el ancho de una pantalla grande
  const palabras = FRASES_CINTA;
  const tramo = [];
  while (tramo.length < 12) tramo.push(...palabras);
  // dos tramos iguales seguidos: la pista se corre medio largo (-50%) y
  // vuelve a empezar sin que se note el salto
  const dibujarTramo = (copia) => (
    <span key={copia} className={estilos.cintaTramo}>
      {tramo.map((p, n) => (
        <span key={n} className={estilos.cintaPalabra}>
          {p}
          {/* el separador alterna un cassette chiquito y una onda de sonido */}
          <span className={n % 2 ? estilos.cintaOnda : estilos.cintaCassette} />
        </span>
      ))}
    </span>
  );

  return (
    <div ref={ref} className={estilos.cinta} aria-hidden="true">
      <div className={estilos.cintaBanda}>
        <div className={estilos.cintaScroll}>
          <div className={estilos.cintaPista}>
            {dibujarTramo(0)}
            {dibujarTramo(1)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LadoB() {
  // la seccion solo se observa para pausar el parlante fuera de pantalla
  const refSeccion = useEnPantalla({ entrada: false, pausa: true });
  const refTitulo = useEnPantalla();
  const refPromesas = useEnPantalla();

  return (
    <section ref={refSeccion} id="el-local" tabIndex={-1} className={estilos.ladoB} aria-labelledby="ladob-titulo" data-oscuro>
      {/* el fondo: la trama de puntos (se corre despacio con el scroll) y un
          parlante que asoma por la derecha: el cono late al ritmo y salen
          ondas de sonido hacia el texto */}
      <div className={estilos.ladoBTrama} aria-hidden="true" />
      <div className={estilos.parlante} aria-hidden="true">
        <div className={estilos.parlanteScroll}>
          <span className={estilos.onda} style={{ '--n': 0 }} />
          <span className={estilos.onda} style={{ '--n': 1 }} />
          <span className={estilos.onda} style={{ '--n': 2 }} />
          <div className={estilos.parlanteMarco} />
          <div className={estilos.parlanteCono} />
        </div>
      </div>

      <div className={estilos.ladoBInterior}>
        {/* renglon por renglon; al final se subraya a mano "se encuentra." */}
        <h2 ref={refTitulo} data-entrada id="ladob-titulo" className={estilos.ladoBTitulo}>
          <span className="revela" style={{ '--i': 0 }}>
            <span>Un disco</span>
          </span>{' '}
          <span className="revela" style={{ '--i': 1 }}>
            <span>no se compra,</span>
          </span>{' '}
          <span className={`revela ${estilos.lineaSubrayada}`} style={{ '--i': 2 }}>
            <span>
              <span className={estilos.ladoBAcento}>
                se encuentra.
                <svg className={estilos.subrayado} viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M4 15 C 52 7, 98 19, 150 12 S 246 6, 296 14" pathLength="1" />
                </svg>
              </span>
            </span>
          </span>
        </h2>
        <dl ref={refPromesas} data-entrada className={estilos.promesas}>
          {PROMESAS.map((p, i) => (
            <div key={p.titulo} style={{ '--i': i }}>
              <dt>
                <span className={estilos.promesaNumero} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                {p.titulo}
              </dt>
              <dd>{p.texto}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// las marcas del dial de FM del cierre
const FRECUENCIAS = [88, 92, 96, 100, 104, 108];

function Cierre() {
  const { info, nombre } = useDatosDelLocal();
  const whatsapp = linkWhatsApp(info?.whatsapp, `Hola ${nombre}! Estoy buscando un disco:`);
  const ref = useEnPantalla({ pausa: true });

  return (
    <section ref={ref} id="pedi-tu-disco" tabIndex={-1} data-entrada className={estilos.cierre} aria-labelledby="cierre-titulo">
      <div className={estilos.cierreInterior}>
        <h2 id="cierre-titulo" className={estilos.cierreTitulo}>
          <span className="revela">
            <span>¿Buscás algo puntual?</span>
          </span>
        </h2>
        <p className={`${estilos.cierreTexto} entra`} style={{ '--i': 2 }}>
          Decinos qué disco estás buscando y lo anotamos. Cuando entra, te avisamos antes de
          publicarlo.
        </p>
        <div className={`${estilos.cierreAcciones} entra`} style={{ '--i': 3 }}>
          {whatsapp && (
            <a className={`btn ${estilos.botonOscuro}`} href={whatsapp} target="_blank" rel="noreferrer">
              <WhatsappLogo size={18} weight="bold" /> Pedilo por WhatsApp
            </a>
          )}
          <Link className={`btn ${estilos.botonLinea}`} to="/contacto">
            Dejar un mensaje
          </Link>
        </div>

        {/* el frente de una radio: la aguja del dial barre la banda buscando
            y se detiene en una frecuencia (lo mismo que hacemos con el disco
            que nos pidas). La perilla de sintonia gira con la aguja, el
            medidor de señal sube al encontrarla y se prende "Estéreo". Todo
            comparte la misma duracion, asi va sincronizado */}
        <div className={`${estilos.radio} entra`} style={{ '--i': 4 }} aria-hidden="true">
          <div className={estilos.radioBotones}>
            <span className={estilos.radioBoton}>
              <span className={estilos.led} />
              AM
            </span>
            <span className={`${estilos.radioBoton} ${estilos.radioBotonActivo}`}>
              <span className={`${estilos.led} ${estilos.ledPrendido}`} />
              FM
            </span>
            <span className={estilos.radioBoton}>
              <span className={`${estilos.led} ${estilos.ledEstereo}`} />
              Estéreo
            </span>
          </div>

          <div className={estilos.dial}>
            <div className={estilos.dialEscala}>
              {FRECUENCIAS.map((f) => (
                <span key={f}>{f}</span>
              ))}
            </div>
            <div className={estilos.dialCarro}>
              <span className={estilos.dialAguja} />
            </div>
          </div>

          <div className={estilos.radioControles}>
            <span className={estilos.control}>
              <span className={estilos.senal}>
                <span className={estilos.senalVentana}>
                  <span className={estilos.senalLlena} />
                </span>
              </span>
              <span className={estilos.controlNombre}>Señal</span>
            </span>
            <span className={estilos.control}>
              <span className={estilos.perilla}>
                <span className={`${estilos.perillaGiro} ${estilos.perillaSintonia}`} />
              </span>
              <span className={estilos.controlNombre}>Sintonía</span>
            </span>
            <span className={estilos.control}>
              <span className={estilos.perilla}>
                <span className={`${estilos.perillaGiro} ${estilos.perillaVolumen}`} />
              </span>
              <span className={estilos.controlNombre}>Volumen</span>
            </span>
          </div>
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
      <Cinta />
      <LadoB />
      <Cierre />
    </main>
  );
}
