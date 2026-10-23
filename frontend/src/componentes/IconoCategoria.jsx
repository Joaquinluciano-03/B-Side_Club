// Los iconos de las categorias: objetos de disqueria dibujados con la misma
// paleta que las tapas genericas (cuerpos carbon, metal, crema del papel) y
// un solo color de acento, que llega por `color`. El local elige uno al
// crear la categoria (panel > Categorias); si no eligio, se deduce del nombre.
//
// Vinilo, CD, cassette y perilla son los motivos originales, hechos con CSS
// (ver IconoCategoria.module.css). El resto son SVG con el mismo lenguaje.
// La lista de ids tiene que coincidir con ICONOS de src/controllers/categoria.js.

import { useId } from 'react';
import estilos from './IconoCategoria.module.css';

const C = {
  carbon: '#161412',
  hondo: '#0e0d0c',
  cuerpo: '#2b2622',
  borde: '#3a3431',
  gris: '#5c554f',
  crema: '#e8e2d8',
  papel: '#c9c1b5',
  metal: '#c9cdd1',
  metalOscuro: '#8e979e',
  tinta: 'rgba(20, 18, 16, 0.6)',
};

// circulo con agujero (fill-rule evenodd): un disco, un label perforado
function anillo(cx, cy, R, r) {
  const c = (rad) => `M${cx - rad},${cy}a${rad},${rad} 0 1,0 ${2 * rad},0a${rad},${rad} 0 1,0 ${-2 * rad},0Z`;
  return c(R) + (r ? c(r) : '');
}

function Surcos({ cx = 50, cy = 50, desde, hasta, paso = 3.5, color = '#2e2926' }) {
  const radios = [];
  for (let r = desde; r <= hasta; r += paso) radios.push(r);
  return radios.map((r) => <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="0.7" />);
}

