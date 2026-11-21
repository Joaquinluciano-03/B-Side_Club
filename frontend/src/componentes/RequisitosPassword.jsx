// requisitos de una contraseña nueva, se tildan mientras se escribe (reglas en lib/reglasPassword). datos: nombre, apellido y mail

import { Check, Circle } from '@phosphor-icons/react';
import { requisitosPassword } from '../lib/reglasPassword';
import estilos from './RequisitosPassword.module.css';

export default function RequisitosPassword({ password, datos, id }) {
  const requisitos = requisitosPassword(password, datos);
  return (
    <ul id={id} className={estilos.lista} aria-label="Requisitos de la contraseña">
      {requisitos.map((r) => (
        <li key={r.id} className={r.ok ? estilos.ok : undefined}>
          {r.ok ? (
            <Check size={13} weight="bold" aria-hidden="true" />
          ) : (
            <Circle size={13} aria-hidden="true" />
          )}
          <span>
            {r.texto}
            <span className="sr-only">{r.ok ? ': cumplido' : ': falta'}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
