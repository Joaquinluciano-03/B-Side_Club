// campo de contraseña con botón para mostrarla; recibe las props de un <input>

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import estilos from './InputPassword.module.css';

// para formularios armados con .map: pinta un <input> o un InputPassword según el tipo
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