const DIBUJOS = {
  simple: () => (
    <>
      <path fillRule="evenodd" fill={C.carbon} d={anillo(50, 50, 42, 9)} />
      <Surcos desde={24} hasta={39} />
      <circle cx="50" cy="50" r="41.4" fill="none" stroke={C.borde} strokeWidth="1.2" />
      <path fillRule="evenodd" fill="currentColor" d={anillo(50, 50, 20, 9)} />
    </>
  ),

  color: () => (
    <>
      <circle cx="50" cy="50" r="44" fill="currentColor" />
      <Surcos desde={17} hasta={41} paso={4} color="rgba(0, 0, 0, 0.16)" />
      {[
        [30, 28, 3],
        [70, 34, 2.2],
        [26, 62, 2],
        [64, 74, 3.4],
        [76, 58, 1.6],
        [40, 80, 1.8],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={C.crema} opacity="0.75" />
      ))}
      <path d="M20 34 A34 34 0 0 1 44 16" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      <circle cx="50" cy="50" r="14" fill={C.crema} />
      <rect x="43" y="42" width="14" height="2.5" rx="1" fill={C.tinta} />
      <circle cx="50" cy="50" r="2" fill={C.carbon} />
    </>
  ),

  vhs: () => (
    <>
      <rect x="6" y="22" width="88" height="56" rx="4" fill={C.carbon} stroke={C.borde} strokeWidth="1.5" />
      <rect x="26" y="29" width="48" height="21" rx="2.5" fill={C.hondo} stroke={C.borde} />
      {[38, 62].map((x) => (
        <g key={x}>
          <circle cx={x} cy="39.5" r="7.5" fill={C.cuerpo} stroke={C.gris} />
          <circle cx={x} cy="39.5" r="2.6" fill={C.crema} />
        </g>
      ))}
      <rect x="12" y="56" width="76" height="15" rx="2" fill="currentColor" />
      <rect x="18" y="61.5" width="32" height="3" rx="1" fill={C.tinta} />
    </>
  ),

  bandeja: () => (
    <>
      <rect x="6" y="16" width="88" height="68" rx="6" fill={C.cuerpo} stroke={C.borde} strokeWidth="1.5" />
      <circle cx="42" cy="50" r="29" fill={C.hondo} />
      <circle cx="42" cy="50" r="27" fill={C.carbon} />
      <Surcos cx={42} cy={50} desde={13} hasta={25} paso={3} />
      <circle cx="42" cy="50" r="10" fill="currentColor" />
      <circle cx="42" cy="50" r="1.6" fill={C.crema} />
      <rect x="76" y="14" width="8" height="9" rx="2" fill={C.metalOscuro} />
      <path d="M80 26 L78 60 L67 70" fill="none" stroke={C.metal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="60" y="66" width="10" height="6" rx="1.2" fill={C.metal} transform="rotate(-42 65 69)" />
      <circle cx="80" cy="27" r="6.5" fill={C.gris} stroke={C.metalOscuro} />
      <circle cx="80" cy="27" r="2.6" fill={C.metal} />
      <rect x="81" y="73" width="8" height="5" rx="1.5" fill="currentColor" />
    </>
  ),

  amplificador: () => (
    <>
      <rect x="12" y="72" width="9" height="5" rx="1" fill={C.carbon} />
      <rect x="79" y="72" width="9" height="5" rx="1" fill={C.carbon} />
      <rect x="4" y="27" width="92" height="46" rx="4" fill={C.metal} stroke={C.metalOscuro} strokeWidth="1.5" />
      <rect x="10" y="35" width="31" height="22" rx="2" fill="#efe6c8" stroke={C.metalOscuro} />
      <path d="M14 47 Q25.5 38 37 47" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M25.5 54 L31 40" stroke={C.carbon} strokeWidth="1.3" strokeLinecap="round" />
      {[
        [56, 47, 0],
        [77, 47, 45],
      ].map(([x, y, giro]) => (
        <g key={x} transform={`rotate(${giro} ${x} ${y})`}>
          <circle cx={x} cy={y} r="8.5" fill={C.carbon} stroke={C.borde} />
          <path d={`M${x} ${y} V${y - 7}`} stroke={C.crema} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ))}
      <rect x="10" y="62" width="40" height="2.4" rx="1" fill={C.metalOscuro} />
      <circle cx="89" cy="64" r="2.2" fill="currentColor" />
    </>
  ),

  parlante: () => (
    <>
      <rect x="22" y="6" width="56" height="88" rx="6" fill={C.cuerpo} stroke={C.borde} strokeWidth="1.5" />
      <circle cx="50" cy="26" r="9" fill={C.carbon} stroke={C.gris} strokeWidth="1.5" />
      <circle cx="50" cy="26" r="3.6" fill={C.metal} />
      <circle cx="50" cy="62" r="22" fill={C.carbon} stroke={C.gris} strokeWidth="2" />
      <circle cx="50" cy="62" r="17" fill="#1f1c1a" stroke={C.borde} />
      <circle cx="50" cy="62" r="6.5" fill="currentColor" />
      {[
        [28, 12],
        [72, 12],
        [28, 88],
        [72, 88],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill={C.gris} />
      ))}
    </>
  ),

  auriculares: () => (
    <>
      <path d="M20 62 V50 A30 30 0 0 1 80 50 V62" fill="none" stroke={C.cuerpo} strokeWidth="7" strokeLinecap="round" />
      <path d="M32 31 A26 26 0 0 1 68 31" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <rect x="17" y="47" width="6" height="9" rx="1" fill={C.metal} />
      <rect x="77" y="47" width="6" height="9" rx="1" fill={C.metal} />
      <rect x="9" y="54" width="21" height="33" rx="8" fill={C.carbon} stroke={C.borde} strokeWidth="1.5" />
      <rect x="70" y="54" width="21" height="33" rx="8" fill={C.carbon} stroke={C.borde} strokeWidth="1.5" />
      <rect x="27" y="57" width="7" height="27" rx="3.5" fill={C.gris} />
      <rect x="66" y="57" width="7" height="27" rx="3.5" fill={C.gris} />
    </>
  ),

  radio: () => {
    const puntos = [];
    for (let x = -12; x <= 12; x += 5) {
      for (let y = -12; y <= 12; y += 5) if (x * x + y * y <= 150) puntos.push([34 + x, 58 + y]);
    }
    return (
      <>
        <path d="M30 34 V26 Q30 20 36 20 H64 Q70 20 70 26 V34" fill="none" stroke={C.cuerpo} strokeWidth="4" />
        <path d="M80 34 L93 7" stroke={C.metalOscuro} strokeWidth="2" strokeLinecap="round" />
        <circle cx="93" cy="7" r="2" fill={C.metal} />
        <rect x="8" y="32" width="84" height="52" rx="9" fill="currentColor" />
        <rect x="8" y="74" width="84" height="10" rx="0" fill="rgba(0, 0, 0, 0.12)" />
        <circle cx="34" cy="58" r="17" fill={C.cuerpo} />
        {puntos.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.3" fill={C.gris} />
        ))}
        <rect x="56" y="41" width="29" height="13" rx="2" fill={C.crema} />
        {[60, 65, 70, 75, 80].map((x) => (
          <path key={x} d={`M${x} 43 V46`} stroke={C.tinta} strokeWidth="0.9" />
        ))}
        <path d="M71 42 V53" stroke="#a83628" strokeWidth="1.4" />
        <circle cx="62" cy="68" r="5" fill={C.carbon} />
        <circle cx="79" cy="68" r="5" fill={C.carbon} />
      </>
    );
  },

  microfono: (id) => (
    <>
      <defs>
        <clipPath id={`${id}-cabeza`}>
          <rect x="34" y="6" width="32" height="40" rx="16" />
        </clipPath>
      </defs>
      <rect x="34" y="6" width="32" height="40" rx="16" fill={C.metalOscuro} />
      <g clipPath={`url(#${id}-cabeza)`} stroke={C.gris} strokeWidth="1">
        {[12, 17, 22, 27, 32, 37, 42].map((y) => (
          <path key={y} d={`M30 ${y} H70`} />
        ))}
        {[40, 45, 50, 55, 60].map((x) => (
          <path key={x} d={`M${x} 4 V48`} />
        ))}
      </g>
      <rect x="32" y="40" width="36" height="8" rx="2" fill="currentColor" />
      <path d="M37 48 H63 L58 85 Q50 94 42 85 Z" fill={C.carbon} stroke={C.borde} strokeWidth="1.2" />
      <rect x="46" y="57" width="8" height="11" rx="2" fill={C.borde} />
    </>
  ),

  // el brazo apoyado en el borde de un disco: la pua sola no se reconoce
  aguja: () => (
    <>
      <circle cx="20" cy="98" r="60" fill={C.carbon} />
      <Surcos cx={20} cy={98} desde={24} hasta={56} paso={3.6} />
      <circle cx="20" cy="98" r="20" fill={C.crema} />
      <rect x="80" y="4" width="11" height="12" rx="2.5" fill={C.metalOscuro} transform="rotate(20 85.5 10)" />
      <path d="M83 20 L68 58 L54 66" fill="none" stroke={C.metal} strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="83" cy="20" r="8" fill={C.gris} stroke={C.metalOscuro} />
      <circle cx="83" cy="20" r="3.2" fill={C.metal} />
      <g transform="rotate(-32 50 68)">
        <path d="M38 63 Q32 61 31 55" fill="none" stroke={C.metal} strokeWidth="2.4" strokeLinecap="round" />
        <rect x="38" y="61" width="22" height="9" rx="2" fill={C.cuerpo} stroke={C.borde} />
        <rect x="41" y="70" width="15" height="8" rx="1.5" fill="currentColor" />
      </g>
    </>
  ),

  // cepillo de pana y rociador: con el cepillo solo parecia un borrador
  cepillo: () => (
    <>
      {[
        [55, 28, 1.6],
        [50, 23, 1.2],
        [51, 33, 1.3],
        [45, 28, 1],
      ].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={C.gris} opacity="0.55" />
      ))}
      <rect x="59" y="26" width="12" height="5" rx="1.5" fill={C.carbon} />
      <path d="M68 22 H88 Q91 22 91 25 V34 H68 Z" fill={C.carbon} />
      <path d="M74 34 L70 45" stroke={C.carbon} strokeWidth="3" strokeLinecap="round" />
      <rect x="76" y="34" width="10" height="9" fill={C.cuerpo} />
      <rect x="68" y="42" width="26" height="48" rx="6" fill={C.crema} stroke={C.papel} />
      <rect x="72" y="56" width="18" height="16" rx="2" fill="currentColor" />
      <rect x="4" y="50" width="56" height="25" rx="10" fill={C.cuerpo} stroke={C.borde} strokeWidth="1.5" />
      <rect x="16" y="57" width="32" height="9" rx="4.5" fill={C.crema} />
      <rect x="6" y="73" width="52" height="14" rx="3" fill="currentColor" />
      <path d="M9 78.5 H55 M9 83 H55" stroke="rgba(0, 0, 0, 0.18)" strokeWidth="1.3" />
    </>
  ),

  funda: () => (
    <>
      <circle cx="66" cy="50" r="33" fill={C.carbon} />
      <Surcos cx={66} cy={50} desde={14} hasta={30} paso={3.2} />
      <circle cx="66" cy="50" r="11" fill="currentColor" />
      <rect x="6" y="14" width="66" height="72" rx="2" fill={C.crema} stroke={C.papel} />
      <circle cx="39" cy="50" r="12" fill={C.carbon} />
      <circle cx="39" cy="50" r="12" fill="none" stroke={C.papel} strokeWidth="1.2" />
      <path d="M44 41 A26 26 0 0 1 48 58" fill="none" stroke="#2e2926" strokeWidth="0.8" />
    </>
  ),

  caja: () => (
    <>
      <rect x="12" y="34" width="76" height="50" rx="2" fill={C.cuerpo} stroke={C.borde} strokeWidth="1.5" />
      <rect x="12" y="54" width="76" height="11" fill="currentColor" />
      <rect x="38" y="70" width="24" height="8" rx="1" fill={C.crema} />
      <rect x="8" y="20" width="84" height="18" rx="3" fill={C.carbon} stroke={C.borde} strokeWidth="1.5" />
      <rect x="15" y="27" width="30" height="4" rx="1" fill={C.borde} />
    </>
  ),

  libro: () => (
    <>
      <rect x="74" y="11" width="7" height="78" rx="1.5" fill={C.crema} stroke={C.papel} />
      <rect x="20" y="8" width="58" height="84" rx="3" fill="currentColor" />
      <path d="M23 8 H29 V92 H23 Q20 92 20 89 V11 Q20 8 23 8 Z" fill="rgba(0, 0, 0, 0.22)" />
      <rect x="35" y="20" width="34" height="5" rx="1" fill={C.carbon} />
      <rect x="35" y="29" width="22" height="3" rx="1" fill={C.tinta} />
      <circle cx="53" cy="64" r="16" fill={C.carbon} />
      <circle cx="53" cy="64" r="5" fill={C.crema} />
      <circle cx="53" cy="64" r="1.2" fill={C.carbon} />
    </>
  ),

  poster: () => (
    <>
      <rect x="16" y="9" width="68" height="84" fill={C.crema} stroke={C.papel} />
      <rect x="22" y="15" width="56" height="50" fill="currentColor" />
      <path d="M30 65 A20 20 0 0 1 70 65 Z" fill={C.carbon} />
      <path d="M42 65 A8 8 0 0 1 58 65 Z" fill={C.crema} />
      <rect x="22" y="71" width="42" height="6" rx="1" fill={C.carbon} />
      <rect x="22" y="81" width="26" height="3" rx="1" fill={C.gris} />
      <rect x="10" y="5" width="17" height="8" fill="#d8cfb8" opacity="0.92" transform="rotate(-28 18.5 9)" />
      <rect x="73" y="5" width="17" height="8" fill="#d8cfb8" opacity="0.92" transform="rotate(28 81.5 9)" />
    </>
  ),

  remera: () => (
    <>
      <path
        d="M36 12 L44 9 Q50 16 56 9 L64 12 L88 26 L80 42 L70 36 L70 90 L30 90 L30 36 L20 42 L12 26 Z"
        fill={C.carbon}
        stroke={C.borde}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M44 9 Q50 16 56 9" fill="none" stroke={C.gris} strokeWidth="2" />
      <circle cx="50" cy="54" r="13" fill="currentColor" />
      <circle cx="50" cy="54" r="8.5" fill="none" stroke="rgba(20, 18, 16, 0.35)" />
      <circle cx="50" cy="54" r="4" fill={C.carbon} />
    </>
  ),

  regalo: () => (
    <>
      <rect x="6" y="22" width="88" height="56" rx="6" fill="currentColor" />
      <rect x="60" y="22" width="9" height="56" fill={C.carbon} />
      <rect x="6" y="44" width="88" height="9" fill={C.carbon} />
      <path
        d="M64.5 48.5 C52 26 38 38 64.5 48.5 Z M64.5 48.5 C77 26 91 38 64.5 48.5 Z"
        fill="none"
        stroke={C.carbon}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <rect x="14" y="30" width="30" height="4" rx="1" fill={C.tinta} />
      <rect x="14" y="62" width="22" height="8" rx="1.5" fill={C.crema} />
    </>
  ),

  etiqueta: () => (
    <g transform="rotate(-14 50 50)">
      <path d="M70 50 C82 50 88 38 97 22" fill="none" stroke={C.carbon} strokeWidth="2" strokeLinecap="round" />
      <path d="M8 31 Q8 23 16 23 H58 L86 50 L58 77 H16 Q8 77 8 69 Z" fill="currentColor" />
      <circle cx="66" cy="50" r="5" fill={C.crema} stroke="rgba(0, 0, 0, 0.25)" />
      <rect x="17" y="39" width="32" height="7" rx="1.5" fill={C.carbon} />
      <rect x="17" y="52" width="22" height="4" rx="1" fill={C.tinta} />
    </g>
  ),
};

