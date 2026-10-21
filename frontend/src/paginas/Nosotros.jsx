// Nosotros: el Lado B. Toda la pagina va en carbon; la historia del local
// son los temas del lado B (B1, B2, B3). Los datos de contacto y el horario
// salen de GET /api/store-info, que el panel puede editar.

import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from '@phosphor-icons/react';
import { useStoreInfo } from '../lib/useStoreInfo';
import { normalizarHorario, horarioDeHoy } from '../lib/horario';
import { linkMapa } from '../lib/contacto';
import Cassette from '../componentes/Cassette';
import estilos from './Nosotros.module.css';

const TEMAS = [
  {
    lado: 'B1',
    titulo: 'Empezó como un cajón',
    texto:
      'Arrancamos vendiendo los duplicados de nuestra propia colección en una feria de Chacarita. Un cajón de verdulería, una lona y una bandeja a pilas para que la gente probara los discos antes de comprar. Esa bandeja todavía está en el mostrador.',
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
      'Nos interesa lo que no entró en el corte difusión: los prensados nacionales raros, los compilados caseros, el cassette que alguien grabó para otra persona. Si buscás algo puntual, escribinos y lo salimos a buscar.',
  },
];

export default function Nosotros() {
  const { info } = useStoreInfo();
  const horario = normalizarHorario(info?.horario);
  const hoy = horarioDeHoy(info?.horario);

  return (
    <main className={estilos.pagina} data-oscuro>
      <header className={`${estilos.cabecera} cascada`}>
        <p className={estilos.lado}>Lado B</p>
        {/* arriba a la derecha, un cassette sonando (el lado B) */}
        <Cassette className={estilos.cassette} />
        <h1 className={estilos.titulo}>La historia</h1>
        <p className={estilos.bajada}>
          {info?.description ||
            'Una disquería chica en Chacarita: discos nuevos o usados, todos con garantía de calidad.'}
        </p>
      </header>

      <ol className={`${estilos.temas} cascada`} style={{ '--cascada-inicio': '260ms' }}>
        {TEMAS.map((t) => (
          <li key={t.lado} className={estilos.tema}>
            <span className={estilos.temaLado}>{t.lado}</span>
            <h2 className={estilos.temaTitulo}>{t.titulo}</h2>
            <p className={estilos.temaTexto}>{t.texto}</p>
          </li>
        ))}
      </ol>

      <section className={estilos.visita} aria-labelledby="visita-titulo">
        <div>
          <h2 id="visita-titulo" className={estilos.visitaTitulo}>
            Pasá a visitarnos
          </h2>
          {info?.direccion && (
            <a href={linkMapa(info.direccion)} target="_blank" rel="noreferrer" className={estilos.direccion}>
              <MapPin size={22} weight="duotone" aria-hidden="true" />
              {info.direccion}
            </a>
          )}
          {hoy && (
            <p className={estilos.hoy}>
              Hoy abrimos <strong>{hoy.value}</strong>
            </p>
          )}
          <Link to="/contacto" className={`btn btn-primario ${estilos.cta}`}>
            Escribinos <ArrowRight size={16} weight="bold" />
          </Link>
        </div>

        {horario.length > 0 && (
          <dl className={estilos.horario}>
            {horario.map((fila) => (
              <div key={fila.label} className={fila.label === hoy?.label ? estilos.esHoy : undefined}>
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
