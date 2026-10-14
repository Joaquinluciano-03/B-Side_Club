// Los "motivos" graficos de la demo: surco de vinilo, cassette, cinta diagonal
// y halftone. Se usan cuando el producto no tiene foto cargada (o cuando la
// foto no carga), para que el catalogo nunca muestre un hueco gris.
// La demo los define en la seccion MOTIVOS del sistema de diseño.

import { useState } from 'react';
import { urlImagen } from '../lib/api';

// Paleta de la demo para el centro del disco y la cinta.
const COLORES = ['#F26A1B', '#0E8FA6', '#C41E75', '#5B45B8', '#9A6100', '#1F7A4E', '#B33A2B', '#35D0E8'];

// Color estable por producto: el mismo disco tiene siempre el mismo color,
// aunque cambie de posicion en la grilla.
function colorDe(texto = '') {
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return COLORES[h % COLORES.length];
}

// Que motivo le toca a cada categoria. Si la categoria no esta en la lista
// cae en el halftone, que es el neutro.
function motivoDe(categoria = '') {
  const c = categoria.toLowerCase();
  if (c.includes('vinilo') || c.includes('lp')) return 'disco';
  if (c.includes('cassette') || c.includes('casete')) return 'cassette';
  if (c.includes('cd')) return 'disco';
  if (c.includes('equipo')) return 'cinta';
  return 'halftone';
}

function Disco({ color, girando }) {
  return (
    <div
      style={{
        width: '72%',
        aspectRatio: '1 / 1',
        borderRadius: '50%',
        background: `repeating-radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0 2px, rgba(255,255,255,.07) 2px 3px), radial-gradient(circle at 50% 50%, ${color} 0 20%, #0C0B0A 20.5% 100%)`,
        animation: girando ? 'bspin 6s linear infinite' : 'none',
        boxShadow: '0 6px 22px rgba(0,0,0,.45)',
      }}
    />
  );
}

function Cassette({ color }) {
  const agujero = {
    width: '14%',
    aspectRatio: '1 / 1',
    borderRadius: '50%',
    background: '#26221F',
  };
  return (
    <div
      style={{
        width: '74%',
        aspectRatio: '120 / 76',
        borderRadius: 8,
        background: '#26221F',
        border: '1px solid #3A3431',
        padding: '7%',
        display: 'flex',
        flexDirection: 'column',
        gap: '7%',
        boxShadow: '0 6px 22px rgba(0,0,0,.45)',
      }}
    >
      <div style={{ height: '26%', background: '#E8E2D8', borderRadius: 2 }} />
      <div
        style={{
          flex: 1,
          background: color,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14%',
        }}
      >
        <div style={agujero} />
        <div style={agujero} />
      </div>
    </div>
  );
}

function Cinta({ color }) {
  return (
    <div
      style={{
        width: '74%',
        aspectRatio: '110 / 76',
        borderRadius: 8,
        background: `repeating-linear-gradient(45deg, ${color} 0 10px, #121110 10px 20px)`,
        boxShadow: '0 6px 22px rgba(0,0,0,.45)',
      }}
    />
  );
}

function Halftone() {
  return (
    <div
      style={{
        width: '74%',
        aspectRatio: '92 / 76',
        borderRadius: 8,
        background:
          'radial-gradient(circle at 50% 50%, #F2ECE4 0 1px, transparent 1.2px) 0 0/9px 9px, #121110',
        border: '1px solid #BAC2C6',
      }}
    />
  );
}

/**
 * Arte de un producto. Si tiene imagen la muestra; si no (o si la imagen no
 * carga) dibuja el motivo que le corresponde a su categoria.
 */
export default function ArteProducto({ producto, categoria, girando = false, mostrarTag = true }) {
  const [imagenFallo, setImagenFallo] = useState(false);

  const nombreCategoria = categoria || producto?.categoria?.nombre || '';
  const portada = producto?.imagenes?.[0];
  const color = colorDe(producto?.nombre || '');
  const motivo = motivoDe(nombreCategoria);

  const marco = {
    position: 'relative',
    aspectRatio: '1 / 1',
    background: 'var(--carbon)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const tag = {
    position: 'absolute',
    left: 11,
    top: 11,
    fontFamily: 'var(--mono)',
    fontSize: 9,
    letterSpacing: '.18em',
    color: 'var(--crema)',
    background: 'rgba(12,11,10,.72)',
    border: '1px solid rgba(242,236,228,.18)',
    padding: '5px 9px',
    borderRadius: 4,
    textTransform: 'uppercase',
    backdropFilter: 'blur(4px)',
  };

  return (
    <div style={marco}>
      {portada && !imagenFallo ? (
        <img
          src={urlImagen(portada.url)}
          alt={portada.alt || producto?.nombre || ''}
          onError={() => setImagenFallo(true)}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <>
          {motivo === 'disco' && <Disco color={color} girando={girando} />}
          {motivo === 'cassette' && <Cassette color={color} />}
          {motivo === 'cinta' && <Cinta color={color} />}
          {motivo === 'halftone' && <Halftone />}
        </>
      )}
      {mostrarTag && nombreCategoria && <div style={tag}>{nombreCategoria}</div>}
    </div>
  );
}