// los que se dibujan con CSS
const CON_CSS = ['vinilo', 'cd', 'cassette', 'perilla'];

/** Todos los iconos, en el orden en que los ofrece el panel. */
export const ICONOS = [
  { id: 'vinilo', nombre: 'Vinilo', grupo: 'Formatos' },
  { id: 'simple', nombre: 'Simple 7"', grupo: 'Formatos' },
  { id: 'color', nombre: 'Vinilo de color', grupo: 'Formatos' },
  { id: 'cd', nombre: 'CD', grupo: 'Formatos' },
  { id: 'cassette', nombre: 'Cassette', grupo: 'Formatos' },
  { id: 'vhs', nombre: 'VHS', grupo: 'Formatos' },
  { id: 'bandeja', nombre: 'Bandeja', grupo: 'Equipos' },
  { id: 'amplificador', nombre: 'Amplificador', grupo: 'Equipos' },
  { id: 'perilla', nombre: 'Perilla', grupo: 'Equipos' },
  { id: 'parlante', nombre: 'Parlante', grupo: 'Equipos' },
  { id: 'auriculares', nombre: 'Auriculares', grupo: 'Equipos' },
  { id: 'radio', nombre: 'Radio', grupo: 'Equipos' },
  { id: 'microfono', nombre: 'Micrófono', grupo: 'Equipos' },
  { id: 'aguja', nombre: 'Púa', grupo: 'Accesorios y más' },
  { id: 'cepillo', nombre: 'Limpieza', grupo: 'Accesorios y más' },
  { id: 'funda', nombre: 'Funda', grupo: 'Accesorios y más' },
  { id: 'caja', nombre: 'Box set', grupo: 'Accesorios y más' },
  { id: 'libro', nombre: 'Libro', grupo: 'Accesorios y más' },
  { id: 'poster', nombre: 'Póster', grupo: 'Accesorios y más' },
  { id: 'remera', nombre: 'Remera', grupo: 'Accesorios y más' },
  { id: 'regalo', nombre: 'Regalo', grupo: 'Accesorios y más' },
  { id: 'etiqueta', nombre: 'Etiqueta', grupo: 'Accesorios y más' },
];

