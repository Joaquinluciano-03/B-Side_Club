// Cartel de neon ABIERTO / CERRADO, segun el horario cargado en el panel y la
// hora del local (Buenos Aires). Abierto en cian, cerrado en rosa: los dos
// tubos del logo, de un solo trazo. Se revisa cada 30 segundos; si el local
// abre o cierra con la pagina abierta, el cartel se vuelve a encender (la key
// del Neon cambia y repite el encendido). Sin horario, o si no se entiende el
// de hoy, no muestra nada.
//
// Dos lugares, segun el ancho de pantalla:
//   fijo     -> uno solo, en la esquina de abajo a la derecha, que acompaña
//              el scroll. Solo en pantallas anchas (lo monta LayoutPublico)
//   (normal) -> en la pagina, junto al horario de hoy (hero, footer,
//              Nosotros, Contacto). Solo en tablets y celulares
// El CSS esconde cada uno donde no corresponde.

import { useEffect, useState } from 'react';
import Neon from './Neon';
import { estadoDelLocal } from '../lib/horario';
import estilos from './CartelAbierto.module.css';

export default function CartelAbierto({ horario, fijo = false, className = '' }) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const reloj = setInterval(() => setAhora(new Date()), 30000);
    return () => clearInterval(reloj);
  }, []);

  const estado = estadoDelLocal(horario, ahora);
  if (!estado) return null;
  const texto = estado.abierto ? 'Abierto' : 'Cerrado';

  return (
    <span
      className={`${estilos.cartel} ${fijo ? estilos.fijo : estilos.enPagina} ${estado.abierto ? estilos.abierto : estilos.cerrado} ${className}`}
      role="status"
    >
      <span className="sr-only">{estado.abierto ? 'Abierto ahora' : 'Cerrado ahora'}</span>
      <Neon key={texto} texto={texto} color={estado.abierto ? 'cian' : 'rosa'} tubo="simple" inicio={250} paso={75} />
    </span>
  );
}
