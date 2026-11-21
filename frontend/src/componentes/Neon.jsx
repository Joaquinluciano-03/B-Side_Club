// texto como cartel de neón: cada palabra es un tubo y cada letra se enciende por su cuenta (una parpadea).
// Solo lo visual (aria-hidden): quien lo usa pone el aria-label.
// inicio: ms hasta encender la primera letra; paso: ms entre letras
// color: 'alterna', 'rosa' o 'cian'; tubo: 'doble' (contorno doble) o 'simple' (un trazo)

import estilos from './Neon.module.css';

export default function Neon({ texto, inicio = 900, paso = 95, color = 'alterna', tubo = 'doble', className = '' }) {
  const palabras = texto.split(/\s+/);
  const total = palabras.join('').length;
  const floja = Math.min(3, total - 1);
  let l = 0;
  return (
    <span
      aria-hidden="true"
      className={`${estilos.neon} ${tubo === 'simple' ? estilos.simple : ''} ${className}`}
      style={{ '--inicio': `${inicio}ms`, '--paso': `${paso}ms` }}
    >
      {palabras.map((palabra, i) => (
        <span key={i} className={`${estilos.palabra} ${color === 'cian' || (i % 2 && color === 'alterna') ? estilos.cian : estilos.rosa}`}>
          {[...palabra].map((letra, j) => {
            const n = l++;
            return (
              <span key={j} className={estilos.letra} style={{ '--l': n }}>
                {/* el parpadeo del tubo flojo va en un span aparte: dos
                    animaciones de opacidad en el mismo elemento no pueden
                    correr en la GPU */}
                {n === floja ? <span className={estilos.floja}>{letra}</span> : letra}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
