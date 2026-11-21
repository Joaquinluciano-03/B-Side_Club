// tapa de un producto: la primera foto, o una tapa genérica según el formato (funda con troquel para vinilo/CD,
// estuche para cassette, ficha para equipo). El color sale del nombre, así el mismo disco siempre tiene la misma tapa

import { useState } from 'react';
import { urlImagen } from '../lib/api';
import { separarNombre } from '../lib/formato';
import { useDatosDelLocal } from '../lib/useStoreInfo';
import { iconoDe } from './IconoCategoria';
import estilos from './ArteProducto.module.css';

// colores de funda: la paleta del sitio más el crema del papel
const COLORES = ['#F26A1B', '#0E8FA6', '#C41E75', '#B8402C', '#5B45B8', '#9A6100', '#1F7A4E', '#E8E2D8'];

function hash(texto = '') {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function colorDe(texto) {
  return COLORES[hash(texto) % COLORES.length];
}

// el label usa otro color para contrastar con la funda
function colorLabel(texto) {
  return COLORES[(hash(texto) + 3) % COLORES.length];
}

// tinta clara u oscura según el fondo
function tintaPara(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.5 ? '#141210' : '#F2ECE4';
}

/** Objeto que va en la funda según el icono de la categoría. Lo que no es disco ni cinta lleva la ficha impresa. */
export function formatoDe(categoria) {
  const icono = iconoDe(categoria);
  if (icono === 'vinilo' || icono === 'simple' || icono === 'color') return 'vinilo';
  if (icono === 'cd') return 'cd';
  if (icono === 'cassette' || icono === 'vhs') return 'cassette';
  return 'equipo';
}

function TapaGenerica({ producto, formato }) {
  // sin artista, el pie lleva el nombre del local
  const { nombre: nombreLocal } = useDatosDelLocal();
  const { titulo, artista } = separarNombre(producto?.nombre);
  const fondo = colorDe(producto?.nombre || '');
  const tinta = tintaPara(fondo);
  const vars = { '--fondo': fondo, '--tinta': tinta, '--label': colorLabel(producto?.nombre || '') };

  if (formato === 'cassette') {
    return (
      <div className={`${estilos.tapa} ${estilos.estuche}`} style={vars}>
        <div className={estilos.cassette}>
          <div className={estilos.etiqueta}>
            <span className={estilos.etiquetaTitulo}>{titulo}</span>
            {artista && <span className={estilos.etiquetaArtista}>{artista}</span>}
          </div>
          <div className={estilos.ventana}>
            <span className={estilos.bobina} />
            <span className={estilos.bobina} />
          </div>
        </div>
      </div>
    );
  }

  if (formato === 'equipo') {
    return (
      <div className={`${estilos.tapa} ${estilos.ficha}`} style={vars}>
        <span className={estilos.fichaMarca}>{nombreLocal} · Revisado</span>
        <span className={estilos.fichaTitulo}>{titulo}</span>
        {artista && <span className={estilos.fichaSub}>{artista}</span>}
      </div>
    );
  }

  // vinilo o CD: funda de papel con troquel
  return (
    <div className={`${estilos.tapa} ${estilos.funda}`} style={vars}>
      <span className={estilos.fundaTitulo}>{titulo}</span>
      <span className={estilos.troquel} aria-hidden="true">
        <span className={formato === 'cd' ? estilos.troquelCd : estilos.troquelLabel} />
      </span>
      <span className={estilos.fundaPie}>{artista || nombreLocal}</span>
    </div>
  );
}

/** Tapa cuadrada del producto. `prioridad` carga la imagen sin lazy. */
export default function ArteProducto({ producto, categoria, prioridad = false, imagen }) {
  const [fallo, setFallo] = useState(false);
  const portada = imagen || producto?.imagenes?.[0];
  const formato = formatoDe(categoria || producto?.categoria);

  if (portada && urlImagen(portada.url) && !fallo) {
    return (
      <div className={estilos.tapa} style={{ '--fondo': colorDe(producto?.nombre || '') }}>
        <img
          className={estilos.foto}
          src={urlImagen(portada.url)}
          alt={portada.alt || producto?.nombre || ''}
          onError={() => setFallo(true)}
          // se decodifica apenas baja, para que no se trabe el scroll al pintarla
          onLoad={(e) => e.currentTarget.decode?.().catch(() => {})}
          loading={prioridad ? 'eager' : 'lazy'}
          fetchPriority={prioridad ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
    );
  }

  return <TapaGenerica producto={producto} formato={formato} />;
}

/** El objeto dentro de la funda (disco, CD o cassette); asoma al pasar el mouse. Los equipos no tienen. */
export function ObjetoInterior({ producto, categoria }) {
  const formato = formatoDe(categoria || producto?.categoria);
  if (formato === 'equipo') return null;
  const vars = { '--label': colorLabel(producto?.nombre || '') };

  if (formato === 'cassette') {
    return <span className={`${estilos.objeto} ${estilos.objetoCassette}`} style={vars} aria-hidden="true" />;
  }
  return (
    <span
      className={`${estilos.objeto} ${formato === 'cd' ? estilos.objetoCd : estilos.objetoVinilo}`}
      style={vars}
      aria-hidden="true"
    />
  );
}
