// grilla para elegir el icono de una categoría: radios nativos, así anda con teclado y lector de pantalla

import IconoCategoria, { ICONOS } from './IconoCategoria';
import estilos from './SelectorIcono.module.css';

const GRUPOS = [...new Set(ICONOS.map((i) => i.grupo))];

export default function SelectorIcono({ valor, onChange }) {
  return (
    <fieldset className={estilos.selector}>
      <legend className="etiqueta">Icono</legend>
      {GRUPOS.map((grupo) => (
        <div key={grupo} className={estilos.grupo}>
          <div className={estilos.grupoNombre}>{grupo}</div>
          <div className={estilos.grilla}>
            {ICONOS.filter((i) => i.grupo === grupo).map((i) => (
              <label key={i.id} className={estilos.opcion}>
                <input
                  type="radio"
                  name="icono-categoria"
                  value={i.id}
                  checked={valor === i.id}
                  onChange={() => onChange(i.id)}
                  className={estilos.radio}
                />
                <span className={estilos.dibujo}>
                  <IconoCategoria icono={i.id} />
                </span>
                <span className={estilos.nombre}>{i.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}
