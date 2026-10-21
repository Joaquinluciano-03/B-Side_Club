// Campo de contraseña con boton para mostrarla. Recibe las mismas props que
// un <input>; va adentro de un .campo como cualquier otro.

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import estilos from './InputPassword.module.css';

// Para formularios armados con un .map de campos: <Entrada as={...} /> pinta
// un <input> comun o un InputPassword segun el tipo del campo.
export function Entrada({ as: Componente = 'input', ...props }) {
  return <Componente {...props} />;
}

export default function InputPassword(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={estilos.envoltorio}>
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className={estilos.ojo}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
      >
        {visible ? <EyeSlash size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
