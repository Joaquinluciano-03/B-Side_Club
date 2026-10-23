// Arte de un producto: la tapa. Si el local cargo fotos, la primera es la
// tapa. Si no hay foto (o no carga), se dibuja una tapa generica segun el
// formato, como las fundas de papel de la casa que usan las disquerias:
//   vinilo / CD -> funda de papel con troquel redondo que deja ver el label
//   cassette    -> estuche con la etiqueta escrita
//   equipo      -> ficha impresa con el nombre del equipo
// El color sale del nombre, asi el mismo disco tiene siempre la misma tapa.

import { useState } from 'react';
import { urlImagen } from '../lib/api';
import { separarNombre } from '../lib/formato';
import { useDatosDelLocal } from '../lib/useStoreInfo';
import { iconoDe } from './IconoCategoria';
import estilos from './ArteProducto.module.css';

// colores de funda: la paleta del sitio, mas el crema del papel
const COLORES = ['#F26A1B', '#0E8FA6', '#C41E75', '#B8402C', '#5B45B8', '#9A6100', '#1F7A4E', '#E8E2D8'];

function hash(texto = '') {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return h;
}

export function colorDe(texto) {
  return COLORES[hash(texto) % COLORES.length];
}

// el label del disco usa otro color de la paleta, para que contraste con la funda
function colorLabel(texto) {
  return COLORES[(hash(texto) + 3) % COLORES.length];
}

// tinta clara u oscura segun el fondo (luminancia relativa simple)
function tintaPara(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.5 ? '#141210' : '#F2ECE4';
}

/**
 * Que objeto va adentro de la funda, segun el icono de la categoria (el
 * elegido en el panel o el que sugiere su nombre). Todo lo que no es un disco
 * ni una cinta (equipos, accesorios, libros, merch) lleva la ficha impresa.
 * Acepta la categoria entera o solo su nombre.
 */
export function formatoDe(categoria) {
  const icono = iconoDe(categoria);
  if (icono === 'vinilo' || icono === 'simple' || icono === 'color') return 'vinilo';
  if (icono === 'cd') return 'cd';
  if (icono === 'cassette' || icono === 'vhs') return 'cassette';
  return 'equipo';
}

function TapaGenerica({ producto, formato }) {
  // sin artista, el pie de la funda lleva el nombre del local (de la base)
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

/**
 * Tapa del producto (cuadrada). Con foto muestra la foto; sin foto, la tapa
 * generica de su formato. `prioridad` carga la imagen sin lazy (la primera
 * imagen grande de una pagina).
 */
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
          loading={prioridad ? 'eager' : 'lazy'}
          fetchPriority={prioridad ? 'high' : 'auto'}
          decoding="async"
        />
      </div>
    );
  }

  return <TapaGenerica producto={producto} formato={formato} />;
}

/**
 * El objeto que vive adentro de la funda (disco, CD o cassette). La card lo
 * hace asomar y lo saca un poco al pasar el mouse. Los equipos no tienen.
 */
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