const IDS = new Set(ICONOS.map((i) => i.id));

// palabras del nombre -> icono, para las categorias que todavia no tienen uno
// elegido (y para sugerirlo mientras se escribe el nombre en el panel).
// El orden importa: "vinilos de color" tiene que ganarle a "vinilo".
const PISTAS = [
  [/color|edici[oó]n especial/, 'color'],
  [/simple|7"|7 pulgadas/, 'simple'],
  [/vinilo|\blp/, 'vinilo'],
  [/\bcd|compact/, 'cd'],
  [/cass?ett?e|casete/, 'cassette'],
  [/vhs|pel[ií]cula|dvd/, 'vhs'],
  [/bandeja|tocadisco|giradisco/, 'bandeja'],
  [/amplific|receiver|receptor/, 'amplificador'],
  [/parlante|bafle|altavoz/, 'parlante'],
  [/auricular/, 'auriculares'],
  [/radio/, 'radio'],
  [/micr[oó]fono/, 'microfono'],
  [/p[uú]a|aguja|c[aá]psula|accesorio/, 'aguja'],
  [/limpieza|cepillo/, 'cepillo'],
  [/funda|protector/, 'funda'],
  [/box|caja|colecci[oó]n/, 'caja'],
  [/libro|revista|fanzine/, 'libro'],
  [/p[oó]ster|afiche/, 'poster'],
  [/remera|merch|ropa/, 'remera'],
  [/regalo|gift/, 'regalo'],
  [/equipo/, 'perilla'],
];

/** El icono que le toca a un nombre de categoria (null si no se reconoce). */
export function iconoSugerido(nombre = '') {
  const n = String(nombre).toLowerCase();
  return PISTAS.find(([re]) => re.test(n))?.[1] ?? null;
}

/**
 * El icono de una categoria: el elegido en el panel o, si no hay, el que
 * sugiere el nombre. Acepta la categoria entera o solo su nombre. Sin pistas
 * queda el vinilo, que es lo que es casi todo en una disqueria.
 */
export function iconoDe(categoria) {
  if (categoria && typeof categoria === 'object') {
    if (IDS.has(categoria.icono)) return categoria.icono;
    return iconoSugerido(categoria.nombre) ?? 'vinilo';
  }
  return iconoSugerido(categoria) ?? 'vinilo';
}

/**
 * Dibuja un icono. `icono` es el id; si no, se toma de `categoria`.
 * Ocupa el 72% de su contenedor (cuadrado), igual que los motivos de siempre.
 */
export default function IconoCategoria({ icono, categoria, color = '#F26A1B', className = '' }) {
  const id = useId().replace(/:/g, '');
  const cual = IDS.has(icono) ? icono : iconoDe(categoria);
  const vars = { '--label': color, color };

  if (CON_CSS.includes(cual)) {
    return <span className={`${estilos.motivo} ${estilos['motivo_' + cual]} ${className}`} style={vars} aria-hidden="true" />;
  }
  return (
    <svg className={`${estilos.motivo} ${className}`} style={vars} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      {DIBUJOS[cual](id)}
    </svg>
  );
}
