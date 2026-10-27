// Texto como cartel de neon: cada palabra es un tubo de un color (rosa, cian,
// rosa...) como el logo, y cada letra se enciende por su cuenta. Una letra
// tiene el tubo "flojo" y parpadea cada tanto. Lo usan el titulo del hero y
// el logotipo del header.
//
// Es solo la parte visual (aria-hidden): quien lo usa pone el texto accesible
// con aria-label en el elemento que lo contiene.
//
// inicio: cuando arranca a encenderse la primera letra (ms desde que monta)
// paso: cuanto tarda en encenderse cada letra despues de la anterior (ms)
// color: 'alterna' (rosa, cian, rosa... como el logo), 'rosa' o 'cian' (todo
// de un color, como el titulo de Categorias o el cartel de abierto/cerrado)
// tubo: 'doble' (Bungee Outline, cada letra con contorno doble, como el logo)
// o 'simple' (Bungee Hairline: un solo trazo, como un tubo continuo)

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
