// cartel de neón ABIERTO / CERRADO según el horario del panel y la hora de Buenos Aires. Se revisa cada 30 s.
// Sin horario, o si no se entiende el de hoy, no muestra nada.
// Hay dos: el fijo (esquina, pantallas anchas) y el de la página (tablets y celulares); el CSS esconde el que no corresponde

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
