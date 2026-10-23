// Grilla para elegir el icono de una categoria en el panel. Son radios
// nativos debajo de cada tarjeta: las flechas del teclado recorren la grilla
// y el lector de pantalla anuncia "Icono, grupo de opciones".

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
