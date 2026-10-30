// Nosotros: el Lado B. Toda la pagina va en carbon y son tres partes, cada
// una con un solo movimiento:
//   1. la cabecera, con el cassette sonando (la cinta avanza con el scroll);
//   2. la caratula del cassette (la tarjeta de papel plegada que viene en la
//      cajita): la historia del local son los temas del lado B (B1, B2, B3).
//      Cuando llega a pantalla, el frente se despliega desde el lomo;
//   3. la visita: direccion, horario y como escribirnos.
// Los datos de contacto y el horario salen de GET /api/store-info, que el
// panel puede editar.

import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from '@phosphor-icons/react';
import { useDatosDelLocal } from '../lib/useStoreInfo';
import { normalizarHorario, horarioDeHoy } from '../lib/horario';
import { linkMapa } from '../lib/contacto';
import { useEnPantalla } from '../lib/useEnPantalla';
import Cassette from '../componentes/Cassette';
import PorLetras from '../componentes/PorLetras';
import CartelAbierto from '../componentes/CartelAbierto';
import estilos from './Nosotros.module.css';

// los temas del lado B
const temas = () => [
  {
    lado: 'B1',
    titulo: 'Como empezamos',
    texto:
      'Todo arrancó con la colección de vinilos de un tío que se mudó y no tenía lugar para llevarla. Eran unos 300 discos, mucho rock nacional y algo de jazz. Los fuimos vendiendo de a poco en el barrio y después empezamos a comprar colecciones de otros.',
  },
  {
    lado: 'B2',
    titulo: 'Garantía de calidad',
    texto:
      'Cada disco que entra, nuevo o usado, se revisa antes de llegar al catálogo. Si salta, si tiene ruido de fondo, si la tapa está gastada: lo escribimos en la ficha. Preferimos vender menos y que nadie se lleve una sorpresa.',
  },
  {
    lado: 'B3',
    titulo: 'El lado B',
    texto:
      'Además de lo conocido, tenemos discos que no se consiguen fácil: ediciones nacionales viejas, compilados y algún cassette. Si buscás algo en particular, escribinos.',
  },
];

export default function Nosotros() {
  const { info, nombre, barrio } = useDatosDelLocal();
  const horario = normalizarHorario(info?.horario);
  const hoy = horarioDeHoy(info?.horario);
  const refCaratula = useEnPantalla();
  const refVisita = useEnPantalla();
  const lista = temas();

  return (
    <main className={estilos.pagina} data-oscuro>
      <header className={`${estilos.cabecera} cascada`}>
        <p className={estilos.lado}>Lado B</p>
        {/* arriba a la derecha, un cassette sonando (el lado B) */}
        <div className={estilos.deck} aria-hidden="true">
          <Cassette alScroll />
        </div>
        <h1 className={estilos.titulo}>
          <PorLetras texto="La historia" claseLetra={estilos.letraTitulo} />
        </h1>
        <p className={estilos.bajada}>
          {info?.description ||
            `Una disquería chica${barrio ? ` en ${barrio}` : ''}: discos nuevos o usados, todos con garantía de calidad.`}
        </p>
      </header>

      {/* La caratula del cassette: el lomo (con el nombre, como se lee en el
          estante) y el frente con la lista de temas. Es del mismo papel que
          la etiqueta del cassette de arriba: crema, franja naranja y
          renglones */}
      <section ref={refCaratula} data-entrada className={estilos.caratula} aria-labelledby="caratula-titulo">
        <div className={estilos.tarjeta}>
          <div className={estilos.lomo} aria-hidden="true">
            <span className={estilos.lomoTexto}>
              {nombre} <span className={estilos.lomoPunto} /> Lado B <span className={estilos.lomoPunto} /> C90
            </span>
          </div>
          <div className={estilos.frente}>
            <div className={estilos.frenteBanda}>
              <h2 id="caratula-titulo" className={estilos.frenteTitulo}>
                Lista de temas
              </h2>
              <span className={estilos.frenteSub}>Lado B · Mix de la casa</span>
            </div>
            <ol className={estilos.temas}>
              {lista.map((t, i) => (
                <li key={t.lado} className={estilos.tema} style={{ '--i': i }}>
                  <span className={estilos.temaLado}>{t.lado}</span>
                  <h3 className={estilos.temaTitulo}>{t.titulo}</h3>
                  <p className={estilos.temaTexto}>{t.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section ref={refVisita} data-entrada className={estilos.visita} aria-labelledby="visita-titulo">
        <div>
          <h2 id="visita-titulo" className={estilos.visitaTitulo}>
            <span className="revela">
              <span>Pasá a visitarnos</span>
            </span>
          </h2>
          {info?.direccion && (
            <a
              href={linkMapa(info.direccion)}
              target="_blank"
              rel="noreferrer"
              className={`${estilos.direccion} entra`}
              style={{ '--i': 1 }}
            >
              <MapPin size={22} weight="duotone" aria-hidden="true" />
              {info.direccion}
            </a>
          )}
          {hoy && (
            <p className={`${estilos.hoy} entra`} style={{ '--i': 2 }}>
              <CartelAbierto horario={info?.horario} />
              {/* "Hoy abrimos Cerrado" no se lee bien */}
              {/cerrad/i.test(hoy.value) ? (
                <span>Hoy no abrimos</span>
              ) : (
                <span>
                  Hoy abrimos <strong>{hoy.value}</strong>
                </span>
              )}
            </p>
          )}
          <div className="entra" style={{ '--i': 3 }}>
            <Link to="/contacto" className={`btn btn-primario ${estilos.cta}`}>
              Escribinos <ArrowRight size={16} weight="bold" />
            </Link>
          </div>
        </div>

        {horario.length > 0 && (
          <dl className={estilos.horario}>
            {horario.map((fila, i) => (
              <div
                key={fila.label}
                className={fila.label === hoy?.label ? estilos.esHoy : undefined}
                style={{ '--i': i }}
              >
                <dt>{fila.label}</dt>
                <dd>{fila.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>
    </main>
  );
}
